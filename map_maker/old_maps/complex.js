var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 19, n = 9;
  var rockProb = 1/getRandomInt(7,9);
  var walls = getRandomInt(14,16);
  var cps = getRandomInt(2,5);
  var tps = getRandomInt(1,2);
  var name = 'Complex';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
