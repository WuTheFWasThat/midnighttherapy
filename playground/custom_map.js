var util = require('./map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('./tile_types');
var map_repr = require('./map_repr');
var DenseMap = map_repr.DenseMap;

function randomBombsAway() {
  var m = 19, n = 19;  
  var map = new DenseMap(m, n, 0, 'Bombs Away');
  var Is = range(1, m, 2);
  var Js = range(1, n, 2);
  map.set(tiles.ROCK, Is, Js);

  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);
  //Tune some parameters
  map.walls = 20;
  var numExtraRocks = getRandomInt(6,8);
  map.placeRandomly(tiles.ROCK2, numExtraRocks);
  var numCheckpoints = getRandomInt(3,4);
  var numTeleports = getRandomInt(2,3);
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }

  return map;
}
exports.randomBombsAway = randomBombsAway;

function randomLayover() {
  var m = 19, n = 13;
  var map = new DenseMap(m, n, 0, 'Layover');
  map.set(tiles.ROCK, [8, 10], [0, 1, 2, 3]);

  map.set(tiles.CHECKPOINT_1, 9, 0);
  map.set(tiles.TELE_IN_1, 9, 1);
  map.set(tiles.TELE_IN_2, 9, 2);
  map.set(tiles.TELE_IN_3, 9, 3);
  map.set(tiles.TELE_IN_4, 9, 4);

  for (var j = 0; j < n; j++) {
    map.set(tiles.GREEN_START, 0, j);
    map.set(tiles.FINISH, m-1, j);
  }

  //Tune some parameters
  map.walls = 15;
  var numExtraRocks = getRandomInt(15,19);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  for (var i = 0; i < 4; i++) {
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  return map;
}
exports.randomLayover = randomLayover;

function randomEdgeCase() {
  var m = 20, n = 20;
  var map = new DenseMap(m, n, 0, 'Edge Case');

  var Is = range(6, m - 6);
  var Js = range(6, n - 6);
  map.set(tiles.EMPTY, Is, Js);

  //Tune some parameters
  map.walls = 22;
  var numExtraRocks = getRandomInt(17, 23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  var numCheckpoints = 2;
  var numTeleports = 3;
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);

  return map;
}
exports.randomEdgeCase = randomEdgeCase;

function randomTriage() {
  var k = 10;
  var m = 3*k + 2, n = 13;
  var map = new DenseMap(m, n, 0, 'Triage');

  //Three regions, k wide and n tall.
  //Separate the three regions.
  var allJs = range(0, n);
  map.set(tiles.EMPTY, [k, 2*k+1], allJs);
  //Put IN1 and IN2 in between the regions.
  map.set(tiles.TELE_IN_1, k, n/2 >> 0);
  map.set(tiles.TELE_IN_2, 2*k+1, n/2 >> 0);
  //First region: Start, A, B
  //Second region: Out1, C, D
  //Third region: Out2, E, End
  var I1 = range(0, k);
  var I2 = range(k+1, 2*k+1);
  var I3 = range(2*k+2, 3*k+2);

  map.placeRandomlyInArea(tiles.GREEN_START, I1, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, I1, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, I1, allJs);

  map.placeRandomlyInArea(tiles.TELE_OUT_1, I2, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, I2, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, I2, allJs);

  map.placeRandomlyInArea(tiles.TELE_OUT_2, I3, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, I3, allJs);
  map.placeRandomlyInArea(tiles.FINISH, I3, allJs);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocks = getRandomInt(17,23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

function randomYOLT() {
  var m = 21, n = 11;
  var map = new DenseMap(m, n, 0, 'You Only Live Twice');
  var allJs = range(0, n);

  //second to last column is all blank
  map.set(tiles.EMPTY, m-2, allJs);
  //last column is out1-4, in5, a-e, finish
  map.set(tiles.TELE_OUT_1, m-1, 0);
  map.set(tiles.TELE_OUT_2, m-1, 1);
  map.set(tiles.TELE_OUT_3, m-1, 2);
  map.set(tiles.TELE_OUT_4, m-1, 3);
  map.set(tiles.TELE_IN_5, m-1, 4);
  map.set(tiles.CHECKPOINT_1, m-1, 5);
  map.set(tiles.CHECKPOINT_2, m-1, 6);
  map.set(tiles.CHECKPOINT_3, m-1, 7);
  map.set(tiles.CHECKPOINT_4, m-1, 8);
  map.set(tiles.CHECKPOINT_5, m-1, 9);
  map.set(tiles.FINISH, m-1, 10);

  //place start and finish
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-3, allJs);

  var Is = range(1, m-3);
  map.placeRandomlyInArea(tiles.TELE_IN_1, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_2, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_3, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_4, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_5, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, Is, allJs);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocks = getRandomInt(17,23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

function randomNoEnd() {
    var m = 21, n = 11;
  var map = new DenseMap(m, n, 0, 'No End in Sight');
  var allJs = range(0, n);

  //second to last column is all blank
  map.set(tiles.EMPTY, m-2, allJs);
  //last column is out1-5, a-e, finish
  map.set(tiles.TELE_OUT_1, m-1, 0);
  map.set(tiles.TELE_OUT_2, m-1, 1);
  map.set(tiles.TELE_OUT_3, m-1, 2);
  map.set(tiles.TELE_OUT_4, m-1, 3);
  map.set(tiles.TELE_OUT_5, m-1, 4);
  map.set(tiles.CHECKPOINT_1, m-1, 5);
  map.set(tiles.CHECKPOINT_2, m-1, 6);
  map.set(tiles.CHECKPOINT_3, m-1, 7);
  map.set(tiles.CHECKPOINT_4, m-1, 8);
  map.set(tiles.CHECKPOINT_5, m-1, 9);
  map.set(tiles.FINISH, m-1, 10);

  //place start
  map.set(tiles.GREEN_START, 0, allJs);
  //map.set(tiles.FINISH, m-3, allJs);

  var Is = range(1, m-2);
  map.placeRandomlyInArea(tiles.TELE_IN_1, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_2, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_3, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_4, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_5, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, Is, allJs);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocks = getRandomInt(17,23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}


var main = function() {
  var fs = require('fs');
  
  // var map = randomLayover();
  // var map = randomBombsAway();
  // var map = randomEdgeCase();
  // var map = randomTriage();
  // var map = randomYOLT();
  var map = randomNoEnd();
  var outStr = map.repr();
  outStr += '\n\n';
  outStr += map.toMapCode();
  
  // var code = "13x7.c1.r10.w9.t0.Simple.:0s.0r.10f.0s.5r.5f.0s.0r.6r.1r.1f.0s.11f.0s.2r.4a.3f.0s.1r.4r.4f.0s.2r.6r.1f.";

  // var map = parseMapCode(code);
  // outStr = '';
  // outStr += map.dilate(3).toMapCode();

  fs.writeFileSync('out.txt', outStr);
  return;
}

if (require.main === module) {
  main();
}

