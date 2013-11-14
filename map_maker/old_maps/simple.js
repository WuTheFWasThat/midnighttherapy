var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 13, n = 7;
  var map = new DenseMap(m, n, 0, 'Simple');

  var allJs = range(0, n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  // A with probability 0.5
  var numCps = getRandomInt(0,1);
  map.placeCheckpoints(numCps);

  // Rock probability 1/12?
  map.placeRocks(1/12);

  // Walls uniform from 7-10?
  map.walls = getRandomInt(7,10);
  
  return map;
}
