var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 13, n = 7;
  var rockProb = 1/12;
  var walls = getRandomInt(7,10);
  var cps = getRandomInt(0,1);
  var tps = 0;
  var name = 'Simple';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
