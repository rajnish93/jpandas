import { describe, it, expect } from 'vitest';
import { DataFrame } from '../src';

describe('DataFrame - cleaning', () => {
  it('dropna rows/cols, fillna, rename, drop', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: null },
      { a: undefined, b: 2 },
      { a: 3, b: 4 },
    ]);

    expect(df.dropna().toJSON()).toEqual([{ a: 3, b: 4 }]);
    expect(df.dropna({ axis: 1 }).columns.sort()).toEqual([]); // drop columns with any NA (pandas default how='any')
    expect(df.fillna(0).toJSON()).toEqual([
      { a: 1, b: 0 },
      { a: 0, b: 2 },
      { a: 3, b: 4 },
    ]);
    expect(df.rename({ a: 'A' }).columns.includes('A')).toBe(true);
    expect(df.drop(['b']).columns.includes('b')).toBe(false);
    expect(df.drop({ index: [0] }).toJSON()).toEqual([
      { a: undefined, b: 2 },
      { a: 3, b: 4 },
    ]);
  });
});

describe('DataFrame - transform', () => {
  it('assign, apply, mapColumns', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
    const assigned = df.assign({ c: (row) => (row.a as number) + (row.b as number) });
    expect(assigned.columns.includes('c')).toBe(true);
    const applied = df.apply((row) => ({ ...row, d: 1 }));
    expect(applied.columns.includes('d')).toBe(true);
    const mapped = df.mapColumns((v, c) => (c === 'a' && typeof v === 'number' ? (v as number) * 10 : v));
    expect(mapped.col('a').toArray()).toEqual([10, 30]);
  });
});


