
var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'timINg';
exports.generate = function() {
  var k = 19, n = 9;
  var m = k + 6;

  var map = new DenseMap(m, n, 0, exports.name);

  var allJs = util.range(0, n);

  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, k-1, allJs);

  //paint the right side all black
  var mostIs = util.range(0, k);
  var restIs = util.range(k, m);
  map.set(tiles.EMPTY, restIs, allJs);

  //A, B, C
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, mostIs, allJs);

  //In1 and Out2-5
  map.placeRandomlyInArea(tiles.TELE_IN_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_3, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_4, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_5, mostIs, allJs);

  //weird right side thing
  //np is the vertical middle of the map
  var np = n / 2 >> 0
  var mp = k + 3;
  map.set(tiles.TELE_OUT_1, mp, np);
  //do each spoke
  map.set(tiles.TELE_IN_2, mp, np-1);
  map.set(tiles.CHECKPOINT_1, mp, np-2);
  map.set(tiles.TELE_IN_3, mp+1, np);
  map.set(tiles.CHECKPOINT_2, mp+2, np);
  map.set(tiles.TELE_IN_4, mp, np+1);
  map.set(tiles.CHECKPOINT_3, mp, np+2);
  map.set(tiles.TELE_IN_5, mp-1, np);
  map.set(tiles.FINISH, mp-2, np);

  //Tune some parameters
  map.walls = util.getRandomInt(18,18);
  var numExtraRocks = util.getRandomInt(10, 20);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numExtraRocks);

  return map;
}
