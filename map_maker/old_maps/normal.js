var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 15, n = 9;
  var rockProb = 1/7;
  var walls = getRandomInt(11,13);
  var cps = getRandomInt(1,3) + getRandomInt(0,1);
  var tps = 0;
  var name = 'Normal';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
