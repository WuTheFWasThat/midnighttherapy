var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Rooms'
exports.generate = function() {
  var num_w = 4, num_h = 4;

  var room_w = 4, room_h = 4;

  var m = (room_w+1) * num_w - 1;
  var n = (room_h+1) * num_h - 1
  var map = new DenseMap(m, n, 0, exports.name);

  for (var k =1; k <  num_w; k++) {
    map.set(tiles.EMPTY, (room_w+1) * k - 1, util.range(0, n));
  }
  for (var k =1; k <  num_h; k++) {
    map.set(tiles.EMPTY, util.range(0, m), (room_h+1) * k - 1);
  }
  //Tune some parameters
  map.walls = 16;

  var numExtraRocks = util.getRandomInt(13, 20);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  // 64% 1 opening, 32% 2 openings, 4% 0
  for (var k =1; k <  num_w; k++) {
    for (var j = 0; j < num_h; j++) {
      var p = Math.random();
      var set_1 = false;
      var set_2 = false;
      if (p < 0.32) {
        set_1 = true;
      } else if (p < 0.64) {
        set_2 = true;
      } else if (p < 0.96) {
        set_1 = true;
        set_2 = true;
      }

      if (set_1) {
      map.set(tiles.DEFAULT, (room_w+1) * k - 1, (room_h+1)*j + 2);
      map.set(tiles.DEFAULT, (room_w+1) * k - 2, (room_h+1)*j + 2);
      map.set(tiles.DEFAULT, (room_w+1) * k , (room_h+1)*j + 2);
      }
      if (set_2) {
      map.set(tiles.DEFAULT, (room_w+1) * k - 1, (room_h+1)*j + 1);
      map.set(tiles.DEFAULT, (room_w+1) * k - 2, (room_h+1)*j + 1);
      map.set(tiles.DEFAULT, (room_w+1) * k , (room_h+1)*j + 1);
      }
    }
  }
  for (var k =1; k <  num_h; k++) {
    for (var j = 0; j < num_w; j++) {
      var p = Math.random();
      var set_1 = false;
      var set_2 = false;
      if (p < 0.32) {
        set_1 = true;
      } else if (p < 0.64) {
        set_2 = true;
      } else if (p < 0.96) {
        set_1 = true;
        set_2 = true;
      }

      if (set_1) {
      map.set(tiles.DEFAULT, (room_w+1)*j + 2, (room_h+1) * k);
      map.set(tiles.DEFAULT, (room_w+1)*j + 2, (room_h+1) * k - 1);
      map.set(tiles.DEFAULT, (room_w+1)*j + 2, (room_h+1) * k - 2);
      }
      if (set_2) {
      map.set(tiles.DEFAULT, (room_w+1)*j + 1, (room_h+1) * k);
      map.set(tiles.DEFAULT, (room_w+1)*j + 1, (room_h+1) * k - 1);
      map.set(tiles.DEFAULT, (room_w+1)*j + 1, (room_h+1) * k - 2);
      }
    }
  }


  var numCheckpoints = 2;
  var numTeleports = 2;
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
