teleports_map = {
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '0': ')',
}

TYPE_MAP = {
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D',
    'e': 'E',
    's': 's',
    'f': 't',
    'r': 'X',
    't': '1',
    'u': '!',
    'm': '2',
    'n': '@',
    'g': '3',
    'h': '#',
    'i': '4',
    'j': '$',
    'k': '5',
    'l': '%',
}

// TODO: switch to i * m + n
function keyify_block(block) {
  if (block == null) {
    return -1;
  } else {
    return block[0] * 1000 + block[1];
  }
  //return JSON.stringify(block)
}

function unkeyify_block(blockkey) {
  if (blockkey == -1) {
    return null;
  } else {
    return [Math.floor(blockkey / 1000), blockkey % 1000];
  }
  //return JSON.parse(blockkey)
}

function parse_blocks(blocksstring) {
  var blocks = {};
  var str_blocks = blocksstring.split('.');
  for (var k in str_blocks) {
    var str_block = str_blocks[k];
    if (str_blocks[k]) {
      var x = parseInt(str_block.split(',')[0]);
      var y = parseInt(str_block.split(',')[1]);
      blocks[keyify_block([x-1 , y ])] = true;
    }
  }
  return blocks;
}

function parse_board(code) {
    var head = code.split(':')[0];
    var body = code.split(':')[1];
    
    var head = head.split('.');
    var dims = head[0].split('x');
    var width = parseInt(dims[0], 10);
    var height = parseInt(dims[1], 10);
    if (head[1][0] != 'c') {console.log('head[1][0] was ' + head[1][0] + ' expected c');}
    var targets = parseInt(head[1].slice(1), 10);
    if (head[2][0] != 'r') {console.log('head[2][0] was ' + head[2][0] + ' expected r');}
    if (head[3][0] != 'w') {console.log('head[3][0] was ' + head[3][0] + ' expected w');}
    //if (board['walls'] != parseInt(head[3].slice(1))) {console.log('board.walls is different from walls in header');}
    if (head[4][0] != 't') {console.log('head[4][0] was ' + head[4][0] + ' expected t');}
    
    var teleports = parseInt(head[4].slice(1), 10)
    
    var data = new Array();
    for (i = 0; i < height; i++) {
        var row = new Array();
        for (j = 0; j < width; j++) {
            row.push(' ');
        }
        data.push(row);
    }
    
    var i = -1;
    var j = width - 1;
    var body_split = body.split('.').slice(0, -1);
    
    for (var k = 0; k < body_split.length; k++) {
        var item = body_split[k];
        for (var l = 0; l < parseInt(item.slice(0, -1), 10) + 1; l++) {
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
    //board['data'] = [''.join(row) for row in data]
    //board['data'] = new Array();
    //return board
    return data;
}


function Graph(board) {
  
  var self  = {};

  self.board = board;
  self.n = board.length;
  self.m = board[0].length;

  var boardstuff = {};
  // Note that these lists start from top-left and go right, then down
  // In particular, starts and finishes are ordered top to bottom
  // Also when there are multiple outs for teleports, same ordering is used
  for (i = 0; i < self.n; i++) {
    for (j = 0; j < self.m; j++) {
      var stuff = self.board[i][j];
      if (stuff != ' ') {
        if (boardstuff.hasOwnProperty(stuff)) {
          boardstuff[stuff].push([i, j]);
        } else {
          boardstuff[stuff] = [[i, j]]
        }
      }
    }
  }

  self.milestones = []; // list of lists of intermediate targets, including starts and ends
  self.milestones.push(boardstuff['s']);

  var letters = ['A', 'B', 'C', 'D', 'E'];
  for (var i = 0; i < 5; i++) {
    var letter = letters[i];
    if (!(boardstuff.hasOwnProperty(letter))) {
      break;
    }
    self.milestones.push(boardstuff[letter]);
  }
  self.milestones.push(boardstuff['t']);

  self.teleports = {};
  var d = 1
  while (boardstuff.hasOwnProperty('' + d)) {
    // TODO: NOT TRUE IN GENERAL!!!
    if ( boardstuff['' + d].length != 1) {console.log("LENGTH SHOULDVE BEEN 1 FOR TELEPORT " + d);}
    self.teleports[keyify_block(boardstuff['' + d][0])] = boardstuff[teleports_map['' + d]];
    d+=1;
  }
        
  self.can_place = function(i, j) {
    return (this.board[i][j] == ' ');
  }


  self.get = function(block) {
    return this.board[block[0]][block[1]];
  }

  // DETERMINES MOVE PRIORITIES
  self.moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  self.get_neighbors = function(blocks, u) {
    if (u == null) { //# invisible 'meta-start' vertex
      return this.milestones[0].slice(0); // return the start vertices
    }
    var x = u[0];
    var y = u[1];
    var neighbors = [];
    // order here is important, as per pathery rules
    // Loop through the pairs:
    // (-1, 0), (0, 1), (1, 0), (0, -1)
    for (var i = 0; i < self.moves.length; i++) {
      var dx = self.moves[i][0];
      var dy = self.moves[i][1];
      var xp = x + dx;
      var yp = y + dy;
      if (((0 <= xp) && (xp < this.n)) && ((0 <= yp) && (yp < this.m))) {
        var val = this.board[xp][yp];
        if (val == 'X') {continue;}
        if (val == 'x') {continue;}
        if (val == '*') {continue;}
        if (blocks.hasOwnProperty(keyify_block([xp, yp]))) {continue;}
        neighbors.push([xp, yp]);
      }
    }
    return neighbors;
  }

  self.teleport = function(block, used_teleports) {
    var stuff = this.get(block);
    if ( teleports_map.hasOwnProperty(stuff) ) {
      var block_key = keyify_block(block);
      if (!(used_teleports.hasOwnProperty(block_key))) {
        used_teleports[block_key] = true;
        return this.teleports[block_key]
      }
    }
    return null;
  }

  return self;
}

function BFS(graph, // graph description, as an array
             blocks, // currently placed blocks
             sources, // list of source vertices, in order of priority
             targets // set of target vertices
            ) {
  parent_dict = {};
  for (var k in sources) {
    var source = sources[k];
    parent_dict[keyify_block(source)] = null;
  }
  var queue = sources;

  var get_path = function(v){
    var path = [];
    while (v !== null) {
      path.push(v);
      v = parent_dict[keyify_block(v)];
    }
    reversed_path = [];
    for (var i = 0; i < path.length; i ++ ) {
      reversed_path.push(path[path.length - 1 - i]);
    }
    return reversed_path
  }

  while (queue.length > 0) {
    var newqueue = []
    for (var i = 0; i < queue.length; i++) {
      var u = queue[i];
      var neighbors = graph.get_neighbors(blocks, u);
      for (var k = 0; k < neighbors.length; k++) {
        var v = neighbors[k];
        var v_key = keyify_block(v);
        if (!parent_dict.hasOwnProperty(v_key)) {
          newqueue.push(v)
          parent_dict[v_key] = u;
        }
        if (targets.hasOwnProperty(v_key)) {
          return get_path(v);
        }
      }
    }
    queue = newqueue;
  }
  return null;
}

function find_full_path(graph, blocks ){
                   
  var used_teleports = {};
  var index = 0;
  var fullpath = [];
  var cur = [null]; // current list of start points
  var num_teleports_used = 0;
  var relevant_blocks = {}; // The set of blocks which blocking may help

  while (index < graph.milestones.length - 1) {
    var best_path = null;
    var target_dict = {};
    for (var i in graph.milestones[index+1]) {
      var target = graph.milestones[index+1][i];
      target_dict[keyify_block(target)] = true;
    }
    var path = BFS(graph, blocks, cur, target_dict);
    if ((best_path == null)  || ((path != null) && (path.length < best_path.length))) {
      best_path = path;
    }
    if (best_path == null) {
      return [null, -Number.MAX_VALUE, {}];
    }
    var out_blocks = null;

    // blocking these could affect things
    for (var k in best_path) {
      var block = best_path[k];
      relevant_blocks[keyify_block(block)] = true;
    }

    // push things onto actual path, until we hit a teleport
    for (var k in best_path) {
      var block = best_path[k];
      var out_blocks = graph.teleport(block, used_teleports);
      if (out_blocks != null) {
        fullpath.push(block);
        num_teleports_used += 1;
        cur = out_blocks.slice(0);
        break;
      }
      // if no teleport, and last block of not last leg, skip (to avoid overcount)
      if ((k < best_path.length - 1) || (index == graph.milestones.length - 2)) {
        fullpath.push(block);
      }
    }
    if (out_blocks == null) {
      index += 1;
      cur = [block];
    }
  }

  var solution_length = fullpath.length - 1 - num_teleports_used;
  return [fullpath, solution_length, relevant_blocks];
}


function compute_value(mapcode, solution) {
    bm_board= parse_board(mapcode);
    bm_graph = Graph(bm_board);
    //BFS(bm_graph, {}, [null], {'[2,2]':true})

    bm_current_blocks = parse_blocks(solution);
    bm_solution = find_full_path(bm_graph, bm_current_blocks);

    bm_solution_value = bm_solution[1];
    if (bm_solution_value < 0)  { return -1; }
    return bm_solution_value;
}

function compute_values(mapcode, solution) {
    bm_board= parse_board(mapcode);
    bm_graph = Graph(bm_board);
    //BFS(bm_graph, {}, [null], {'[2,2]':true})

    bm_current_blocks = parse_blocks(solution);
    bm_solution = find_full_path(bm_graph, bm_current_blocks);

    bm_solution_path = bm_solution[0];
    bm_solution_value = bm_solution[1];
    bm_relevant_blocks = bm_solution[2];

    var values_list = [];
    for (var i in bm_board) {
        i = parseInt(i);
        for (var j in bm_board[i]) {
            j = parseInt(j);
            if (bm_graph.get([i,j]) == ' ') {
                var blockstring = keyify_block([i, j]);
                var value;
                var diff;
                var css;
                if (blockstring in bm_current_blocks) {
                    delete bm_current_blocks[blockstring];
                    value = find_full_path(bm_graph, bm_current_blocks)[1];
                    diff = bm_solution_value - value;
                    bm_current_blocks[blockstring] = true;
                    css = {'color': 'white',
                           'text-align': 'center'
                          };
                } else if (blockstring in bm_relevant_blocks) {
                    bm_current_blocks[blockstring] = true;
                    value = find_full_path(bm_graph, bm_current_blocks)[1];
                    diff = value - bm_solution_value;
                    delete bm_current_blocks[blockstring];

                    if (Math.abs(diff) > 2222222222) {diff = '-';}
                    else if (diff == 0) {diff = '';}

                    css = {'color': 'black',
                           'text-align': 'center'
                          };
                } else {
                    diff = '';
                    css = {};
                }
                values_list.push({i: i, j: j, val: diff, css: css});
            }
        }
    }
    return {value: bm_solution_value, values_list: values_list};
}


try {
  exports.compute_value = compute_value;
  exports.compute_values = compute_values;
} catch (e) {}
