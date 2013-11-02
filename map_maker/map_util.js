//Utility functions.

//between min/max, inclusive
exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//integer range, exclusive
exports.range = function(a, b, step) {
  if (step <= 0) {
    throw new Error("range: i'm too lazy to make a negative range");
  }
  if (step == undefined) {
    step = 1;
  }
  if (b < a) {
    throw new Error("range: must have b >= a");
  }
  var result = [];
  var val = a;
  while (val < b) {
    result.push(val);
    val += step;
  }
  return result;
}

//integer range, inclusive
exports.rangeInclusive = function(a, b, step) {
  if (step <= 0) {
    throw new Error("range: i'm too lazy to make a negative range");
  }
  if (step == undefined) {
    step = 1;
  }
  if (b < a) {
    throw new Error("range: must have b >= a");
  }
  var result = [];
  var val = a;
  while (val <= b) {
    result.push(val);
    val += step;
  }
  return result;
}
