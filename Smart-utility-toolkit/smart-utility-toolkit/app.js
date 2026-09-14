// Command-line calculator application
const calculator = require("./calculator");

const [, , operation, first, second] = process.argv;

const a = Number(first);
const b = Number(second);

if (!operation || !Number.isFinite(a) || !Number.isFinite(b)) {
  console.log("Usage: node app.js <add|subtract|multiply|divide> <number> <number>");
  process.exit(1);
}

try {
  let result;

  switch (operation.toLowerCase()) {
    case "add":
      result = calculator.add(a, b);
      break;
    case "subtract":
      result = calculator.subtract(a, b);
      break;
    case "multiply":
      result = calculator.multiply(a, b);
      break;
    case "divide":
      result = calculator.divide(a, b);
      break;
    default:
      console.log("Unknown operation. Use add, subtract, multiply, or divide.");
      process.exit(1);
  }

  console.log(`Result: ${result}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
