<h4 align="center">

📟 A lightweight JavaScript package for working with tabular data, inspired by pandas in Python..

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

```javascript
import DataFrame from 'jpandas';

const data = [
    { Name: 'Ankit', Age: 23, University: 'BHU' },
    { Name: 'Aishwarya', Age: 21, University: 'JNU' }
];

const df = new DataFrame(data);
console.log(df.getRowCount()); // Outputs: 2
```

## Creating DataFrames

### From an Array

You can create a DataFrame from a 2D array:

```javascript
const data = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
];
const df = new DataFrame(data);
console.log(df.getRowCount()); // Outputs: 3
```

### From an Object

You can also create a DataFrame from an object where keys are column names:

```javascript
const data = {
    Name: ['Ankit', 'Aishwarya', 'Shaurya', 'Shivangi'],
    Age: [23, 21, 22, 21],
    University: ['BHU', 'JNU', 'DU', 'BHU']
};
const df = new DataFrame(data);
console.log(df.getValue(0, 'Name')); // Outputs: 'Ankit'
```

### From CSV String

To create a DataFrame from a CSV string:

```javascript
const csvData = `Name,Age,University\nAnkit,23,BHU\nAishwarya,21,JNU`;
const df = new DataFrame(csvData);
console.log(df.getValue(1, 'Age')); // Outputs: 21
```

### From JSON String

You can also create a DataFrame from a JSON string:

```javascript
const jsonString = `[{"Name": "Ankit", "Age": 23, "University": "BHU"}, {"Name": "Aishwarya", "Age": 21, "University": "JNU"}]`;
const df = new DataFrame(JSON.parse(jsonString));
console.log(df.getValue(1, 'University')); // Outputs: 'JNU'
```

## DataFrame Operations

### Group By

Group your DataFrame by a specific column:

```javascript
const grouped = df.groupBy('University');
console.log(Object.keys(grouped).length); // Outputs: number of unique universities
```

### Rename Columns

You can rename columns easily:

```javascript
const renamedDf = df.rename({ a: 'x', b: 'y' });
console.log(renamedDf.getColumns()); // Outputs: ['x', 'y', 'c']
```

### Transform DataFrame

Transform your DataFrame using a custom function:

```javascript
const transformedDf = df.transform(row => ({
    FullName: row.Name,
    Age: row.Age + 1
}));
console.log(transformedDf.getValue(0, 'FullName')); // Outputs: 'Ankit'
```

### Calculate Mean

Calculate the mean of a numeric column:

```javascript
const meanAge = df.mean('Age');
console.log(meanAge); // Outputs: average age
```

## Contributing

## License

- BSD-3-Clause © [Rajnish Singh](https://github.com/rajnish93)

## Contact

<div align="left">
    <p><a href="https://github.com/rajnish93"><img alt="GitHub @rajnish93" align="center" src="https://img.shields.io/badge/GITHUB-gray.svg?colorB=6cc644&style=flat" /></a>&nbsp;<small><strong>(follow)</strong> To stay up to date on free & open-source software</small></p>
    <p><a href="https://www.linkedin.com/in/krajnishsingh/"><img alt="LinkedIn @krajnishsingh" align="center" src="https://img.shields.io/badge/LINKEDIN-gray.svg?colorB=0077b5&style=flat" /></a>&nbsp;<small><strong>(connect)</strong> On the LinkedIn profile</small></p>
</div>
