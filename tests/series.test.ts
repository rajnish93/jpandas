import { describe, it, expect } from 'vitest';
import { Series } from '../src';

describe('Series - basics', () => {
  it('head/tail/iloc/get', () => {
    const s = new Series([1, 2, 3, 4, 5]);
    expect(s.head(2).toArray()).toEqual([1, 2]);
    expect(s.tail(2).toArray()).toEqual([4, 5]);
    expect(s.iloc(1).toArray()).toEqual([2]);
    expect(s.iloc(-1).toArray()).toEqual([5]);
    expect(s.iloc(1, 4).toArray()).toEqual([2, 3, 4]);
    expect(s.get(0)).toBe(1);
  });

  it('map/dropna/fillna', () => {
    const s = new Series([1, null, 3, undefined, NaN]);
    expect(s.dropna().toArray()).toEqual([1, 3]);
    expect(s.fillna(0).toArray()).toEqual([1, 0, 3, 0, 0]);
    expect(s.map((v) => (typeof v === 'number' ? (v as number) * 2 : v)).toArray()).toEqual([2, null, 6, undefined, NaN]);
  });

  it('stats: sum/mean/min/max/median/mode/valueCounts/describe', () => {
    const s = new Series([1, 2, 2, 3]);
    expect(s.sum()).toBe(8);
    expect(s.mean()).toBe(2);
    expect(s.min()).toBe(1);
    expect(s.max()).toBe(3);
    expect(s.median()).toBe(2);
    expect(s.mode()).toEqual([2]);
    const vc = s.valueCounts();
    expect(vc[0].value).toBe(2);
    expect(vc[0].count).toBe(2);
    const d = s.describe();
    expect(d.count).toBe(4); // all numbers
    expect(d.mean).toBe(2);
  });
});


