var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Race Condition'
exports.generate = function() {
  var k = 9;
  var m = 15, n = 2*k+1;
  var map = new DenseMap(m, n, 0, exports.name);
  var allIs = util.range(0, m);
  var J1 = util.range(0,k);
  var J2 = util.range(k+1, 2*k+1);

  //middle row is empty
  map.set(tiles.EMPTY, allIs, k);
  //put top start and finish
  map.set(tiles.GREEN_START, 0, J1);
  map.set(tiles.FINISH, m-1, J1);
  //put bot start and finish
  map.set(tiles.GREEN_START, 0, J2);
  map.set(tiles.FINISH, m-1, J2);

  //Tune some parameters
  map.walls = util.getRandomInt(17, 19);
  var numCheckpoints;
  if (Math.random() < .15) {
    numCheckpoints = 2;
  } else {
    numCheckpoints = 3;
  }
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J1);
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J2);
  }

  var numExtraRocks = util.getRandomInt(11,15);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J1, numExtraRocks);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J2, numExtraRocks);

  return map;
}
