var util = require('./map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('./tile_types');

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
DenseMap.prototype.ind2sub = function(idx) {
  return [idx%this.m, idx/this.m >> 0];
}
DenseMap.prototype.get = function(i, j) {
  return this.tiles[this.sub2ind(i,j)];
}
DenseMap.prototype.setSingle = function(v, i, j) {
  this.tiles[this.sub2ind(i,j)] = v;
}
DenseMap.prototype.set = function(v, I, J) {
  if (typeof I !== 'object') { I = [I]; }
  if (typeof J !== 'object') { J = [J]; }
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
//Return array of places that we added to. (Each place is a len2 array)
DenseMap.prototype.placeRandomly = function(val, numTimes) {
  if (numTimes == undefined) {
    numTimes = 1;
  }
  var places = [];

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
      places.push(this.ind2sub(idx));
    }
  }

  //rejection sampling failed
  if (numTimes != 0) {
    throw new Error("placeRandomly: rejection sampling failed too many times");
  }

  return places;
}

//Randomly place the nonempty value given, somewhere in the region defined by IxJ.
//Do this numTimes (default 1)
//Return array of places that we added to. (Each place is a len2 array)
DenseMap.prototype.placeRandomlyInArea = function(val, I, J, numTimes) {
  if (numTimes == undefined) {
    numTimes = 1;
  }
  if (val == ' ') {
    throw new Error("placeRandomly: expected nonempty tile type");
  }
  var places = [];
  if (typeof I !== 'object') {
    I = [I];
  }
  if (typeof J !== 'object') {
    J = [J];
  }

  //TODO: make sure the rejection sampling terminates
  var tries = 0;
  while (numTimes > 0 && tries < 100) {
    var idxI = I[getRandomInt(0, I.length-1)];
    var idxJ = J[getRandomInt(0, J.length-1)];
    var idx = this.sub2ind(idxI, idxJ);
    if (this.tiles[idx] !== ' ') {
      tries++;
    } else {
      this.tiles[idx] = val;
      numTimes--;
      tries = 0;
      places.push(this.ind2sub(idx));
    }
  }

  //rejection sampling failed
  if (numTimes != 0) {
    throw new Error("placeRandomlyInArea: rejection sampling failed too many times");
  }

  return places;
}

// Randomly place the nonempty value given, the number of times requested.
// Takes a condition function. condition takes (map, i, j)
// and returns true if it should be added
DenseMap.prototype.placeRandomlyCondition = function(val, condition, numTimes) {
  if (numTimes == undefined) {
    numTimes = 1;
  }

  if (val == ' ') {
    throw new Error("placeRandomly: expected nonempty tile type");
  }
  var places = [];

  var tries = 0;
  while (numTimes > 0 && tries < 100) {
    var idx = getRandomInt(0, this.tiles.length - 1);
    var sub = this.ind2sub(idx);
    if (this.tiles[idx] !== ' ' || !condition(this, sub[0], sub[1])) {
      tries++;
    } else {
      this.tiles[idx] = val;
      numTimes--;
      tries = 0;
      places.push(this.ind2sub(idx));
    }
  }
  return places;
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


DenseMap.prototype.toBoard = function() {
  var board = [];
  for (var i = 0; i < this.n; i++)  {
    var row = [];
    for (var j = 0; j < this.m; j++)  {
      row.push(this.tiles[this.sub2ind(j,i)]);
    }
    board.push(row);
  }
  return board;
}

//Mapcodes on the forum need to be formatted with line breaks.
DenseMap.prototype.forumMapCode = function(linewidth) {
  var mc = this.toMapCode();
  if (linewidth == undefined) {
    linewidth = 60;
  }

  var lines = [];
  var idx = 0;
  var lastIdx = -1;
  var lastLineIdx = -1;
  var line;
  while (true) {
    idx = mc.indexOf('.', lastIdx + 1);
    if (idx - lastLineIdx > linewidth) {
      //make new line
      line = mc.substr(lastLineIdx + 1, idx - lastLineIdx);
      lines.push(line);
      lastLineIdx = idx;
    }
    lastIdx = idx;

    if (idx == -1) {
      line = mc.substr(lastLineIdx + 1);
      lines.push(line);
      break;
    }
  }
  return lines.join('\n');
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

DenseMap.prototype.toDumbTiles = function() {
  return this.tiles.map(function(x) {
    var ans = [];
    for (var i = 0; i < x.length; i++) {
      ans.push(dumb_tile_map[x[i]]);
    }
    return ans;
  })
}

var dumb_tile_map = {
    ' ': 'o '
  , 'r': 'r '

// TODO: is this right?
  , 'R': 'r '
// TODO: is this right?
  , 'q': 'r '

  , 'p': 'p '

// TODO: is this right?
  , 'X': 'x1'
  , 'x': 'x2'

  , 's': 's '
// TODO: is this right?
  , 'S': 's '

  , 'f': 'f '

  , 'a': 'c1'
  , 'b': 'c2'
  , 'c': 'c3'
  , 'd': 'c4'
  , 'e': 'c5'

  , 't': 't1'
  , 'u': 'u1'

  , 'm': 't2'
  , 'n': 'u2'

  , 'g': 't3'
  , 'h': 'u3'

  , 'i': 't4'
  , 'j': 'u4'

  , 'k': 't5'
  , 'l': 'u5'
}

