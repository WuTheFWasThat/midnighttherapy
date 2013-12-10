var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Layover'
exports.generate = function() {
  var m = 19, n = 13;
  var map = new DenseMap(m, n, 0, exports.name);
  map.set(tiles.ROCK, [8, 10], [0, 1, 2, 3]);

  map.set(tiles.CHECKPOINT_1, 9, 0);
  map.set(tiles.TELE_IN_1, 9, 1);
  map.set(tiles.TELE_IN_2, 9, 2);
  map.set(tiles.TELE_IN_3, 9, 3);
  map.set(tiles.TELE_IN_4, 9, 4);

  for (var j = 0; j < n; j++) {
    map.set(tiles.GREEN_START, 0, j);
    map.set(tiles.FINISH, m-1, j);
  }

  //Tune some parameters
  map.walls = 15;
  var numExtraRocks = util.getRandomInt(15,19);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  for (var i = 0; i < 4; i++) {
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  return map;
}

