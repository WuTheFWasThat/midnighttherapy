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
    var path = graph.find_path(blocks, extra_block, cur, target_dict);
    if (path == null) {
      return {path: null, value: PATH_BLOCKED_CONSTANT, relevant_blocks: {}};
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
          value: sum_values(values),
          relevant_blocks: relevant_blocks};
}


function compute_value(board, cur_blocks, cb) {
    var graph = new PatheryGraph(board);

    var current_blocks = graph.dictify_blocks(cur_blocks);
    var solution = find_pathery_path(graph, current_blocks);

    if (cb) {cb(solution.values)}
    return solution.values;
}
exports.compute_value = compute_value;

function sum_values(array) {
  if (array.length == 0) {return PATH_BLOCKED_CONSTANT;}
  return array.reduce(function(x, y) {return x + y})
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


})(typeof exports === "undefined" ? Analyst : module.exports)
