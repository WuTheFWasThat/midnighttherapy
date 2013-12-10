var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Complex';
exports.generate = function() {
  var m = 19, n = 9;
  var rockProb = 1/util.getRandomInt(7,9);
  var walls = util.getRandomInt(14,16);
  var cps = util.getRandomInt(2,5);
  var tps = util.getRandomInt(1,2);
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
