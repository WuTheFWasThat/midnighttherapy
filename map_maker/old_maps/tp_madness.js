var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Teleport Madness';
exports.generate = function() {
  var m = 17, n = 12;
  var rockProb = 1/10;
  var walls = util.getRandomInt(17,18);
  var cps = 1;
  var tps = 5;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
