var util = require('../map_util');
var getRandomInt = util.getRandomInt;
var gen_map = require('../generate_map');

exports.generate = function() {
  var m = 18, n = 14;
  var rockProb = 1/20;
  var walls = 30;
  var cps = 1
  var tps = 1;
  var name = 'Thirty';
  return gen_map.generateMap(m, n, rockProb, walls, cps, tps, name);
}
