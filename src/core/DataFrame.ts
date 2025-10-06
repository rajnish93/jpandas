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

	// JS-friendly aliases
	getRowsByIndex(start: number, end?: number): DataFrame {
		return this.iloc(start, end);
	}

	getRowsByCondition(fn: (row: Row, index: number) => boolean): DataFrame {
		return new DataFrame(this.rows.filter((r, i) => fn(r, i)));
	}

	filter(fn: (row: Row, index: number) => boolean): DataFrame {
		return this.getRowsByCondition(fn);
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

	// Column-wise mapper
	mapColumns(fn: (value: Primitive, column: string, row: Row, rowIndex: number) => Primitive, columns?: string[]): DataFrame {
		const cols = columns ?? this.columns;
		const rows = this.rows.map((r, i) => {
			const o: Row = { ...r };
			for (const c of cols) {
				o[c] = fn(r[c], c, r, i);
			}
			return o;
		});
		return new DataFrame(rows);
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

	// JS-friendly aliases
	static fromArray(rows: Row[] | ReadonlyArray<Row>): DataFrame {
		return DataFrame.fromJSON(rows);
	}

	toObject(): Row[] {
		return this.toJSON();
	}

	toCSV(options?: { delimiter?: string; header?: boolean; quote?: 'auto' | 'always' | 'never' }): string {
		const delimiter = options?.delimiter ?? ',';
		const header = options?.header ?? true;
		const quote = options?.quote ?? 'auto';
		const cols = this.columns;
		const lines: string[] = [];
		if (header) lines.push(cols.join(delimiter));
		for (const r of this.rows) {
			const parts = cols.map((c) => DataFrame.serializeCSVValue(r[c], delimiter, quote));
			lines.push(parts.join(delimiter));
		}
		return lines.join('\n');
	}

	private static serializeCSVValue(v: Primitive, delimiter: string, quote: 'auto' | 'always' | 'never'): string {
		if (v === null || v === undefined) return '';
		let s = v instanceof Date ? v.toISOString() : String(v);
		const needsQuote = quote === 'always' || (quote === 'auto' && (s.includes(delimiter) || s.includes('"') || /\s/.test(s)));
		if (needsQuote) {
			s = '"' + s.replace(/"/g, '""') + '"';
		}
		return s;
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

	getColumnTypes(): Record<string, string> {
		const types: Record<string, string> = {};
		for (const c of this.columns) {
			const seen = new Set<string>();
			for (const r of this.rows) {
				const v = r[c];
				if (v === null) { seen.add('null'); continue; }
				if (v === undefined) { seen.add('undefined'); continue; }
				if (v instanceof Date) { seen.add('date'); continue; }
				seen.add(typeof v);
			}
			if (seen.size === 0) types[c] = 'undefined';
			else if (seen.size === 1) types[c] = Array.from(seen)[0]!;
			else types[c] = 'mixed';
		}
		return types;
	}

	// ===== GroupBy =====
	groupby(by: string | string[]) {
		const keys = Array.isArray(by) ? by : [by];
		const groups = new Map<string, { keyValues: Row; rows: Row[] }>();
		for (const r of this.rows) {
			const keyValues: Row = {};
			for (const k of keys) keyValues[k] = r[k];
			const key = JSON.stringify(keys.map((k) => keyValues[k]));
			let g = groups.get(key);
			if (!g) {
				g = { keyValues, rows: [] };
				groups.set(key, g);
			}
			g.rows.push(r);
		}
		const numericCols = this.columns.filter((c) => this.rows.some((r) => typeof r[c] === 'number'));
		const aggregate = (fn: (values: number[]) => number | null) => {
			const out: Row[] = [];
			for (const { keyValues, rows } of groups.values()) {
				const row: Row = { ...keyValues };
				for (const c of numericCols) {
					const values = rows.map((r) => r[c]).filter((v) => typeof v === 'number') as number[];
					row[c] = fn(values) as Primitive;
				}
				out.push(row);
			}
			return new DataFrame(out);
		};
		return {
			sum: () => aggregate((vals) => vals.reduce((a, b) => a + b, 0)),
			mean: () => aggregate((vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null)),
			count: () => new DataFrame(Array.from(groups.values()).map(({ keyValues, rows }) => ({ ...keyValues, count: rows.length }))),
			min: () => aggregate((vals) => (vals.length ? Math.min(...vals) : null)),
			max: () => aggregate((vals) => (vals.length ? Math.max(...vals) : null)),
		};
	}

	// ===== Merge/Join =====
	merge(other: DataFrame, options: { on?: string | string[]; leftOn?: string | string[]; rightOn?: string | string[]; how?: 'inner' | 'left' | 'right' | 'outer'; suffixes?: [string, string] } = {}): DataFrame {
		const how = options.how ?? 'inner';
		const leftKeys = (options.leftOn ?? options.on) as string | string[] | undefined;
		const rightKeys = (options.rightOn ?? options.on) as string | string[] | undefined;
		const lks = Array.isArray(leftKeys) ? leftKeys : leftKeys ? [leftKeys] : [];
		const rks = Array.isArray(rightKeys) ? rightKeys : rightKeys ? [rightKeys] : lks;
		if (lks.length !== rks.length) throw new Error('merge: left keys and right keys must have same length');
		const [lsuf, rsuf] = options.suffixes ?? ['_x', '_y'];
		const rightIndex = new Map<string, Row[]>();
		for (const rr of other.rows) {
			const key = JSON.stringify(rks.map((k) => rr[k]));
			const arr = rightIndex.get(key);
			if (arr) arr.push(rr); else rightIndex.set(key, [rr]);
		}
		const results: Row[] = [];
		const matchedRight = new Set<Row>();
		for (const lr of this.rows) {
			const key = JSON.stringify(lks.map((k) => lr[k]));
			const matches = rightIndex.get(key) ?? [];
			if (matches.length) {
				for (const rr of matches) {
					matchedRight.add(rr);
					results.push(DataFrame.mergeRows(lr, rr, lks, rks, lsuf, rsuf));
				}
			} else if (how === 'left' || how === 'outer') {
				results.push(DataFrame.mergeRows(lr, undefined, lks, rks, lsuf, rsuf));
			}
		}
		if (how === 'right' || how === 'outer') {
			for (const rr of other.rows) {
				if (!matchedRight.has(rr)) {
					results.push(DataFrame.mergeRows(undefined, rr, lks, rks, lsuf, rsuf));
				}
			}
		}
		return new DataFrame(results);
	}

	private static mergeRows(left: Row | undefined, right: Row | undefined, lks: string[], rks: string[], lsuf: string, rsuf: string): Row {
		const out: Row = {};
		if (left) {
			for (const [k, v] of Object.entries(left)) {
				const isKey = lks.includes(k);
				const collide = right && Object.prototype.hasOwnProperty.call(right, k) && !rks.includes(k);
				out[collide && !isKey ? k + lsuf : k] = v;
			}
		}
		if (right) {
			for (const [k, v] of Object.entries(right)) {
				const isKey = rks.includes(k);
				const collide = left && Object.prototype.hasOwnProperty.call(left, k) && !lks.includes(k);
				const name = collide && !isKey ? k + rsuf : k;
				if (!(name in out)) out[name] = v; else out[name] = v;
			}
		}
		return out;
	}

	// ===== Concat =====
	static concat(frames: DataFrame[], options?: { axis?: 0 | 1; suffixes?: string[] }): DataFrame {
		const axis = options?.axis ?? 0;
		if (axis === 0) {
			const allCols = new Set<string>();
			for (const f of frames) f.columns.forEach((c) => allCols.add(c));
			const rows: Row[] = [];
			for (const f of frames) {
				for (const r of f.rows) {
					const o: Row = {};
					for (const c of allCols) o[c] = r[c];
					rows.push(o);
				}
			}
			return new DataFrame(rows);
		}
		// axis=1: column-wise by index alignment
		const suffixes = options?.suffixes ?? frames.map((_, i) => `_${i}`);
		const maxLen = Math.max(...frames.map((f) => f.rows.length), 0);
		const rows: Row[] = [];
		for (let i = 0; i < maxLen; i++) {
			const o: Row = {};
			for (let fi = 0; fi < frames.length; fi++) {
				const f = frames[fi]!;
				const r = f.rows[i];
				if (!r) continue;
				for (const [k, v] of Object.entries(r)) {
					if (Object.prototype.hasOwnProperty.call(o, k)) o[k + suffixes[fi]!] = v; else o[k] = v;
				}
			}
			rows.push(o);
		}
		return new DataFrame(rows);
	}

	// ===== Pivot / Pivot Table =====
	pivot(options: { index: string; columns: string; values: string }): DataFrame {
		const { index, columns, values } = options;
		const rowKeys = Array.from(new Set(this.rows.map((r) => r[index])));
		const colKeys = Array.from(new Set(this.rows.map((r) => r[columns])));
		const lookup = new Map<string, Primitive>();
		for (const r of this.rows) {
			const key = JSON.stringify([r[index], r[columns]]);
			lookup.set(key, r[values]);
		}
		const out: Row[] = [];
		for (const rk of rowKeys) {
			const row: Row = { [index]: rk };
			for (const ck of colKeys) {
				const key = JSON.stringify([rk, ck]);
				row[String(ck)] = lookup.get(key);
			}
			out.push(row);
		}
		return new DataFrame(out);
	}

	pivotTable(options: { index: string; columns: string; values: string; aggfunc?: 'sum' | 'mean' | 'count' | 'min' | 'max' }): DataFrame {
		const { index, columns, values } = options;
		const agg = options.aggfunc ?? 'mean';
		// group by [index, columns]
		const grouped = this.groupby([index, columns]);
		let df: DataFrame;
		switch (agg) {
			case 'sum': df = grouped.sum(); break;
			case 'count': df = grouped.count(); break;
			case 'min': df = grouped.min(); break;
			case 'max': df = grouped.max(); break;
			default: df = grouped.mean(); break;
		}
		// Now pivot
		return df.pivot({ index, columns, values });
	}
}


