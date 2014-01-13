var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'BAAAAAAA';
exports.generate = function() {
  var m = 19, n = 15;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0,n);

  //start and finish cols
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);
  //7 As and a B
  //As can't be on left column
  var mostIs = util.range(2, m);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs, 7);
  map.placeRandomly(tiles.CHECKPOINT_2, 1);

  //Tune some parameters
  map.walls = util.getRandomInt(17, 23) + 15;
  var numExtraRocks = util.getRandomInt(19, 38);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}
