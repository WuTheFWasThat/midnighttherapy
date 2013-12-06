var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 19, n = 9;
  var map = new DenseMap(m, n, 0, 'Complex');

  var allJs = range(0, n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  // D-E, ratio 1:1:1:1
  var CPDist = new util.Distribution();
  CPDist.add(2, 1);
  CPDist.add(3, 1);
  CPDist.add(4, 1);
  CPDist.add(5, 1);
  var numCps = CPDist.sample();
  map.placeCheckpoints(numCps, {xrange: range(2,m-2)});

  // uniform between 1 and 2 TPs
  var numTps = getRandomInt(1,2);
  map.placeTps(numTps, {xrange: range(2,m-2)});

  // Rock probability 1/8?
  map.placeRocks(1/8);

  // Walls uniform from 14-16?
  map.walls = getRandomInt(14,16);

  return map;
}
