// File-system demonstration using Node.js fs module
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "test.txt");

console.log("Creating File...");

fs.writeFileSync(filePath, "Hello Node.js", "utf8");
console.log("File Created");

console.log("Reading File");
console.log(fs.readFileSync(filePath, "utf8"));

fs.appendFileSync(filePath, "\nLearning FS Module", "utf8");
console.log("File Updated");
console.log(fs.readFileSync(filePath, "utf8"));

fs.unlinkSync(filePath);
console.log("File Deleted");
