var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Finite';
exports.generate = function() {
  var m = 18, n = 9;
  var rockProb = 1/7;
  var walls = util.getRandomInt(15,17);
  var cps = 0;
  var tps = 0;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
