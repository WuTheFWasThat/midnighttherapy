var util = require('../map_util');
var tiles = require('../tile_types');

var map_repr = require('../map_repr');
var DenseMap = map_repr.DenseMap;

exports.name = 'Dualing paths';
exports.generate = function() {
  var m = 18, n = 9;
  var map = new DenseMap(m, n, 0, exports.name);

  var top_half = util.range(0,4);
  var bot_half = util.range(5,9);
  var allJs = util.range(0,9);

  map.set('?', 1, allJs);
  map.set('?', m-2, allJs);
  map.set(tiles.GREEN_START, 0, top_half);
  map.set(tiles.FINISH, 0, bot_half);
  map.set(tiles.FINISH, m-1, top_half);
  map.set(tiles.RED_START, m-1, bot_half);
  map.set('X', 1, bot_half);
  map.set('X', 0, 4);
  map.set('x', m-1, 4);
  map.set('x', m-2, top_half);

  map.placeCheckpoints(3);

  var colorWall1 = util.getRandomInt(2,4);
  var colorWall2 = util.getRandomInt(2,4);

  map.placeRandomly('x', colorWall1);
  map.placeRandomly('X', colorWall2);

  map.placeRocks(1/9);

  map.walls = 13;

  map.replaceAll('?', tiles.DEFAULT);
  return map;
}