var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var num_rings = 5;
  var n = 4 * num_rings - 1;
  var mid = 2 * num_rings - 1;

  var map = new DenseMap(n, n, 0, 'Web');

  map.set(tiles.EMPTY, range(0,n), range(0, n));
  for (var k =1; k <=  num_rings; k++) {
    var r = 2* k-1;
    map.set(tiles.DEFAULT, mid + r, range(mid - r, mid + r+1));
    map.set(tiles.DEFAULT, mid - r, range(mid - r, mid + r+1));
    map.set(tiles.DEFAULT, range(mid - r, mid + r+1), mid + r);
    map.set(tiles.DEFAULT, range(mid - r, mid + r+1), mid - r);
  }
  map.set(tiles.DEFAULT, mid, range(0, n));
  map.set(tiles.DEFAULT, range(0, n), mid);


  //Tune some parameters
  map.walls = 5;

  var numExtraRocks = getRandomInt(1,1);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  var numCheckpoints = 5;
  var numTeleports = 5;
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
