var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 19, n = 15;
  var rockProb = 1/5;
  var walls = getRandomInt(16,18);
  var cps = util.getRandomElt([1,2,2,2,3,3]);
  var tps = 0;
  var name = 'Rocky Maze';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
