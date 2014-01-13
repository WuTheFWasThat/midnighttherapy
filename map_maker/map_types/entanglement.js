var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

//used for the map type below
//spotsX and spotsY should be the same length
function isSeparated(spotsX, spotsY) {
  for (var i = 0; i < spotsX.length; i++) {
    for (var j = i+1; j < spotsX.length; j++) {
      //make sure i and j are far apart enough
      if (!(Math.abs(spotsX[i]-spotsX[j]) > 2 ||
            Math.abs(spotsY[i]-spotsY[j]) > 2)) {
        return false;
      }
    }
  }

  return true;
}

exports.name = 'Entanglement'
exports.generate = function() {
  var m = 19, n = 19;
  var map = new DenseMap(m, n, 0, exports.name);

  //start corners
  map.set(tiles.GREEN_START, 0, 0);
  map.set(tiles.RED_START, m-1, n-1);
  //finish corners
  map.set(tiles.FINISH, m-1, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-2, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-1, 1);
  map.set(tiles.FINISH, 0, n-1);
  map.set(tiles.RED_THROUGH_ONLY, 0, n-2);
  map.set(tiles.RED_THROUGH_ONLY, 1, n-1);

  //2 As, Bs, Cs = 6 spots
  var done = false;
  var SPOTS = 6;
  //make a list of separated places
  while (!done) {
    spotsX = []; //vertical... lol
    spotsY = [];
    for (var i = 0; i < SPOTS; i++) {
      spotsX[i] = util.getRandomInt(2, m-3);
      spotsY[i] = util.getRandomInt(2, n-3);
    }
    done = isSeparated(spotsX, spotsY);
  }

  var CPS = [tiles.CHECKPOINT_1, tiles.CHECKPOINT_1,
             tiles.CHECKPOINT_2, tiles.CHECKPOINT_2,
             tiles.CHECKPOINT_3, tiles.CHECKPOINT_3];
  var WALLS = [tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY,
               tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY,
               tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY];
  var dxs = [-1, 1,  0, 0];
  var dys = [ 0, 0, -1, 1];

  for (var i = 0; i < SPOTS; i++) {
    map.set(CPS[i], spotsX[i], spotsY[i]);
    for (var j = 0; j < 4; j++) {
      map.set(WALLS[i], spotsX[i] + dxs[j], spotsY[i] + dys[j]);
    }
  }

  //Tune some parameters
  map.walls = util.getRandomInt(20,20);
  var numExtraRocks = util.getRandomInt(19, 38);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}
