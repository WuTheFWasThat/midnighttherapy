var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Rooms'
exports.generate = function() {
  var num_w = 4, num_h = 4;

  var room_w = 5, room_h = 5;

  var m = (room_w+1) * num_w - 1;
  var n = (room_h+1) * num_h - 1
  var map = new DenseMap(m, n, 0, exports.name);

  for (var k =1; k <  num_w; k++) {
    map.set(tiles.EMPTY, (room_w+1) * k - 1, util.range(0, n));
  }
  for (var k =1; k <  num_h; k++) {
    map.set(tiles.EMPTY, util.range(0, m), (room_h+1) * k - 1);
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

  // Don't place rocks where they can block walls.
  // Assumes room_w = room_h = 5
  var eq = function(a, b) {
    return (a[0] == b[0]) && (a[1] == b[1]);
  }
  var notOK = [[2,4],[2,5],[2,0],[4,2],[5,2],[0,2]];

  var condition = function(map, i, j) {
    i = i % 6;
    j = j % 6;
    var check = [i,j];
    for (var k = 0; k < notOK.length; k++) {
      if (eq(check, notOK[k])) {
        return false;
      }
    }

    return true;
  };

  var numExtraRocks = util.getRandomInt(13, 20);
  map.placeRandomly(tiles.ROCK, numExtraRocks, {condition: condition});

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
