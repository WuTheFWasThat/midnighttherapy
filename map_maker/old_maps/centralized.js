var util = require('../map_util');
var tiles = require('../tile_types');

var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Centralized';
exports.generate = function() {
  var m = 19, n = 9;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0,n);

  map.set('s', 10, 4);
  map.set('f', 8, 4);
  for (var i = 0; i < m; i++) {
    map.set('?', i, 0);
    map.set('?', i, n-1);
  }
  for (var j = 0; j < n; j++) {
    map.set('?', 0, j);
    map.set('?', m-1, j);
  }
  map.set('?', 9, 4);
  map.placeCheckpoints(3);
  // tu, d, tud, or nothing
  var num = util.getRandomInt(1,4);
  switch(num) {
    case 1:
      map.placeTps(1);
      break;
    case 2:
      map.placeRandomly(tiles.CHECKPOINT_4);
      break;
    case 3:
      map.placeTps(1);
      map.placeRandomly(tiles.CHECKPOINT_4);
    default:
  }

  map.placeRocks(1/7);

  map.walls = util.getRandomElt([17, 18, 19, 18, 17]);

  map.replaceAll('?', tiles.DEFAULT);

  return map;
}