import { describe, it, expect } from 'vitest';
import { DataFrame } from '../src';

describe('DataFrame - sort & stats wrappers', () => {
  it('sortValues and median/mode/valueCounts', () => {
    const df = DataFrame.fromJSON([
      { a: 3, b: 2 },
      { a: 1, b: 2 },
      { a: 2, b: 1 },
    ]);
    const sorted = df.sortValues(['b', 'a'], { ascending: [true, true] });
    expect(sorted.toJSON()).toEqual([
      { a: 2, b: 1 },
      { a: 1, b: 2 },
      { a: 3, b: 2 },
    ]);
    expect(df.median('a')).toBe(2);
    expect(Array.isArray(df.mode('b'))).toBe(true);
    const vc = df.valueCounts('b');
    expect(vc[0].count).toBe(2);
  });
});

describe('DataFrame - groupby & combine', () => {
  it('groupby aggregations', () => {
    const sales = DataFrame.fromJSON([
      { region: 'N', prod: 'A', qty: 2 },
      { region: 'N', prod: 'B', qty: 1 },
      { region: 'S', prod: 'A', qty: 3 },
    ]);
    const sum = sales.groupby('region').sum().sortValues('region');
    expect(sum.toJSON()).toEqual([
      { region: 'N', qty: 3 },
      { region: 'S', qty: 3 },
    ]);
    const mean = sales.groupby(['region', 'prod']).mean();
    expect(mean.columns.includes('qty')).toBe(true);
  });

  it('merge/join and concat', () => {
    const left = DataFrame.fromJSON([{ id: 1, name: 'a' }, { id: 2, name: 'b' }]);
    const right = DataFrame.fromJSON([{ id: 1, val: 10 }, { id: 3, val: 30 }]);
    const leftJoin = left.merge(right, { on: 'id', how: 'left' }).sortValues('id');
    expect(leftJoin.toJSON()).toEqual([
      { id: 1, name: 'a', val: 10 },
      { id: 2, name: 'b', val: undefined },
    ]);
    const inner = left.merge(right, { on: 'id', how: 'inner' });
    expect(inner.shape[0]).toBe(1);
    const rowConcat = DataFrame.concat([left, left]);
    expect(rowConcat.shape[0]).toBe(4);
    const colConcat = DataFrame.concat([left, right], { axis: 1 });
    expect(colConcat.shape[1]).toBeGreaterThanOrEqual(2);
  });
});

describe('DataFrame - pivot & export', () => {
  it('pivot and pivotTable, toCSV', () => {
    const tall = DataFrame.fromJSON([
      { city: 'X', quarter: 'Q1', sales: 5 },
      { city: 'X', quarter: 'Q2', sales: 7 },
      { city: 'Y', quarter: 'Q1', sales: 3 },
    ]);
    const wide = tall.pivot({ index: 'city', columns: 'quarter', values: 'sales' }).sortValues('city');
    expect(wide.columns.includes('Q1')).toBe(true);
    const table = tall.pivotTable({ index: 'city', columns: 'quarter', values: 'sales', aggfunc: 'sum' });
    expect(table.columns.includes('Q2')).toBe(true);
    const csv = table.toCSV();
    expect(typeof csv).toBe('string');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});


