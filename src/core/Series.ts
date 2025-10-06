export type Primitive = string | number | boolean | null | undefined | Date;

export interface SeriesDescribe {
	count: number;
	mean: number | null;
	min: number | null;
	max: number | null;
}

export class Series<T extends Primitive = Primitive> {
	private readonly data: T[];
	readonly name: string | undefined;

	constructor(data: T[] | ReadonlyArray<T>, name?: string) {
		this.data = Array.from(data);
		this.name = name;
	}

	static from<T extends Primitive>(data: T[] | ReadonlyArray<T>, name?: string): Series<T> {
		return new Series<T>(Array.from(data), name);
	}

	get length(): number {
		return this.data.length;
	}

	toArray(): T[] {
		return Array.from(this.data);
	}

	head(n = 5): Series<T> {
		return new Series(this.data.slice(0, Math.max(0, n)), this.name);
	}

	tail(n = 5): Series<T> {
		return new Series(this.data.slice(Math.max(0, this.data.length - n)), this.name);
	}

	iloc(start: number, end?: number): Series<T> {
		if (end === undefined) {
			const idx = this.normalizeIndex(start);
			const value = this.data[idx];
			return new Series(value === undefined ? ([] as T[]) : [value], this.name);
		}
		const [s, e] = this.normalizeSlice(start, end);
		return new Series(this.data.slice(s, e), this.name);
	}

	get(i: number): T | undefined {
		return this.data[this.normalizeIndex(i)];
	}

	sum(): number {
		return this.data.reduce((acc, v) => acc + (typeof v === 'number' ? (v as number) : 0), 0);
	}

	mean(): number | null {
		if (this.data.length === 0) return null;
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return numeric.reduce((a, b) => a + b, 0) / numeric.length;
	}

	min(): number | null {
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return Math.min(...numeric);
	}

	max(): number | null {
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return Math.max(...numeric);
	}

	describe(): SeriesDescribe {
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		const count = numeric.length;
		return {
			count,
			mean: this.mean(),
			min: this.min(),
			max: this.max(),
		};
	}

	map<U extends Primitive>(fn: (value: T, index: number) => U): Series<U> {
		const out: U[] = this.data.map((v, i) => fn(v, i));
		return new Series<U>(out, this.name);
	}

	dropna(): Series<T> {
		const out = this.data.filter((v) => !Series.isMissing(v));
		return new Series<T>(out, this.name);
	}

	fillna(value: T): Series<T> {
		const out = this.data.map((v) => (Series.isMissing(v) ? value : v));
		return new Series<T>(out, this.name);
	}

	median(): number | null {
		const numeric = this.data.filter((v) => typeof v === 'number' && !Number.isNaN(v as number)) as number[];
		if (numeric.length === 0) return null;
		numeric.sort((a, b) => a - b);
		const mid = Math.floor(numeric.length / 2);
		if (numeric.length % 2 === 0) {
			const a = numeric[mid - 1]!;
			const b = numeric[mid]!;
			return (a + b) / 2;
		}
		return numeric[mid]!;
	}

	mode(): T[] {
		const counts = new Map<string, { value: T; count: number }>();
		for (const v of this.data) {
			const key = Series.keyOf(v);
			const entry = counts.get(key);
			if (entry) entry.count += 1; else counts.set(key, { value: v, count: 1 });
		}
		let max = 0;
		for (const { count } of counts.values()) max = Math.max(max, count);
		return Array.from(counts.values()).filter((e) => e.count === max).map((e) => e.value);
	}

	valueCounts(options?: { normalize?: boolean; sort?: boolean; ascending?: boolean; dropna?: boolean }): Array<{ value: T; count: number; proportion?: number }>{
		const normalize = options?.normalize ?? false;
		const sort = options?.sort ?? true;
		const ascending = options?.ascending ?? false;
		const dropna = options?.dropna ?? true;
		const counts = new Map<string, { value: T; count: number }>();
		for (const v of this.data) {
			if (dropna && Series.isMissing(v)) continue;
			const key = Series.keyOf(v);
			const entry = counts.get(key);
			if (entry) entry.count += 1; else counts.set(key, { value: v, count: 1 });
		}
		let arr = Array.from(counts.values());
		if (sort) arr.sort((a, b) => (ascending ? a.count - b.count : b.count - a.count));
		if (normalize) {
			const total = arr.reduce((s, e) => s + e.count, 0) || 1;
			return arr.map((e) => ({ ...e, proportion: e.count / total }));
		}
		return arr;
	}

	private static isMissing(v: Primitive): boolean {
		return v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
	}

	private static keyOf(v: Primitive): string {
		if (v instanceof Date) return `__date__:${v.toISOString()}`;
		return String(v);
	}

	private normalizeIndex(i: number): number {
		const len = this.data.length;
		return i >= 0 ? i : Math.max(0, len + i);
	}

	private normalizeSlice(start: number, end: number): [number, number] {
		const len = this.data.length;
		const s = start >= 0 ? start : Math.max(0, len + start);
		const e = end >= 0 ? Math.min(end, len) : len + end;
		return [Math.max(0, s), Math.max(0, Math.min(len, e))];
	}
}


