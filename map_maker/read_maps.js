// var repr = require('./map_repr');
var tiles = require('./tile_types');
var fs = require('fs');

function Distribution() {
}
Distribution.prototype.incr = function(num, amt) {
  if (num === undefined) {
    num = 0;
  }
  if (amt === undefined) {
    amt = 1;
  }
  if (!(this[num])) {
    this[num] = 0;
  }

  this[num] += amt;
};


// return object with info about the map
function mapCodeInfo(mapcode) {
  var head = mapcode.split(':')[0];
  var body = mapcode.split(':')[1];

  var head = head.split('.');
  var dims = head[0].split('x');
  var m = parseInt(dims[0]);
  var n = parseInt(dims[1]);
  if (head[1][0] != 'c') {console.log('head[1][0] was ' + head[1][0] + ' expected c');}
  if (head[2][0] != 'r') {console.log('head[2][0] was ' + head[2][0] + ' expected r');}
  if (head[3][0] != 'w') {console.log('head[3][0] was ' + head[3][0] + ' expected w');}
  var walls = parseInt(head[3].slice(1));
  if (head[4][0] != 't') {console.log('head[4][0] was ' + head[4][0] + ' expected t');}
  var name = head[5];

  // Figure out name
  if (name == '') {
    if (m == 13 && n == 7) {
      name = 'Simple';
    } else if (m == 15 && n == 9) {
      name = 'Normal';
    } else if (m == 19 && n == 9) {
      name = 'Complex';
    } else {
      console.log("can't figure out name of map");
    }
  }

  // Result
  var result = {};
  result.mapType = name;
  result.walls = walls;

  var body_split = body.split('.').slice(0, -1);
  for (var k = 0; k < body_split.length; k++) {
    var item = body_split[k];
    var type = item[item.length - 1];
    resultIncr(result, type);
  }

  // Count number of checkpoints/TPs
  var cps = 0;
  for (var i = 0; i < 5; i++) {
    if (result[tiles.CHECKPOINTS[i]]) {
      cps += 1;
    }
  }
  result.cps = cps;

  var tps = 0;
    for (var i = 0; i < 5; i++) {
    if (result[tiles.TELE_INS[i]]) {
      tps += 1;
    }
  }
  result.tps = tps;


  return result;
}

// Increment the value of the given tile type in given results object
function resultIncr(result, type) {
  if (!result[type]) {
    result[type] = 1;
  } else {
    result[type] += 1;
  }
}

// The tileTypes we care about
var tileTypes = ['cps', 'tps', 'walls', tiles.ROCK];

// Collect result
function collectResult(results, result) {
  var t = results[result.mapType];
  if (typeof(t) == 'undefined') {
    // console.log("unexpected result");
    return;
  }

  t.total++;
  t.cpDist.incr(result.cps);
  t.rockDist.incr(result[tiles.ROCK]);
  t.wallDist.incr(result.walls);
  var CPS = result.cps;
  // t.rockDists[CPS].incr(result[tiles.ROCK]);
  // t.wallDists[CPS].incr(result.walls);
  tileTypes.forEach(function(tile) {
    t[tile] += (result[tile] ? result[tile] : 0);
  });
}


function main() {
  var file = fs.readFileSync('./codes.txt');
  var text = file.toString();
  var codes = text.split('\n');

  var results = {};
  // Initialize map types we care about
  var mapTypes = ['Simple', 'Normal', 'Complex', 'Ultra Complex', 'Teleport Madness',
                  'Thirty', 'Thirty Too', 'Reverse Order', 'Finite', 'Rocky Maze',
                  'Ultimate Random', 'Centralized', 'Seeing Double', 'Side to Side',
                  'Unlimited', "ABC's ", 'Dualing paths'];
  var mapTypes = ['Simple', 'Normal',];

  mapTypes.forEach(function(type) {
    var t = {};
    t.total = 0;
    // t.cpDist = [0, 0, 0, 0, 0, 0];
    t.cpDist = new Distribution();
    t.rockDist = new Distribution();
    t.wallDist = new Distribution();
    // t.rockDists = [];
    // t.wallDists = [];
    // for (var i = 0; i <= 5; i++) {
    //   t.rockDists[i] = new Distribution();
    //   t.wallDists[i] = new Distribution();
    // }
    tileTypes.forEach(function(tile) {
      t[tile] = 0;
    });
    results[type] = t;
  });

  codes.forEach(function(line) {
    if (line.length == 0) {
      return;
    }
    var result = mapCodeInfo(line);
    collectResult(results, result);
  });

  console.log(results);

  var simples = results['Simple'];


  // mapTypes.forEach(function(mapType) {
  //   var count = results[mapType].total;
  //   console.log(mapType + " " + count);
  // });
}

if (require.main === module) {
  main();
}
