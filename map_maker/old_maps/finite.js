var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 18, n = 9;
  var rockProb = 1/7;
  var walls = getRandomInt(15,17);
  var cps = 0;
  var tps = 0;
  var name = 'Finite';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
