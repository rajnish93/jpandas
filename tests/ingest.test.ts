import { describe, it, expect } from 'vitest';
import { DataFrame } from '../src';

describe('DataFrame - ingestion', () => {
  it('fromJSON and columns/shape', () => {
    const df = DataFrame.fromJSON([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
    expect(df.shape).toEqual([2, 2]);
    expect(new Set(df.columns)).toEqual(new Set(['a', 'b']));
  });

  it('fromCSV with header parsing and auto types', () => {
    const df = DataFrame.fromCSV('a,b\n1,2\n3,4');
    expect(df.shape).toEqual([2, 2]);
    expect(df.col('a').toArray()).toEqual([1, 3]);
    expect(df.col('b').toArray()).toEqual([2, 4]);
  });
});


