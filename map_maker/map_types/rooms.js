var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var num_w = 4, num_h = 4;

  var room_w = 5, room_h = 5;

  var m = (room_w+1) * num_w - 1;
  var n = (room_h+1) * num_h - 1
  var map = new DenseMap(m, n, 0, 'Rooms');

  for (var k =1; k <  num_w; k++) {
    map.set(tiles.EMPTY, (room_w+1) * k - 1, range(0, n));
  }
  for (var k =1; k <  num_h; k++) {
    map.set(tiles.EMPTY, range(0, m), (room_h+1) * k - 1);
  }

  for (var k =1; k <  num_w; k++) {
    for (var j = 0; j < num_h; j++) {
      map.set(tiles.DEFAULT, (room_w+1) * k - 1, (room_h+1)*j + 2);
    }
  }
  for (var k =1; k <  num_h; k++) {
    for (var j = 0; j < num_w; j++) {
      map.set(tiles.DEFAULT, (room_w+1)*j + 2, (room_h+1) * k - 1);
    }
  }

  //Tune some parameters
  map.walls = 20;

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
