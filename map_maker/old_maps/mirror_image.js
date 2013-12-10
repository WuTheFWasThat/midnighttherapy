var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 23, n = 15;
  var map = new DenseMap(m, n, 0, 'Mirror Image');

  var mid = (n-1)/2;
  var top_half = range(0,mid);
  var bot_half = range(mid+1,n);

  var allJs = range(0, n);
  // start and finish columns
  map.set('?', 1, allJs)
  map.set('?', m-2, allJs)
  map.set('q', range(0,m), mid)
  map.set(tiles.FINISH      , 0   , top_half);
  map.set(tiles.RED_START   , m-1 , top_half);

  var num_cps = 5;
  map.placeCheckpoints(num_cps, {yrange: top_half});
  map.placeRandomly(tiles.TELE_OUTS[1] , 1, {J: top_half});
  map.placeRandomly(tiles.TELE_OUTS[4] , 1, {J: top_half});
  map.placeRandomly(tiles.TELE_INS[0]  , 1, {J: top_half});
  map.placeRandomly(tiles.TELE_INS[2]  , 1, {J: top_half});
  map.placeRandomly(tiles.ROCK, 5, {J: top_half});

  var mapping = { }
  mapping[tiles.FINISH  ] = tiles.GREEN_START;
  mapping[tiles.RED_START  ] = tiles.FINISH;
  mapping[tiles.TELE_OUTS[1] ] = tiles.TELE_INS[1];
  mapping[tiles.TELE_OUTS[4] ] = tiles.TELE_INS[4];
  mapping[tiles.TELE_INS[0]  ] = tiles.TELE_OUTS[0];
  mapping[tiles.TELE_INS[2]  ] = tiles.TELE_OUTS[2];
  for (var i =0; i < m; i++) {
    for (var j =0; j < mid; j++) {
      var type = map.get(i,j);
      if (type in mapping) {
        map.set(mapping[type], i, j+mid+1)
      } else {
        map.set(type, i, j+mid+1)
      }
    }
  }
  map.placeRocks(1/400);

  map.replaceAll('?', tiles.DEFAULT)

  map.walls = 999;
  console.log(map.repr())

  return map;
}
