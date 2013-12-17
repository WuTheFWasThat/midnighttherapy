////////////////////////////////////////////////////////////
// ANALYST
////////////////////////////////////////////////////////////

// The analyst does all the heavy computation.  It can be in the client, but it is recommended that you run it through the server.

(function(exports) {

ROCK_1             = 'r';
ROCK_2             = 'R';  // never used?
ROCK_3             = 'q';  // used in seeing double, same as rock?

PATCH              = 'p';  // can't place blocks, but path can pass

GREEN_THROUGH_ONLY = 'X';  // colored green, blocks red
RED_THROUGH_ONLY   = 'x';  // colored red, blocks green

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

teleports_map = {};
teleports_map[TELE_IN_1] = TELE_OUT_1;
teleports_map[TELE_IN_2] = TELE_OUT_2;
teleports_map[TELE_IN_3] = TELE_OUT_3;
teleports_map[TELE_IN_4] = TELE_OUT_4;
teleports_map[TELE_IN_5] = TELE_OUT_5;

PATH_BLOCKED_CONSTANT = NaN; // TODO: use this

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

  this.green_starts = this.boardstuff[GREEN_START]; // list of keyified starts
  this.has_regular = (this.green_starts !== undefined);

  this.red_starts = this.boardstuff[RED_START]; // list of keyified alt-starts
  this.has_reverse = (this.red_starts !== undefined);

  this.checkpoints = []; // list of lists of intermediate targets, including starts and ends, all keyified

  var checkpoint_types = [CHECKPOINT_1, CHECKPOINT_2, CHECKPOINT_3, CHECKPOINT_4, CHECKPOINT_5];
  for (var i = 0; i < 5; i++) {
    var checkpoint_type = checkpoint_types[i];
    if (!(this.boardstuff.hasOwnProperty(checkpoint_type))) {
      break;
    }
    this.checkpoints.push(this.boardstuff[checkpoint_type]);
  }

  this.finishes = this.boardstuff[FINISH]; // list of keyified finishes

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

        // fill edge with rocks so we don't need this check?
        if (((0 <= xp) && (xp < this.n)) && ((0 <= yp) && (yp < this.m))) {
          val = this.board[xp][yp];
          if (val == ROCK_1) {continue;}
          if (val == ROCK_2) {continue;}
          if (val == ROCK_3) {continue;}
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

PatheryGraph.prototype.snapify = function(keyed) {
  var unkeyed = this.unkeyify(keyed);
  return [unkeyed[1], unkeyed[0] + 1];
}

PatheryGraph.prototype.path_dir = function(oldkey, newkey) {
  var diff = newkey - oldkey;
  switch(diff) {
    case -this.m:
      return '1'; // up
    case 1:
      return '2'; // right
    case this.m:
      return '3'; // down
    case -1:
      return '4'; // left
    default:
      throw new Error("unexpected value in pathing");
  }
}

PatheryGraph.prototype.dictify_blocks = function(blocks_list) {
  var blocks_dict = {};
  for (var i =0; i < blocks_list.length; i++) {
    blocks_dict[this.keyify(blocks_list[i])] = true;
  }
  return blocks_dict;
}

PatheryGraph.prototype.listify_blocks = function(blocks_dict) {
  var blocks_list = [];
  for (var block in blocks_dict) {
    blocks_list.push(this.unkeyify(block));
  }
  return blocks_list;
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
var find_path_ret_val = new Int32Array(2500);

// Returns: Object with fields
// path: (typed) array of block keys in path
// numel: the number of elements this path should be taken up to.
// Note: the elements should be accessed backwards, from numel-1 to 0.
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
        var path = find_path_ret_val;
        var idx = 0;
        while (v !== -1) {
          path[idx++] = v;
          v = parent_map[v];
        }
        return {'path': path, 'numel': idx};
      }

      // add to queue
      queue[queue_end++] = v;
    }
  }
  return null;
}

function find_full_path(graph, blocks, reversed){
  var used_teleports = {};
  var index = 0;
  var fullpath = [];
  var cur; // current list of start points
  var extra_block;
  if (reversed) {     // red path
    cur = graph.red_starts;
    extra_block = GREEN_THROUGH_ONLY;
  } else {            // green path
    cur = graph.green_starts;
    extra_block = RED_THROUGH_ONLY;
  }
  var num_teleports_used = 0;

  // TODO: REMOVE BRIDGES FROM RELEVANT BLOCKS (i.e. take care of all those - values in one sweep)
  // http://www.geeksforgeeks.org/bridge-in-a-graph/
  // http://en.wikipedia.org/wiki/Bridge_(graph_theory)#Tarjan.27s_Bridge-finding_algorithm

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
    var pathObj = graph.find_path(blocks, extra_block, cur, target_dict);
    if (pathObj == null) {
      return {path: null, value: PATH_BLOCKED_CONSTANT, relevant_blocks: {}};
    }
    var out_blocks = null;

    var block;
    // blocking these could affect things
    var path_len = pathObj.numel;
    var path = pathObj.path;
    for (var k = path_len - 1; k >= 0; k--) {
      block = path[k];
      relevant_blocks[block] = true;
    }

    // push things onto actual path, until we hit a teleport
    for (var k = path_len - 1; k >= 0; k--) {
      block = path[k];
      out_blocks = graph.teleport(block, used_teleports);
      if (out_blocks != null) {
        fullpath.push(block);
        num_teleports_used += 1;
        cur = out_blocks;
        break;
      }
      // if no teleport, and last block of not last leg, skip (to avoid overcount)
      if ((k > 0) || (index == graph.checkpoints.length)) {
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
          value: sum_values(values),
          relevant_blocks: relevant_blocks};
}


function compute_solution(board, cur_blocks, cb) {
    if (cur_blocks === undefined) {cur_blocks = []}
    var graph = new PatheryGraph(board);

    var current_blocks = graph.dictify_blocks(cur_blocks);
    var solution = find_pathery_path(graph, current_blocks);

    if (cb) {cb(solution)}
    return solution;
}
exports.compute_solution= compute_solution;

function compute_value(board, cur_blocks, cb) {
    var solution = compute_solution(board, cur_blocks, function(solution) {
      if (cb) {cb(solution.values);}
    });
    return solution.values;
}
exports.compute_value = compute_value;

function sum_values(array) {
  if (array.length == 0) {return PATH_BLOCKED_CONSTANT;}
  return array.reduce(function(x, y) {return x + y})
}
exports.sum_values = sum_values;

function stringify_block(block) {
  return block[0] + ',' + block[1];
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

function compute_values(board, cur_blocks, cb) {
    if (cur_blocks === undefined) {cur_blocks = []}
    var graph = new PatheryGraph(board);

    var current_blocks = graph.dictify_blocks(cur_blocks);
    var solution = find_pathery_path(graph, current_blocks);

    var solution_path = solution.paths;
    var solution_value = solution.value;
    var relevant_blocks = solution.relevant_blocks;

    var find_pathery_path_count = 0;

    var values_list = [];
    var value; var diff; var blocking;

    for (var i = 0; i < graph.n; i ++) {
        for (var j = 0; j < graph.m; j++) {
            var block = graph.keyify_coordinates(i, j);
            if (graph.serial_board[block] == ' ') {
                if (block in current_blocks) {
                    blocking = true;
                    if (isNaN(solution_value)) {
                      diff = '-';
                    } else {
                      delete current_blocks[block];
                      value = find_pathery_path(graph, current_blocks).value;
                      find_pathery_path_count++;
                      diff = solution_value - value;
                      current_blocks[block] = true;
                    }
                } else if (block in relevant_blocks) {
                    blocking = false;
                    if (isNaN(solution_value)) {
                      diff = '';
                    } else {
                      current_blocks[block] = true;
                      value = find_pathery_path(graph, current_blocks).value;
                      find_pathery_path_count++;
                      diff = value - solution_value;
                      if (isNaN(diff)) {diff = '-';}
                      delete current_blocks[block];

                      if (Math.abs(diff) > 2222222222) {diff = '-';} // TODO : make less hackish
                    }
                } else {
                    diff = '';
                    blocking = false;
                }
                values_list.push({i: i, j: j, val: diff, blocking: blocking});
            }
        }
    }
    var retval = {value: solution_value, values_list: values_list, find_pathery_path_count: find_pathery_path_count};
    if (cb) {cb(retval);}
    return retval;
}
exports.compute_values = compute_values;


///////////////////////////////////////////////////////////////////////////////////////////////
// SOLVER
///////////////////////////////////////////////////////////////////////////////////////////////

function place_greedy(board, cur_blocks, remaining, cb) {
  while (remaining > 0) {
    var best_val= -1;
    var best_block = null;
    var values_list = compute_values(board, cur_blocks).values_list;
    for (var i = 0; i < values_list.length; i++) {
      var val_dict = values_list[i];
      if ((!val_dict.blocking) && (typeof val_dict.val === 'number') && (val_dict.val > best_val)) {
        best_val = val_dict.val;
        best_block = [val_dict.i, val_dict.j]
      }
    }

    if (best_block) {
      cur_blocks.push(best_block);
    }

    remaining -= 1;
  }
  if (cb) {cb(cur_blocks);}
  return cur_blocks;
}
exports.place_greedy = place_greedy;

// OPTIONS:
// randomize:        break ties by randomizing
// num_failures:     number of failed improvements before stopping
function improve_solution(board, blocks, options) {
  //blocks = place_greedy(board, blocks, remaining, cb) {
  var graph = new PatheryGraph(board);
  blocks = graph.dictify_blocks(blocks);

  var solution = find_pathery_path(graph, blocks);

  var best_val = solution.value;
  var best_remove_block = null;
  var best_add_block = null;
  var num_tied = 1;
  var val;

  var fail_improve = 0;

  options.num_failures = options.num_failures || 1;
  if (options.try_shortcut === undefined) {options.try_shortcut = true;}

  while (fail_improve < options.num_failures) {
    fail_improve += 1;
    if (options.try_shortcut) {
    }

    for (var remove_block in blocks) {
      delete blocks[remove_block];

      solution = find_pathery_path(graph, blocks);
      var relevant_blocks = solution.relevant_blocks;

      for (var add_block in relevant_blocks) {
        blocks[add_block] = true;
        solution = find_pathery_path(graph, blocks);
        val = solution.value;
        if (val > best_val) {
          num_tied = 1;
          fail_improve = 0;
          best_remove_block = remove_block; best_add_block = add_block; best_val = val;
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

    if (best_remove_block) {
      delete blocks[best_remove_block]
      blocks[best_add_block] = true;
    }
  }
  return graph.listify_blocks(blocks);
}
exports.improve_solution = improve_solution;

// Path animation

function pa_find_full_path(graph, blocks, reversed) {
  var used_teleports = {};
  var fullpathinfo = [];
  var cur; // current list of start points
  var extra_block;
  if (reversed) {     // red path
    cur = graph.red_starts;
    extra_block = GREEN_THROUGH_ONLY;
  } else {            // green path
    cur = graph.green_starts;
    extra_block = RED_THROUGH_ONLY;
  }
  var num_teleports_used = 0;

  var start_block_str, end_block_str;
  var block, last_block;

  var lastIndex = -1, index = 0;
  var totalMoves = 0;
  while (index < graph.checkpoints.length  + 1) {
    var target_dict = {}
    if (index == graph.checkpoints.length) {
      var targets = graph.finishes;
      var cpname = FINISH;
    } else if (reversed)  {
      var targets = graph.checkpoints[graph.checkpoints.length - 1 - index];
      var cpname = CHECKPOINTS[graph.checkpoints.length - 1 - index];
    } else {
      var targets = graph.checkpoints[index];
      var cpname = CHECKPOINTS[index];
    }
    for (var i in targets) {
      var target = targets[i];
      target_dict[target] = true;
    }
    var pathObj = graph.find_path(blocks, extra_block, cur, target_dict); // returns a list of keys, or null
    if (pathObj == null) {
      if (!start_block_str) {
        // TODO: make sure this is right? it doesn't seem to matter
        start_block_str = stringify_block(graph.snapify(cur[0]));
      }
      if (!end_block_str) {
        // TODO: make sure this is right? it doesn't seem to matter
        end_block_str = stringify_block(graph.snapify(graph.finishes[0]));
      }
      var lastTarget = cpname;
      var totalMoves = NaN;
      var retpath = {
        blocked: true,
        start: start_block_str,
        end: end_block_str,
        lastTarget: lastTarget,
        path: fullpathinfo.join(''),
      };
      return {
        path: retpath,
        value: totalMoves,
      };
    }
    var out_blocks = null;

    var path_len = pathObj.numel;
    var path = pathObj.path;
    var first_block_idx = path_len - 1; //path is returned backwards
    if (lastIndex == index) {
      // we hit a teleporter last time
      fullpathinfo.push(graph.serial_board[path[first_block_idx]]);
      fullpathinfo.push(stringify_block(graph.snapify(path[first_block_idx])));
      fullpathinfo.push(graph.serial_board[path[first_block_idx]]);
    } else {
      if (lastIndex == -1) {
        // first pass: initialize
        start_block_str = stringify_block(graph.snapify(path[first_block_idx]));
      }
      // initialize this checkpoint
      fullpathinfo.push(cpname);
    }

    // push things onto actual path, until we hit a teleport

    last_block = path[path_len - 1];
    for (var k = path_len - 2; k >= 0; k--) {
      totalMoves += 1;
      block = path[k];
      fullpathinfo.push(graph.path_dir(last_block, block));
      last_block = block;

      out_blocks = graph.teleport(block, used_teleports);
      if (out_blocks != null) {
        // fullpath.push(block);
        num_teleports_used += 1;
        cur = out_blocks;

        var tpchar = graph.serial_board[block];
        fullpathinfo.push(tpchar);
        break;
      } else if (k == 0) {
        // last step in the path for this checkpoint
        if (index == graph.checkpoints.length) {
          // special case: last step in the entire path
          end_block_str = stringify_block(graph.snapify(block));
        }
        fullpathinfo.push('r'); // signify done with this checkpoint
      }
    }

    lastIndex = index;

    if (out_blocks == null) {
      index += 1;
      cur = [block];
    }
  }
  var retpath = {
    blocked: false,
    start: start_block_str,
    end: end_block_str,
    path: fullpathinfo.join(''),
    moves: totalMoves,
  };
  return {
    path: retpath,
    value: totalMoves,
  };
}

function pa_find_pathery_path(graph, blocks){
  var path = [];
  var values = [];

  if (graph.has_regular) {
    solution_green = pa_find_full_path(graph, blocks);
    path.push(solution_green.path);
    values.push(solution_green.value);
  }

  if (graph.has_reverse) {
    solution_red = pa_find_full_path(graph, blocks, true);
    path.push(solution_red.path);
    values.push(solution_red.value);
  }
  return {path: path,
          value: sum_values(values),
  };
}


function pa_compute_solution(board, cur_blocks) {
    if (cur_blocks === undefined) {cur_blocks = []}
    var graph = new PatheryGraph(board);

    var current_blocks = graph.dictify_blocks(cur_blocks);
    var solution = pa_find_pathery_path(graph, current_blocks);

    return solution;
}
exports.pa_compute_solution = pa_compute_solution;


})(typeof exports === "undefined" ? Analyst : module.exports)
