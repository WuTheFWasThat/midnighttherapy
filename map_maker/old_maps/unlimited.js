var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Unlimited'
exports.generate = function() {
  var m = 17, n = 9;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0, n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  for (var i = 0; i < n; i++) {
    if (i % 2 == 0) {
      map.set('?', m-2, i);
      map.set('?', 1, i);
    }
  }
  for (var i = 0; i < m; i++) {
    if (i % 2 == 1) {
      map.set('?', i, 0);
      map.set('?', i, n-1);
    }
  }

  var num_cps = 3;
  map.placeCheckpoints(num_cps);
  map.placeTps(1);

  if (Math.random() < 0.5) {
    map.placeRandomly(tiles.CHECKPOINTS[num_cps]);
  }

  map.placeRocks(1/9);

  map.replaceAll('?', tiles.DEFAULT)

  map.walls = 999;

  return map;
}
