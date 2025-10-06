import { Series, type Primitive } from './Series';

export type Row = Record<string, Primitive>;

export interface DataFrameDescribeRow {
	count: number;
	mean: number | null;
	min: number | null;
	max: number | null;
}

export class DataFrame {
	private readonly rows: Row[];

	constructor(rows: Row[] | ReadonlyArray<Row>) {
		this.rows = rows.map((r) => ({ ...r }));
	}

	static fromJSON(json: Row[] | ReadonlyArray<Row>): DataFrame {
		return new DataFrame(Array.from(json));
	}

	static fromCSV(csv: string, options?: { delimiter?: string; header?: string[] }): DataFrame {
		const delimiter = options?.delimiter ?? ',';
		const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
		if (lines.length === 0) return new DataFrame([]);
		const header = options?.header ?? lines[0]!.split(delimiter).map((h) => h.trim());
		const startIndex = options?.header ? 0 : 1;
		const rows: Row[] = [];
		for (let i = startIndex; i < lines.length; i++) {
			const parts = DataFrame.parseCSVLine(lines[i]!, delimiter);
			const row: Row = {};
			header.forEach((name, idx) => {
				row[name] = DataFrame.autoType(parts[idx]);
			});
			rows.push(row);
		}
		return new DataFrame(rows);
	}

	private static parseCSVLine(line: string, delimiter: string): string[] {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (ch === delimiter && !inQuotes) {
				result.push(current);
				current = '';
			} else {
				current += ch;
			}
		}
		result.push(current);
		return result.map((s) => s.trim());
	}

	private static autoType(value: string | undefined): Primitive {
		if (value === undefined) return undefined;
		const trimmed = value.trim();
		if (trimmed === '') return '';
		if (trimmed === 'null') return null;
		if (trimmed === 'undefined') return undefined;
		if (trimmed === 'true') return true;
		if (trimmed === 'false') return false;
		const num = Number(trimmed);
		if (!Number.isNaN(num) && /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(trimmed)) return num;
		const date = new Date(trimmed);
		if (!isNaN(date.getTime())) return date;
		return trimmed;
	}

	get shape(): [number, number] {
		return [this.rows.length, this.columns.length];
	}

	get columns(): string[] {
		const set = new Set<string>();
		for (const r of this.rows) {
			Object.keys(r).forEach((k) => set.add(k));
		}
		return Array.from(set);
	}

	head(n = 5): DataFrame {
		return new DataFrame(this.rows.slice(0, Math.max(0, n)));
	}

	tail(n = 5): DataFrame {
		return new DataFrame(this.rows.slice(Math.max(0, this.rows.length - n)));
	}

	iloc(rowStart: number, rowEnd?: number): DataFrame {
		if (rowEnd === undefined) {
			const idx = this.normalizeIndex(rowStart, this.rows.length);
			const row = this.rows[idx];
			return new DataFrame(row ? [row] : []);
		}
		const [s, e] = this.normalizeSlice(rowStart, rowEnd, this.rows.length);
		return new DataFrame(this.rows.slice(s, e));
	}

	col(name: string): Series<Primitive> {
		return new Series(this.rows.map((r) => r[name]));
	}

	select(names: string[]): DataFrame {
		const projected = this.rows.map((r) => {
			const o: Row = {};
			for (const n of names) o[n] = r[n];
			return o;
		});
		return new DataFrame(projected);
	}

	dropna(options?: { axis?: 0 | 1; subset?: string[] }): DataFrame {
		const axis = options?.axis ?? 0; // 0 rows, 1 columns
		if (axis === 0) {
			const subset = options?.subset ?? this.columns;
			const rows = this.rows.filter((r) => subset.every((c) => !DataFrame.isMissing(r[c])));
			return new DataFrame(rows);
		}
		// drop columns with any missing
		const keepCols = this.columns.filter((c) => this.rows.every((r) => !DataFrame.isMissing(r[c])));
		return this.select(keepCols);
	}

	fillna(value: Primitive, options?: { subset?: string[] }): DataFrame {
		const subset = options?.subset ?? this.columns;
		const rows = this.rows.map((r) => {
			const out: Row = { ...r };
			for (const c of subset) if (DataFrame.isMissing(out[c])) out[c] = value;
			return out;
		});
		return new DataFrame(rows);
	}

	drop(columns?: string[] | { columns?: string[]; index?: number[] }): DataFrame {
		if (Array.isArray(columns)) {
			const colsToDrop = new Set(columns);
			const rows = this.rows.map((r) => {
				const o: Row = {};
				for (const k of Object.keys(r)) if (!colsToDrop.has(k)) o[k] = r[k];
				return o;
			});
			return new DataFrame(rows);
		}
		const cols = new Set(columns?.columns ?? []);
		const idx = new Set(columns?.index ?? []);
		const filteredRows = this.rows.filter((_, i) => !idx.has(i)).map((r) => {
			const o: Row = {};
			for (const k of Object.keys(r)) if (!cols.has(k)) o[k] = r[k];
			return o;
		});
		return new DataFrame(filteredRows);
	}

	rename(mapper: Record<string, string>): DataFrame {
		const rows = this.rows.map((r) => {
			const o: Row = {};
			for (const [k, v] of Object.entries(r)) o[mapper[k] ?? k] = v;
			return o;
		});
		return new DataFrame(rows);
	}

	assign(newCols: Record<string, (row: Row, index: number) => Primitive | Primitive>): DataFrame {
		const rows = this.rows.map((r, i) => {
			const o: Row = { ...r };
			for (const [k, fn] of Object.entries(newCols)) {
				const val = typeof fn === 'function' ? (fn as (row: Row, index: number) => Primitive)(r, i) : (fn as Primitive);
				o[k] = val;
			}
			return o;
		});
		return new DataFrame(rows);
	}

	apply(fn: (row: Row, index: number) => Row): DataFrame {
		return new DataFrame(this.rows.map((r, i) => fn({ ...r }, i)));
	}

	sortValues(by: string | string[], options?: { ascending?: boolean | boolean[]; naPosition?: 'first' | 'last' }): DataFrame {
		const cols = Array.isArray(by) ? by : [by];
		const ascending = Array.isArray(options?.ascending) ? options!.ascending as boolean[] : [options?.ascending ?? true];
		const naPosition = options?.naPosition ?? 'last';
		const rows = [...this.rows];
		rows.sort((a, b) => {
			for (let i = 0; i < cols.length; i++) {
				const col = cols[i]!;
				const asc = ascending[i] ?? ascending[ascending.length - 1] ?? true;
				const av = a[col];
				const bv = b[col];
				const aMissing = DataFrame.isMissing(av);
				const bMissing = DataFrame.isMissing(bv);
				if (aMissing || bMissing) {
					if (aMissing && bMissing) continue;
					const dir = naPosition === 'first' ? -1 : 1;
					return aMissing ? dir : -dir;
				}
				const cmp = DataFrame.compare(av, bv);
				if (cmp !== 0) return asc ? cmp : -cmp;
			}
			return 0;
		});
		return new DataFrame(rows);
	}

	get length(): number {
		return this.rows.length;
	}

	sum(column: string): number {
		return this.col(column).sum();
	}

	mean(column: string): number | null {
		return this.col(column).mean();
	}

	min(column: string): number | null {
		return this.col(column).min();
	}

	max(column: string): number | null {
		return this.col(column).max();
	}

	describe(columns?: string[]): Record<string, DataFrameDescribeRow> {
		const cols = columns ?? this.columns;
		const out: Record<string, DataFrameDescribeRow> = {};
		for (const c of cols) {
			const s = this.col(c) as unknown as Series<number>;
			out[c] = s.describe();
		}
		return out;
	}

	median(column: string): number | null {
		return (this.col(column) as unknown as Series<number>).median();
	}

	mode(column: string): Primitive[] {
		return this.col(column).mode();
	}

	valueCounts(column: string, options?: { normalize?: boolean; sort?: boolean; ascending?: boolean; dropna?: boolean }) {
		return this.col(column).valueCounts(options);
	}

	toJSON(): Row[] {
		return this.rows.map((r) => ({ ...r }));
	}

	private normalizeIndex(i: number, len: number): number {
		return i >= 0 ? i : Math.max(0, len + i);
	}

	private normalizeSlice(start: number, end: number, len: number): [number, number] {
		const s = start >= 0 ? start : Math.max(0, len + start);
		const e = end >= 0 ? Math.min(end, len) : len + end;
		return [Math.max(0, s), Math.max(0, Math.min(len, e))];
	}

	private static isMissing(v: Primitive): boolean {
		return v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
	}

	private static compare(a: Primitive, b: Primitive): number {
		if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
		if (typeof a === 'number' && typeof b === 'number') return a - b;
		return String(a).localeCompare(String(b));
	}
}


