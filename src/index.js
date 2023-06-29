class DataFrame {
	constructor(
		data = null,
		index = null,
		columns = null,
		dtype = null,
		copy = false
	) {
		this._data = data;
		this._index = index;
		this._columns = columns;
		this._dtype = dtype;
		this._copy = copy;

		if (data !== null) {
			if (Array.isArray(data)) {
				if (columns !== null && data.length !== columns.length) {
					throw new Error(
						'Length of columns does not match the length of data'
					);
				}
				this._data = data;
				this._columns = columns || [...Array(data[0].length).keys()];
			} else if (typeof data === 'object' && !Array.isArray(data)) {
				this._data = Object.values(data);
				this._columns = columns || Object.keys(data);
			} else {
				throw new Error(
					'Invalid data format. Please provide an array or object'
				);
			}
		}

		if (index !== null) {
			this._index = index;
		} else if (data !== null) {
			this._index = [...Array(this.getRowCount()).keys()];
		}
	}

	getData() {
		return this._data;
	}

	getIndex() {
		return this._index;
	}

	getColumns() {
		return this._columns;
	}

	getRowCount() {
		return this._data[0].length;
	}

	getColumnCount() {
		return this._columns.length;
	}

	getValue(row, column) {
		const columnIndex = this._columns.indexOf(column);
		if (columnIndex === -1) {
			throw new Error(`Column '${column}' does not exist`);
		}
		return this._data[row][columnIndex];
	}

	shape() {
		const rowCount = this.getRowCount();
		const columnCount = this.getColumnCount();
		return [rowCount, columnCount];
	}

	// Print DataFrame to console
	head(rows = 5) {
		const dataToDisplay = this._data.slice(0, rows);
		const tableData = dataToDisplay.map(row => {
			const rowData = {};
			this._columns.forEach((column, index) => {
				rowData[column] = row[index];
			});
			return rowData;
		});
		console.table(tableData);
	}
	tail(rows = 5) {
		const dataToDisplay = this._data.slice(-rows);
		const tableData = dataToDisplay.map(row => {
			const rowData = {};
			this._columns.forEach((column, index) => {
				rowData[column] = row[index];
			});
			return rowData;
		});
		console.table(tableData);
	}
}

module.exports = {
	DataFrame
};
