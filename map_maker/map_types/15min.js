var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 21, n = m;
  var k = (n-1)/2 >> 0; //middle index
  var map = new DenseMap(m, n, 0, '15 Minutes Late');

  // Attempt to draw a circle
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      if ((i-k)*(i-k) + (j-k)*(j-k) > k*k + k) {
        map.set(tiles.EMPTY, i, j);
      }
    }
  }

  map.set(tiles.EMPTY, k, k);

  // hour hand
  map.set(tiles.FINISH, k, range(k-4,k));
  // minute hand
  map.set(tiles.GREEN_START, range(k+1, k+8), k);

  // checkpoints
  var front = range(0,k);
  var back = range(k+1, n);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, back, back);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, front, back);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, front, front);

  // Tune some parameters
  map.walls = getRandomInt(15,19);
  var numRocks = getRandomInt(22, 26);
  map.placeRandomly(tiles.ROCK, numRocks);
  return map;
}
