var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Rocky Maze';
exports.generate = function() {
  var m = 19, n = 15;
  var rockProb = 1/5;
  var walls = util.getRandomInt(16,18);
  var cps = util.getRandomElt([1,2,2,2,3,3]);
  var tps = 0;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
