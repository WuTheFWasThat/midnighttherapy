var util = require('../map_util');
var tiles = require('../tile_types');

var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Ultimate Random';
exports.generate = function() {
  var m = 18, n = 10;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0,n);

  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);
  map.placeCheckpoints(3);
  // tu, tu, nothing, nothing, or d
  var num = util.getRandomInt(1,5);
  switch(num) {
    case 1:
    case 2:
      map.placeTps(1);
      break;
    case 3:
      map.placeRandomly(tiles.CHECKPOINT_4);
      break;
    default:
  }

  map.placeRocks(1/10);

  map.walls = util.getRandomElt([21, 20, 22, 20, 21]);

  return map;
}