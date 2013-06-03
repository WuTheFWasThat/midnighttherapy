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


function Graph(board) {
  
  var self  = {};

  self.board = board;
  self.n = board.length;
  self.m = board[0].length;

  self.keyify_coordinates = function(x, y) {
    return x * self.m + y;
  }
  
  self.keyify = function(block) {
    return self.keyify_coordinates(block[0] , block[1]);
  }

  self.keyify_list = function(blocklist) {
    var list = [];
    for (var i = 0; i < blocklist.length; i++ ) {
      list[i] = self.keyify(blocklist[i]);
    }
    return list;
  }

  self.unkeyify = function(blockkey) {
    return [Math.floor(blockkey / self.m), blockkey % self.m];
  }

  self.unkeyify_list = function(blocklist) {
    var list = [];
    for (var i = 0; i < blocklist.length; i++ ) {
      list[i] = self.unkeyify(blocklist[i]);
    }
    return list;
  }
  
  self.parse_blocks = function(blocksstring) {
    var blocks = {};
    var str_blocks = blocksstring.split('.');
    for (var k in str_blocks) {
      var str_block = str_blocks[k];
      if (str_blocks[k]) {
        var x = parseInt(str_block.split(',')[0]);
        var y = parseInt(str_block.split(',')[1]);
        blocks[self.keyify_coordinates(x-1 , y)] = true;
      }
    }
    return blocks;
  }

  self.boardstuff = {};

  self.serial_board = []; // same as board, but uses keyified index

  // Note that these lists start from top-left and go right, then down
  // In particular, starts and finishes are ordered top to bottom
  // Also when there are multiple outs for teleports, same ordering is used
  for (var i = 0; i < self.n; i++) {
    for (var j = 0; j < self.m; j++) {
      var stuff = self.board[i][j];
      var key = self.keyify_coordinates(i,j);
      self.serial_board.push(stuff);
      if (stuff != ' ') {
        if (self.boardstuff.hasOwnProperty(stuff)) {
          self.boardstuff[stuff].push(key);
        } else {
          self.boardstuff[stuff] = [key]
        }
      }
    }
  }

  self.checkpoints = []; // list of lists of intermediate targets, including starts and ends

  self.starts = self.boardstuff['s'];
  self.has_regular = (self.starts !== undefined);

  self.alt_starts = self.boardstuff['S'];
  self.has_reverse = (self.alt_starts !== undefined);

  var letters = ['A', 'B', 'C', 'D', 'E'];
  for (var i = 0; i < 5; i++) {
    var letter = letters[i];
    if (!(self.boardstuff.hasOwnProperty(letter))) {
      break;
    }
    self.checkpoints.push(self.boardstuff[letter]);
  }

  self.finishes = self.boardstuff['t'];

  self.teleports = {};
  for (teleport_key in teleports_map) {
    // TODO: NOT TRUE IN GENERAL!!!
    var teleport_ins = self.boardstuff[teleport_key];
    if (! teleport_ins) {continue;}
    var teleport_outs = self.boardstuff[teleports_map[teleport_key]];

    for (var i = 0; i < teleport_ins.length; i++) {
      self.teleports[teleport_ins[i]] = teleport_outs;
    }
  }
        
  self.can_place = function(i, j) {
    return (self.board[i][j] == ' ');
  }


  self.get = function(block) {
    return self.board[block[0]][block[1]];
  }

  // NOTE: Order is important.  DETERMINES MOVE PRIORITIES
  self.moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  // Preprocess neighbors
  // Index is the keyified block
  self.neighbors = [];
  var neighbors_list;
  var xp;
  var yp;
  for (var x = 0; x < self.n; x++) {
    for (var y = 0; y < self.m; y++) {
      neighbors_list = [];
      for (var i = 0; i < self.moves.length; i++) {
        xp = x + self.moves[i][0];
        yp = y + self.moves[i][1];

        // fill edge with 'X' so we don't need this check?
        if (((0 <= xp) && (xp < self.n)) && ((0 <= yp) && (yp < self.m))) {
          val = self.board[xp][yp];
          if (val == 'X') {continue;}
          if (val == 'x') {continue;}
          if (val == '*') {continue;}
          neighbors_list.push(self.keyify_coordinates(xp, yp));
        }
      }
      self.neighbors.push(neighbors_list);
    }
  }

  self.extra_block = '?';

  self.get_neighbors = function(blocks, u) {
    var val;
    var neighbors = [];
    var potential_neighbors = self.neighbors[u];
    var potential_neighbor;
    for (var i = 0; i < potential_neighbors.length; i++) {
      potential_neighbor = potential_neighbors[i];
      val = self.serial_board[potential_neighbor];
      if (val == self.extra_block) {continue;}
      if (blocks[potential_neighbor]) {continue;}
      neighbors.push(potential_neighbor);
    }
    return neighbors;
  }

  self.teleport = function(block, used_teleports) {
    var stuff = self.serial_board[block];
    if ( teleports_map[stuff] ) {
      if (!(used_teleports[stuff])) {
        used_teleports[stuff] = true;
        return self.teleports[block]
      }
    }
    return null;
  }

  return self;
}

function Queue(n) {
  var self = {};
  self.n = n;
  self.q = new Array(n); // guaranteed max size of queue
  self.start = 0;
  self.end = 0;
  self.push = function(el) {
    self.q[self.end] = el;
    self.end = (self.end + 1) % self.n;
  }
  self.pop = function() {
    self.start = (self.start + 1) % self.n;
    return self.q[self.start - 1];
  }
  self.empty = function() {
    return (self.start == self.end);
  }
  return self;
}

function BFS(graph, // graph description, as an array
             blocks, // currently placed blocks
             sources, // list of source vertices, in order of priority
             targets // set of target vertices
            ) {
  parent_dict = {};
  var queue = Queue(graph.m * graph.n);

  for (var k in sources) {
    var source = sources[k];
    queue.push(source);
    parent_dict[source] = true;
  }

  var get_path = function(v){
    var path = [];
    while (v !== true) {
      path.push(v);
      v = parent_dict[v];
    }
    return path.reverse();
  }

  while (!queue.empty()) {
    var u = queue.pop();
    var neighbors = graph.get_neighbors(blocks, u);
    for (var k = 0; k < neighbors.length; k++) {
      var v = neighbors[k];
      if (!parent_dict.hasOwnProperty(v)) {
        queue.push(v)
        parent_dict[v] = u;
      }
      if (targets[v]) {
        return get_path(v);
      }
    }
  }
  return null;
}

function find_half_path(graph, blocks, reversed){
  var used_teleports = {};
  var index = 0;
  var fullpath = [];
  var cur;
  if (reversed) {     // red path
    cur = graph.alt_starts; // current list of start points
    graph.extra_block = 'g';
  } else {            // green path
    cur = graph.starts; // current list of start points
    graph.extra_block = 'r';
  }
  var num_teleports_used = 0;
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
    var path = BFS(graph, blocks, cur, target_dict);
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
    //path: graph.unkeyify_list(fullpath), 
    path: fullpath, 
    value: solution_length, 
    relevant_blocks: relevant_blocks
  };
}

function find_full_path(graph, blocks){
  var relevant_blocks = {};
  var paths = [];
  var values = [];

  if (graph.has_regular) {
    solution_green = find_half_path(graph, blocks);
    paths.push(solution_green.path);
    values.push(solution_green.value);
    for (var block in solution_green.relevant_blocks) {relevant_blocks[block] = true;}
  }

  if (graph.has_reverse) {
    solution_red = find_half_path(graph, blocks, true);
    paths.push(solution_red.path);
    values.push(solution_red.value);
    for (var block in solution_red.relevant_blocks) {relevant_blocks[block] = true;}
  }
  return {paths: paths, 
          values: values, 
          relevant_blocks: relevant_blocks};
}


function compute_value(mapcode, solution) {
    bm_board= parse_board(mapcode);
    bm_graph = Graph(bm_board);
    //BFS(bm_graph, {}, [null], {'[2,2]':true})

    bm_current_blocks = bm_graph.parse_blocks(solution);
    bm_solution = find_full_path(bm_graph, bm_current_blocks);

    return bm_solution.values;
}

function sum_values(array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++)  {
    sum += array[i];
  }
  return sum;
}

function improve_solution(graph, blocks) {
  var solution = find_full_path(graph, blocks);
  var cur_val = sum_values(solution.values);
  for (var block in blocks) {
    delete blocks[block];

    solution = find_full_path(graph, blocks);

    var relevant_blocks = solution.relevant_blocks;

    blocks[block] = true;
  }
}

function compute_values(mapcode, solution) {
    bm_board= parse_board(mapcode);
    bm_graph = Graph(bm_board);
    //BFS(bm_graph, {}, [null], {'[2,2]':true})

    bm_current_blocks = bm_graph.parse_blocks(solution);
    var bm_solution = find_full_path(bm_graph, bm_current_blocks);

    var bm_solution_path = bm_solution.paths;
    var bm_solution_value = sum_values(bm_solution.values);
    var bm_relevant_blocks = bm_solution.relevant_blocks;

    var find_full_path_count = 0;

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
                      value = sum_values(find_full_path(bm_graph, bm_current_blocks).values);
                      find_full_path_count++;
                      diff = bm_solution_value - value;
                      bm_current_blocks[block] = true;
                    }
                } else if (block in bm_relevant_blocks) {
                    blocking = false;
                    if (isNaN(bm_solution_value)) { 
                      diff = '';
                    } else {
                      bm_current_blocks[block] = true;
                      value = sum_values(find_full_path(bm_graph, bm_current_blocks).values);
                      find_full_path_count++;
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
    console.log("find_full_path count: " + find_full_path_count);
    return {value: bm_solution_value, values_list: values_list};
}


try {
  exports.compute_value = compute_value;
  exports.compute_values = compute_values;
} catch (e) {}
