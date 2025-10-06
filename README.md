# jpandas

[![npm version](https://img.shields.io/npm/v/jpandas.svg?style=flat-square)](https://www.npmjs.com/package/jpandas)
[![DOWNLOADS](https://img.shields.io/npm/dt/jpandas.svg?label=DOWNLOADS&style=flat)](https://www.npmjs.com/package/jpandas)

📟 A lightweight TypeScript library for tabular data manipulation, inspired by Python's pandas. Supports DataFrame/Series APIs and works in both Node.js and the browser.

- 📦 Easy creation of tabular data structures in JavaScript.
- 📦 Provides a DataFrame class inspired by pandas in Python.
- 👨‍🏫 Developed by **Rajnish**.

## Table of Contents

- [jpandas](#jpandas)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Creating DataFrames](#creating-dataframes)
    - [From an Array](#from-an-array)
    - [From an Object](#from-an-object)
    - [From CSV String](#from-csv-string)
    - [From JSON String](#from-json-string)
  - [DataFrame Operations](#dataframe-operations)
    - [Selection \& Indexing](#selection--indexing)
    - [Cleaning](#cleaning)
    - [Group By](#group-by)
    - [Rename Columns](#rename-columns)
    - [Transform DataFrame](#transform-dataframe)
    - [Calculate Mean](#calculate-mean)
    - [Sorting](#sorting)
    - [Statistics](#statistics)
    - [Median/Mode](#medianmode)
    - [Value Counts](#value-counts)
    - [Combining (Merge/Join)](#combining-mergejoin)
    - [Concat](#concat)
    - [Pivot \& Reshaping](#pivot--reshaping)
    - [Export / Conversion](#export--conversion)
    - [JS-friendly Helpers](#js-friendly-helpers)
    - [Types](#types)
  - [Series Operations](#series-operations)
    - [Series Selection](#series-selection)
    - [Series Transform](#series-transform)
    - [Series Statistics](#series-statistics)
    - [Series Value Counts](#series-value-counts)
  - [Compatibility](#compatibility)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Installation

```sh
npm install jpandas

or

yarn add jpandas
```

## Usage

Here’s a quick example of how to use the DataFrame Library in your project:

```ts
import { DataFrame, Series } from 'jpandas';

// From JSON
const df = DataFrame.fromJSON([
  { a: 1, b: 2 },
  { a: 3, b: 4 },
]);

// From CSV
const csv = `a,b\n1,2\n3,4`;
const dfCsv = DataFrame.fromCSV(csv);

// Exploration
console.log(df.shape); // [2, 2]
console.log(df.columns); // ['a','b']
console.log(df.head(1).toJSON()); // [{ a: 1, b: 2 }]
console.log(df.tail(1).toJSON()); // [{ a: 3, b: 4 }]

// Selection
console.log(df.col('a').toArray()); // [1, 3]
console.log(df.select(['b']).toJSON()); // [{ b: 2 }, { b: 4 }]
console.log(df.iloc(0).toJSON()); // [{ a: 1, b: 2 }]
console.log(df.iloc(0, 2).toJSON()); // slice rows [0,2)

// Stats
console.log(df.sum('a')); // 4
console.log(df.mean('b')); // 3
console.log(df.min('a')); // 1
console.log(df.max('b')); // 4
console.log(df.describe()); // { a: { count, mean, min, max }, b: { ... } }

// Series
const s = new Series([1, 2, 3], 's');
console.log(s.head(2).toArray()); // [1,2]
console.log(s.sum()); // 6
console.log(s.describe()); // { count: 3, mean: 2, min: 1, max: 3 }
```

## Creating DataFrames

### From an Array

```ts
import { DataFrame } from 'jpandas';

const rows = [
  { a: 1, b: 2 },
  { a: 3, b: 4 },
];

// fromArray is an alias of fromJSON
const df = DataFrame.fromArray(rows);
```

### From an Object

Currently, DataFrame expects an array of row objects. If you have a column-oriented object, convert it first:

```ts
const columns = { a: [1, 3], b: [2, 4] };
const rows = columns.a.map((_, i) => ({ a: columns.a[i], b: columns.b[i] }));
const df = DataFrame.fromJSON(rows);
```

### From CSV String

```ts
import { DataFrame } from 'jpandas';

const csv = `a,b\n1,2\n3,4`;
const df = DataFrame.fromCSV(csv);
```

### From JSON String

```ts
import { DataFrame } from 'jpandas';

const json = '[{"a":1,"b":2},{"a":3,"b":4}]';
const df = DataFrame.fromJSON(JSON.parse(json));
```

## DataFrame Operations

### Selection & Indexing

```ts
// Columns
df.col('a').toArray();
df.select(['a', 'b']).toJSON();

// Row indexing (iloc)
df.iloc(0).toJSON();
df.iloc(0, 2).toJSON();

// JS-friendly
df.getRowsByIndex(1, 3).toJSON();
df.getRowsByCondition(row => (row.a as number) > 1).toJSON();
df.filter(row => (row.b as number) % 2 === 0).toJSON();
```

### Cleaning

```ts
df.dropna();                    // drop rows with any NA
df.dropna({ axis: 1 });         // drop columns with any NA
df.dropna({ subset: ['a'] });   // consider only selected columns

df.fillna(0);                   // fill across all columns
df.fillna(0, { subset: ['a'] });

df.drop(['b']);                 // drop single or multiple columns
df.drop({ columns: ['b', 'c'], index: [0] });

df.rename({ a: 'A', b: 'B' });
```

### Group By

```ts
const sales = DataFrame.fromJSON([
  { region: 'N', prod: 'A', qty: 2 },
  { region: 'N', prod: 'B', qty: 1 },
  { region: 'S', prod: 'A', qty: 3 },
]);

const grouped = sales.groupby(['region', 'prod']).sum();
```

### Rename Columns

```ts
const df = DataFrame.fromJSON([{ a: 1, b: 2 }]);
const renamed = df.rename({ a: 'A', b: 'B' });
```

### Transform DataFrame

```ts
const df = DataFrame.fromJSON([
  { a: 1, b: 2 },
  { a: 3, b: 4 },
]);

// Add computed column
const withC = df.assign({ c: (row) => (row.a as number) + (row.b as number) });

// Row-wise apply
const applied = df.apply((row) => ({ ...row, d: 1 }));

// Column-wise map
const mapped = df.mapColumns((v, c) => (c === 'a' && typeof v === 'number' ? (v as number) * 10 : v));
```

### Calculate Mean
### Sorting

```ts
df.sortValues('a');
df.sortValues(['a', 'b'], { ascending: [true, false], naPosition: 'last' });
```

### Statistics

```ts
df.sum('a');
df.mean('a');
df.min('a');
df.max('a');
df.describe();
```

### Median/Mode

```ts
df.median('a');
df.mode('a');
```

### Value Counts

```ts
// On a column
df.valueCounts('b');
df.valueCounts('b', { normalize: true, ascending: true, dropna: false });
```

### Combining (Merge/Join)

```ts
left.merge(right, { on: 'id', how: 'left' });
left.merge(right, { on: 'id', how: 'inner' });
left.merge(right, { on: 'id', how: 'right' });
left.merge(right, { on: 'id', how: 'outer', suffixes: ['_L', '_R'] });
```

### Concat

```ts
DataFrame.concat([left, left]);               // axis 0 (rows)
DataFrame.concat([left, right], { axis: 1 }); // axis 1 (columns)
DataFrame.concat([left, right], { axis: 1, suffixes: ['_l', '_r'] });
```

### Pivot & Reshaping

```ts
// Basic pivot
const wide = tall.pivot({ index: 'city', columns: 'quarter', values: 'sales' });

// Pivot table with aggregation
tall.pivotTable({ index: 'city', columns: 'quarter', values: 'sales', aggfunc: 'sum' });
```

### Export / Conversion

```ts
df.toJSON();                                  // Row[]
df.toCSV();                                   // CSV string (with header)
df.toCSV({ delimiter: ';', quote: 'always' });

const s = new Series([1, 2, 3]);
s.toArray();                                   // number[]
```

### JS-friendly Helpers

```ts
// Column-wise transform
df.mapColumns((v, c) => (c === 'a' && typeof v === 'number' ? v * 10 : v));

// DataFrame.fromArray / toObject
const df2 = DataFrame.fromArray([{ a: 1 }, { a: 2 }]);
df2.toObject();
```

### Types

```ts
df.getColumnTypes(); // { a: 'number', b: 'number', ... }
```

## Series Operations

### Series Selection

```ts
const s = new Series([1, 2, 3, null]);
s.head(2).toArray();
s.tail(2).toArray();
s.iloc(1).toArray();
```

### Series Transform

```ts
s.map(v => (typeof v === 'number' ? v * 2 : v)).toArray();
s.dropna().toArray();
s.fillna(0).toArray();
```

### Series Statistics

```ts
s.sum();
s.mean();
s.min();
s.max();
s.median();
s.mode();
s.describe();
```

### Series Value Counts

```ts
s.valueCounts({ normalize: true, ascending: true, dropna: false });
```

## Compatibility

- ESM: `import { DataFrame, Series } from 'jpandas'`
- CJS: `const { DataFrame, Series } = require('jpandas')`
- Browser: include `dist/index.global.js` and use `window.jpandas`
- Tree-shaking: package sets `sideEffects: false`

```ts
const df = DataFrame.fromJSON([
  { a: 1, b: 2 },
  { a: 3, b: 4 },
]);

df.mean('a'); // 2
```

## Contributing

## License

- MIT © [Rajnish Singh](https://github.com/rajnish93)

## Contact

- [![GitHub @rajnish93](https://img.shields.io/badge/GITHUB-gray.svg?colorB=6cc644&style=flat)](https://github.com/rajnish93) (follow to stay up to date on OSS)
- [![LinkedIn @krajnishsingh](https://img.shields.io/badge/LINKEDIN-gray.svg?colorB=0077b5&style=flat)](https://www.linkedin.com/in/krajnishsingh/) (connect on LinkedIn)
