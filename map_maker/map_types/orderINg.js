var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var k = 19;
  var m = k + 2, n = 11;

  var map = new DenseMap(m, n, 0, 'orderINg');

  var allJs = range(0, n);

  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, k-1, allJs);

  //paint the right side all black
  var mostIs = range(0, k);
  var restIs = range(k, m);
  map.set(tiles.EMPTY, restIs, allJs);

  // Weird right col thing
  map.set(tiles.TELE_OUT_1, m-1, 0);
  map.set(tiles.TELE_OUT_2, m-1, 1);
  map.set(tiles.TELE_OUT_3, m-1, 2);
  map.set(tiles.TELE_IN_4, m-1, 3);
  map.set(tiles.TELE_IN_5, m-1, 4);
  map.set(tiles.CHECKPOINT_1, m-1, 5);
  map.set(tiles.CHECKPOINT_2, m-1, 6);
  map.set(tiles.CHECKPOINT_3, m-1, 7);
  map.set(tiles.CHECKPOINT_4, m-1, 8);
  map.set(tiles.CHECKPOINT_5, m-1, 9);
  map.set(tiles.FINISH, m-1, 10);

  // A, B, C, IN 1-3, OUT 4-5 in main area
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_3, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_4, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_5, mostIs, allJs);

  //Tune some parameters
  map.walls = getRandomInt(16, 22);
  var numRocks = getRandomInt(15, 25);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numRocks);
  return map;
}
