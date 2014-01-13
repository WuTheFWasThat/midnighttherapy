var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Ultra INfinite'
exports.generate = function() {
  var m = 25, n = 19;
  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0, n);
  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  //INs
  for (var i = 0; i < 5; i++) {
    map.set(tiles.TELE_INS[i], m-2, 2*i);
    map.set(tiles.TELE_INS[i], m-2, 2*i+10);
  }

  //randomly place OUTs
  var mostIs = util.range(1, m-3);
  for (var i = 0; i < 5; i++) {
    map.placeRandomlyInArea(tiles.TELE_OUTS[i], mostIs, allJs, 2);
  }

  //Tune some parameters
  map.walls = 50;
  var numExtraRocks = util.getRandomInt(12, 22) * 2;
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numExtraRocks);

  return map;
}
