var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 25, n = 15;
  var map = new DenseMap(m, n, 0, 'Complex');

  var allJs = range(0, n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);
  for (var i = 0; i < n; i++) {
    if (i % 2 == 0) {
      map.set(tiles.ROCK, m-1, i);
    } else {
      map.set(tiles.ROCK, 0, i);
    }
  }

  // D-E, ratio 1:1:1:1
  map.placeCheckpoints(5, {
    xrange: range(2,m-2),
    yrange: range(1,n-1),
  });

  map.placeTps(4, {
    xrange: range(2,m-2),
    yrange: range(1,n-1),
    numouts: function(i) {
      return 1;
    }
  });

  // Rock probability 1/8?
  map.placeRocks(1/10);

  map.set(tiles.DEFAULT, 1, range(0,n));
  map.set(tiles.DEFAULT, m-2, range(0,n));
  map.set(tiles.DEFAULT, range(1,m-1), 0);
  map.set(tiles.DEFAULT, range(1,m-1), n-1);

  // Walls uniform from 14-16?
  map.walls = 50;

  return map;
}
