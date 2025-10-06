export type Primitive = string | number | boolean | null | undefined | Date;

export interface SeriesDescribe {
	count: number;
	mean: number | null;
	min: number | null;
	max: number | null;
}

export class Series<T extends Primitive = Primitive> {
	private readonly data: T[];
	readonly name?: string;

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
			return new Series([this.data[this.normalizeIndex(start)]], this.name);
		}
		const [s, e] = this.normalizeSlice(start, end);
		return new Series(this.data.slice(s, e), this.name);
	}

	get(i: number): T | undefined {
		return this.data[this.normalizeIndex(i)];
	}

	sum(this: Series<number>): number {
		return this.data.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
	}

	mean(this: Series<number>): number | null {
		if (this.data.length === 0) return null;
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return numeric.reduce((a, b) => a + b, 0) / numeric.length;
	}

	min(this: Series<number>): number | null {
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return Math.min(...numeric);
	}

	max(this: Series<number>): number | null {
		const numeric = this.data.filter((v) => typeof v === 'number') as number[];
		if (numeric.length === 0) return null;
		return Math.max(...numeric);
	}

	describe(this: Series<number>): SeriesDescribe {
		const count = this.data.filter((v) => typeof v === 'number').length;
		return {
			count,
			mean: this.mean(),
			min: this.min(),
			max: this.max(),
		};
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


