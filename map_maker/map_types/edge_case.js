var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 20, n = 20;
  var map = new DenseMap(m, n, 0, 'Edge Case');

  var Is = range(6, m - 6);
  var Js = range(6, n - 6);
  map.set(tiles.EMPTY, Is, Js);

  //Tune some parameters
  map.walls = 22;
  var numExtraRocks = getRandomInt(13, 37);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  var numCheckpoints = 2;
  var numTeleports = 3;
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);

  return map;
}
