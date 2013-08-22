(function(exports) {

teleports_map = {
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  //'6': '^',
  //'7': '&',
  //'8': '*',
  //'9': '(',
  //'0': ')',
}

TYPE_MAP = {
    // CHECKPOINTS
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D',
    'e': 'E',

    // start
    's': 's',
    'S': 'S', // red start
    // finish
    'f': 't',

    // block
    'r': 'X',
    'x': 'r', // colored red, blocks green
    'X': 'g', // colored green, blocks red
    'p': 'p', // PATCH.  Can't block here!
    'q': 'X', // empty space, used in seeing double.  Same as regular block?

    // TELEPORTS
    // dark blue
    't': '1',
    'u': '!',
    // green
    'm': '2',
    'n': '@',
    // red
    'g': '3',
    'h': '#',
    // light blue
    'i': '4',
    'j': '$',
    // light green
    'k': '5',
    'l': '%',
}


function parse_board(code) {
    var head = code.split(':')[0];
    var body = code.split(':')[1];

    var head = head.split('.');
    var dims = head[0].split('x');
    var width = parseInt(dims[0]);
    var height = parseInt(dims[1]);
    if (head[1][0] != 'c') {console.log('head[1][0] was ' + head[1][0] + ' expected c');}
    var targets = parseInt(head[1].slice(1));
    if (head[2][0] != 'r') {console.log('head[2][0] was ' + head[2][0] + ' expected r');}
    if (head[3][0] != 'w') {console.log('head[3][0] was ' + head[3][0] + ' expected w');}
    if (head[4][0] != 't') {console.log('head[4][0] was ' + head[4][0] + ' expected t');}

    var teleports = parseInt(head[4].slice(1))

    var data = new Array();
    for (i = 0; i < height; i++) {
        var row = new Array();
        for (j = 0; j < width; j++) {
            row[j] = ' ';
        }
        data[i] = row;
    }

    var i = -1;
    var j = width - 1;
    var body_split = body.split('.').slice(0, -1);

    for (var k = 0; k < body_split.length; k++) {
        var item = body_split[k];
        for (var l = 0; l < parseInt(item.slice(0, -1)) + 1; l++) {
            j += 1;
            if (j >= width) {
                j = 0;
                i += 1;
            }
        }
        var type = item[item.length - 1];
        if (!TYPE_MAP.hasOwnProperty(type)) {console.log('Unexpected type ' + type);}
        data[i][j] = TYPE_MAP[type];
    }

    //var board = [];
    //for (var i in data) {
    //  board.push(data[i].join(''));
    //}
    //return board

    return data;
}


function PatheryGraph(board) {

  this.board = board; // i,j -> val
  this.n = board.length;
  this.m = board[0].length;

  this.serial_board = []; // same as board, but uses keyified index
  this.boardstuff = {}; // reverse of serial board.  val -> list of keyified blocks

  // Note that these lists start from top-left and go right, then down
  // In particular, starts and finishes are ordered top to bottom
  // Also when there are multiple outs for teleports, same ordering is used
  for (var i = 0; i < this.n; i++) {
    for (var j = 0; j < this.m; j++) {
      var stuff = this.board[i][j];
      var key = this.keyify_coordinates(i,j);
      this.serial_board.push(stuff);
      if (stuff != ' ') {
        if (this.boardstuff.hasOwnProperty(stuff)) {
          this.boardstuff[stuff].push(key);
        } else {
          this.boardstuff[stuff] = [key]
        }
      }
    }
  }

  this.starts = this.boardstuff['s']; // list of keyified starts
  this.has_regular = (this.starts !== undefined);

  this.alt_starts = this.boardstuff['S']; // list of keyified alt-starts
  this.has_reverse = (this.alt_starts !== undefined);

  this.checkpoints = []; // list of lists of intermediate targets, including starts and ends, all keyified

  var letters = ['A', 'B', 'C', 'D', 'E'];
  for (var i = 0; i < 5; i++) {
    var letter = letters[i];
    if (!(this.boardstuff.hasOwnProperty(letter))) {
      break;
    }
    this.checkpoints.push(this.boardstuff[letter]);
  }

  this.finishes = this.boardstuff['t']; // list of keyified finishes

  this.teleports = {};
  for (teleport_key in teleports_map) {
    // TODO: NOT TRUE IN GENERAL!!!
    var teleport_ins = this.boardstuff[teleport_key];
    if (! teleport_ins) {continue;}
    var teleport_outs = this.boardstuff[teleports_map[teleport_key]];

    for (var i = 0; i < teleport_ins.length; i++) {
      this.teleports[teleport_ins[i]] = teleport_outs;
    }
  }

  // NOTE: Order is important.  DETERMINES MOVE PRIORITIES
  this.moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  // Preprocess neighbors
  // Index is the keyified block
  this.neighbors = [];
  var neighbors_list;
  var xp;
  var yp;
  for (var x = 0; x < this.n; x++) {
    for (var y = 0; y < this.m; y++) {
      neighbors_list = [];
      for (var i = 0; i < this.moves.length; i++) {
        xp = x + this.moves[i][0];
        yp = y + this.moves[i][1];

        // fill edge with 'X' so we don't need this check?
        if (((0 <= xp) && (xp < this.n)) && ((0 <= yp) && (yp < this.m))) {
          val = this.board[xp][yp];
          if (val == 'X') {continue;}
          if (val == 'x') {continue;}
          if (val == '*') {continue;}
          neighbors_list.push(this.keyify_coordinates(xp, yp));
        }
      }
      this.neighbors.push(neighbors_list);
    }
  }

}

PatheryGraph.prototype.keyify_coordinates = function(x, y) {
  return x * this.m + y;
}

PatheryGraph.prototype.keyify = function(block) {
  return this.keyify_coordinates(block[0] , block[1]);
}

PatheryGraph.prototype.unkeyify = function(blockkey) {
  return [Math.floor(blockkey / this.m), blockkey % this.m];
}

PatheryGraph.prototype.parse_blocks = function(blocksstring) {
  var blocks = {};
  var str_blocks = blocksstring.split('.');
  for (var k in str_blocks) {
    var str_block = str_blocks[k];
    if (str_blocks[k]) {
      var x = parseInt(str_block.split(',')[0]);
      var y = parseInt(str_block.split(',')[1]);
      blocks[this.keyify_coordinates(x-1 , y)] = true;
    }
  }
  return blocks;
}

PatheryGraph.prototype.teleport = function(block, used_teleports) {
  var stuff = this.serial_board[block];
  if ( teleports_map[stuff] ) {
    if (!(used_teleports[stuff])) {
      used_teleports[stuff] = true;
      return this.teleports[block]
    }
  }
  return null;
}


// var BFS_queue = new Int32Array(graph.m * graph.n); // new Array(...)
var BFS_queue = new Int32Array(1000); // new Array(...)

PatheryGraph.prototype.find_path = function(
             blocks, // currently placed blocks
             extra_block, // unpassable square (used for green or red only)
             sources, // list of source vertices, in order of priority
             targets // set of target vertices
            ) {
  parent_map = []; // keyified index ->  parent key (or -1 if was source, and undefined if not yet reached)
  var queue = BFS_queue;
  var queue_start = 0,
      queue_end = 0;

  for (var k in sources) {
    var source = sources[k];
    queue[queue_end++] = source;
    parent_map[source] = -1;
  }

  while (queue_start != queue_end) {
    var u = queue[queue_start++];

    var neighbors = this.neighbors[u];
    for (var i = 0; i < neighbors.length; i++) {
      var v = neighbors[i];

      // already found this square
      if (parent_map.hasOwnProperty(v)) { continue;}

      if (blocks[v]) {continue;}

      // impassable square
      if (this.serial_board[v] === extra_block) {continue;}

      parent_map[v] = u;

      // found target!
      if (targets[v]) {
        var path = [];
        while (v !== -1) {
          path.push(v);
          v = parent_map[v];
        }
        return path.reverse();
      }

      // add to queue
      queue[queue_end++] = v;
    }
  }
  return null;
}

// TODO: FIND BLOCKS WHERE I CAN'T PLACE BLOCKS WITHOUT BLOCKING THE PATH
// BE VERY CAREFUL.  BECAUSE OF TELEPORTS... THIS IS TRICKY AND I DONT YET KNOW HOW TO DO IT
PatheryGraph.prototype.find_bridges = function(
             blocks, // currently placed blocks
             extra_block, // unpassable square (used for green or red only)
             sources, // list of source vertices, in order of priority
             targets // set of target vertices
            ) {

}

function find_full_path(graph, blocks, reversed){
  var used_teleports = {};
  var index = 0;
  var fullpath = [];
  var cur; // current list of start points
  var extra_block;
  if (reversed) {     // red path
    cur = graph.alt_starts;
    extra_block = 'g';
  } else {            // green path
    cur = graph.starts;
    extra_block = 'r';
  }
  var num_teleports_used = 0;
  // TODO: REMOVE BRIDGES FROM RELEVANT BLOCKS (i.e. take care of all those - values in one sweep)
  var relevant_blocks = {}; // The set of blocks which blocking may help

  while (index < graph.checkpoints.length  + 1) {
    var target_dict = {}
    if (index == graph.checkpoints.length) {
      var targets = graph.finishes;
    } else if (reversed)  {
      var targets = graph.checkpoints[graph.checkpoints.length - 1 - index];
    } else {
      var targets = graph.checkpoints[index];
    }
    for (var i in targets) {
      var target = targets[i];
      target_dict[target] = true;
    }
    var path = graph.find_path(blocks, extra_block, cur, target_dict);
    if (path == null) {
      return {path: null, value: NaN, relevant_blocks: {}};
    }
    var out_blocks = null;

    var block;
    // blocking these could affect things
    for (var k in path) {
      block = path[k];
      relevant_blocks[block] = true;
    }

    // push things onto actual path, until we hit a teleport
    for (var k in path) {
      block = path[k];
      out_blocks = graph.teleport(block, used_teleports);
      if (out_blocks != null) {
        fullpath.push(block);
        num_teleports_used += 1;
        cur = out_blocks;
        break;
      }
      // if no teleport, and last block of not last leg, skip (to avoid overcount)
      if ((k < path.length - 1) || (index == graph.checkpoints.length)) {
        fullpath.push(block);
      }
    }
    if (out_blocks == null) {
      index += 1;
      cur = [block];
    }
  }

  var solution_length = fullpath.length - 1 - num_teleports_used;
  return {
    path: fullpath,
    value: solution_length,
    relevant_blocks: relevant_blocks
  };
}

function find_pathery_path(graph, blocks){
  var relevant_blocks = {};
  var paths = [];
  var values = [];

  if (graph.has_regular) {
    solution_green = find_full_path(graph, blocks);
    paths.push(solution_green.path);
    values.push(solution_green.value);
    for (var block in solution_green.relevant_blocks) {relevant_blocks[block] = true;}
  }

  if (graph.has_reverse) {
    solution_red = find_full_path(graph, blocks, true);
    paths.push(solution_red.path);
    values.push(solution_red.value);
    for (var block in solution_red.relevant_blocks) {relevant_blocks[block] = true;}
  }
  return {paths: paths,
          values: values,
          relevant_blocks: relevant_blocks};
}


exports.compute_value = function(mapcode, solution, cb) {
    bm_board= parse_board(mapcode);
    bm_graph = new PatheryGraph(bm_board);

    bm_current_blocks = bm_graph.parse_blocks(solution);
    bm_solution = find_pathery_path(bm_graph, bm_current_blocks);

    if (cb) {cb(bm_solution.values)}
    return bm_solution.values;
}

function sum_values(array) {
  return array.reduce(function(x, y) {return x + y})
}

// OPTIONS:
// break_immediate:  break as soon as something better is found
// randomize:        break ties by randomizing
function improve_solution(graph, blocks, options) {
  var solution = find_pathery_path(graph, blocks);

  var best_val = sum_values(solution.values);
  var best_remove_block = null;
  var best_add_block = null;
  var num_tied = 1;
  var val;

  for (var remove_block in blocks) {
    delete blocks[remove_block];

    solution = find_pathery_path(graph, blocks);
    var relevant_blocks = solution.relevant_blocks;

    for (var add_block in relevant_blocks) {
      blocks[add_block] = true;
      solution = find_pathery_path(graph, blocks);
      val = sum_values(solution.values);
      if (val > best_val) {
        num_tied = 1;
        if (options.break_immediate) {
          return {remove_block: remove_block, add_block: add_block}
        } else {
          best_remove_block = remove_block; best_add_block = add_block; best_val = val;
        }
      } else if (val == best_val) {
        num_tied += 1;
        if (options.randomize) {
          if (Math.random() * num_tied < 1) {
            best_remove_block = remove_block; best_add_block = add_block; best_val = val;
          }
        }
      }

      delete blocks[add_block];
    }

    blocks[remove_block] = true;
  }
  return null;
}

exports.compute_values = function(mapcode, solution, cb) {
    bm_board= parse_board(mapcode);
    bm_graph = new PatheryGraph(bm_board);

    bm_current_blocks = bm_graph.parse_blocks(solution);
    var bm_solution = find_pathery_path(bm_graph, bm_current_blocks);

    var bm_solution_path = bm_solution.paths;
    var bm_solution_value = sum_values(bm_solution.values);
    var bm_relevant_blocks = bm_solution.relevant_blocks;

    var find_pathery_path_count = 0;

    var values_list = [];
    for (var i = 0; i < bm_graph.n; i ++) {
        for (var j = 0; j < bm_graph.m; j++) {
            var block = bm_graph.keyify_coordinates(i, j);
            if (bm_graph.serial_board[block] == ' ') {
                var value;
                var diff;
                var blocking;
                if (block in bm_current_blocks) {
                    blocking = true;
                    if (isNaN(bm_solution_value)) {
                      diff = '-';
                    } else {
                      delete bm_current_blocks[block];
                      value = sum_values(find_pathery_path(bm_graph, bm_current_blocks).values);
                      find_pathery_path_count++;
                      diff = bm_solution_value - value;
                      bm_current_blocks[block] = true;
                    }
                } else if (block in bm_relevant_blocks) {
                    blocking = false;
                    if (isNaN(bm_solution_value)) {
                      diff = '';
                    } else {
                      bm_current_blocks[block] = true;
                      value = sum_values(find_pathery_path(bm_graph, bm_current_blocks).values);
                      find_pathery_path_count++;
                      diff = value - bm_solution_value;
                      if (isNaN(diff)) {diff = '-';}
                      delete bm_current_blocks[block];

                      if (Math.abs(diff) > 2222222222) {diff = '-';}
                      else if (diff == 0) {diff = '';}
                    }
                } else {
                    diff = '';
                    blocking = false;
                }
                values_list.push({i: i, j: j, val: diff, blocking: blocking});
            }
        }
    }
    var retval = {value: bm_solution_value, values_list: values_list, find_pathery_path_count: find_pathery_path_count};
    if (cb) {cb(retval);}
    return retval;
}

})(typeof exports === "undefined" ? (window.PatherySolver={}, window.PatherySolver) : module.exports)
