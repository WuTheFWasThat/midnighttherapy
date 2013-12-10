var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'INception';
exports.generate = function() {
  var outWidth = 4;
  var midWidth = 6;
  var m = 2*outWidth + 2 + 2*midWidth + 4;
  var n = m;
  var map = new DenseMap(m, n, 0, exports.name);

  // Separate the rings
  map.set(tiles.EMPTY, outWidth, util.range(outWidth, n-outWidth));
  map.set(tiles.EMPTY, m-outWidth-1, util.range(outWidth, n-outWidth));
  map.set(tiles.EMPTY, util.range(outWidth, m-outWidth), outWidth);
  map.set(tiles.EMPTY, util.range(outWidth, m-outWidth), n-outWidth-1);

  map.set(tiles.EMPTY, outWidth + midWidth + 1, util.range(outWidth+midWidth + 1, n-outWidth-midWidth-1));
  map.set(tiles.EMPTY, m-(outWidth + midWidth + 1) - 1, util.range(outWidth+midWidth + 1, n-outWidth-midWidth-1));
  map.set(tiles.EMPTY, util.range(outWidth+midWidth + 1, m-outWidth-midWidth-1), outWidth + midWidth + 1);
  map.set(tiles.EMPTY, util.range(outWidth+midWidth + 1, m-outWidth-midWidth-1), n-(outWidth + midWidth + 1) - 1);

  // Set inner ring
  var innerM = outWidth + 1 + midWidth + 1;
  var innerN = outWidth + 1 + midWidth + 1;
  map.set(tiles.CHECKPOINT_3, innerM, innerN);
  map.set(tiles.TELE_OUT_4, innerM+1, innerN);
  map.set(tiles.TELE_OUT_5, innerM, innerN+1);
  map.set(tiles.FINISH, innerM+1, innerN+1);


  var inOutRing = function(MAP, i, j) {
    if (0 <= i && i < outWidth)
      return true;
    if (m-outWidth <= i && i < m)
      return true;
    if (0 <= j && j < outWidth)
      return true;
    if (n-outWidth <= j && j < n)
      return true;
    return false;
  }

  var inMidRing = function(MAP, i, j) {
    //somewhere not in outer ring?
    if (inOutRing(MAP, i, j))
      return false;
    if (outWidth + 1 <= i && i < outWidth + midWidth + 1)
      return true;
    if (m-outWidth-midWidth-1 <= i && i < m-outWidth-1)
      return true;
    if (outWidth + 1 <= j && j < outWidth + midWidth + 1)
      return true;
    if (n-outWidth-midWidth-1 <= j && j < n-outWidth-1)
      return true;
    return false;
  }

  map.placeRandomlyCondition(tiles.GREEN_START, inOutRing);
  map.placeRandomlyCondition(tiles.CHECKPOINT_1, inOutRing);
  map.placeRandomlyCondition(tiles.CHECKPOINT_2, inOutRing);
  map.placeRandomlyCondition(tiles.TELE_IN_1, inOutRing);
  map.placeRandomlyCondition(tiles.TELE_IN_2, inOutRing);
  map.placeRandomlyCondition(tiles.TELE_IN_3, inOutRing);

  map.placeRandomlyCondition(tiles.TELE_OUT_1, inMidRing);
  map.placeRandomlyCondition(tiles.TELE_OUT_2, inMidRing);
  map.placeRandomlyCondition(tiles.TELE_OUT_3, inMidRing);
  map.placeRandomlyCondition(tiles.TELE_IN_4, inMidRing);
  map.placeRandomlyCondition(tiles.TELE_IN_5, inMidRing);
  map.placeRandomlyCondition(tiles.CHECKPOINT_2, inMidRing);
  map.placeRandomlyCondition(tiles.CHECKPOINT_3, inMidRing);


  //Tune some parameters
  map.walls = util.getRandomInt(22, 27);
  var outerRocks = 40,
      innerRocks = 20;

  map.placeRandomlyCondition(tiles.ROCK, inOutRing, outerRocks);
  map.placeRandomlyCondition(tiles.ROCK, inMidRing, innerRocks);
  return map;
}

