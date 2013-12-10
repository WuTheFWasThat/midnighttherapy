var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('../tile_types');
var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.generate = function() {
  var m = 25, n = 15;
  var map = new DenseMap(m, n, 0, 'Ultra Complex');

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

  map.set('?', 1, allJs)
  map.set('?', m-2, allJs)
  map.set('?', range(1,m-1), 0)
  map.set('?', range(1,m-1), n-1)

  var num_cps = 5;
  var num_tps = 4;
  map.placeCheckpoints(num_cps);
  map.placeTps(num_tps);

  map.placeRandomly( util.getRandomElt(tiles.CHECKPOINTS) );
  var cp_or_tele_out = []
  for (var i = 0; i < num_cps; i ++ ) {cp_or_tele_out.push(tiles.CHECKPOINTS[i])}
  for (var i = 0; i < num_tps; i ++ ) {cp_or_tele_out.push(tiles.TELE_OUTS[i])}
  map.placeRandomly( util.getRandomElt(cp_or_tele_out) );
  map.placeRandomly( util.getRandomElt(cp_or_tele_out) );

  map.placeRocks(1/12);

  map.replaceAll('?', tiles.DEFAULT)

  map.walls = 50;

  return map;
}
