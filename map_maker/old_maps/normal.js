var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Normal';
exports.generate = function() {
  var m = 15, n = 9;
  var rockProb = 1/7;
  var walls = util.getRandomInt(11,13);
  var cps = util.getRandomInt(1,3) + util.getRandomInt(0,1);
  var tps = 0;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
