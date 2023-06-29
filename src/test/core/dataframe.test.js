const { DataFrame } = require('../../index');

describe('DataFrame', () => {
	describe('Create DataFrame from an array', () => {
		it('should correctly create DataFrame from array', () => {
			const data = [
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			];
			const df = new DataFrame(data);
			expect(df.getRowCount()).toBe(3);
			expect(df.getColumnCount()).toBe(3);
			expect(df.getValue(0, 0)).toBe(1);
			expect(df.getValue(1, 1)).toBe(5);
			expect(df.getValue(2, 2)).toBe(9);
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
			expect(df.getValue(0, 'Name')).toBe('Ankit');
			expect(df.getValue(1, 'Age')).toBe(21);
			expect(df.getValue(2, 'University')).toBe('DU');
		});
	});

	describe('Get DataFrame shape', () => {
		it('should return the correct shape of the DataFrame', () => {
			const data = [
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			];
			const df = new DataFrame(data);
			expect(df.shape()).toEqual([3, 3]);
		});
	});

	describe('Get DataFrame index', () => {
		it('should return the correct index of the DataFrame', () => {
			const data = [
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			];
			const index = [10, 20, 30];
			const df = new DataFrame(data, index);
			expect(df.getIndex()).toEqual([10, 20, 30]);
		});
	});

	describe('Create DataFrame from an object with user-defined indexes.', () => {
		it('should correctly create DataFrame from object', () => {
			const data = [
				[1, 'John', 'Doe'],
				[2, 'Jane', 'Smith'],
				[3, 'Alice', 'Johnson']
			];
			const column = ['ID', 'First Name', 'Last Name'];
			const df = new DataFrame(data, (columns = column));
			// Redirect console.log output to a mock function
			const consoleLogMock = jest.fn();
			console.log = consoleLogMock;
			// Call the display method
			df.head();
			expect(df.getRowCount()).toBe(3);
			expect(df.getColumnCount()).toBe(3);
			expect(consoleLogMock.mock.calls.length).toBe(1);
		});
	});
});
