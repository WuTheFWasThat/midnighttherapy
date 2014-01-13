var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Thirty Too'
exports.generate = function() {
  var m = 21, n = 15;
  var map = new DenseMap(m, n, 0, exports.name);

  map.set(tiles.GREEN_START, 0, 0);
  map.set(tiles.FINISH, m-1, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-2, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-1, 1);

  map.set(tiles.RED_START, m-1, n-1);
  map.set(tiles.FINISH, 0, n-1);
  map.set(tiles.RED_THROUGH_ONLY, 0, n-2);
  map.set(tiles.RED_THROUGH_ONLY, 1, n-1);

  map.placeCheckpoints(1);
  map.placeTps(1);
  map.placeRandomly(tiles.PATCH, 4);

  map.placeRocks(1/20);

  map.walls = 32;

  return map;
}
