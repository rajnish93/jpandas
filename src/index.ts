export default class DataFrame<T extends { [key: string]: any }> {
	private _data: T[] | null;
	private _index: (string | number)[] | null;
	private _columns: (keyof T | number)[] | null;
	private _dtype: string | null;
	private _copy: boolean;

	constructor(
		data: T[] | { [key: string]: any[] } | string | null = null,
		index: (string | number)[] | null = null,
		columns: (keyof T | number)[] | null = null,
		dtype: string | null = null,
		copy: boolean = false
	) {
		this._data = null;
		this._columns = columns;
		this._index = index;
		this._dtype = dtype;
		this._copy = copy;

		if (data === null || (Array.isArray(data) && data.length === 0)) {
			this._data = [];
		} else if (typeof data === 'string') {
			try {
				const jsonData = JSON.parse(data);
				if (Array.isArray(jsonData)) {
					this._parseArray(jsonData);
				} else {
					this._parseObject(jsonData);
				}
			} catch (e) {
				this._parseCSV(data);
			}
		} else if (Array.isArray(data)) {
			this._parseArray(data);
		} else if (typeof data === 'object' && data !== null) {
			this._parseObject(data);
		} else {
			throw new Error(
				'Invalid data format. Please provide an array, object, CSV string, or JSON string'
			);
		}

		if (index === null && this._data !== null) {
			this._index = [...Array(this.getRowCount()).keys()];
		}
		this._checkNumericColumns();
	}

	private _parseArray(data: any[][] | { [key: string]: any }[]): void {
		if (!Array.isArray(data) || data.length === 0) {
			throw new Error(
				'Array data should be a non-empty array of arrays or objects'
			);
		}

		if (data[0] instanceof Array) {
			// Handle 2D array
			const numColumns = data[0].length;
			if (
				!data.every(
					row => Array.isArray(row) && row.length === numColumns
				)
			) {
				throw new Error(
					'All rows should have the same number of columns'
				);
			}

			this._columns =
				this._columns ||
				Array.from({ length: numColumns }, (_, i) => i as keyof T);
		} else {
			// Handle array of objects
			const columnNames = Object.keys(data[0]);
			if (
				!data.every(obj =>
					Object.keys(obj).every(key => columnNames.includes(key))
				)
			) {
				throw new Error('All objects should have the same properties');
			}

			this._columns = this._columns || columnNames;
		}

		this._data = data as unknown as T[];
	}

	private _parseObject(data: { [key: string]: any[] }): void {
		const rows: T[] = [];
		const columns = Object.keys(data);
		const rowCount = columns.reduce(
			(min, column) => Math.min(min, data[column].length),
			Infinity
		);
		for (let i = 0; i < rowCount; i++) {
			const row: T = {} as T;
			columns.forEach(column => {
				(row as any)[column] = data[column][i];
			});
			rows.push(row);
		}
		this._data = rows;
		this._columns = columns as (keyof T)[];
	}

	private _parseCSV(data: string): void {
		const rows = data.trim().split('\n');
		const columns = rows[0]
			.split(',')
			.map(col => col.trim()) as (keyof T)[];
		const dataRows = rows.slice(1).map(row => {
			const values = row.split(',').map(value => value.trim());
			const obj: T = {} as T;
			columns.forEach((col, i) => {
				if (!isNaN(Number(values[i]))) {
					(obj as any)[col] = Number(values[i]);
				} else {
					(obj as any)[col] = values[i];
				}
			});
			return obj;
		});
		this._data = dataRows;
		this._columns = columns;
	}

	private _checkNumericColumns(): void {
		if (!this._data) return;

		this._columns?.forEach((column, index) => {
			const values =
				this._data !== null
					? this._data.map(row => row[column as keyof T])
					: [];
			const isNumericColumn = values.every(
				value => typeof value === 'number'
			);

			if (isNumericColumn) {
				const nonNumericValues = values.filter(value => isNaN(value));
				if (nonNumericValues.length > 0) {
					throw new Error(
						`Column '${String(
							column
						)}' contains non-numeric values: ${nonNumericValues.join(
							', '
						)}`
					);
				}
			}
		});
	}

	getData(): T[] | null {
		return this._data;
	}

	getIndex(): (string | number)[] | null {
		return this._index;
	}

	getColumns(): (keyof T)[] | null {
		return this._columns;
	}

	getRowCount(): number {
		return this._data ? this._data.length : 0;
	}

	getColumnCount(): number {
		return this._columns ? this._columns.length : 0;
	}

	getValue<K extends keyof T>(row: number, column: K): T[K] | null {
		const columnIndex = this._columns?.indexOf(column);
		if (columnIndex === -1) {
			throw new Error(`Column '${String(column)}' does not exist`);
		}
		return this._data ? this._data[row][column] : null;
	}

	shape(): [number, number] {
		return [this.getRowCount(), this.getColumnCount()];
	}
}