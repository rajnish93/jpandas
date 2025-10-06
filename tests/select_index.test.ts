import { describe, it, expect } from 'vitest';
import { DataFrame } from '../src';

describe('DataFrame - selection and indexing', () => {
  const df = DataFrame.fromJSON([
    { a: 1, b: 2 },
    { a: 3, b: 4 },
    { a: 5, b: 6 },
  ]);

  it('col/select', () => {
    expect(df.col('a').toArray()).toEqual([1, 3, 5]);
    expect(df.select(['b']).toJSON()).toEqual([{ b: 2 }, { b: 4 }, { b: 6 }]);
  });

  it('iloc and JS-friendly aliases', () => {
    expect(df.iloc(0).toJSON()).toEqual([{ a: 1, b: 2 }]);
    expect(df.iloc(0, 2).toJSON()).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
    expect(df.getRowsByIndex(1).toJSON()).toEqual([{ a: 3, b: 4 }]);
    expect(df.getRowsByIndex(1, 3).toJSON()).toEqual([
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ]);
    expect(df.getRowsByCondition((r) => (r.a as number) > 1).toJSON()).toEqual([
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ]);
    expect(df.filter((r) => (r.b as number) === 4).toJSON()).toEqual([{ a: 3, b: 4 }]);
  });
});


