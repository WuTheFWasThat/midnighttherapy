var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 19, n = 15;
  var map = new DenseMap(m, n, 0, 'BAAAAAAA');

  var allJs = range(0,n);

  //start and finish cols
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);
  //7 As and a B
  //As can't be on left column
  var mostIs = range(2, m);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs, 7);
  map.placeRandomly(tiles.CHECKPOINT_2, 1);

  //Tune some parameters
  map.walls = getRandomInt(17, 23) + 15;
  var numExtraRocks = getRandomInt(19, 38);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}
