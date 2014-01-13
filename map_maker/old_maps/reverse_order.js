var util = require('../map_util');
var tiles = require('../tile_types');

var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Reverse Order';
exports.generate = function() {
  var m = 17, n = 8;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0,n);

  map.set(tiles.FINISH, 0, allJs);
  map.set(tiles.RED_START, m-1, allJs);
  map.set('?', 1, allJs);
  map.set('?', m-2, allJs);
  map.placeCheckpoints(3);
  map.placeTps(1);

  map.placeRocks(1/7);
  map.replaceAll('?', tiles.DEFAULT);

  map.walls = 12;

  return map;
}