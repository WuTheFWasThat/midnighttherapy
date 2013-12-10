var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 17, n = 12;
  var rockProb = 1/10;
  var walls = getRandomInt(17,18);
  var cps = 1;
  var tps = 5;
  var name = 'Teleport Madness';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
