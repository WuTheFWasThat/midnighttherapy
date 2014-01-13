var util = require('../map_util');

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Seeing Double';
exports.generate = function() {
  var m = 21, n = 13;
  var map = new DenseMap(m, n, 0, exports.name);

  var mid = (n-1)/2;
  var top_half = util.range(0,mid);
  var bot_half = util.range(mid+1,n);

  var allJs = util.range(0, n);
  // start and finish columns
  map.set('s', 0, allJs)
  map.set('f', m-1, allJs)
  map.set('q', util.range(1,m-1), mid)
  map.set('o', 0, mid)
  map.set('o', m-1, mid)

  var num_cps = 3;
  map.placeCheckpoints(num_cps, {yrange: top_half});
  map.placeCheckpoints(num_cps, {yrange: bot_half});
  map.placeTps(1);
  map.placeRocks(1/9);

  map.walls = util.getRandomElt([20, 20, 21, 21, 22, 23]);

  return map;
}
