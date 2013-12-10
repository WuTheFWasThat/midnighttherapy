var util = require('./map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('./tile_types');
var map_repr = require('./map_repr');
var DenseMap = map_repr.DenseMap;

exports.generateMap = function(m, n, rockChance, walls, cps, tps, mapName) {
  // Default values
  if (m == undefined) m = 19;
  if (n == undefined) n = 9;
  if (rockChance == undefined) rockChance = 0.5;
  if (walls == undefined) walls = getRandomInt(7, (m*n*.12) >> 0);
  if (cps == undefined) cps = getRandomInt(0,5);
  if (tps == undefined) tps = getRandomInt(0,2);
  if (mapName == undefined) mapName = '';

  var map = new DenseMap(m, n, walls, mapName);

  var allJs = range(0,n);
  // start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  map.placeCheckpoints(cps, {xrange: range(2,m-2)});
  map.placeTps(tps, {xrange: range(2,m-2)});

  map.placeRocks(rockChance);

  // walls already set
  return map;
}