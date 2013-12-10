var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 21, n = 13;
  var map = new DenseMap(m, n, 0, 'Seeing Double');

  var mid = (n-1)/2;
  var top_half = range(0,mid);
  var bot_half = range(mid+1,n);

  var allJs = range(0, n);
  // start and finish columns
  map.set('s', 0, allJs)
  map.set('f', m-1, allJs)
  map.set('q', range(1,m-1), mid)
  map.set('o', 0, mid)
  map.set('o', m-1, mid)

  var num_cps = 3;
  map.placeCheckpoints(num_cps, {yrange: top_half});
  map.placeCheckpoints(num_cps, {yrange: bot_half});
  map.placeTps(1);
  map.placeRocks(1/9);

  map.walls = util.getRandomElt([20, 20, 21, 21, 22, 23]);
  console.log(map.repr())

  return map;
}
