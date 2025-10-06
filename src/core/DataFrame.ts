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
}


