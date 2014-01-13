var util = require('../map_util');
var gen_map = require('../generate_map');

exports.name = 'Simple';
exports.generate = function() {
  var m = 13, n = 7;
  var rockProb = 1/12;
  var walls = util.getRandomInt(7,10);
  var cps = util.getRandomInt(0,1);
  var tps = 0;
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, exports.name);
}
