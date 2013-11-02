
var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 19, n = 19;
  var map = new DenseMap(m, n, 0, 'Bombs Away');
  var Is = range(1, m, 2);
  var Js = range(1, n, 2);
  map.set(tiles.ROCK, Is, Js);

  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);
  //Tune some parameters
  map.walls = 20;
  var numExtraRocks = getRandomInt(6,8);
  map.placeRandomly(tiles.ROCK2, numExtraRocks);
  var numCheckpoints = getRandomInt(3,4);
  var numTeleports = getRandomInt(2,3);
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }

  return map;
}
