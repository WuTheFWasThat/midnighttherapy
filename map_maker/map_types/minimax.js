var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Minimax'
exports.generate = function() {
  var a = 19, b = 9;
  var m = a+3, n = 2*b+1;
  var map = new DenseMap(m, n, 0, exports.name);
  var J1 = util.range(0,b);
  var J2 = util.range(b+1,2*b+1);
  var mostIs = util.range(3,a+3-2);

  // Paint things black (left 2 cols, middle row)
  map.set(tiles.EMPTY, [0,1], util.range(0,n));
  map.set(tiles.EMPTY, util.range(0,m), b);

  // Left side gadgets
  map.set(tiles.TELE_OUT_1, 0, 0);
  map.set(tiles.TELE_IN_4, 1, 0);
  map.set(tiles.TELE_OUT_2, 0, n-1);
  map.set(tiles.TELE_IN_5, 1, n-1);

  map.set(tiles.GREEN_START, 0, b-1-2);
  map.set(tiles.TELE_IN_3, 0, b-1-1);
  map.set(tiles.FINISH, 0, b-1);

  map.set(tiles.TELE_OUT_4, 0, b+1);
  map.set(tiles.FINISH, 0, b+2);
  map.set(tiles.TELE_OUT_5, 0, b+3);

  // Left side fake start (OUT 3)
  map.set(tiles.TELE_OUT_3, 2, J1);
  map.set(tiles.TELE_OUT_3, 2, J2);

  // Right side fake goal (IN 2/1)
  map.set(tiles.TELE_IN_2, m-2, J1);
  map.set(tiles.TELE_IN_1, m-2, J2);

  // Right side bait goal
  map.set(tiles.FINISH, m-1, J1);
  map.set(tiles.FINISH, m-1, J2);

  // Tune some parameters
    //Tune some parameters
  map.walls = 5 + util.getRandomInt(26, 32);
  var lo = 16,
      hi = 28;
  var numRocks1 = util.getRandomInt(lo, hi);
  var numRocks2 = util.getRandomInt(lo, hi);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, J1, numRocks1);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, J2, numRocks2);

  return map;
}

