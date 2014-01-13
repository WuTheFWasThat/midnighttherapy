var util = require('../map_util');
var gen_map = require('../generate_map');
exports.name = 'Thirty';

exports.generate = function() {
  var m = 18, n = 14;
  var rockProb = 1/20;
  var walls = 30;
  var cps = 1
  var tps = 1;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
