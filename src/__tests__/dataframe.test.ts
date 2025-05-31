import DataFrame from '../index';

describe('DataFrame', () => {
	describe('Create DataFrame from an array', () => {
		it('should correctly create DataFrame from array', () => {
			const data = [
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			];
			const df = new DataFrame<number[]>(data, null, [0, 1, 2]);
			expect(df.getRowCount()).toBe(3);
			expect(df.getColumnCount()).toBe(3);
			expect(df.shape()).toEqual([3, 3]);
			expect(df.getValue(0, 0)).toBe(1);
			expect(df.getValue(1, 1)).toBe(5);
			expect(df.getValue(2, 2)).toBe(9);
			expect(df.head(2).getData()?.[1]).toEqual([2, 5, 8]);
		});
	});

	describe('Create DataFrame from an object', () => {
		it('should correctly create DataFrame from object', () => {
			const data = {
				Name: ['Ankit', 'Aishwarya', 'Shaurya', 'Shivangi'],
				Age: [23, 21, 22, 21],
				University: ['BHU', 'JNU', 'DU', 'BHU']
			};
			const df = new DataFrame(data);

			expect(df.getRowCount()).toBe(4);
			expect(df.getColumnCount()).toBe(3);
			expect(df.shape()).toEqual([4, 3]);
			expect(df.getValue(0, 'Name')).toBe('Ankit');
			expect(df.getValue(1, 'Age')).toBe(21);
			expect(df.getValue(2, 'University')).toBe('DU');
			expect(df.head(2).getData()?.[1]).toEqual({
				Age: 21,
				Name: 'Aishwarya',
				University: 'JNU'
			});
		});
	});

	describe('Create DataFrame from CSV string', () => {
		it('should correctly create DataFrame from CSV string', () => {
			const csvData = `Name,Age,University\nAnkit,23,BHU\nAishwarya,21,JNU\nShaurya,22,DU\nShivangi,21,BHU`;
			const df = new DataFrame(csvData);
			expect(df.getRowCount()).toBe(4);
			expect(df.getColumnCount()).toBe(3);
			expect(df.getValue(0, 'Name')).toBe('Ankit');
			expect(df.getValue(1, 'Age')).toBe(21);
			expect(df.getValue(2, 'University')).toBe('DU');
			expect(df.head(2).getData()?.[1]).toEqual({
				Age: 21,
				Name: 'Aishwarya',
				University: 'JNU'
			});
		});
	});

	describe('Create DataFrame from JSON string', () => {
		it('should correctly create DataFrame from JSON string', () => {
			const jsonString = `[
			{"Name": "Ankit", "Age": 23, "University": "BHU"},
			{"Name": "Aishwarya", "Age": 21, "University": "JNU"},
			{"Name": "Shaurya", "Age": 22, "University": "DU"},
			{"Name": "Shivangi", "Age": 21, "University": "BHU"}
			]`;

			const jsonData = JSON.parse(jsonString);
			const df = new DataFrame(jsonData);

			expect(df.getRowCount()).toBe(4);
			expect(df.getColumnCount()).toBe(3);
			expect(df.getValue(0, 'Name')).toBe('Ankit');
			expect(df.getValue(1, 'Age')).toBe(21);
			expect(df.getValue(2, 'University')).toBe('DU');
			expect(df.head(2).getData()?.[1]).toEqual({
				Age: 21,
				Name: 'Aishwarya',
				University: 'JNU'
			});
		});
	});

	describe('GroupBy DataFrame', () => {
		it('should correctly group DataFrame by column', () => {
			const data = [
				{ Name: 'Ankit', Age: 23, University: 'BHU' },
				{ Name: 'Aishwarya', Age: 21, University: 'JNU' },
				{ Name: 'Shaurya', Age: 22, University: 'DU' },
				{ Name: 'Shivangi', Age: 21, University: 'BHU' }
			];
			const df = new DataFrame(data);
			const grouped = df.groupBy('University');
			expect(Object.keys(grouped || {}).length).toBe(3);
			console.log("grouped?['BHU']::", df.groupBy('University'));

			const df1 = new DataFrame([
				{ name: 'John', age: 25, country: 'USA' },
				{ name: 'Alice', age: 30, country: 'UK' },
				{ name: 'Bob', age: 35, country: 'USA' }
			]);

			const result = df1
				.filter(row => row.age > 30)
				.select(['name', 'age'])
				.assign('ageGroup', row => (row.age > 30 ? 'old' : 'young'));

			expect(result.head().getData()?.[0]).toEqual({
				name: 'Bob',
				age: 35,
				ageGroup: 'old'
			});
			console.log('result:', result.head());
		});
	});

	describe('DataFrame.rename', () => {
		it('renames columns correctly', () => {
			const data = [
				{ a: 1, b: 2, c: 3 },
				{ a: 4, b: 5, c: 6 }
			];
			const df = new DataFrame(data);
			const renamedDf = df.rename({ a: 'x', b: 'y' });

			expect(renamedDf.getColumns()).toEqual(['x', 'y', 'c']);
			expect(renamedDf.getData()).toEqual([
				{ x: 1, y: 2, c: 3 },
				{ x: 4, y: 5, c: 6 }
			]);
		});

		it('leaves columns unchanged if no rename is specified', () => {
			const data = [
				{ a: 1, b: 2, c: 3 },
				{ a: 4, b: 5, c: 6 }
			];
			const df = new DataFrame(data);
			const renamedDf = df.rename({});

			expect(renamedDf.getColumns()).toEqual(['a', 'b', 'c']);
			expect(renamedDf.getData()).toEqual([
				{ a: 1, b: 2, c: 3 },
				{ a: 4, b: 5, c: 6 }
			]);
		});
	});

	describe('Transform DataFrame', () => {
		it('should correctly transform DataFrame', () => {
			const data = [
				{ Name: 'Ankit', Age: 23, University: 'BHU' },
				{ Name: 'Aishwarya', Age: 21, University: 'JNU' }
			];
			const df = new DataFrame(data);
			const transformedDf = df.transform(row => ({
				FullName: row.Name,
				Age: row.Age + 1
			}));
			expect(transformedDf.getRowCount()).toBe(2);
			expect(transformedDf.getColumnCount()).toBe(2);
			expect(transformedDf.getValue(0, 'FullName')).toBe('Ankit');
			expect(transformedDf.getValue(1, 'Age')).toBe(22);
		});
	});

	describe('Calculate mean of a column', () => {
		it('should correctly calculate mean', () => {
			const data = [
				{ Name: 'Ankit', Age: 23, University: 'BHU' },
				{ Name: 'Aishwarya', Age: 21, University: 'JNU' },
				{ Name: 'Shaurya', Age: 22, University: 'DU' }
			];
			const df = new DataFrame(data);
			const meanAge = df.mean('Age');
			expect(meanAge).toBe(22);
		});

		it('should return null for empty data', () => {
			const df = new DataFrame([]);
			const meanAge = df.mean('Age');
			expect(meanAge).toBeNull();
		});

		it('should return null if column contains non-numeric values', () => {
			const data = [
				{ Name: 'Ankit', Age: 'Twenty-Three', University: 'BHU' },
				{ Name: 'Aishwarya', Age: 21, University: 'JNU' }
			];
			const df = new DataFrame(data);
			expect(() => df.mean('Age')).toThrow(
				"Data at index 0 contains non-numeric value 'Twenty-Three' in column 'Age'."
			);
		});
	});

	describe('DataFrame.fillna', () => {
		it('should fill null/undefined values with a specified number', () => {
			const data = [
				{ name: 'Alice', age: 25, city: 'New York' },
				{ name: 'Bob', age: null, city: 'London' },
				{ name: 'Charlie', age: 30, city: undefined }
			];
			const df = new DataFrame(data);
			const filledDf = df.fillna(0);
			expect(filledDf.getData()).toEqual([
				{ name: 'Alice', age: 25, city: 'New York' },
				{ name: 'Bob', age: 0, city: 'London' },
				{ name: 'Charlie', age: 30, city: 0 }
			]);
			// Ensure original is not modified
			expect(df.getData()?.[1].age).toBeNull();
			expect(df.getData()?.[2].city).toBeUndefined();
		});

		it('should fill null/undefined values with a specified string', () => {
			const data = [
				{ name: 'Alice', value: 100 },
				{ name: 'Bob', value: undefined },
				{ name: 'Charlie', value: null }
			];
			const df = new DataFrame(data);
			const filledDf = df.fillna('N/A');
			expect(filledDf.getData()).toEqual([
				{ name: 'Alice', value: 100 },
				{ name: 'Bob', value: 'N/A' },
				{ name: 'Charlie', value: 'N/A' }
			]);
		});

		it('should return an empty DataFrame if original is empty', () => {
			const df = new DataFrame([]);
			const filledDf = df.fillna(0);
			expect(filledDf.getData()).toEqual([]);
			expect(filledDf.getRowCount()).toBe(0);
		});

		it('should return a new identical DataFrame if no missing values', () => {
			const data = [
				{ name: 'Alice', age: 25 },
				{ name: 'Bob', age: 30 }
			];
			const df = new DataFrame(data);
			const filledDf = df.fillna(0);
			expect(filledDf.getData()).toEqual(data);
			expect(filledDf.getData()).not.toBe(df.getData()); // Check it's a new instance
		});

		it('should fill all values if all are missing (relevant columns)', () => {
			const data = [
				{ name: null, age: undefined },
				{ name: undefined, age: null }
			];
			const df = new DataFrame(data, null, ['name', 'age']);
			const filledDf = df.fillna('Filled');
			expect(filledDf.getData()).toEqual([
				{ name: 'Filled', age: 'Filled' },
				{ name: 'Filled', age: 'Filled' }
			]);
		});
	});

	describe('DataFrame.dropna', () => {
		const dataWithNaN = [
			{ name: 'Alice', age: 25, score: 100 },
			{ name: 'Bob', age: null, score: 90 },
			{ name: 'Charlie', age: 30, score: undefined },
			{ name: 'David', age: undefined, score: undefined },
			{ name: 'Eve', age: 28, score: 88 },
			{ name: 'Frank', age: null, score: null} // for how='all' test
		];
		const dfOriginal = new DataFrame(dataWithNaN, null, ['name', 'age', 'score']);


		it('should not modify the original DataFrame', () => {
			const dfCopy = new DataFrame(dfOriginal.getData()?.map(r => ({...r})) as any[]); // deep copy for test
			dfCopy.dropna();
			expect(dfCopy.getData()).toEqual(dfOriginal.getData());
		});

		describe("axis = 'row'", () => {
			it("how = 'any' (default) should drop rows with any NaN", () => {
				const df = new DataFrame(dataWithNaN, null, ['name', 'age', 'score']);
				const droppedDf = df.dropna(); // axis='row', how='any'
				expect(droppedDf.getData()).toEqual([
					{ name: 'Alice', age: 25, score: 100 },
					{ name: 'Eve', age: 28, score: 88 }
				]);
				expect(droppedDf.getIndex()).toEqual([0, 4]);
			});

			it("how = 'all' should drop rows with all NaN", () => {
				const df = new DataFrame(dataWithNaN, null, ['name', 'age', 'score']);
				const droppedDf = df.dropna('row', 'all');
				// No rows should be dropped from dataWithNaN because no row has ALL values as null/undefined
				// (name is always present)
				const expectedData = dataWithNaN.map(r => ({...r})); // Make copies
				expect(droppedDf.getData()).toEqual(expectedData);
				// Original indices: 0, 1, 2, 3, 4, 5 (none dropped)
				expect(droppedDf.getIndex()).toEqual([0, 1, 2, 3, 4, 5]);
			});

			it("how = 'all' with a row of all nulls for its defined columns", () => {
				const data = [
					{ name: 'A', value: 1},
					{ name: null, value: null}, // this row should be dropped
					{ name: 'B', value: 2}
				];
				const df = new DataFrame(data, null, ['name', 'value']);
				const droppedDf = df.dropna('row', 'all');
				expect(droppedDf.getData()).toEqual([
					{ name: 'A', value: 1},
					{ name: 'B', value: 2}
				]);
				expect(droppedDf.getIndex()).toEqual([0, 2]);
			});
		});

		describe("axis = 'column'", () => {
			const dataForColDrop = [
				{ a: 1, b: null, c: 3, d: null },
				{ a: 4, b: 5,    c: undefined, d: null },
				{ a: 6, b: 7,    c: 8, d: null }
			];
			const df = new DataFrame(dataForColDrop);

			it("how = 'any' should drop columns with any NaN", () => {
				const droppedDf = df.dropna('column', 'any');
				expect(droppedDf.getColumns()).toEqual(['a']);
				expect(droppedDf.getData()).toEqual([
					{ a: 1 }, { a: 4 }, { a: 6 }
				]);
				expect(droppedDf.getIndex()).toEqual([0,1,2]); // Index should be preserved
			});

			it("how = 'all' should drop columns with all NaN", () => {
				const droppedDf = df.dropna('column', 'all');
				expect(droppedDf.getColumns()).toEqual(['a', 'b', 'c']);
				expect(droppedDf.getData()).toEqual([
					{ a: 1, b: null, c: 3 },
					{ a: 4, b: 5,    c: undefined },
					{ a: 6, b: 7,    c: 8 }
				]);
			});
		});

		it('should return an empty DataFrame if original is empty', () => {
			const df = new DataFrame([]);
			const droppedDf = df.dropna();
			expect(droppedDf.getData()).toEqual([]);
			expect(droppedDf.getRowCount()).toBe(0);
			const droppedDfCols = df.dropna('column');
			expect(droppedDfCols.getData()).toEqual([]);
		});

		it('should return a new identical DataFrame if no missing values', () => {
			const data = [ { name: 'Alice', age: 25 }, { name: 'Bob', age: 30 } ];
			const df = new DataFrame(data);
			const droppedDf = df.dropna();
			expect(droppedDf.getData()).toEqual(data);
			expect(droppedDf.getData()).not.toBe(df.getData()); // New instance

			const droppedDfCols = df.dropna('column');
			expect(droppedDfCols.getData()).toEqual(data);
			expect(droppedDfCols.getData()).not.toBe(df.getData());
		});

		it('should handle DataFrame with only one row', () => {
			const data1 = [{ name: 'Alice', age: null }];
			const df1 = new DataFrame(data1);
			const droppedDf1 = df1.dropna('row', 'any');
			expect(droppedDf1.getData()).toEqual([]);

			const data2 = [{ name: 'Alice', age: 25 }];
			const df2 = new DataFrame(data2);
			const droppedDf2 = df2.dropna('row', 'any');
			expect(droppedDf2.getData()).toEqual(data2);
		});

		it('should handle DataFrame with only one column', () => {
			const data1 = [{ age: 25 }, { age: null }, { age: 30 }];
			const df1 = new DataFrame(data1);
			const droppedDf1 = df1.dropna('column', 'any'); // 'age' column has a null
			expect(droppedDf1.getColumns()).toEqual([]);
			expect(droppedDf1.getData()?.every(row => Object.keys(row).length === 0)).toBe(true);


			const data2 = [{ age: 25 }, { age: 30 }];
			const df2 = new DataFrame(data2);
			const droppedDf2 = df2.dropna('column', 'any');
			expect(droppedDf2.getColumns()).toEqual(['age']);
			expect(droppedDf2.getData()).toEqual(data2);
		});

		it('should correctly update index after dropping rows', () => {
			const data = [
				{ id: 'a', val: 1},
				{ id: 'b', val: null},
				{ id: 'c', val: 3},
				{ id: 'd', val: undefined},
				{ id: 'e', val: 5}
			];
			const df = new DataFrame(data, ['idx0', 'idx1', 'idx2', 'idx3', 'idx4']);
			const dropped = df.dropna('row', 'any');
			expect(dropped.getData()?.map(r => r.id)).toEqual(['a', 'c', 'e']);
			expect(dropped.getIndex()).toEqual(['idx0', 'idx2', 'idx4']);
		});

		it('should handle custom indices when no rows are dropped', () => {
			const data = [{id: 'a', val: 1}, {id: 'b', val: 2}];
			const customIndex = ['rowA', 'rowB'];
			const df = new DataFrame(data, customIndex);
			const dropped = df.dropna();
			expect(dropped.getIndex()).toEqual(customIndex);
			expect(dropped.getData()).toEqual(data);
		});

		it('should produce an empty index if all rows are dropped with custom index', () => {
			const data = [{id: 'a', val: null}, {id: 'b', val: undefined}];
			const customIndex = ['rowA', 'rowB'];
			const df = new DataFrame(data, customIndex);
			const dropped = df.dropna();
			expect(dropped.getIndex()).toEqual([]);
			expect(dropped.getData()).toEqual([]);
		});
	});

	describe('DataFrame.merge', () => {
		const dfLeft = new DataFrame([
			{ id: 1, name: 'Alice', age: 30 },
			{ id: 2, name: 'Bob', age: 24 },
			{ id: 3, name: 'Charlie', age: 28 },
			{ id: 4, name: 'Diana', age: 35 }
		]);
		const dfRight = new DataFrame([
			{ id: 1, value: 100, category: 'A' },
			{ id: 2, value: 200, category: 'B' },
			{ id: 3, value: 150, category: 'A' },
			{ id: 5, value: 250, category: 'C' } // id 5 not in dfLeft for some join types
		]);
		const emptyDf = new DataFrame<any>([]);

		it('inner merge on single column', () => {
			const merged = dfLeft.merge(dfRight, 'id', 'inner');
			expect(merged.getData()).toEqual([
				{ id: 1, name: 'Alice', age: 30, value: 100, category: 'A' },
				{ id: 2, name: 'Bob', age: 24, value: 200, category: 'B' },
				{ id: 3, name: 'Charlie', age: 28, value: 150, category: 'A' }
			]);
			expect(merged.getColumns()).toEqual(['id', 'name', 'age', 'value', 'category']);
		});

		it('left merge on single column', () => {
			const merged = dfLeft.merge(dfRight, 'id', 'left');
			expect(merged.getData()).toEqual([
				{ id: 1, name: 'Alice', age: 30, value: 100, category: 'A' },
				{ id: 2, name: 'Bob', age: 24, value: 200, category: 'B' },
				{ id: 3, name: 'Charlie', age: 28, value: 150, category: 'A' },
				{ id: 4, name: 'Diana', age: 35, value: null, category: null }
			]);
		});

		it('right merge on single column', () => {
			const merged = dfLeft.merge(dfRight, 'id', 'right');
			expect(merged.getData()).toEqual([
				{ id: 1, name: 'Alice', age: 30, value: 100, category: 'A' },
				{ id: 2, name: 'Bob', age: 24, value: 200, category: 'B' },
				{ id: 3, name: 'Charlie', age: 28, value: 150, category: 'A' },
				{ id: 5, name: null, age: null, value: 250, category: 'C' }
			]);
		});

		it('outer merge on single column', () => {
			const merged = dfLeft.merge(dfRight, 'id', 'outer');
			expect(merged.getData()).toEqual([
				{ id: 1, name: 'Alice', age: 30, value: 100, category: 'A' },
				{ id: 2, name: 'Bob', age: 24, value: 200, category: 'B' },
				{ id: 3, name: 'Charlie', age: 28, value: 150, category: 'A' },
				{ id: 4, name: 'Diana', age: 35, value: null, category: null },
				{ id: 5, name: null, age: null, value: 250, category: 'C' }
			]);
		});

		const dfLeftMulti = new DataFrame([ {k1: 'a', k2: 1, val_l: 'L1'}, {k1: 'b', k2: 2, val_l: 'L2'} ]);
		const dfRightMulti = new DataFrame([ {k1: 'a', k2: 1, val_r: 'R1'}, {k1: 'b', k2: 3, val_r: 'R2'} ]);
		it('inner merge on multiple columns', () => {
			const merged = dfLeftMulti.merge(dfRightMulti, ['k1', 'k2'], 'inner');
			expect(merged.getData()).toEqual([ {k1: 'a', k2: 1, val_l: 'L1', val_r: 'R1'} ]);
		});

		it('merge with left_on and right_on', () => {
			const dfL = new DataFrame([{ l_id: 1, data_l: 'L1' }]);
			const dfR = new DataFrame([{ r_id: 1, data_r: 'R1' }]);
			const merged = dfL.merge(dfR, undefined,'inner', ['l_id'], ['r_id']);
			// Expected columns: l_id, data_l, data_r (r_id is dropped as it's a key)
			// The current merge logic might include r_id if not handled carefully when left_on/right_on are used.
			// The logic `if (isJoinKeyShared) return;` might not apply if key names differ.
			// Let's assume current merge logic: join keys from left are kept, right keys are data.
			// The `tempResultColumns` logic will be crucial here.
			// `leftJoinKeys = ['l_id']`, `rightJoinKeys = ['r_id']`
			// `tempResultColumns` starts with `['l_id', 'data_l']`
			// `rCol = 'r_id'`: isJoinKeyInRight=true. leftJoinKeys.includes('r_id')=false. So not skipped.
			// tempResultColumns.includes('r_id')=false. So pushed: `['l_id', 'data_l', 'r_id', 'data_r']` (expected)
			// In mergedRow: `mergedRow['l_id'] = leftRow['l_id']`. `mergedRow['data_l'] = leftRow['data_l']`.
			// Then for right columns: `rCol = 'r_id'`. isJoinKeyShared=false. `mergedRow['r_id'] = rightRow['r_id']`.
			// `rCol = 'data_r'`. `mergedRow['data_r'] = rightRow['data_r']`.
			// This seems correct.
			expect(merged.getData()).toEqual([{ l_id: 1, data_l: 'L1', r_id:1, data_r: 'R1' }]);
			expect(merged.getColumns()).toEqual(['l_id', 'data_l', 'r_id', 'data_r']);
		});

		it('merge with overlapping column names', () => {
			const dfL = new DataFrame([{id:1, name: 'L-Alice', common: 'L1'}]);
			const dfR = new DataFrame([{id:1, job: 'Engineer', common: 'R1'}]);
			const merged = dfL.merge(dfR, 'id', 'inner');
			expect(merged.getData()).toEqual([{id:1, name: 'L-Alice', common_x: 'L1', job: 'Engineer', common_y: 'R1'}]);
			expect(merged.getColumns()).toEqual(['id', 'name', 'common_x', 'job', 'common_y']);
		});

		it('merge with no common rows', () => {
			const dfL = new DataFrame([{id:1, val:'L1'}]);
			const dfR = new DataFrame([{id:2, val:'R1'}]);
			const mergedInner = dfL.merge(dfR, 'id', 'inner');
			expect(mergedInner.getData()).toEqual([]);
			const mergedLeft = dfL.merge(dfR, 'id', 'left');
			expect(mergedLeft.getData()).toEqual([{id:1, val_x:'L1', val_y:null}]); // val_x, val_y due to common 'val'
		});

		it('merge with an empty DataFrame', () => {
			const merged1 = dfLeft.merge(emptyDf, 'id', 'inner');
			expect(merged1.getData()).toEqual([]);
			const merged2 = emptyDf.merge(dfLeft, 'id', 'left');
			expect(merged2.getData()).toEqual([]);
		});

		it('merge on keys with null/undefined values (typically not matched)', () => {
			const dfL = new DataFrame([ {id:1, name:"A"}, {id:null, name:"B"} ]);
			const dfR = new DataFrame([ {id:1, value:"V1"}, {id:null, value:"V2"} ]);
			const merged = dfL.merge(dfR, 'id', 'inner');
			// Nulls usually don't match other nulls in SQL/pandas joins
			expect(merged.getData()).toEqual([ {id:1, name:"A", value:"V1"} ]);
		});

		it('original DataFrames should not be modified', () => {
			const dfLOriginalData = JSON.parse(JSON.stringify(dfLeft.getData()));
			const dfROriginalData = JSON.parse(JSON.stringify(dfRight.getData()));
			dfLeft.merge(dfRight, 'id');
			expect(dfLeft.getData()).toEqual(dfLOriginalData);
			expect(dfRight.getData()).toEqual(dfROriginalData);
		});
	});

	describe('DataFrame.join (index-based)', () => {
		const df1 = new DataFrame(
			[{ name: 'Alice', age: 30 }, { name: 'Bob', age: 24 }],
			['idx1', 'idx2'] // Custom index
		);
		const df2 = new DataFrame(
			[{ city: 'New York', value: 100 }, { city: 'Los Angeles', value: 200 }],
			['idx1', 'idx3'] // Custom index, idx3 not in df1
		);
		const dfOverlap = new DataFrame(
			[{ name: 'Charlie', age: 28 }], // Overlapping column name 'age'
			['idx1']
		);
		const emptyDf = new DataFrame<any>([], []);

		it('left join on index', () => {
			const joined = df1.join(df2, undefined, 'left'); // 'on' is undefined for index join
			expect(joined.getData()).toEqual([
				{ name: 'Alice', age: 30, city: 'New York', value: 100 },
				{ name: 'Bob', age: 24, city: null, value: null }
			]);
			expect(joined.getIndex()).toEqual(['idx1', 'idx2']);
		});

		it('right join on index', () => {
			const joined = df1.join(df2, undefined, 'right');
			expect(joined.getData()).toEqual([
				{ name: 'Alice', age: 30, city: 'New York', value: 100 },
				{ name: null, age: null, city: 'Los Angeles', value: 200 }
			]);
			expect(joined.getIndex()).toEqual(['idx1', 'idx3']);
		});

		it('inner join on index', () => {
			const joined = df1.join(df2, undefined, 'inner');
			expect(joined.getData()).toEqual([
				{ name: 'Alice', age: 30, city: 'New York', value: 100 }
			]);
			expect(joined.getIndex()).toEqual(['idx1']);
		});

		it('outer join on index (sorted index)', () => {
			const joined = df1.join(df2, undefined, 'outer');
			expect(joined.getData()).toEqual([
				{ name: 'Alice', age: 30, city: 'New York', value: 100 }, // idx1
				{ name: 'Bob', age: 24, city: null, value: null },       // idx2
				{ name: null, age: null, city: 'Los Angeles', value: 200 } // idx3
			]);
			expect(joined.getIndex()).toEqual(['idx1', 'idx2', 'idx3']); // Assuming sorting of combined keys
		});

		it('join with overlapping column names (lsuffix, rsuffix)', () => {
			const dfA = new DataFrame([{id:1, common: 'A1'}], ['x']);
			const dfB = new DataFrame([{id:2, common: 'B1'}], ['x']);
			const joined = dfA.join(dfB, undefined, 'inner', '_L', '_R');
			expect(joined.getData()).toEqual([{id_L:1, common_L: 'A1', id_R:2, common_R: 'B1'}]);
			expect(joined.getColumns()).toEqual(['id_L', 'common_L', 'id_R', 'common_R']);
		});

		it('join with no common indices', () => {
			const dfNoCommonIdx = new DataFrame([{ val: 'X' }], ['idx4']);
			const joinedInner = df1.join(dfNoCommonIdx, undefined, 'inner');
			expect(joinedInner.getData()).toEqual([]);
			const joinedLeft = df1.join(dfNoCommonIdx, undefined, 'left');
			// df1 has { name, age }, dfNoCommonIdx has { val }
			// Expect df1 data, with 'val' column added and filled with null
			expect(joinedLeft.getData()).toEqual([
				{ name: 'Alice', age: 30, val: null },
				{ name: 'Bob', age: 24, val: null }
			]);
			expect(joinedLeft.getColumns()).toEqual(['name', 'age', 'val']);
		});

		it('join with an empty DataFrame', () => {
			const dfLeftNonEmpty = new DataFrame([{ name: 'Alice', age: 30 }], ['idx1']);
			const emptyWithNoCols = new DataFrame<any>([], [], []); // Explicitly no columns

			const joinedLeftToEmpty = dfLeftNonEmpty.join(emptyWithNoCols, undefined, 'left');
			// Expect data to be from left, no new columns added from empty right
			expect(joinedLeftToEmpty.getData()).toEqual(dfLeftNonEmpty.getData());
			expect(joinedLeftToEmpty.getColumns()).toEqual(dfLeftNonEmpty.getColumns());
			expect(joinedLeftToEmpty.getIndex()).toEqual(dfLeftNonEmpty.getIndex());

			const emptyLeft = new DataFrame<any>([], [], []);
            const dfRightNonEmpty = new DataFrame([{ name: 'Bob', age: 25 }], ['idx2']);
			const joinedEmptyToRight = emptyLeft.join(dfRightNonEmpty, undefined, 'left'); // Left join from empty DF
			expect(joinedEmptyToRight.getData()).toEqual([]);
			// Columns should be from the right DF as left DF had no columns, but data is empty.
            expect(joinedEmptyToRight.getColumns()).toEqual(dfRightNonEmpty.getColumns());
            expect(joinedEmptyToRight.getIndex()).toEqual([]);
		});

		it('original DataFrames should not be modified (join)', () => {
			const df1OriginalData = JSON.parse(JSON.stringify(df1.getData()));
			const df2OriginalData = JSON.parse(JSON.stringify(df2.getData()));
			df1.join(df2);
			expect(df1.getData()).toEqual(df1OriginalData);
			expect(df2.getData()).toEqual(df2OriginalData);
		});

		it('join throws error when "on" is specified (as per current partial implementation)', () => {
			expect(() => {
				df1.join(df2, 'some_column_to_join_on');
			}).toThrow("Column joining with 'on' in `join` method using lsuffix/rsuffix not fully implemented in this pass.");
		});
	});

	describe('DataFrame.toCSV', () => {
		const dfSimple = new DataFrame([
			{ id: 1, name: 'Alice', age: 30 },
			{ id: 2, name: 'Bob', age: 24 }
		]);
		const dfWithNulls = new DataFrame([
			{ colA: null, colB: 'Val1' },
			{ colA: 'Val2', colB: undefined }
		]);
		const dfWithSpecChars = new DataFrame([
			{ item: 'A"B', desc: 'Comma,Sep', notes: 'Line1\nLine2' }
		]);
		const dfCustomIndex = new DataFrame(
			[ { A:1, B:2 }, { A:3, B:4 } ],
			['idx_X', 'idx_Y']
		);
		const dfEmpty = new DataFrame<any>([]);

		it('default behavior (header, no index, comma sep)', () => {
			const csv = dfSimple.toCSV();
			expect(csv).toBe("id,name,age\n1,Alice,30\n2,Bob,24");
		});

		it('includeIndex=true', () => {
			const csv = dfSimple.toCSV(true);
			expect(csv).toBe("index,id,name,age\n0,1,Alice,30\n1,2,Bob,24");
		});

		it('includeIndex=true with custom string indices', () => {
			const csv = dfCustomIndex.toCSV(true);
			expect(csv).toBe("index,A,B\nidx_X,1,2\nidx_Y,3,4");
		});

		it('header=false', () => {
			const csv = dfSimple.toCSV(false, false); // includeIndex = false, header = false
			expect(csv).toBe("1,Alice,30\n2,Bob,24");
		});

		it('custom separator (sep=;)', () => {
			const csv = dfSimple.toCSV(false, true, ';'); // includeIndex = false, header = true
			expect(csv).toBe("id;name;age\n1;Alice;30\n2;Bob;24");
		});

		it('handles null and undefined values (as empty strings)', () => {
			const csv = dfWithNulls.toCSV();
			expect(csv).toBe("colA,colB\n,Val1\nVal2,");
		});

		it('handles values with separators, quotes, and newlines', () => {
			const csv = dfWithSpecChars.toCSV(false, true, ',');
			expect(csv).toBe('item,desc,notes\n"A""B","Comma,Sep","Line1\nLine2"');

			const dfSemicolon = new DataFrame([{ val: 'a;b'}]);
			const csvSemi = dfSemicolon.toCSV(false, true, ';');
			expect(csvSemi).toBe('val\n"a;b"');
		});

		it('handles empty DataFrame', () => {
			const dfEmptyNoCols = new DataFrame<any>([]);
			expect(dfEmptyNoCols.toCSV()).toBe(""); // header=true, includeIndex=false. No cols -> empty header.
			expect(dfEmptyNoCols.toCSV(true)).toBe("index"); // header=true, includeIndex=true. Only "index" header.
			expect(dfEmptyNoCols.toCSV(false, false)).toBe(""); // No header, no index.
			// If includeIndex=true but header=false, and no data, result is empty string.
			expect(dfEmptyNoCols.toCSV(true, false, ',')).toBe("");

			const dfEmptyWithColsStill = new DataFrame<any>([], null, ['h1','h2']); // Renamed to avoid conflict
			expect(dfEmptyWithColsStill.toCSV()).toBe("h1,h2");
			expect(dfEmptyWithColsStill.toCSV(true)).toBe("index,h1,h2");
		});
	});

	describe('DataFrame.toJSON', () => {
		const dfSimple = new DataFrame([
			{ id: 1, name: 'Alice', age: 30 },
			{ id: 2, name: 'Bob', age: 24 }
		]);
		const dfWithNulls = new DataFrame([
			{ item: 'A', value: 100, detail: undefined },
			{ item: 'B', value: null, detail: 'Exists' }
		]);
		const dfCustomIndex = new DataFrame(
			[ { A:1, B:null }, { A:3, B:4 } ],
			['idx_X', 'idx_Y']
		);
		const dfEmpty = new DataFrame<any>([]);
		const dfEmptyWithCols = new DataFrame<any>([], null, ['colA', 'colB']);


		it("orient='records' (default)", () => {
			const json = dfSimple.toJSON();
			expect(JSON.parse(json)).toEqual([
				{ id: 1, name: 'Alice', age: 30 },
				{ id: 2, name: 'Bob', age: 24 }
			]);
			const jsonNulls = dfWithNulls.toJSON(); // Test undefined -> null
			expect(JSON.parse(jsonNulls)).toEqual([
				{ item: 'A', value: 100, detail: null },
				{ item: 'B', value: null, detail: 'Exists' }
			]);
		});

		it("orient='split'", () => {
			const json = dfCustomIndex.toJSON('split');
			expect(JSON.parse(json)).toEqual({
				columns: ['A', 'B'],
				index: ['idx_X', 'idx_Y'],
				data: [ [1, null], [3, 4] ]
			});
		});

		it("orient='index'", () => {
			const json = dfCustomIndex.toJSON('index');
			expect(JSON.parse(json)).toEqual({
				idx_X: { A:1, B:null },
				idx_Y: { A:3, B:4 }
			});
		});

		it("orient='columns'", () => {
			const json = dfCustomIndex.toJSON('columns');
			expect(JSON.parse(json)).toEqual({
				A: { idx_X: 1, idx_Y: 3 },
				B: { idx_X: null, idx_Y: 4 }
			});
		});

		it("orient='values'", () => {
			const json = dfCustomIndex.toJSON('values');
			expect(JSON.parse(json)).toEqual([ [1, null], [3, 4] ]);
		});

		it('handles empty DataFrame for each orient', () => {
			expect(JSON.parse(dfEmpty.toJSON('records'))).toEqual([]);
			expect(JSON.parse(dfEmptyWithCols.toJSON('records'))).toEqual([]);

			expect(JSON.parse(dfEmpty.toJSON('split'))).toEqual({ columns: [], index: [], data: [] });
			expect(JSON.parse(dfEmptyWithCols.toJSON('split'))).toEqual({ columns: ['colA', 'colB'], index: [], data: [] });

			expect(JSON.parse(dfEmpty.toJSON('index'))).toEqual({});
			expect(JSON.parse(dfEmptyWithCols.toJSON('index'))).toEqual({});

			expect(JSON.parse(dfEmpty.toJSON('columns'))).toEqual({});
			expect(JSON.parse(dfEmptyWithCols.toJSON('columns'))).toEqual({ colA:{}, colB:{} });

			expect(JSON.parse(dfEmpty.toJSON('values'))).toEqual([]);
			expect(JSON.parse(dfEmptyWithCols.toJSON('values'))).toEqual([]);
		});

		it('ensures output is a valid JSON string', () => {
			const json = dfSimple.toJSON();
			expect(() => JSON.parse(json)).not.toThrow();
		});
	});
});
