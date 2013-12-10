var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = "ABC's";
exports.generate = function() {
  var m = 19, n = 11;
  var rockProb = 1/12;
  var walls = util.getRandomElt([20,21,22,22,23]);
  var cps = 3;
  var tps = 0;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
