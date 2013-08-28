//integer range, exclusive
function range(a, b, step) {
  if (step <= 0) {
    throw new Error("range: i'm too lazy to make a negative range");
  }
  if (step == undefined) {
    step = 1;
  }
  if (b < a) {
    throw new Error("range: must have b >= a");
  }
  var result = [];
  var val = a;
  while (val < b) {
    result.push(val);
    val += step;
  }
  return result;
}

//integer range, inclusive
function rangeInclusive(a, b, step) {
  if (step <= 0) {
    throw new Error("range: i'm too lazy to make a negative range");
  }
  if (step == undefined) {
    step = 1;
  }
  if (b < a) {
    throw new Error("range: must have b >= a");
  }
  var result = [];
  var val = a;
  while (val <= b) {
    result.push(val);
    val += step;
  }
  return result;
}

//Dense Representation of a map.
//Takes tiles, an array of values of the tiles,
//number of walls,
//and given dimensions. (m = width, n = height)
function DenseMap(m, n, walls, name, tiles) {
  this.m = m;
  this.n = n;
  if (walls == undefined) {
    walls = 0;
  }
  this.walls = walls;
  if (name == undefined) {
    name = '';
  }
  this.myName = name;
  if (tiles == undefined) {
    tiles = [];
    for (var i = 0; i < m *n; i++) {
      tiles[i] = ' ';
    }
  }
  this.tiles = tiles;
}

//Indexing.
//i,j -> col i, row j (0-indexed)
DenseMap.prototype.sub2ind = function(i, j) {
  return j*(this.m) + i;
}
DenseMap.prototype.get = function(i, j) {
  return this.tiles[this.sub2ind(i,j)];
}
DenseMap.prototype.setSingle = function(v, i, j) {
  this.tiles[this.sub2ind(i,j)] = v;
}
DenseMap.prototype.set = function(v, I, J) {
  if (typeof I !== 'object') {
    I = [I];
  }
  if (typeof J !== 'object') {
    J = [J];
  }
  for (var a = 0; a < I.length; a++) {
    for (var b = 0; b < J.length; b++) {
      this.setSingle(v, I[a], J[b]);
    }
  }
}
DenseMap.prototype.repr = function() {
  var result = this.myName + ': ' + this.walls + ' walls\n';
  for (var j = 0; j < this.n; j++) {
    var rowArr = this.tiles.slice(j*(this.m), (j+1)*(this.m));
    var rowStr = rowArr.join('');
    result += rowStr + '\n';
  }
  return result;
}
//Randomly place the nonempty value given.
//Do this numTimes (default 1) 
DenseMap.prototype.placeRandomly = function(val, numTimes) {
  if (numTimes == undefined) {
    numTimes = 1;
  }

  if (val == ' ') {
    throw new Error("placeRandomly: expected nonempty tile type");
  }

  //TODO: make sure the rejection sampling terminates
  var tries = 0;
  while (numTimes > 0 && tries < 100) {
    var idx = getRandomInt(0, this.tiles.length - 1);
    if (this.tiles[idx] !== ' ') {
      tries++;
    } else {
      this.tiles[idx] = val;
      numTimes--;
      tries = 0;
    }
  }

  //rejection sampling failed
  if (numTimes != 0) {
    throw new Error("placeRandomly: rejection sampling failed too many times");
  }
}

DenseMap.prototype.toMapCode = function() {
  //create header
  var headerContents = [];
  headerContents[0] = this.m + 'x' + this.n;
  //not sure what this one does
  headerContents[1] = 'c0';
  //count number of rocks
  headerContents[2] = 'r0';
  //number of walls given
  headerContents[3] = 'w' + this.walls;
  //count number of teleporters?
  headerContents[4] = 't0';
  //title
  headerContents[5] = this.myName;
  //nothing AFAIK
  headerContents[6] = '';
  var header = headerContents.join('.');

  //create body
  var bodyTiles = [];
  var lastIdx = -1;
  var i = 0;
  while (i < this.tiles.length) {
    var val = this.tiles[i];
    if (val !== ' ') {
      var diff = i - lastIdx - 1;
      bodyTiles.push(diff + val);
      lastIdx = i;
    }
    i++;
  }
  bodyTiles.push('');
  var body = bodyTiles.join('.');
  return header + ':' + body;
}

//blow everything up, k by k
DenseMap.prototype.dilate = function(k) {
  //make sure k is a positive integer
  if (k < 0 || k !== k >> 0) {
    throw new Error('dilate: expected positive integer argument');
  }
  var newWalls = k * this.walls;
  var newM = k * this.m;
  var newN = k * this.n;
  var newName = this.myName + ' x' + k;

  var newMap = new DenseMap(newM, newN, newWalls, newName);
  for (var i = 0; i < this.m; i++) {
    for (var j = 0; j < this.n; j++) {
      var val = this.get(i, j);
      if (val !== ' ') {
        var Is = range(k*i, k*i + k);
        var Js = range(k*j, k*j + k);
        newMap.set(val, Is, Js);
      }      
    }
  }

  return newMap;
}

function parseMapCode(mapcode) {
  var head = mapcode.split(':')[0];
  var body = mapcode.split(':')[1];

  var head = head.split('.');
  var dims = head[0].split('x');
  var m = parseInt(dims[0]);
  var n = parseInt(dims[1]);
  if (head[1][0] != 'c') {console.log('head[1][0] was ' + head[1][0] + ' expected c');}
  //var targets = parseInt(head[1].slice(1));
  if (head[2][0] != 'r') {console.log('head[2][0] was ' + head[2][0] + ' expected r');}
  if (head[3][0] != 'w') {console.log('head[3][0] was ' + head[3][0] + ' expected w');}
  var walls = parseInt(head[3].slice(1));
  if (head[4][0] != 't') {console.log('head[4][0] was ' + head[4][0] + ' expected t');}
  var name = head[5];

  var tiles = [];
  for (var i = 0; i < m*n; i++) {
    tiles[i] = ' '; //empty space
  }

  var currIdx = -1;
  var body_split = body.split('.').slice(0, -1);
  for (var k = 0; k < body_split.length; k++) {
    var item = body_split[k];
    currIdx++;
    currIdx += parseInt(item.slice(0,-1));
    var type = item[item.length - 1];
    tiles[currIdx] = type;
  }

  return new DenseMap(m, n, walls, name, tiles);
}

exports.DenseMap = DenseMap;
exports.parseMapCode = parseMapCode;

ROCK_1             = 'r';
ROCK               = ROCK_1;
ROCK2              = 'R';
ROCK3              = 'q';
EMPTY              = ROCK3  // used in seeing double, same as rock?
PATCH              = 'p';  // can't place blocks, but path can pass

GREEN_THROUGH_ONLY = 'x';  // colored green, blocks red
RED_THROUGH_ONLY   = 'X';  // colored red, blocks green

GREEN_START        = 's';
RED_START          = 'S';

FINISH             = 'f';

CHECKPOINT_1       = 'a';
CHECKPOINT_2       = 'b';
CHECKPOINT_3       = 'c';
CHECKPOINT_4       = 'd';
CHECKPOINT_5       = 'e';
CHECKPOINTS        = [CHECKPOINT_1, CHECKPOINT_2, CHECKPOINT_3, CHECKPOINT_4, CHECKPOINT_5];

// dark blue
TELE_IN_1          = 't';
TELE_OUT_1         = 'u';
// green
TELE_IN_2          = 'm';
TELE_OUT_2         = 'n';
// red
TELE_IN_3          = 'g';
TELE_OUT_3         = 'h';
// light blue
TELE_IN_4          = 'i';
TELE_OUT_4         = 'j';
// light green
TELE_IN_5          = 'k';
TELE_OUT_5         = 'l';

TELE_INS           = [TELE_IN_1, TELE_IN_2, TELE_IN_3, TELE_IN_4, TELE_IN_5];
TELE_OUTS          = [TELE_OUT_1, TELE_OUT_2, TELE_OUT_3, TELE_OUT_4, TELE_OUT_5];

//between min/max, inclusive
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBombsAway() {
  var m = 19, n = 19;  
  var map = new DenseMap(m, n, 0, 'Bombs Away');
  var Is = range(1, m, 2);
  var Js = range(1, n, 2);
  map.set(ROCK, Is, Js);

  map.placeRandomly(GREEN_START);
  map.placeRandomly(FINISH);
  //Tune some parameters
  map.walls = 20;
  var numExtraRocks = getRandomInt(6,8);
  map.placeRandomly(ROCK2, numExtraRocks);
  var numCheckpoints = getRandomInt(3,4);
  var numTeleports = getRandomInt(2,3);
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(TELE_INS[i]);
    map.placeRandomly(TELE_OUTS[i]);
  }

  return map;
}
exports.randomBombsAway = randomBombsAway;

function randomLayover() {
  var m = 19, n = 13;
  var map = new DenseMap(m, n, 0, 'Layover');
  map.set(ROCK, [8, 10], [0, 1, 2, 3]);

  map.set(CHECKPOINT_1, 9, 0);
  map.set(TELE_IN_1, 9, 1);
  map.set(TELE_IN_2, 9, 2);
  map.set(TELE_IN_3, 9, 3);
  map.set(TELE_IN_4, 9, 4);

  for (var j = 0; j < n; j++) {
    map.set(GREEN_START, 0, j);
    map.set(FINISH, m-1, j);
  }

  //Tune some parameters
  map.walls = 15;
  var numExtraRocks = getRandomInt(15,19);
  map.placeRandomly(ROCK, numExtraRocks);
  for (var i = 0; i < 4; i++) {
    map.placeRandomly(TELE_OUTS[i]);
  }
  return map;
}
exports.randomLayover = randomLayover;

function randomEdgeCase() {
  var m = 20, n = 20;
  var map = new DenseMap(m, n, 0, 'Edge Case');

  var Is = range(6, m - 6);
  var Js = range(6, n - 6);
  map.set(EMPTY, Is, Js);

  //Tune some parameters
  map.walls = 22;
  var numExtraRocks = getRandomInt(17, 23);
  map.placeRandomly(ROCK, numExtraRocks);
  var numCheckpoints = 2;
  var numTeleports = 3;
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(TELE_INS[i]);
    map.placeRandomly(TELE_OUTS[i]);
  }
  map.placeRandomly(GREEN_START);
  map.placeRandomly(FINISH);

  return map;
}
exports.randomEdgeCase = randomEdgeCase;

var main = function() {
  var fs = require('fs');
  
  var map = randomLayover();
  var map = randomBombsAway();
  var map = randomEdgeCase();
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

