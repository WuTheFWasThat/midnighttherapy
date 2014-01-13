
var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Triage'
exports.generate = function() {
  var k = 10;
  var m = 3*k + 4, n = 13;
  var map = new DenseMap(m, n, 0, exports.name);

  //Three regions, k wide and n tall.
  //Separate the three regions.
  var allJs = util.range(0, n);
  map.set(tiles.EMPTY, [0,k+1, 2*k+2, 3*k+3], allJs);
  //permute the ins/outs
  var p = [3,4,0,1,2];
  var INS = [], OUTS = [];
  for (var i = 0; i < 5; i++) {
    INS.push(tiles.TELE_INS[p[i]]);
    OUTS.push(tiles.TELE_OUTS[p[i]]);
  }

  // //Put IN1 and IN2 in between the regions.
  // map.set(INS[0], k, n/2 >> 0);
  map.set(' ', k+1, n/2 >> 0);
  // map.set(INS[1], 2*k+1, n/2 >> 0);
  map.set(' ', 2*k+2, n/2 >> 0);
  //First region: Start, A,
  //Second region: Out1, B
  //Third region: Out2, C, [End]
  //Each region has a warp
  var I1 = util.range(1, k+1);
  var I2 = util.range(k+2, 2*k+2);
  var I3 = util.range(2*k+3, 3*k+3);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocksPerArea = util.getRandomInt(6,16);

  map.set(tiles.GREEN_START, 0, n/2 >> 0);
  //map.placeRandomlyInArea(tiles.GREEN_START, I1, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, I1, allJs);
  map.placeRandomlyInArea(INS[2], I1, allJs);
  map.placeRandomlyInArea(OUTS[2], I1, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I1, allJs, numExtraRocksPerArea);

  //map.placeRandomlyInArea(OUTS[0], I2, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, I2, allJs);
  map.placeRandomlyInArea(INS[3], I2, allJs);
  map.placeRandomlyInArea(OUTS[3], I2, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I2, allJs, numExtraRocksPerArea);

  map.set(tiles.FINISH, m-1, n/2 >> 0);
  //map.placeRandomlyInArea(OUTS[1], I3, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, I3, allJs);
  map.placeRandomlyInArea(INS[4], I3, allJs);
  map.placeRandomlyInArea(OUTS[4], I3, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I3, allJs, numExtraRocksPerArea);

  return map;
}
