////////////////////////////////////////////////////////////
// THERAPIST
////////////////////////////////////////////////////////////

// The therapist is an intermediary between the client and analyst.
// It provides hotkeys, saving/loading of solutions, etc. and only runs in the browser

(function(exports, solver) {

////////////////////////////////////////////////////////////
// LOAD SCRIPTS
////////////////////////////////////////////////////////////
// CREDIT TO:  http://stackoverflow.com/questions/1866717/document-createelementscript-adding-two-scripts-with-one-callback

var is_mapeditor = ($('#playableMapDisplay').length > 0)
var is_ugli = (typeof pathery_ugli != 'undefined');

function loadScripts(array,callback){
  var loader = function(src,handler){
    var script = document.createElement("script");
    script.src = src;
    script.onload = script.onreadystatechange = function(){
    script.onreadystatechange = script.onload = null;
      handler();
    }
    var head = document.getElementsByTagName("head")[0];
    (head || document.body).appendChild( script );
  };
  (function(){
    if(array.length!=0){
      loader(array.shift(),arguments.callee);
    }else{
      callback && callback();
    }
  })();
}

//loadScripts([
//   mt_url + 'lib/html2canvas.js', // "http://html2canvas.hertzen.com/build/html2canvas.js",
//]); // should really be asynchronous, but oh well... too much of a headache
//] , function() {

if (is_mapeditor) {
  function get_param(name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return (results == null ? null : (results[1] || 0));
  }
  $('#mapCode').val(get_param('code'));
  loadMap("code");
  refresh_all();
}

// get user id
var user_id;
$(document).ready(function() {
  $('#topbarContent a').each(function(x, y) {
    var link = $(y);
    if (link.text() == 'Achievements') {
      user_id = parseInt(link.attr('href').split('=')[1])
    }
  })
})

exports.mapid = null;

var last_compute_values_time = Date.now();
var compute_values_interval = 500;
var new_map_timeout = 100;
var draw_values_var = null;

/////////////////////
// GENERAL UTILITIES
/////////////////////

function add_message(msg) {
  $('#difficulties').before('<center>' + msg + '</center></br>');
}

// from my representation of block to pathery's 'mapid,x,y' representation
function id_from_block(mapid, block) {
  var x = block[0] + 1;
  var y = block[1];
  var id = mapid + '\\,' + x + '\\,' + y;
  return id;
}

// from pathery's representation to my representation of block
function block_from_block_string(block_string) {
  var string_coordinates = block_string.split(',');
  var x = parseInt(string_coordinates[0]) - 1;
  var y = parseInt(string_coordinates[1]);
  var block = [x, y];
  return block;
}

// also updates the current mapid
function get_mapid() {
    var old_mapid = exports.mapid;
    var outer_grid = $('.shown-maps .grid_outer');
    if (outer_grid.length > 0) {
      exports.mapid =  parseInt(outer_grid.attr('id').split(',')[0]);
    } else {
      exports.mapid = -1; // mapeditor mapid
    }

    if (old_mapid !== exports.mapid) {refresh_all();}

    return exports.mapid;
}
exports.get_mapid = get_mapid;

function get_code(mapid) {
  if (mapid === undefined) {mapid = get_mapid();}
  return mapdata[mapid].code;
}
exports.get_code = get_code;

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
    var walls_remaining = parseInt(head[3].slice(1));

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
        data[i][j] = type;
    }

    //var board = [];
    //for (var i in data) {
    //  board.push(data[i].join(''));
    //}
    //return board

    return {board: data,
            walls_remaining: walls_remaining
    };
}
exports.parse_board = parse_board;

function get_board(mapid) {
  if (mapid === undefined) {mapid = get_mapid();}
  var code = get_code(mapid);
  // console.log('code', code)
  // console.log('board', parse_board(code).board);
  return parse_board(code).board;
}
exports.get_board = get_board;

function get_solution(mapid) {
  var solution_string = solution[mapid];
  var solution_block_strings = solution_string.split('.').slice(1, -1);
  var blocks = [];
  for (var k in solution_block_strings) {
    var block = block_from_block_string(solution_block_strings[k]);
    blocks.push(block);
  }
  return blocks;
}
exports.get_solution = get_solution;

function get_current_solution() {
  var mapid = get_mapid();
  return get_solution(mapid);
}
exports.get_current_solution = get_current_solution;

function send_solution(mapid) {
  update_animate_path();
  doSend(mapid);
}
exports.send_solution = send_solution;

function walls_remaining(mapid) {
  return parseInt(mapdata[mapid].usedWallCount);
}
exports.walls_remaining = walls_remaining;

function map_is_out(mapid) {
  return (walls_remaining(mapid) < 1);
}

function switch_map(map_num) {
  showStats(map_num);
  refresh_all();
}

function update_scores_page() {
  if (is_mapeditor || is_ugli) {return;}
  var mapid = get_mapid();
  scoresShowPage(currentPage[mapid], mapid);
}

if (!is_mapeditor) {
  setInterval(update_scores_page, 1000);
}

////////////////////////////////////////////
// OVERRIDE SNAP'S STUFF
////////////////////////////////////////////

var __old_grick_click__ = grid_click;
grid_click = function() {
  var custom_image = get_custom('wall_image');
  if (custom_image) {wallEmblem = custom_image;}
  var old_linkEmblem = linkEmblem;
  if (custom_image) { linkEmblem = function() {return wallEmblem;} }
  __old_grick_click__.apply(this, arguments);
  if (custom_image) {linkEmblem = old_linkEmblem;}
}

// disable updating of the main score display
var __old_updateDsp__ = updateDsp;
updateDsp = function(mapid, element, data) {
  if (element == 'dspCount') {return;}
  __old_updateDsp__.apply(this, arguments);
}

// disable flashing of stuff
var __old_flashelement__ = flashelement;
flashelement = function() {}

// CUSTOM COUNTDOWN TIMER
//if (typeof countdownInt !== 'undefined') {
//  clearInterval(countdownInt)
//  countdownInt = setInterval(function() {
//    var timerem = tomorrow.getTime() - new Date().getTime();
//    newMapStr = 'New maps: ' + formatedTomorrow + '<br/>Time remaining: ' + millisecondsToTimeString(timerem);
//    $("#countdown").html(newMapStr);
//    //TODO: dynamically load the new map w/o refresh?
//    if (timerem <= 100) {location.reload(true);}
//  }, 100)
//}

function reset_map(mapid) {
    var old_solution = get_solution(mapid);
    add_move_to_history(mapid, new ChangeBoardMove(mapid, old_solution, []))
    clearwalls(exports.mapid);
}
resetwalls = reset_map; // override snap's function!

var __old_animatePath__ = animatePath;
function update_animate_path() {
  if (shiftkey_held) {
    animatePath = __old_animatePath__;
  } else {
    animatePath = function() {
      __old_flashelement__(exports.mapid + ',dspCount', 2);
      if (!is_mapeditor) {
        scoresRequestPage(exports.mapid, currentPage[exports.mapid])
      }
    };
  }
}

////////////////////////////////
// drawing values and scores
////////////////////////////////

function draw_values() {
    var mapid = get_mapid();

    var time = Date.now();

    // nullify any other pending request
    clearTimeout(draw_values_var);

    // Don't draw values if compute_values_interval hasn't elapsed since the last request sent
    if (time - last_compute_values_time < compute_values_interval) {
      draw_values_var = setTimeout(draw_values, compute_values_interval);
    } else {
      last_compute_values_time = time;
      solver.compute_values(get_board(mapid), get_solution(mapid), function(result) {
         var value  = result.value;
         var values_list  = result.values_list;
         var maxValue = Math.max.apply(Math, values_list.map(function(x) { return (x.hasOwnProperty('val') && !isNaN(x.val) && !x.blocking ? x.val : -1); }));
         for (var k in values_list) {
           var values_dict = values_list[k];
           draw_single_value(mapid, values_dict.i, values_dict.j, values_dict.val, values_dict.blocking, maxValue);
         }
       })
    }
}

var showing_values = false;
function refresh_score() {
  try { // for mapeditor race condition
    var mapid = get_mapid();
    var sol = get_solution(mapid);
    solver.compute_value(get_board(mapid), sol, function(values) {
      var sum = get_score_total(values);
      solution_storage.update_best(mapid, sol, sum);
      write_score_value(values);
    })
    if (showing_values) { draw_values(); }
  } catch (e) {return console.log('In mapeditor?  failed to refresh score', e);}
};

function draw_single_value(mapid, i, j, value, blocking, maxValue) {
    var elt = $('#child_' + mapid + '\\,' + (i+1) + '\\,' + j);
    var css = {'text-align': 'center',
  		     'cursor': 'default',
  			 'font-weight': 'normal'
              };

    if (blocking) {
      // user-placed walls
      if (!isNaN(value) && value <= 0) {
        // negative worth block
  	  css.color = 'red';
  	  } else {
          css.color = 'white';
  	  }
    } else if (!isNaN(value) && (value >= 0)) {
      //useful squares
      if (value == 0) {value = ''};
      if (value == maxValue) {
   	    css.color = 'green';
   	    css['font-weight'] = 'bold';
   	  } else {
        css.color = 'black';
   	  }
    } else {
      //negative/invalid squares
      css.color = 'gray';
    }
    elt.css(css);
    elt.text(value);
}

function refresh_all() {
  refresh_solution_store_display();
  refresh_score();
}

function update_show_values() {
  if (showing_values) {
    $('#mt_show_values').text('Hide values');
    refresh_score();
  } else {
    $('.map .child').text('');
    $('#mt_show_values').text('Show values');
  }
}
function toggle_values() {
  showing_values = !showing_values;
  update_show_values();
}
exports.toggle_values = toggle_values;

function get_score_total(values) {
  var sum = 0;
  for (var i in values) {
    if (values[i] == null) {return NaN;}
    sum = sum + values[i];
  }
  return sum;
}

function write_score_value(values) {
  var sum = get_score_total(values);
  var txt = ''
  if (values.length > 1) { txt += values.join(' + ') + ' = '; }
  if (isNaN(sum))        { txt += 'Path blocked!'; }
  else                   { txt += sum + ' moves'; }
  $('#' + exports.mapid + '\\,dspCount').text(txt);
}

function get_custom(item_name) {
  if (supports_HTML5_Storage()) {
    return localStorage['custom' + '.' + item_name];
  } else {
    return getCookie('mt_' + item_name);
  }
}

function set_custom(item_name, val) {
  if (supports_HTML5_Storage()) {
    localStorage['custom' + '.' + item_name] = val;
  } else {
    setCookie('mt_' + item_name, val);
  }
}

/////////////////////////////////////////////
// SOLUTION SAVING
/////////////////////////////////////////////

//////////////////
// html5 storage
//////////////////

function HTML5_SolutionStorage() {
}

HTML5_SolutionStorage.prototype.update_best = function(mapid, sol, score) {
  if (isNaN(score)) {return;}
  var cur_best = this.get_best(mapid);
  var totalWalls = +(mapdata[mapid].walls);
  var usedWalls = sol.length;
  if ((!cur_best) || (score > cur_best)) {
    localStorage['best:' + mapdata[mapid].code] = score;
    this.add_solution(mapid, sol, 'best');
    if (usedWalls == totalWalls) {
      send_solution(mapid);
    }
  }

  // if (score == cur_best && usedWalls == totalWalls) {
  //   send_solution(mapid);
  // }
}

HTML5_SolutionStorage.prototype.get_best = function(mapid) {
  return localStorage['best:' + mapdata[mapid].code]
}

HTML5_SolutionStorage.prototype.get_hash = function(mapid) {
  return 'solutions:' + mapdata[mapid].code;
}

// TODO:  no need to preface everything with pathery... (make the change after there's a new UC)
HTML5_SolutionStorage.prototype.add_solution = function(mapid, sol, name) {
  var hash = this.get_hash(mapid);
  var map_storage;
  if (localStorage[hash] === undefined) {
    map_storage = {};
  } else {
    map_storage = JSON.parse(localStorage[hash]);
  }
  map_storage[name] = true;
  localStorage[hash] = JSON.stringify(map_storage);
  localStorage[hash + ':' + name] = JSON.stringify(sol);
  refresh_solution_store_display();
}

HTML5_SolutionStorage.prototype.get_solution = function(mapid, name) {
  var hash = this.get_hash(mapid);
  return JSON.parse(localStorage[hash + ':' + name])
}

HTML5_SolutionStorage.prototype.get_solutions = function(mapid) {
  var hash = this.get_hash(mapid);
  var solutions = {};

  if (localStorage[hash] !== undefined) {
    var map_storage = JSON.parse(localStorage[hash]);
    for (var name in map_storage) {
      solutions[name] = JSON.parse(localStorage[hash + ':' + name]);
    }
  }
  return solutions;
}

HTML5_SolutionStorage.prototype.delete_solution = function(mapid, name) {
  if (name == 'best') {delete localStorage['best:' + mapdata[mapid].code]}

  var hash = this.get_hash(mapid);
  var map_storage = JSON.parse(localStorage[hash]);
  delete map_storage[name];
  localStorage[hash] = JSON.stringify(map_storage);

  delete localStorage[hash + ':' + name]
  refresh_solution_store_display();
}

HTML5_SolutionStorage.prototype.clear_all = function(mapid, name) {
  for (var k in localStorage) {
    delete localStorage[k];
  }
  refresh_solution_store_display();
}

//////////////////
// regular storage
//////////////////

function JS_SolutionStorage() {
  this.storage =  {};
  this.best = {}
  this.best = -Infinity;
}

JS_SolutionStorage.prototype.get_best = function(mapid) {
  return this.best[mapid];
}

JS_SolutionStorage.prototype.update_best = function(mapid, sol, score) {
  if (isNaN(score)) {return;}
  var cur_best = this.get_best(mapid);
  var totalWalls = +(mapdata[mapid].walls);
  var usedWalls = sol.length;
  if ((!cur_best) || (score > cur_best)) {
    this.best[mapid] = score;
    this.add_solution(mapid, sol, 'best');
    if (usedWalls == totalWalls) {
      send_solution(mapid);
    }
  }
}

JS_SolutionStorage.prototype.add_solution = function(mapid, solution, name) {
  if (this.storage[mapid] === undefined) { this.storage[mapid] = {}; }
  this.storage[mapid][name] = solution;
  refresh_solution_store_display();
}

JS_SolutionStorage.prototype.get_solution = function(mapid, name) {
  return this.storage[mapid][name];
}

JS_SolutionStorage.prototype.get_solutions = function(mapid) {
  return (this.storage[mapid] || {})
}

JS_SolutionStorage.prototype.delete_solution = function(mapid, name) {
  delete this.storage[mapid][name];
  refresh_solution_store_display();
}

function supports_HTML5_Storage() {
  return (typeof(Storage) !== undefined);
}

var solution_storage;

if (!supports_HTML5_Storage()) {
  add_message('<p style="font-size:15px;color:yellow">Your browser doesn\'t support HTML5 local storage, so your solutions will not be remembered upon refresh.</p>')
  solution_storage = new JS_SolutionStorage();
}  else {
  solution_storage = new HTML5_SolutionStorage();
}

// TODO: auto-save best
// TODO: clear solutions for past maps?
function save_current_solution() {
  var mapid = get_mapid();
  var solution = get_current_solution();
  var name = $('#mt_save_solution_name').val();
  $('#mt_save_solution_name').val('');

  function add_solution() {
    solution_storage.add_solution(mapid, solution, name);
  }

  if (!name) {
    // choose name based on score, and walls remaining
    var remaining = walls_remaining(mapid);

    solver.compute_value(get_board(mapid), get_solution(mapid), function(values) {

      raw_name = '' + get_score_total(values);
      if (remaining > 0) { raw_name += "+" + remaining + "w"; }
      name = raw_name;

      var existing_names = solution_storage.get_solutions(mapid);
      var suffix = 2;
      while (name in existing_names) {
        name = raw_name + '(' + (suffix++) + ')';
      }
      add_solution();
    })
  } else {
    add_solution();
  }
}
exports.save_current_solution = save_current_solution;

function place_solution(mapid, solution) {
  clearwalls(mapid);
  for (var i in solution) {
    var block = solution[i];
    click_block_untriggered(mapid, block);
  }
}

function load_solution(mapid, new_solution) {
  var cur_solution = get_current_solution();
  place_solution(mapid, new_solution);
  add_move_to_history(mapid, new ChangeBoardMove(mapid, cur_solution, new_solution))
  refresh_score();
}
exports.load_solution = load_solution;

function refresh_solution_store_display() {
  var mapid = get_mapid();

  //var current_solution = get_current_solution();

  try { // for mapeditor race condition
  var store = solution_storage.get_solutions(mapid);
  } catch (e) {return console.log('In mapeditor?  failed to get solutions', e);}

  if (!store['best']) {store['best'] = []};
  var names = []
  for (var name in store) {
    if (name !== 'best') {names.push(name)};
  }
  var names = ['best'].concat(names.sort());

  $('#mt_save_solution_list').empty();
  for (var k in names) {
    var name = names[k];
    var sol = store[name];
    //load_solution(mapid, sol);
    var solution_el = $('<div>').text(name)
    if (name == 'best') {
      solution_el.text(name + ': ' + solution_storage.get_best(mapid));
    }

    var load_button = $('<button>').text('Load').css('margin-left','5px')
    load_button.data('solution', sol)
    load_button.click(function() {
      var sol = $(this).data('solution');
      load_solution(mapid, sol);
    })
    solution_el.append(load_button);

    if (name !== 'best') {
      var delete_button = $('<button> Delete </button>')
      delete_button.data('name', name)
      delete_button.data('mapid', mapid)
      delete_button.click(function() {
        var name = $(this).data('name');
        var mapid = $(this).data('mapid');
        if (window.confirm("Are you sure?")) {
          solution_storage.delete_solution(mapid, name);
        }
      })
      solution_el.append(delete_button);
    }

    var code_button = $('<button>').text('Code')
    code_button.data('solution', JSON.stringify(sol))
    code_button.click(function() {
      var sol = $(this).data('solution');
      alert(sol);
    })
    solution_el.append(code_button);

    $('#mt_save_solution_list').append(solution_el);

    // TODO: problem is that the div changes during this loop.  need async queue
    //function render_solution(el) {
    //  html2canvas($('[id="' + mapid + ',outer"] .playable'), {
    //      onrendered: function(canvas) {
    //          $(canvas).css('height', canvas.height/10+'px');
    //          $(canvas).css('width', canvas.width/10 + 'px');
    //          //el.append(canvas);
    //          var img = canvas.toDataURL()
    //          window.open(img);
    //      }
    //  });
    //}
    //render_solution(solution_el)
  }

  if ($('#mt_save_solution_list').children().length == 0) {
    $('#mt_save_solution_list').append('No solutions saved!')
  }

  //load_solution(mapid, current_solution);
}

////////////////////////////////////////////
// BLOCK PLACEMENT HISTORY
////////////////////////////////////////////

////////////////////////////////////////////
// SINGLE BLOCK MOVE
////////////////////////////////////////////

function BlocksDiffMove(mapid, blocks) { // click (add or remove) the block
  this.mapid = mapid;
  this.blocks = blocks;
}
BlocksDiffMove.prototype.redo = function() {
  for (var i in this.blocks) {
    click_block_untriggered(this.mapid, this.blocks[i]);
  }
}
BlocksDiffMove.prototype.undo = function() {
  for (var i in this.blocks) {
    click_block_untriggered(this.mapid, this.blocks[i]);
  }
}
BlocksDiffMove.prototype.is_trivial = function() {return (this.blocks.length == 0);}
BlocksDiffMove.prototype.get_last_block = function() {
  return ((!this.is_trivial()) && this.blocks.slice(-1)[0]);
}

// TODO: make this work for built-in load-Best
function ChangeBoardMove(mapid, old_blocks, new_blocks) {
  // change entire board, e.g. load solution, reset
  this.mapid = mapid;
  this.old_blocks = old_blocks;
  this.new_blocks = new_blocks;
}
ChangeBoardMove.prototype.redo = function() {
  place_solution(this.mapid, this.new_blocks);
}
ChangeBoardMove.prototype.undo = function() {
  place_solution(this.mapid, this.old_blocks);
}
ChangeBoardMove.prototype.is_trivial = function() {
  return (this.old_blocks.toString() == this.new_blocks.toString()) ;
}

// mapid : most recent index (in the block history) of event (initially -1)
var last_move_indices = {};

// mapid : list of block history (and future)
var move_histories = {};

function get_move_history(mapid) {
  if (!move_histories[mapid]) {
    move_histories[mapid] = [];
    last_move_indices[mapid] = -1;
  }
  return move_histories[mapid];
}

function add_move_to_history(mapid, move) {
  if (move.is_trivial()) {return;}
  var move_history = get_move_history(mapid);
  var index = ++last_move_indices[mapid];
  while (move_history.length > index) {
    move_history.pop();
  }
  move_history[index] = move;
}

function redo_move_history(mapid) {
  var move_history = get_move_history(mapid);
  var index = last_move_indices[mapid];

  var move = move_history[index + 1];
  if (move) {
    move.redo();
    last_move_indices[mapid]++;
  }
}

function undo_move_history(mapid) {
  var move_history = get_move_history(mapid);
  var index = last_move_indices[mapid];

  var move = move_history[index];
  if (move) {
    if (index == -1) {console.log("SOMETHING WEIRD HAPPENED.  UNDOING HISTORY AT -1");}
    move.undo();
    last_move_indices[mapid]--;
  }
}

function paint_block(block_div) {
  if (!block_div.cv) {$(block_div).trigger('click');}
}

function erase_block(block_div) {
  if (block_div.cv) {$(block_div).trigger('click');}
}

function toggle_block(block_div) {
  $(block_div).trigger('click');
}

//logic for determining what squares to consider for paint_line_to
//returns array of blocks to consider
function line_candidates(from_block, to_block) {
  var x_diff = to_block[0] - from_block[0];
  var y_diff = to_block[1] - from_block[1];

  var candidates = [];

  var niters = Math.max(Math.abs(x_diff), Math.abs(y_diff))
  var xinc = Math.min(Math.abs(x_diff / y_diff), 1) * (x_diff > 0 ? 1 : -1);
  var yinc = Math.min(Math.abs(y_diff / x_diff), 1) * (y_diff > 0 ? 1 : -1);

  for (var iter = 0; iter <= niters; iter++) {
    var x_local = from_block[0] + Math.round(iter * xinc);
    var y_local = from_block[1] + Math.round(iter * yinc);
    var local_block = [x_local, y_local];
    candidates.push(local_block);
  }

  return candidates;
}

function paint_line_to(to_block, mapid) {
  var move_history = get_move_history(mapid);
  var index = last_move_indices[mapid];
  if (index < 0) {return false;}
  var move = move_history[index];
  var from_block = (move.get_last_block && move.get_last_block());
  if (!from_block) { return false; }

  var candidates = line_candidates(from_block, to_block);
  //case where line_candidates returned early

  var blocks_to_add = [];
  for (var i = 0; i < candidates.length; i++) {
    if (map_is_out(mapid)) {break;}
    var local_block = candidates[i];
    if (!is_block_there(mapid, local_block)) {
      blocks_to_add.push(local_block);
      click_block_untriggered(mapid, local_block);
    }
  }
  add_move_to_history(mapid, new BlocksDiffMove(mapid, blocks_to_add));
  return true;
};

var cur_block;
function bind_block_events() {
  $('.playable > div').unbind();

  function get_block_from_obj(block_obj) {
    var id = $(block_obj).attr('id');
    var first_comma_index = id.indexOf(',');

    var mapid = parseInt(id.slice(0, first_comma_index));
    if (is_mapeditor && (mapid == 0)) {return;} // mapeditor's uneditable map
    if (mapid !== exports.mapid ) {console.log('BUG FOUND!! NONMATCHING IDS: ' + mapid + ', ' + exports.mapid); return;}

    var block = block_from_block_string(id.slice(first_comma_index+1));
    return block;
  }

  $('.playable > div').mousemove(function(e) {
    var block = get_block_from_obj(this);
    if (!block) {return;}
    var is_there = this.cv; // note: can be undefined

    // Only attempt to add/remove blocks if you're not at the tile corner.
    var x_offset = (e.pageX - $(this).offset().left) / $(this).width();
    var y_offset = (e.pageY - $(this).offset().top) / $(this).height();
    var on_corner = ((x_offset < 0.2 || x_offset > 0.8) &&
                   (y_offset < 0.2 || y_offset > 0.8)) ;
    if (on_corner) {return;}

    if (paintkey_held) {paint_block(this);}
    if (erasekey_held) {erase_block(this);}
  });

  $('.playable > div').mouseenter(function(e) { cur_block = this; })
  $('.playable > div').mouseleave(function(e) { cur_block = null; })

  $('.playable > div').click(function(ev) {
    var block = get_block_from_obj(this);
    if (!block) {return;}
    var is_there = this.cv; // note: can be undefined
    var mapid = get_mapid();

    if (shiftkey_held) {
      // Undo previous click.  That way this is the last block clicked (if we make it that far). (2 simple clicks on same grid is always a no-op).
      if (is_there) { click_block_untriggered(mapid, block); }
      var painted = paint_line_to(block, mapid);
      return;
    }

    // unless trying to add block while out of blocks, add to history
    if (is_there || (!map_is_out(mapid))) {
      add_move_to_history(mapid, new BlocksDiffMove(mapid, [block]));
    }
  });
}
bind_block_events();

function is_block_there(mapid, block) {
  var id = id_from_block(mapid, block);
  return $("#" + id)[0].cv;
}

function click_block_untriggered(mapid, block)  {
  var id = id_from_block(mapid, block);
  var block_div = $("#" + id);
  // Only click the block if it's clickable (e.g. not a transporter/pre-placed block/checkpoint etc).
  // TODO: this stops being true for clickable blocks after placement and erase
  if (!block_div.hasClass('o')) { return; }
  grid_click(block_div[0]);
}

// NOTE: this is unused
function click_block(mapid, block)  {
  var id = id_from_block(mapid, block);
  $("#" + id).click();
}

////////////////////////////////////////////
// HOTKEYS
////////////////////////////////////////////

var MAP_SWITCH_KEY_1      = '1'
  , MAP_SWITCH_KEY_2      = '2'
  , MAP_SWITCH_KEY_3      = '3'
  , MAP_SWITCH_KEY_4      = '4'
  , MAP_SWITCH_KEY_5      = '5'
  , SAVE_KEY              = 'S'
  , LOAD_KEY              = 'L'
  , GO_KEY                = 'G'
  , RESET_KEY             = 'R'
  , TOGGLE_MUTE_KEY       = 'M'
  , TOGGLE_VALUES_KEY     = 'V'
  , REDO_KEY              = 'Y'
  , UNDO_KEY              = 'Z'
  , TOGGLE_BLOCK_KEY      = 'X'
  , PAINT_BLOCK_KEY       = 'W'
  , ERASE_KEY             = 'E'
;

var hotkeys_list = [
    {key: MAP_SWITCH_KEY_1 + '-' + MAP_SWITCH_KEY_5, action: 'Switch maps'                },
    {key: SAVE_KEY                                 , action: 'Save'                       },
    {key: LOAD_KEY                                 , action: 'Load best'                  },
    {key: GO_KEY                                   , action: 'Go! (Hold shift to animate)'},
    {key: RESET_KEY                                , action: 'Reset'                      },
    {key: TOGGLE_MUTE_KEY                          , action: 'Toggle mute'                },
    {key: TOGGLE_VALUES_KEY                        , action: 'Toggle values'              },
    {key: REDO_KEY                                 , action: 'Redo'                       },
    {key: UNDO_KEY                                 , action: 'Undo'                       },
    {key: TOGGLE_BLOCK_KEY                         , action: 'Toggle block'               },
    {key: PAINT_BLOCK_KEY                          , action: 'Wall (paint)'               },
    {key: ERASE_KEY                                , action: 'Erase (paint)'              },
    {key: 'Shift+Click'                            , action: 'Draw line to'               },
]


var hotkey_handler = {};
function register_hotkey(key, handler) {hotkey_handler[key] = handler;}
exports.register_hotkey = register_hotkey;

register_hotkey(MAP_SWITCH_KEY_1, function(e) {switch_map(1)});
register_hotkey(MAP_SWITCH_KEY_2, function(e) {switch_map(2)});
register_hotkey(MAP_SWITCH_KEY_3, function(e) {switch_map(3)});
register_hotkey(MAP_SWITCH_KEY_4, function(e) {switch_map(4)});
register_hotkey(MAP_SWITCH_KEY_5, function(e) {switch_map(5)});

register_hotkey(GO_KEY, function(e) {
  var mapid = get_mapid();
  send_solution(mapid);
  update_scores_page();
  setTimeout(update_scores_page, 300);
});

register_hotkey(RESET_KEY, function(e) {
  var mapid = get_mapid();
  reset_map(mapid);
});

register_hotkey(SAVE_KEY, function(e) {
    save_current_solution();
});

register_hotkey(LOAD_KEY, function(e) {
    var mapid = get_mapid();
    var new_solution = solution_storage.get_solution(mapid, 'best');
    load_solution(mapid, new_solution);
});

if (!is_ugli) {
register_hotkey(TOGGLE_MUTE_KEY, setMute);
}
register_hotkey(TOGGLE_VALUES_KEY, toggle_values);

register_hotkey(PAINT_BLOCK_KEY, function(e) {
    if (cur_block) {paint_block(cur_block)}
});

register_hotkey(ERASE_KEY, function(e) {
    if (cur_block) {erase_block(cur_block)}
});

register_hotkey(TOGGLE_BLOCK_KEY, function(e) {
    if (cur_block) {toggle_block(cur_block)}
});

register_hotkey(REDO_KEY, function(e) {
    redo_move_history(get_mapid());
});

register_hotkey(UNDO_KEY, function(e) {
    undo_move_history(get_mapid());
});

var shiftkey_held = false;
var controlkey_held = false;
var paintkey_held = false;
var erasekey_held = false;
$(document).bind('keyup keydown', function(e) {
  shiftkey_held = e.shiftKey;
  controlkey_held = e.ctrlKey;
  return true;
});

$(document).bind('keyup', function(e){
  if (String.fromCharCode(e.keyCode) == PAINT_BLOCK_KEY) {paintkey_held = false;}
  if (String.fromCharCode(e.keyCode) == ERASE_KEY) {erasekey_held = false;}
  return true;
});

$(document).bind('keydown', function(e){
  if (String.fromCharCode(e.keyCode) == PAINT_BLOCK_KEY) {paintkey_held = true;}
  if (String.fromCharCode(e.keyCode) == ERASE_KEY) {erasekey_held = true;}
  return true;
});

$(document).bind('keydown', function(e){
    if ($("input").is(":focus")) {return true;}
    var chr = String.fromCharCode(e.keyCode);
    var handler = hotkey_handler[chr];
    if (handler) {
      handler(e);
      refresh_score();
    };
});

function initialize_toolbar() {
  $('#mt_left_bar').remove();
  var toolbar_width = 300;

  var button_toolbar = $('<div>').attr('id',"mt_left_bar").css({
    'position' : 'absolute',
    'left' : '20px',
    'width' : toolbar_width,
    'z-index' : '41',
    'text-align' : 'center',
    'background' : '-ms-linear-gradient(top, #555555 0%,#222222 100%)',
    'background' : 'linear-gradient(to bottom, #555555 0%,#222222 100%)',
    'border-radius' : '15px',
    'box-shadow' : 'inset 0 0 0 1px #fff',
    'padding' : '8px 0px',
    'margin-top' : '21px'
  })

  if (is_ugli) {
    $('#yms').before(button_toolbar)
    setTimeout(bind_block_events, 1000);
  } else if (is_mapeditor) {
    // mapeditor
    $('#playableMapDisplay').parent().css('width', '100%');

    button_toolbar.css('position', 'static');
    button_toolbar.css('margin-left', '50px');
    button_toolbar.css('float', 'left');
    $('#playableMapDisplay').before(button_toolbar);
    $('#playableMapDisplay').css('margin-left', '50px');
    $('#playableMapDisplay').css('margin-top', '40px');
    $('#playableMapDisplay').css('float', 'left');

    $(window).click(function() {
      refresh_all();
      bind_block_events();
      setTimeout(bind_block_events, new_map_timeout); // this is apparently not enough...
    });
  } else {
    $('#difficulties').parent().css('margin-left', toolbar_width + 'px');
    $('#difficulties').parent().prepend(button_toolbar);
  }

  var show_values_button = $('<button>').attr('id',"mt_show_values").css({
    'margin': '10px 0px 20px 0px'
  })

  button_toolbar.append(show_values_button);
  show_values_button.click(toggle_values);
  update_show_values();

  /* hotkeys */

  var hotkeys_button = $('<button>').text('Hotkeys').css({ 'margin': '20px', });
  var hotkeys_dropdown = $('<table>')
  hotkeys_list.forEach(function(x) {
    hotkeys_dropdown.append($('<tr>')
      .append( $('<td>').text(x.key).css('border','1px solid white'))
      .append( $('<td>').text(x.action).css('border','1px solid white'))
    )
  })

  hotkeys_dropdown.css({
    'position': 'absolute',
    'background-color': '#000',
    'border': '1px solid white',
    'text-align': 'left',
  });
  hotkeys_button.hover(
    function(e) {
      hotkeys_dropdown.show();
    },
    function(e) {
      hotkeys_dropdown.hide();
    }
  );
  button_toolbar.append(hotkeys_button);
  button_toolbar.append(hotkeys_dropdown);
  hotkeys_dropdown.hide();

  button_toolbar.append('<br/>');
  /* solutions */

  var load_solution_input = $('<input>').attr('placeholder',"solution code");
  var load_solution_button = $('<button>').text('Load solution');
  load_solution_button.click(function() {
    var sol = JSON.parse(load_solution_input.val());
    place_solution(exports.get_mapid(), sol);
  });
  button_toolbar.append(load_solution_input).append(load_solution_button).append($('<br/>'));

  var save_solution_input = $('<input>').attr({'id':"mt_save_solution_name",'placeholder':"solution label/name (optional)"});
  var save_solution_button = $('<button>').attr('id',"mt_save_solution").text('Save solution');
  save_solution_button.click(save_current_solution);
  button_toolbar.append(save_solution_input).append(save_solution_button).append($('<br/>'));

  var solutions_list = $('<div>').attr('id',"mt_save_solution_list").css({
    'text-align': 'center',
    'border':'1px solid white',
    'margin': '5px 30px 20px 30px',
    'padding': '3px 0px',
    'width': (toolbar_width - 60) + 'px'
  })
  button_toolbar.append(solutions_list);

  if (!is_ugli) {
    function change_wall_image() {
      var url = $('#mt_change_wall_input').val();
      set_custom('wall_image', url);
      update_wall_images();
    }

    var change_wall_input = $('<input>').attr({'id':"mt_change_wall_input",'placeholder':"Image url (blank to use default)"});
    var change_wall_button = $('<button>').attr('id',"mt_change_wall").text('Set wall image');
    change_wall_button.click(change_wall_image);
    button_toolbar.append(change_wall_input).append(change_wall_button).append($('<br/>'));

    function change_rock_image() {
      var url = $('#mt_change_rock_input').val();
      set_custom('rock_image', url);
      update_rock_images();
    }

    var change_rock_input = $('<input>').attr({'id':"mt_change_rock_input" ,'placeholder':"Image url (blank to use default)"});
    var change_rock_button = $('<button>').attr('id',"mt_change_rock").text('Set rock image');
    change_rock_button.click(change_rock_image);
    button_toolbar.append(change_rock_input).append(change_rock_button).append($('<br/>'));
  }

  //var chat_iframe = $('<iframe>').attr('src', 'http://www.pathery.com/chat').css({
  //  'width':'100%','height':'400px', 'margin-top':'20px'
  //})
  //button_toolbar.append(chat_iframe);

  if (!is_ugli) {
    var chat_frame = $('<div>').addClass('chatContainer2')
                    .append($('<div>').attr('id','chatContainer').css({'height':'350px', 'overflow':'scroll'}))
                    .append(
                       $('<form>').attr({'id':'sendChat', 'onsubmit':'return false', 'height':'50px'})
                       .append($('<input>').prop('type', 'hidden').attr({ 'name':'stuff','value':'0'}))
                       .append($('<input>').addClass('chatButton').prop('type','button').attr({'id':'chatSendBtn', 'value':'Send','onclick':'sendChat()'}))
                       .append($('<input>').addClass('chatInputMessage').prop('type', 'text').attr({'id':'message', 'name':'message','maxlength':'255','autocomplete':'off'}))
                     )
                    .css({ 'width':'100%','margin-top':'20px', 'height':'400px'});
    button_toolbar.append(chat_frame);

   $.getScript(mt_url + '/src/chat.js');

    $("<link/>", { rel: "stylesheet", type: "text/css",
       href: mt_url + '/src/chat.css'
    }).appendTo("head");
  }
}


function update_rock_images() {
  if (is_ugli) {return;}
  var rock_image = get_custom('rock_image');
  if (!rock_image) {
    rock_image = 'http://www.pathery.com/images/OverlayTileFaceted50b.png';
  };
  $('.mapcell.r').css('background-image', "url(" + rock_image + ")")
}

function update_wall_images() {
  if (is_ugli) {return;}
  var wall_image = get_custom('wall_image');
  if (!wall_image) {
    setWallStyle(userObj);
    wall_image = linkEmblem(wallEmblem, wallOrientation)
  }
  $('.playable > div').each(function(x, y) {
    if (this.cv) {$(this).css('background-image', "url(" + wall_image + ")")};
  })
}


////////////////////////////////////////////
// INITIALIZE
////////////////////////////////////////////

$(document).ready(function() {

  // NOTE:  DO NOT UNCOMMENT THIS LINE
  // $(document).on('click', function() {$('.map.playable .o').css('background-image', 'url(http://24.media.tumblr.com/tumblr_lg3ynmrMvc1qcpyl1o1_400.gif)')})

  update_rock_images();
  update_wall_images();

  // make the walls unselectable
  $('.o').css('-moz-user-select','none')
         .css('-khtml-user-select', 'none')
         .css('-webkit-user-select', 'none')
         .css('-o-user-select', 'none')

  $(window).click(function() {
    refresh_score();
    setTimeout(function() {
      // trigger refresh
      get_mapid();
    }, new_map_timeout);
  });
  get_mapid();

  initialize_toolbar();

  refresh_all();
})


})(typeof exports === "undefined" ? Therapist : module.exports, Analyst)

