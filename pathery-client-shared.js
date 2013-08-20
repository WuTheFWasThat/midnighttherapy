// CUSTOMIZED BLOCKS
var user_id;
var bm_customizations = {
  'www.pathery.com': {
    835: { // joy
           block: 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/images/custom/pusheen.png',
         },
    400: { // me
           block: 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/images/custom/bwlo.png',
         },
    271: { // yeuo
           block: 'http://downloads.khinsider.com/wallpaper/1280x1024/1058-everquest-002-gywvt.jpg',
         },
  },
  'defaults': {
    wall:  null, //'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/images/custom/mario_wall.png',
    block: null, //'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/images/custom/mario_block.png'
  }
}

function bm_get_custom(item) {
  if ((document.domain in bm_customizations) && (user_id in bm_customizations[document.domain])) {
    if (item in bm_customizations[document.domain][user_id]) {
      return bm_customizations[document.domain][user_id][item];
    }
  }
  return bm_customizations.defaults[item];
}

var __old_grick_click__ = grid_click;
var grid_click = function() {
  var custom_image = bm_get_custom('block');
  if (custom_image) {wallEmblem = custom_image;}
  var old_linkEmblem = linkEmblem;
  if (custom_image) { linkEmblem = function() {return wallEmblem;} }
  __old_grick_click__.apply(this, arguments);
  if (custom_image) {linkEmblem = old_linkEmblem;}
}

function bm_add_message(msg) {
  $('#difficulties').before('<center>' + msg + '</center></br>');
}

$(document).ready(function() {
  $('#topbarContent a').each(function(x, y) {
    var link = $(y);
    if (link.text() == 'Achievements') {
      user_id = parseInt(link.attr('href').split('=')[1])
      if (!((document.domain in bm_customizations) && (user_id in bm_customizations[document.domain]))) {
        //bm_add_message('<p style="font-size:15px;color:yellow">Get your own custom block and wall images!  Just tell Wu your user_id and give him image URLs.' +
        //               '<a href="https://github.com/WuTheFWasThat/midnighttherapy/tree/master/images/custom">Here</a>\'s a small selection.</p>')
      }
    }
  })

  function update_wall_images() {
    var custom_wall = bm_get_custom('wall');
    if (custom_wall) {
      $('.mapcell.r').css('background-image', "url(" + custom_wall + ")")
    };
  }
  update_wall_images();

  function update_block_images() {
    var custom_image = bm_get_custom('block');
    if (custom_image) {
      $('.playable > div').each(function(x, y) {
        if (this.cv) {$(this).css('background-image', "url(" + custom_image + ")")};
      })
    }
  }
  update_block_images();

  $('.o').css('-moz-user-select','none')
         .css('-khtml-user-select', 'none')
         .css('-webkit-user-select', 'none')
         .css('-o-user-select', 'none')
});

// END CUSTOMIZED BLOCKS

// TODO:  DO NOT UNCOMMENT THIS LINE
// $(document).on('click', function() {$('.map.playable .o').css('background-image', 'url(http://24.media.tumblr.com/tumblr_lg3ynmrMvc1qcpyl1o1_400.gif)')})

// CREDIT TO:  http://stackoverflow.com/questions/1866717/document-createelementscript-adding-two-scripts-with-one-callback
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

loadScripts([
   "http://html2canvas.hertzen.com/build/html2canvas.js"
],function() {

(function(exports,
          get_values,
          get_value) {

  exports.mapid = null;

  var last_get_values_time = Date.now();
  var get_values_interval = 500;
  var load_best_timeout = 500;
  var new_mapid_timeout = 100;
  var draw_values_var = null;

  function draw_values() {
      var mapid = exports.get_current_mapid();

      var time = Date.now();

      // nullify any other pending request
      clearTimeout(draw_values_var);

      // Don't draw values if get_values_interval hasn't elapsed since the last request sent
      if (time - last_get_values_time < get_values_interval) {
        draw_values_var = setTimeout(draw_values, get_values_interval);
      } else {
        last_get_values_time = time;
        get_values(mapid,
            function(old_mapid) {
              return function(result) {
                var value  = result.value;
                var values_list  = result.values_list;
	            var maxValue = Math.max.apply(Math, values_list.map(function(x) { return (x.hasOwnProperty('val') && !isNaN(x.val) && !x.blocking ? x.val : -1); }));
                for (var k in values_list) {
                  var values_dict = values_list[k];
                  draw_single_value(old_mapid, values_dict.i, values_dict.j, values_dict.val, values_dict.blocking, maxValue);
                }
              }
            } (mapid)
        )
      }
  }

  function refresh_score() {
    var mapid = exports.get_current_mapid();
    get_value(mapid, function(values) {
      write_score_value(values);
    })
    if (show_values) {
      draw_values();
    }
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
      } else if (!isNaN(value) && value > 0) {
	    //useful squares
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

  // also updates the current mapid
  exports.get_current_mapid = function() {
      var old_mapid = exports.mapid;
      var outer_grid = $('.shown-maps .grid_outer');
      if (outer_grid.length > 0) {
        exports.mapid =  parseInt(outer_grid.attr('id').split(',')[0]);
      } else {
        exports.mapid = -1;
      }

      if (old_mapid !== exports.mapid) {refresh_all();}

      return exports.mapid;
  }

  var show_values;

  exports.toggle_values = function() {
    if (show_values) {
      show_values = false;
      $('.map .child').text('');
      $('#bm_show_values').text('Show values')
    } else {
      show_values = true;
      $('#bm_show_values').text('Hide values')
    }
  }

  function get_score_total(values) {
    var sum = 0;
    for (var i in values) {
      if (values[i] == null) {values[i] = NaN;}
      sum = sum + values[i];
    }
    return sum;
  }

  function write_score_value(values) {
    var sum = get_score_total(values);

    var txt = ''
    if (values.length > 1) {
      txt = values.join(' + ') + ' = ';
    }

    if (isNaN(sum)) {
      txt += 'Path blocked!';
    } else {
      txt += sum + ' moves';
    }
    $('#' + exports.mapid + '\\,dspCount').text(txt);
  }

  /////////////////////////////////////////////
  // SOLUTION SAVING
  /////////////////////////////////////////////

  //////////////////
  // html5 storage
  //////////////////

  function PatheryHTML5Storage() {
  }

  PatheryHTML5Storage.prototype.add_solution = function(mapid, solution, name) {
    var map_storage;
    if (localStorage['pathery' + '.' + mapid] === undefined) {
      map_storage = {};
    } else {
      map_storage = JSON.parse(localStorage['pathery' + '.' + mapid]);
    }
    map_storage[name] = true;
    localStorage['pathery' + '.' + mapid] = JSON.stringify(map_storage);
    localStorage['pathery' + '.' + mapid + '.' + name] = JSON.stringify(solution);
  }

  PatheryHTML5Storage.prototype.get_solution = function(mapid, name) {
    return JSON.parse(localStorage['pathery' + '.' + mapid + '.' + name])
  }

  PatheryHTML5Storage.prototype.get_solutions = function(mapid) {
    var solutions = {};

    if (localStorage['pathery' + '.' + mapid] !== undefined) {
      var map_storage = JSON.parse(localStorage['pathery' + '.' + mapid]);
      for (var name in map_storage) {
        solutions[name] = JSON.parse(localStorage['pathery' + '.' + mapid + '.' + name]);
      }
    }
    return solutions;
  }

  PatheryHTML5Storage.prototype.delete_solution = function(mapid, name) {
    var map_storage = JSON.parse(localStorage['pathery' + '.' + mapid]);
    delete map_storage[name];
    localStorage['pathery' + '.' + mapid] = JSON.stringify(map_storage);

    delete localStorage['pathery' + '.' + mapid + '.' + name]
  }

  PatheryHTML5Storage.prototype.clear_all = function(mapid, name) {
    for (var k in localStorage) {
      if (k.slice(0, 7) == 'pathery') {
        delete localStorage[k];
      }
    }
  }

  /////////////////////
  // GENERAL UTILITIES
  /////////////////////

  // from div id to my representation of block
  function id_from_block(mapid, block) {
    var x = block[0] + 1;
    var y = block[1];
    var id = mapid + ',' + x + ',' + y;
    return id;
  }

  // from my representation of block to pathery's 'x,y' representation
  function block_from_block_string(block_string) {
    var string_coordinates = block_string.split(',');
    var x = parseInt(string_coordinates[0]) - 1;
    var y = parseInt(string_coordinates[1]);
    var block = [x, y];
    return block;
  }

  // are we out of walls?
  function map_is_out(mapid) {
    return (mapdata[mapid].usedWallCount < 1);
  }

  //////////////////
  // regular storage
  //////////////////

  function PatheryJSStorage() {
    this.storage =  {};
  }

  PatheryJSStorage.prototype.add_solution = function(mapid, solution, name) {
    if (this.storage[mapid] === undefined) {
      this.storage[mapid] = {};
    }
    this.storage[mapid][name] = solution;
  }

  PatheryJSStorage.prototype.get_solution = function(mapid, name) {
    return this.storage[mapid][name];
  }

  PatheryJSStorage.prototype.get_solutions = function(mapid) {
    if (this.storage[mapid] !== undefined) {
      return this.storage[mapid];
    } else {
      return {};
    }
  }

  PatheryJSStorage.prototype.delete_solution = function(mapid, name) {
    delete this.storage[mapid][name];
  }

  exports.get_current_solution = function() {
    var mapid = exports.get_current_mapid();
    var solution_string = solution[mapid];
    var solution_block_strings = solution_string.split('.').slice(1, -1);
    var blocks = [];
    for (var k in solution_block_strings) {
      var block = block_from_block_string(solution_block_strings[k]);
      blocks.push(block);
    }
    return blocks;
  }

  function supports_HTML5_Storage() {
    return (typeof(Storage) !== undefined);
  }

  var solution_storage;

  if (!supports_HTML5_Storage()) {
    bm_add_message('<p style="font-size:15px;color:yellow">Your browser doesn\'t support HTML5 local storage, so your solutions will not be remembered upon refresh.</p>')
    solution_storage = new PatheryJSStorage();
  }  else {
    solution_storage = new PatheryHTML5Storage();
  }

  // TODO: auto-save best
  // TODO: clear solutions for past maps?
  exports.save_current_solution = function() {
    var mapid = exports.get_current_mapid();
    var solution = exports.get_current_solution();
    var name = $('#bm_save_solution_name').val();
    $('#bm_save_solution_name').val('');

    function add_solution() {
      solution_storage.add_solution(mapid, solution, name);
      refresh_solution_store_display();
    }

    if (!name) {
      get_value(mapid, function(values) {
        name = '' + get_score_total(values);
        var existing_names = solution_storage.get_solutions(mapid);
        if (name in existing_names) {
          var suffix = 'a';
          var suffix_name = name + '.' + suffix;
          while (suffix_name in existing_names) {
            suffix = String.fromCharCode(suffix.charCodeAt(0) + 1)
            var suffix_name = name + '.' + suffix;
          }
          name = suffix_name;
        }
        add_solution();
      })
    } else {
      add_solution();
    }

  }

  function place_solution(mapid, solution) {
    clearwalls(mapid);
    for (var i in solution) {
      var block = solution[i];
      click_block_untriggered(mapid, block);
    }
  }

  exports.load_solution = function(mapid, new_solution) {
    var cur_solution = exports.get_current_solution();
    place_solution(mapid, new_solution);
    add_move_to_history(mapid, new ChangeBoardMove(mapid, cur_solution, new_solution))
  }

  function refresh_solution_store_display() {
    var mapid = exports.get_current_mapid();

    //var current_solution = exports.get_current_solution();

    var store = solution_storage.get_solutions(mapid);
    $('#bm_save_solution_list').empty();
    for (var name in store) {
      var solution = store[name];
      //exports.load_solution(mapid, solution);
      var solution_el = $('<div>' + name + '</div>')

      var load_button = $('<button> Load </button>')
      load_button.data('solution', solution)
      load_button.click(function() {
        var solution = $(this).data('solution');
        exports.load_solution(mapid, solution);

      })
      solution_el.append(load_button);

      var delete_button = $('<button> Delete </button>')
      delete_button.data('name', name)
      delete_button.data('mapid', mapid)
      delete_button.click(function() {
        var name = $(this).data('name');
        var mapid = $(this).data('mapid');
        if (window.confirm("Are you sure?")) {
          solution_storage.delete_solution(mapid, name);
          refresh_solution_store_display();
        }
      })
      solution_el.append(delete_button);

      $('#bm_save_solution_list').append(solution_el);

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
    //exports.load_solution(mapid, current_solution);
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

  // TODO: make this work for built-in Reset and load-Best
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

  function paint_line(block_div) {
    var id = $(block_div).attr('id');
    var first_comma_index = id.indexOf(',');
    var mapid = parseInt(id.slice(0, first_comma_index));
    if (mapid !== exports.mapid ) {return console.log('BUG FOUND!! NONMATCHING IDS: ' + mapid + ', ' + exports.mapid);}

    if (map_is_out(mapid)) {
      return;
    }

    var block = block_from_block_string(id.slice(first_comma_index+1));
    var is_there = this.cv; // note: can be undefined

    var move_history = get_move_history(mapid);
    var index = last_move_indices[mapid];
    if (index < 0) return;
    var move = move_history[index];
    if (!(move instanceof BlocksDiffMove)) {
      return;
    }

    var from_block = move.blocks.slice(-1)[0];
    var x_diff = block[0] - from_block[0];
    var y_diff = block[1] - from_block[1];
    var x_sign = (x_diff > 0) ? 1 : ((x_diff < 0) ? -1 : 0);
    var y_sign = (y_diff > 0) ? 1 : ((y_diff < 0) ? -1 : 0);

    // Cannot paint a line if block and from_block are identical.
    if (x_diff == 0 && y_diff == 0) {
      return;
    }

    // For now, only allow painting of horizontal, vertical, or diagonal lines.
    if (Math.abs(x_diff) != Math.abs(y_diff) && x_diff != 0 && y_diff != 0) {
      return;
    }

    var blocks_to_add = [];
    for (var iter = 1; iter <= Math.max(Math.abs(x_diff), Math.abs(y_diff)) && !map_is_out(mapid); iter++) {
      var x_local = from_block[0] + (x_sign * iter);
      var y_local = from_block[1] + (y_sign * iter);
      var local_block = [x_local, y_local];

      if (!is_block_there(mapid, local_block)) {
        blocks_to_add.push([x_local, y_local]);
        click_block_untriggered(mapid, [x_local, y_local]);
      }
    }
    add_move_to_history(mapid, new BlocksDiffMove(mapid, blocks_to_add));
  };

  function erase_line(block_div) {
    // TODO(joy): implement this
    console.log('implement this');
  };

  $('.playable > div').mousemove(function(e) {
    var id = $(this).attr('id');
    var first_comma_index = id.indexOf(',');

    var mapid = parseInt(id.slice(0, first_comma_index));
    if (mapid !== exports.mapid ) {return console.log('BUG FOUND!! NONMATCHING IDS: ' + mapid + ', ' + exports.mapid);}

    var block = block_from_block_string(id.slice(first_comma_index+1));
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

  var cur_block;
  $('.playable > div').mouseenter(function(e) {
    cur_block = this;
  })
  $('.playable > div').mouseleave(function(e) {
    cur_block = null;
  })

  $('.playable > div').click(function() {
    var id = $(this).attr('id');
    var first_comma_index = id.indexOf(',');

    var mapid = parseInt(id.slice(0, first_comma_index));
    if (mapid !== exports.mapid ) {return console.log('BUG FOUND!! NONMATCHING IDS: ' + mapid + ', ' + exports.mapid);}

    var block = block_from_block_string(id.slice(first_comma_index+1));
    var is_there = this.cv; // note: can be undefined

    if (shiftkey_held && is_there) {
      // Undo previous click. (2 simple clicks on same grid is always a no-op).
      click_block_untriggered(mapid, block);
      paint_line(this);
      return;
    }

    if (controlkey_held && !is_there) {
      // Undo previous click. (2 simple clicks on same grid is always a no-op).
      click_block_untriggered(mapid, block);
      erase_line(this);
      return;
    }

    // unless trying to add block while out of blocks, add to history
    if (is_there || (!map_is_out(mapid))) {
      add_move_to_history(mapid, new BlocksDiffMove(mapid, [block]));
    }
  });

  function is_block_there(mapid, block) {
    var id = id_from_block(mapid, block);
    return $("[id='" + id + "']").cv;
  }

  function click_block_untriggered(mapid, block)  {
    var id = id_from_block(mapid, block);
    grid_click($("[id='" + id + "']")[0]);
  }

  function click_block(mapid, block)  {
    var id = id_from_block(mapid, block);
    $("[id='" + id + "']").click();
  }

  ////////////////////////////////////////////
  // HOTKEYS
  ////////////////////////////////////////////

  var MAP_SWITCH_KEY_1  = '1'
    , MAP_SWITCH_KEY_2  = '2'
    , MAP_SWITCH_KEY_3  = '3'
    , MAP_SWITCH_KEY_4  = '4'
    , MAP_SWITCH_KEY_5  = '5'
    , SAVE_KEY          = 'S'
    , LOAD_KEY          = 'L'
    , GO_KEY            = 'G'
    , RESET_KEY         = 'R'
    , MUTE_KEY          = 'M'
    , TOGGLE_VALUES_KEY = 'V'
    , REDO_KEY          = 'Y'
    , UNDO_KEY          = 'Z'
    , TOGGLE_BLOCK_KEY  = 'X'
    , PAINT_BLOCK_KEY   = 'W'
    , ERASE_KEY         = 'E'
  ;

  var hotkeys_text =
    '<table style="border:1px solid black; text-align: left;">' +
    // TODO:
    '<tr><td>' + MAP_SWITCH_KEY_1 + '-' + MAP_SWITCH_KEY_5 + '</td><td>' + 'Switch maps'    + '</td></tr>' +
    '<tr><td>' + SAVE_KEY                                  + '</td><td>' + 'Save'           + '</td></tr>' +
    '<tr><td>' + LOAD_KEY                                  + '</td><td>' + 'Load best'      + '</td></tr>' +
    '<tr><td>' + GO_KEY                                    + '</td><td>' + 'Go!'            + '</td></tr>' +
    '<tr><td>' + RESET_KEY                                 + '</td><td>' + 'Reset'          + '</td></tr>' +
    '<tr><td>' + MUTE_KEY                                  + '</td><td>' + 'Toggle mute'    + '</td></tr>' +
    '<tr><td>' + TOGGLE_VALUES_KEY                         + '</td><td>' + 'Toggle values'  + '</td></tr>' +
    '<tr><td>' + REDO_KEY                                  + '</td><td>' + 'Redo'           + '</td></tr>' +
    '<tr><td>' + UNDO_KEY                                  + '</td><td>' + 'Undo'           + '</td></tr>' +
    '<tr><td>' + TOGGLE_BLOCK_KEY                          + '</td><td>' + 'Toggle block'   + '</td></tr>' +
    '<tr><td>' + PAINT_BLOCK_KEY                           + '</td><td>' + 'Wall (paint)'   + '</td></tr>' +
    '<tr><td>' + ERASE_KEY                                 + '</td><td>' + 'Erase (paint)'  + '</td></tr>' +
    '</table>';

  function switch_map(map_num) {
    showStats(map_num);
    refresh_all();
  }

  var hotkey_handler = {};

  hotkey_handler[MAP_SWITCH_KEY_1] = function(e) {switch_map(1)};
  hotkey_handler[MAP_SWITCH_KEY_2] = function(e) {switch_map(2)};
  hotkey_handler[MAP_SWITCH_KEY_3] = function(e) {switch_map(3)};
  hotkey_handler[MAP_SWITCH_KEY_4] = function(e) {switch_map(4)};
  hotkey_handler[MAP_SWITCH_KEY_5] = function(e) {switch_map(5)};

  hotkey_handler[GO_KEY] = function(e) {
      doSend(exports.mapid);
  };

  hotkey_handler[RESET_KEY] = function(e) {
      var old_solution = exports.get_current_solution();
      var mapid = exports.get_current_mapid();
      add_move_to_history(mapid, new ChangeBoardMove(mapid, old_solution, []))
      clearwalls(exports.mapid);
  };

  hotkey_handler[SAVE_KEY] = function(e) {
      exports.save_current_solution();
  };

  hotkey_handler[LOAD_KEY] = function(e) {
      var old_solution = exports.get_current_solution();
      var mapid = exports.get_current_mapid();
      requestSol(exports.mapid);
      // TODO: this doesn't work
      var new_solution = exports.get_current_solution();
      add_move_to_history(mapid, new ChangeBoardMove(mapid, old_solution, new_solution))
      setTimeout(refresh_score, load_best_timeout);
  };

  hotkey_handler[MUTE_KEY] = function(e) {
      setMute();
  };

  hotkey_handler[TOGGLE_VALUES_KEY] = function(e) {
      exports.toggle_values();
  };

  hotkey_handler[PAINT_BLOCK_KEY] = function(e) {
      if (cur_block) {paint_block(cur_block)}
  };

  hotkey_handler[ERASE_KEY] = function(e) {
      if (cur_block) {erase_block(cur_block)}
  };

  hotkey_handler[TOGGLE_BLOCK_KEY] = function(e) {
      if (cur_block) {toggle_block(cur_block)}
  };

  hotkey_handler[REDO_KEY] = function(e) {
      redo_move_history(exports.get_current_mapid());
  };

  hotkey_handler[UNDO_KEY] = function(e) {
      undo_move_history(exports.get_current_mapid());
  };

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
      if ($("#bm_save_solution_name").is(":focus")) {return true;}
      var chr = String.fromCharCode(e.keyCode);
      var handler = hotkey_handler[chr];
      if (handler) {
        handler(e)
        refresh_score();
      };
  });


  ////////////////////////////////////////////
  // INITIALIZE
  ////////////////////////////////////////////

  $(document).ready(function() {

    $(window).click(function() {
      refresh_score();
      setTimeout(function() {
        // trigger refresh
        exports.get_current_mapid();
      }, new_mapid_timeout);
    });
    exports.get_current_mapid();



    $('#difficulties').parent().css('margin-left', '300px');

    if ($('#bm_left_bar').length == 0) {
      var button_toolbar = $('<div id="bm_left_bar" style="position:absolute; left:50px; width:275px; text-align:center; background: -ms-linear-gradient(top, #555555 0%,#222222 100%); background: linear-gradient(to bottom, #555555 0%,#222222 100%); border-radius: 15px; box-shadow: inset 0 0 0 1px #fff; padding: 8px 0px; margin-top: 21px"></div>')
      $('#difficulties').after(button_toolbar);

      var show_values_button = $('<button id="bm_show_values">Show values</button>');
      show_values = false;
      button_toolbar.append(show_values_button);
      show_values_button.click(exports.toggle_values);

      button_toolbar.append('<br/>');
      button_toolbar.append('<br/>');

      if (!is_full) {
        show_values_button.click();
      }

      var save_solution_input = $('<input id="bm_save_solution_name" placeholder="solution label/name (optional)">');
      button_toolbar.append(save_solution_input);
      var save_solution_button = $('<button id="bm_save_solution">Save solution</button>');
      button_toolbar.append(save_solution_button);
      save_solution_button.click(exports.save_current_solution);

      //var clear_solutions_button = $('<button id="bm_clear_solution">Clear solution</button>');
      //button_toolbar.append(clear_solution_button);

      var solutions_list = $('<div id="bm_save_solution_list" style="text-align:center; border:1px solid white; margin: 5px 30px; padding: 3px 0px; width: 200px;"></div>')
      button_toolbar.append(solutions_list);

      button_toolbar.append('<br/>');
      button_toolbar.append('<br/>');

      var hotkeys_button = $('<button id="bm_show_hotkeys">Hotkeys</button>');
      var hotkeys_dropdown = $('<p id="bm_hotkeys_text" style="display:none; position: relative; text-align: left; font-family: Courier">' + hotkeys_text + '</p>');
      hotkeys_button.hover(
        function(e) {
          hotkeys_dropdown.show();
        },
        function(e) {
          hotkeys_dropdown.hide();
        }
      );
      button_toolbar.append(hotkeys_button);
      hotkeys_button.append(hotkeys_dropdown);
      hotkeys_dropdown.hide();


    }
    refresh_solution_store_display();

  })

})(typeof exports === "undefined" ? (window.PatheryAssist={}, window.PatheryAssist) : module.exports, bm_get_values, bm_get_value)

});

