import { Series } from '../series';

describe('Series', () => {
    describe('constructor', () => {
        it('should create a Series with array data and default index', () => {
            const data = [1, 2, 3, 4, 5];
            const series = new Series(data);
            expect(series.toArray()).toEqual(data);
            expect(series.toString()).toBe("0\t1\n1\t2\n2\t3\n3\t4\n4\t5\n");
        });

        it('should create a Series with array data and custom index', () => {
            const data = [10, 20, 30];
            const index = ['a', 'b', 'c'];
            const series = new Series(data, index);
            expect(series.toArray()).toEqual(data);
            expect(series.toString()).toBe("a\t10\nb\t20\nc\t30\n");
        });

        it('should create a Series with object data', () => {
            const data = { a: 1, b: 2, c: 3 };
            const series = new Series(data);
            expect(series.toArray()).toEqual([1, 2, 3]);
            // The toString() check below implicitly verifies the index.
            expect(series.toString()).toBe("a\t1\nb\t2\nc\t3\n");
        });

        it('should throw an error if data and index lengths differ', () => {
            const data = [1, 2];
            const index = ['a', 'b', 'c'];
            expect(() => new Series(data, index)).toThrow("Data and index must have the same length.");
        });

        it('should throw an error for invalid data type', () => {
            expect(() => new Series(null as any)).toThrow("Data must be an array or an object.");
            expect(() => new Series(123 as any)).toThrow("Data must be an array or an object.");
        });
    });

    describe('head', () => {
        const data = [1, 2, 3, 4, 5];
        const index = ['a', 'b', 'c', 'd', 'e'];
        const series = new Series(data, index);

        it('should return the first n elements', () => {
            const headSeries = series.head(3);
            expect(headSeries.toArray()).toEqual([1, 2, 3]);
            // The toString() check below implicitly verifies the index.
            expect(headSeries.toString()).toBe("a\t1\nb\t2\nc\t3\n");
        });

        it('should return all elements if n is larger than length', () => {
            const headSeries = series.head(10);
            expect(headSeries.toArray()).toEqual(data);
            // The toString() check below implicitly verifies the index.
            expect(headSeries.toString()).toBe("a\t1\nb\t2\nc\t3\nd\t4\ne\t5\n");
        });

        it('should return an empty Series if n is 0', () => {
            const headSeries = series.head(0);
            expect(headSeries.toArray()).toEqual([]);
            // The toString() check below implicitly verifies the index.
            expect(headSeries.toString()).toBe("");
        });

        it('should return the first 5 elements by default', () => {
            const s = new Series([1,2,3,4,5,6,7]);
            const headSeries = s.head();
            expect(headSeries.toArray()).toEqual([1,2,3,4,5]);
            expect(headSeries.toString()).toBe("0\t1\n1\t2\n2\t3\n3\t4\n4\t5\n");
        });

        it('should throw an error if n is negative', () => {
            expect(() => series.head(-1)).toThrow("Number of elements cannot be negative.");
        });
    });

    describe('tail', () => {
        const data = [1, 2, 3, 4, 5];
        const index = ['a', 'b', 'c', 'd', 'e'];
        const series = new Series(data, index);

        it('should return the last n elements', () => {
            const tailSeries = series.tail(3);
            expect(tailSeries.toArray()).toEqual([3, 4, 5]);
            // The toString() check below implicitly verifies the index.
            expect(tailSeries.toString()).toBe("c\t3\nd\t4\ne\t5\n");
        });

        it('should return all elements if n is larger than length', () => {
            const tailSeries = series.tail(10);
            expect(tailSeries.toArray()).toEqual(data);
            // The toString() check below implicitly verifies the index.
            expect(tailSeries.toString()).toBe("a\t1\nb\t2\nc\t3\nd\t4\ne\t5\n");
        });

        it('should return an empty Series if n is 0', () => {
            const tailSeries = series.tail(0);
            expect(tailSeries.toArray()).toEqual([]);
            // The toString() check below implicitly verifies the index.
            expect(tailSeries.toString()).toBe("");
        });

        it('should return the last 5 elements by default', () => {
            const s = new Series([1,2,3,4,5,6,7]);
            const tailSeries = s.tail();
            expect(tailSeries.toArray()).toEqual([3,4,5,6,7]);
            // Default index for [1,2,3,4,5,6,7] is [0,1,2,3,4,5,6]
            // Tail 5 index would be [2,3,4,5,6]
            expect(tailSeries.toString()).toBe("2\t3\n3\t4\n4\t5\n5\t6\n6\t7\n");
        });

        it('should throw an error if n is negative', () => {
            expect(() => series.tail(-1)).toThrow("Number of elements cannot be negative.");
        });
    });

    describe('toArray', () => {
        it('should return the data as an array', () => {
            const data = [1, 2, 3];
            const series = new Series(data);
            expect(series.toArray()).toEqual(data);
        });

        it('should return an empty array for an empty series', () => {
            const series = new Series([]);
            expect(series.toArray()).toEqual([]);
        });
    });

    describe('toString', () => {
        it('should return a string representation of the series', () => {
            const data = { a: 1, b: 2 };
            const series = new Series(data);
            expect(series.toString()).toBe("a\t1\nb\t2\n");
        });

        it('should return an empty string for an empty series', () => {
            const series = new Series([]);
            expect(series.toString()).toBe("");
        });
    });
});

// Add a getter for index in Series class for testing purposes
// This is not ideal but necessary if we want to check the index directly in tests
// without exposing it publicly in the class's main interface.
// A better way would be to have methods that allow inspecting parts of the index
// or to have the `head` and `tail` methods return objects that also expose their index.

// For now, we'll proceed with the understanding that `series.index` is accessed
// for testing convenience. If this were production code, we'd reconsider this.
// One alternative: head/tail could return { data: [], index: [] } instead of new Series,
// or the Series class could have a public getIndex() method.
// Given the current Series implementation, direct access (even if marked private)
// is what's shown in the tests.
// The tests are written assuming 'index' property can be accessed.
// If Series.ts is changed to make `index` truly private (e.g. #index),
// these tests would need adjustment.
// For the purpose of this exercise, I'll assume the current Series.ts allows this access.

// Let's fix the issue of accessing private member `index`.
// The `Series` class's `head` and `tail` methods return new `Series` instances.
// The `toString()` method of these instances can be used to verify the correctness
// of both data and index. So, direct access to `series.index` is not strictly necessary.

// Re-evaluating tests that access `series.index`:
// - Constructor test for object data: `expect(series.index).toEqual(['a', 'b', 'c']);`
//   Can be verified by `toString()` if `toString()` is trusted. Or we can add a `getIndex()` method.
//   For now, `toString()` is the main public way to see the index.
// - Head/Tail tests: `expect(headSeries.index).toEqual(...)`
//   Similarly, `headSeries.toString()` should be sufficient.

// Let's remove direct access to `series.index` in tests and rely on `toString()` or `toArray()`
// for `head` and `tail` results.
// For the constructor object data test, `toString()` already verifies it.
// The `index` property is used by `toString()`, so if `toString()` is correct, `index` is correct.
// I will remove the lines that directly access `series.index`.

// The line `expect(series.index).toEqual(['a', 'b', 'c']);` in constructor test for object data.
// The constructor for object data is:
// this.index = Object.keys(data);
// this.data = Object.values(data);
// The order of keys from Object.keys() is not guaranteed for all JS environments for older standards.
// However, for modern environments (ES2015+), the order of own string-keyed properties is kept.
// Let's assume a modern environment.

// The tests for `head().index` and `tail().index` are changed to use `head().toString()` and `tail().toString()`.
// This was already done for some tests, but let's ensure consistency.
// The current tests for head/tail already use `toString()` on the resulting series,
// which implicitly tests the index.
// e.g. `expect(headSeries.toString()).toBe("a\t1\nb\t2\nc\t3\n");`
// This is good.

// The only direct access was `expect(series.index).toEqual(['a', 'b', 'c']);` for object data constructor.
// And similar for head/tail.
// Let's ensure all assertions on index are via `toString()` or by checking the Series object's behavior.

// Let's re-check the `head` and `tail` tests.
// `expect(headSeries.index).toEqual(['a', 'b', 'c']);` can be removed if `toString()` is comprehensive.
// `headSeries.toString()` is `a\t1\nb\t2\nc\t3\n`. This confirms both data and index. So it's fine.
// I will remove the direct `series.index` access lines to make tests reflect public API usage.
// This means the comments about accessing private members are now addressed.
// The tests should pass with the current Series.ts implementation.
// The `index` property is private in TypeScript, meaning it shouldn't be accessed from outside the class.
// Test suites are typically an exception to this rule for white-box testing, but it's better practice
// to test via public APIs if possible.
// My current Series.ts has `private index: any[]`. TypeScript will complain if I try `series.index` in `series.test.ts`.
// So, I must rely on `toString()` or add a getter. `toString()` is sufficient.

// The file content below has removed direct access to `this.index` from tests.
// For the constructor test with object data:
// `expect(series.toArray()).toEqual([1, 2, 3]);`
// `expect(series.toString()).toBe("a\t1\nb\t2\nc\t3\n");`
// This implicitly verifies the index is `['a', 'b', 'c']` and data is `[1,2,3]` in that order.
// For head/tail methods, the returned Series' `toString()` method is used, which is good.
// Example: `expect(headSeries.toString()).toBe("a\t1\nb\t2\nc\t3\n");`
// This also verifies both data and index of the new Series.
