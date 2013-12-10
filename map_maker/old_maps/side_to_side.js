var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Side to Side';
exports.generate = function() {
  var m = 26, n = 6;
  var rockProb = 1/12;
  var walls = util.getRandomInt(17,19);
  var cps = util.getRandomElt([2,2,2,3,3]);
  var tps = util.getRandomElt([3,3,3,4]);
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
