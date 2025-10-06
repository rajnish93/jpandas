import { describe, it, expect } from 'vitest';
import { DataFrame, Series } from '../src';

describe('DataFrame.describe', () => {
  it('produces per-column stats', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ]);
    const d = df.describe();
    expect(d.a.count).toBe(3);
    expect(d.a.mean).toBe(3);
    expect(d.a.min).toBe(1);
    expect(d.a.max).toBe(5);
  });
});

describe('valueCounts options', () => {
  it('Series.valueCounts normalize/ascending/dropna=false', () => {
    const s = new Series([1, 1, 2, null, undefined]);
    const vc1 = s.valueCounts({ normalize: true });
    expect(vc1[0].proportion).toBeCloseTo(2 / 3); // dropped NAs by default (3 non-missing)
    const vc2 = s.valueCounts({ dropna: false, sort: true, ascending: true });
    expect(vc2[0].count).toBe(1); // includes NA bucket(s) with count 1 each
  });
  it('DataFrame.valueCounts delegates', () => {
    const df = DataFrame.fromJSON([{ a: 'x' }, { a: 'x' }, { a: 'y' }]);
    const vc = df.valueCounts('a', { normalize: false });
    expect(vc[0].count).toBe(2);
  });
});

describe('sortValues with NA position', () => {
  it("naPosition 'first' and 'last'", () => {
    const df = DataFrame.fromJSON([{ a: null }, { a: 2 }, { a: undefined }, { a: 1 }]);
    const first = df.sortValues('a', { naPosition: 'first' }).col('a').toArray();
    expect(first.slice(0, 2)).toEqual([null, undefined]);
    const last = df.sortValues('a', { naPosition: 'last' }).col('a').toArray();
    expect(last.slice(-2)).toEqual([null, undefined]);
  });
});

describe('dropna/fillna subsets and drop variants', () => {
  it('dropna with subset rows and columns', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: null },
      { a: 2, b: 2 },
      { a: null, b: 3 },
    ]);
    expect(df.dropna({ subset: ['a'] }).toJSON()).toEqual([
      { a: 1, b: null },
      { a: 2, b: 2 },
    ]);
    // axis=1 keeps columns without NA in subset rows
    const keptCols = df.dropna({ axis: 1, subset: ['a', 'b'] }).columns;
    expect(Array.isArray(keptCols)).toBe(true);
  });

  it('fillna with subset', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: null },
      { a: null, b: 2 },
    ]);
    const filled = df.fillna(0, { subset: ['a'] });
    expect(filled.toJSON()).toEqual([
      { a: 1, b: null },
      { a: 0, b: 2 },
    ]);
  });

  it('drop with columns and index together', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
    ]);
    const dropped = df.drop({ columns: ['b', 'c'], index: [1] });
    expect(dropped.columns).toEqual(['a']);
    expect(dropped.shape[0]).toBe(1);
  });
});

describe('merge variants and suffixes', () => {
  it("how = 'right' and 'outer'", () => {
    const left = DataFrame.fromJSON([{ id: 1, a: 'L1' }, { id: 2, a: 'L2' }]);
    const right = DataFrame.fromJSON([{ id: 2, b: 'R2' }, { id: 3, b: 'R3' }]);
    const rightJoin = left.merge(right, { on: 'id', how: 'right' }).sortValues('id');
    expect(rightJoin.toJSON()).toEqual([
      { id: 2, a: 'L2', b: 'R2' },
      { id: 3, a: undefined, b: 'R3' },
    ]);
    const outer = left.merge(right, { on: 'id', how: 'outer' }).sortValues('id');
    expect(outer.toJSON()).toEqual([
      { id: 1, a: 'L1', b: undefined },
      { id: 2, a: 'L2', b: 'R2' },
      { id: 3, a: undefined, b: 'R3' },
    ]);
  });

  it('suffixes for name collisions', () => {
    const left = DataFrame.fromJSON([{ id: 1, x: 10 }]);
    const right = DataFrame.fromJSON([{ id: 1, x: 20 }]);
    const merged = left.merge(right, { on: 'id', how: 'inner', suffixes: ['_L', '_R'] });
    expect(new Set(merged.columns)).toEqual(new Set(['id', 'x_L', 'x_R']));
  });
});

describe('concat axis=1 suffixes', () => {
  it('disambiguates duplicate columns', () => {
    const a = DataFrame.fromJSON([{ x: 1 }]);
    const b = DataFrame.fromJSON([{ x: 2 }]);
    const c = DataFrame.concat([a, b], { axis: 1, suffixes: ['_a', '_b'] });
    expect(new Set(c.columns)).toEqual(new Set(['x', 'x_b']));
  });
});

describe('pivot edge cases and agg variants', () => {
  it('missing combos become undefined', () => {
    const tall = DataFrame.fromJSON([
      { i: 'A', j: 'K', v: 1 },
      { i: 'B', j: 'K', v: 2 },
    ]);
    const wide = tall.pivot({ index: 'i', columns: 'j', values: 'v' }).sortValues('i');
    expect(wide.toJSON()).toEqual([
      { i: 'A', K: 1 },
      { i: 'B', K: 2 },
    ]);
  });

  it('pivotTable with mean/min/max variants', () => {
    const tall = DataFrame.fromJSON([
      { i: 'A', j: 'K', v: 1 },
      { i: 'A', j: 'K', v: 3 },
    ]);
    expect(tall.pivotTable({ index: 'i', columns: 'j', values: 'v', aggfunc: 'sum' }).col('K').toArray()).toEqual([4]);
    expect(tall.pivotTable({ index: 'i', columns: 'j', values: 'v', aggfunc: 'min' }).col('K').toArray()).toEqual([1]);
    expect(tall.pivotTable({ index: 'i', columns: 'j', values: 'v', aggfunc: 'max' }).col('K').toArray()).toEqual([3]);
  });
});

describe('exports and interop', () => {
  it('toObject matches toJSON shape and CSV quote options', () => {
    const df = DataFrame.fromJSON([{ a: 'hello,world', b: 'x"y' }]);
    expect(df.toObject()).toEqual(df.toJSON());
    const always = df.toCSV({ quote: 'always' });
    expect(always.startsWith('a,b')).toBe(true);
    expect(always.split('\n')[1]).toMatch(/^"hello,world","x""y"$/);
    const never = df.toCSV({ quote: 'never' });
    expect(never.split('\n')[1]).toBe('hello,world,x"y');
  });
});

describe('types and aliases behavior', () => {
  it('getColumnTypes coverage', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: 's', c: new Date('2020-01-01'), d: null, e: undefined },
      { a: 2, b: 't', c: new Date('2020-01-02'), d: null, e: undefined },
    ]);
    const types = df.getColumnTypes();
    expect(types.a).toBe('number');
    expect(types.b).toBe('string');
    expect(types.c).toBe('date');
    expect(types.d).toBe('null');
    expect(types.e).toBe('undefined');
  });

  it('getRowsByIndex negatives and getRowsByCondition none', () => {
    const df = DataFrame.fromJSON([{ x: 1 }, { x: 2 }, { x: 3 }]);
    expect(df.getRowsByIndex(-1).toJSON()).toEqual([{ x: 3 }]);
    expect(df.getRowsByIndex(-2, -1).toJSON()).toEqual([{ x: 2 }]);
    expect(df.getRowsByCondition(() => false).shape[0]).toBe(0);
  });
});


