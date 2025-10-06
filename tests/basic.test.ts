import { describe, it, expect } from 'vitest';
import { DataFrame, Series } from '../src';

describe('Series', () => {
	it('basic stats and ops', () => {
		const s = new Series([1, 2, 2, 3]);
		expect(s.toArray()).toEqual([1, 2, 2, 3]);
		expect(s.sum()).toBe(8);
		expect(s.mean()).toBe(2);
		expect(s.median()).toBe(2);
		expect(s.mode()).toEqual([2]);
		const counts = s.valueCounts();
		expect(counts[0].value).toBe(2);
		expect(counts[0].count).toBe(2);
	});
});

describe('DataFrame', () => {
	it('ingestion and exploration', () => {
		const df = DataFrame.fromCSV('a,b\n1,2\n3,4');
		expect(df.shape).toEqual([2, 2]);
		expect(new Set(df.columns)).toEqual(new Set(['a', 'b']));
		expect(df.head(1).toJSON()).toEqual([{ a: 1, b: 2 }]);
		expect(df.col('a').toArray()).toEqual([1, 3]);
	});

	it('selection and stats', () => {
		const df = DataFrame.fromJSON([
			{ a: 1, b: 2 },
			{ a: 3, b: 4 },
		]);
		expect(df.select(['b']).toJSON()).toEqual([{ b: 2 }, { b: 4 }]);
		expect(df.sum('a')).toBe(4);
		expect(df.mean('b')).toBe(3);
	});

	it('groupby sum', () => {
		const sales = DataFrame.fromJSON([
			{ region: 'N', qty: 2 },
			{ region: 'N', qty: 1 },
			{ region: 'S', qty: 3 },
		]);
		const g = sales.groupby('region').sum().sortValues('region');
		expect(g.toJSON()).toEqual([
			{ region: 'N', qty: 3 },
			{ region: 'S', qty: 3 },
		]);
	});
});


