var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = '15 Minutes Late'
exports.generate = function() {
  var m = 21, n = m;
  var k = (n-1)/2 >> 0; //middle index
  var map = new DenseMap(m, n, 0, exports.name);

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
  map.set(tiles.FINISH, k, util.range(k-4,k));
  // minute hand
  map.set(tiles.GREEN_START, util.range(k+1, k+8), k);

  // checkpoints
  var front = util.range(0,k);
  var back = util.range(k+1, n);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, back, back);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, front, back);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, front, front);

  // Tune some parameters
  map.walls = util.getRandomInt(15,19);
  var numRocks = util.getRandomInt(22, 26);
  map.placeRandomly(tiles.ROCK, numRocks);
  return map;
}
