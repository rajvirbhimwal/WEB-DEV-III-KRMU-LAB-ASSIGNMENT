// Returns true when a number is even.
function isEven(number) {
  return Number.isFinite(number) && number % 2 === 0;
}

module.exports = isEven;
