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

  function draw_values() {
      var mapid = exports.get_current_mapid();
  
      get_values(mapid, 
          function(old_mapid) {
            return function(result) {
              var value  = result.value;
              var values_list  = result.values_list;
  
              for (var k in values_list) {
                var values_dict = values_list[k];
                draw_single_value(old_mapid, values_dict.i, values_dict.j, values_dict.val, values_dict.blocking);
              }
            }
          } (mapid)
      )
  }
  
  function refresh_score() {
    var mapid = exports.get_current_mapid();
    get_value(mapid, function(values) {
      write_score_value(values);
    })
  };

  function draw_single_value(mapid, i, j, value, blocking) {
      var elt = $('#child_' + mapid + '\\,' + (i+1) + '\\,' + j);
      var css;
      if (blocking) {
        css = {'color': 'white',
               'text-align': 'center'
              };
      } else {
        css = {'color': 'black',
               'text-align': 'center'
              };
      }
      for (var attr in css) {
        if (css.hasOwnProperty(attr)) {
          elt.css(attr, css[attr]);
        }
      }
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
  
  var interval_var;
  
  exports.toggle_values = function() {
    if (interval_var) {
      clearInterval(interval_var);
      interval_var = null;
      $('.map .child').text('');
      $('.client_score').text('');
      $('#bm_show_values').text('Show values')
    } else {
      // TODO: do something more intelligent
      draw_values();
      interval_var = setInterval(draw_values, 2000);
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
    if (!$('#' + exports.mapid + 'client_score').length) {
      var my_score = $('<span id="' + exports.mapid + 'client_score" class="client_score"></span>');
      $('[id="' + exports.mapid + ',dspbl"]').append(my_score);
    }
    $('#' + exports.mapid + 'client_score').text(txt);
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
    alert('Your browser doesn\'t support HTML5 local storage, so your solutions will not be remembered upon refresh.');
    solution_storage = new PatheryJSStorage();
  }  else {
    solution_storage = new PatheryHTML5Storage();
  }
  
  // TODO: auto-save best
  // TODO: clear solutions for past maps?
  // TODO: prevent local-storage collision on beta sites?
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
  
  
  $('.playable > div').click(function() {
    var id = $(this).attr('id');
    var first_comma_index = id.indexOf(',');
    var mapid = parseInt(id.slice(0, first_comma_index));
  
    if (mapid !== exports.mapid ) {
      console.log('BUG FOUND!! NONMATCHING IDS: ' + mapid + ', ' + exports.mapid)
      return;
    }
  
    var block = block_from_block_string(id.slice(first_comma_index+1));
    var is_there = this.cv; // note: can be undefined

    if (shiftkey_held) {
      var move_history = get_move_history(mapid);
      var index = last_move_indices[mapid];
      var move = move_history[index];
      if (move instanceof BlocksDiffMove) {
        var from_block = move.blocks.slice(-1)[0];
        // TODO: this is a bit annoying... dealing with case where running out of walls, and being able to undo properly, hard to use just clidcks
        console.log('DRAW LINE')
        console.log(from_block)
        console.log(block)
        return;
      }
    }
  
    // unless trying to add block while out of blocks, add to history
    if (is_there || (!map_is_out(mapid))) {
      add_move_to_history(mapid, new BlocksDiffMove(mapid, [block]));
    }
  })
  
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
  
  var hotkeys_text = 
    // TODO:
    //'x: place'     + '<br/>' +
    '1-5: switch maps' + '<br/>' + 
    's:   save'           + '<br/>' +
    'l:   load'           + '<br/>' +
    'g:   Go!'            + '<br/>' +
    'r:   Reset'          + '<br/>' +
    'v:   Toggle values'  + '<br/>' +
    'y:   Redo'           + '<br/>' + 
    'z:   Undo'           + '<br/>' 
  ;
  
  function switch_map(map_num) {
    showStats(map_num);
    refresh_all();
  }

  var hotkey_handler = {
    '1' : function(e) {switch_map(1)},
    '2' : function(e) {switch_map(2)},
    '3' : function(e) {switch_map(3)},
    '4' : function(e) {switch_map(4)},
    '5' : function(e) {switch_map(5)},
    'G' : function(e) {
      doSend(exports.mapid);
    },
    'R' : function(e) {
      var old_solution = exports.get_current_solution();
      var mapid = exports.get_current_mapid();
      add_move_to_history(mapid, new ChangeBoardMove(mapid, old_solution, []))
      clearwalls(exports.mapid); 
    },
    'S' : function(e) {
      save_current_solution();
    },
    'L' : function(e) {
      var old_solution = exports.get_current_solution();
      var mapid = exports.get_current_mapid();
      requestSol(exports.mapid);
      // TODO: this doesn't work
      var new_solution = exports.get_current_solution();
      add_move_to_history(mapid, new ChangeBoardMove(mapid, old_solution, new_solution))
    },
    'V' : function(e) {
      exports.toggle_values();
    },
    'Y' : function(e) {
      redo_move_history(exports.get_current_mapid());
    },
    'Z' : function(e) {
      undo_move_history(exports.get_current_mapid());
    }
  }

  var shiftkey_held = false;
  $(document).bind('keyup keydown', function(e){shiftkey_held = e.shiftKey; return true;} );
  
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
      }, 100);
    });
    exports.get_current_mapid();
  
    if ($('#bm_top_toolbar').length == 0) {
      var button_toolbar = $('<div id="bm_top_toolbar" style="text-align: center"></div>');
      $('#difficulties').after(button_toolbar);
  
      var show_values_button = $('<button id="bm_show_values">Show values</button>');
      button_toolbar.append(show_values_button);
      show_values_button.click(exports.toggle_values);
  
      if (!is_full) {
        show_values_button.click();
      }
  
      var hotkeys_button = $('<button id="bm_show_hotkeys">Hotkeys</button>');
      var hotkeys_dropdown = $('<p id="bm_hotkeys_text" style="display:none; position: relative; border:1px solid #000; text-align: left; font-family: Courier">' + hotkeys_text + '</p>');
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
    }
  
    $('#difficulties').parent().css('margin-left', '300px');
  
    if ($('#bm_left_bar').length == 0) {
      //var left_toolbar = $('<div id="bm_left_bar" style="text-align: center"></div>');
      //$('#bm_top_toolbar').after(left_toolbar);
      var left_toolbar = $('<div id="bm_left_bar" style="position:absolute; left:50px; width:250px; text-align:center"></div>')
      $('#bm_top_toolbar').after(left_toolbar);
  
      var save_solution_input = $('<input id="bm_save_solution_name" placeholder="solution label/name (optional)">');
      left_toolbar.append(save_solution_input);
      var save_solution_button = $('<button id="bm_save_solution">Save solution</button>');
      left_toolbar.append(save_solution_button);
      save_solution_button.click(exports.save_current_solution);
  
      //var clear_solutions_button = $('<button id="bm_clear_solution">Clear solution</button>');
      //left_toolbar.append(clear_solution_button);
      
      var solutions_list = $('<div id="bm_save_solution_list" style="text-align:center; border:1px solid white;"></div>')
      left_toolbar.append(solutions_list);
  
    }
    refresh_solution_store_display();
  
  })

})(typeof exports === "undefined" ? (window.PatheryAssist={}, window.PatheryAssist) : module.exports, bm_get_values, bm_get_value)

});

