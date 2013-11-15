//Utility functions.

//between min/max, inclusive
exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Return a random element of the array
exports.getRandomElt = function(arr) {
  var n = arr.length;
  return arr[exports.getRandomInt(0,n-1)];
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

// Discrete distribution
var Distribution = function() {
  this.total = 0;
  this.keys = {};
};
Distribution.prototype.add = function(key, weight) {
  if (weight <= 0) {
    throw new Error("Distribution add: weight must be positive");
  }
  if (this.keys[key]) {
    this.keys[key] += weight;
  } else {
    this.keys[key] = weight;
  }
  this.total += weight;
};
Distribution.prototype.sample = function() {
  var val = Math.random() * this.total;
  var current = 0;
  for (var key in this.keys) {
    if (this.keys.hasOwnProperty(key)) {
      current += this.keys[key];
      if (current >= val) {
        return key;
      }
    }
  }

  throw new Error("Distribution sample: unexpectedly failed to sample");
};


exports.Distribution = Distribution;