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
});
