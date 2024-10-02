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
});
