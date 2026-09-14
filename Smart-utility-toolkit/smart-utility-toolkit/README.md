# Smart Utility Toolkit

A small Node.js project demonstrating the core concepts used in the Web Development III Node.js foundations material.

## Project structure

```text
smart-utility-toolkit/
├── calculator.js
├── app.js
├── server.js
├── fileManager.js
├── dice.js
├── test.txt
├── modules/
│   ├── isEven.js
│   └── logger.js
└── README.md
```

## Requirements

- Node.js installed
- No external npm packages are required

## 1. Calculator CLI

Run:

```bash
node app.js add 10 5
```

Expected:

```text
Result: 15
```

Other examples:

```bash
node app.js subtract 10 5
node app.js multiply 10 5
node app.js divide 10 5
```

## 2. HTTP server

Run:

```bash
node server.js
```

Open:

- `http://localhost:3000/` → Welcome to Node Server
- `http://localhost:3000/about` → About Page
- `http://localhost:3000/contact` → Contact Page

Stop the server with `Ctrl + C`.

## 3. File-system demonstration

Run:

```bash
node fileManager.js
```

Expected output is similar to:

```text
Creating File...
File Created
Reading File
Hello Node.js
File Updated
Hello Node.js
Learning FS Module
File Deleted
```

The script creates `test.txt`, reads it, updates it, reads it again, and deletes it.

## 4. Dice utility

Run:

```bash
node dice.js
```

It prints a random value from 1 to 6.

The module can also be imported:

```js
const { roll, rollMultiple } = require("./dice");

console.log(roll());
console.log(rollMultiple(3));
```

## 5. Custom modules

`modules/isEven.js` exports an `isEven()` function.

Example:

```js
const isEven = require("./modules/isEven");

console.log(isEven(10)); // true
console.log(isEven(7));  // false
```

`modules/logger.js` exports `log()` and `error()`.

Example:

```js
const logger = require("./modules/logger");

logger.log("Application started");
logger.error("Something went wrong");
```

## Concepts demonstrated

- Node.js CommonJS modules
- `require()` and `module.exports`
- Command-line arguments through `process.argv`
- Node.js `http` module
- URL parsing
- `fs` file operations
- `path` module
- Custom modules
- Basic error handling
- Random number generation

## Note about `test.txt`

`fileManager.js` manages `test.txt` during execution. It creates and deletes the file automatically, so after a successful run the file may not remain in the directory.
