var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 15, n = 9;
  var map = new DenseMap(m, n, 0, 'Normal');

  var allJs = range(0, n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  // A-D, ratio 1:2:2:1
  var CPDist = new util.Distribution();
  CPDist.add(1, 1);
  CPDist.add(2, 2);
  CPDist.add(3, 2);
  CPDist.add(4, 1);
  var numCps = CPDist.sample();
  console.log(numCps);
  map.placeCheckpoints(numCps, {no_left_right: 1});

  // Rock probability 1/7?
  map.placeRocks(1/7);

  // Walls uniform from 11-13?
  map.walls = getRandomInt(11,13);

  return map;
}
