var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 18, n = 9;
  var map = new DenseMap(m, n, 0, 'INfinite');

  var allJs = range(0, n);
  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  //INs
  for (var i = 0; i < 5; i++) {
    map.set(tiles.TELE_INS[i], m-2, 2*i);
  }

  //randomly place OUTs
  var mostIs = range(1, m-3);
  for (var i = 0; i < 5; i++) {
    map.placeRandomlyInArea(tiles.TELE_OUTS[i], mostIs, allJs);
  }

  //Tune some parameters
  map.walls = getRandomInt(15,15);
  var numExtraRocks = getRandomInt(12, 22);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numExtraRocks);

  return map;
}
