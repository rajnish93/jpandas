<h4 align="center">

📟 A lightweight TypeScript library for tabular data manipulation, inspired by Python's pandas. Supports DataFrame/Series APIs and works in both Node.js and the browser.

[![npm version](https://img.shields.io/npm/v/jpandas.svg?style=flat-square)](https://www.npmjs.com/package/jpandas)
[![DOWNLOADS](https://img.shields.io/npm/dt/jpandas.svg?label=DOWNLOADS&style=flat)](https://www.npmjs.com/package/jpandas)

</h4>

# jpandas

- 📦 Easy creation of tabular data structures in JavaScript.
- 📦 Provides a DataFrame class inspired by pandas in Python.
- 👨‍🏫 Developed by **Rajnish**.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Creating DataFrames](#creating-dataframes)
  - [From an Array](#from-an-array)
  - [From an Object](#from-an-object)
  - [From CSV String](#from-csv-string)
  - [From JSON String](#from-json-string)
- [DataFrame Operations](#dataframe-operations)
  - [Group By](#group-by)
  - [Rename Columns](#rename-columns)
  - [Transform DataFrame](#transform-dataframe)
  - [Calculate Mean](#calculate-mean)
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
import { DataFrame, Series } from 'ts-pandas-lite';

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

## Contributing

## License

- MIT © [Rajnish Singh](https://github.com/rajnish93)

## Contact

<div align="left">
    <p><a href="https://github.com/rajnish93"><img alt="GitHub @rajnish93" align="center" src="https://img.shields.io/badge/GITHUB-gray.svg?colorB=6cc644&style=flat" /></a>&nbsp;<small><strong>(follow)</strong> To stay up to date on free & open-source software</small></p>
    <p><a href="https://www.linkedin.com/in/krajnishsingh/"><img alt="LinkedIn @krajnishsingh" align="center" src="https://img.shields.io/badge/LINKEDIN-gray.svg?colorB=0077b5&style=flat" /></a>&nbsp;<small><strong>(connect)</strong> On the LinkedIn profile</small></p>
</div>
