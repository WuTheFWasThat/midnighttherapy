var bm_mapid = null;
var bm_old_solution = null;

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

function get_current_map_id() {
    var outer_grid = $('.shown-maps .grid_outer');
    if (outer_grid.length > 0) {
      return parseInt(outer_grid.attr('id').split(',')[0]);
    } else {
      return -1;
    }
}

var interval_var;

function bm_toggle() {
  if (interval_var) {
    clearInterval(interval_var);
    interval_var = null;
    $('.map .child').text('');
    $('.client_score').text('');
    $('#bm_show_values').text('Show values')
  } else {
    interval_var = setInterval(draw_values, 1000);
    $('#bm_show_values').text('Hide values')
  }
  bm_old_solution = null;
}

function write_score_value(values) {
  var sum = 0;
  for (var i in values) {
    if (values[i] == null) {values[i] = NaN;}
    sum = sum + values[i];
  }

  var txt = ''
  if (values.length > 1) {
    txt = values.join(' + ') + ' = ';
  }

  if (isNaN(sum)) {
    txt += 'Path blocked!';
  } else {
    txt += sum + ' moves';
  }
  if (!$('#' + bm_mapid + 'client_score').length) {
    var my_score = $('<span id="' + bm_mapid + 'client_score" class="client_score"></span>');
    $('[id="' + bm_mapid + ',dspbl"]').append(my_score);
  }
  $('#' + bm_mapid + 'client_score').text(txt);
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

//////////////////

function get_current_solution() {
  var mapid = get_current_map_id();
  var solution_string = solution[mapid];
  var solution_block_strings = solution_string.split('.').slice(1, -1);
  var blocks = [];
  for (var k in solution_block_strings) {
    var string_coordinates = solution_block_strings[k].split(',');
    var x = parseInt(string_coordinates[0]) - 1;
    var y = parseInt(string_coordinates[1]);
    blocks.push([x, y]);
  }
  console.log(blocks)
  return blocks;
}

function supports_HTML5_Storage() {
  return (typeof(Storage) !== undefined);
}

var bm_solution_storage;

if (!supports_HTML5_Storage()) {
  alert('Your browser doesn\'t support HTML5 local storage, so your solutions will not be remembered upon refresh.');
  bm_solution_storage = new PatheryJSStorage();
}  else {
  bm_solution_storage = new PatheryHTML5Storage();
}

function save_current_solution() {
  var mapid = get_current_map_id();
  var solution = get_current_solution();
  var name = $('#bm_save_solution_name').val();
  bm_solution_storage.add_solution(mapid, solution, name);
  refresh_solution_store_display();
}

function refresh_solution_store_display() {
  var mapid = get_current_map_id();
  var store = bm_solution_storage.get_solutions(mapid);
  $('#bm_save_solution_list').empty();
  for (var name in store) {
    var solution = store[name];
    var solution_el = $('<li>' + name + '</li>')

    var load_button = $('<button> Load </button>')
    load_button.data('solution', solution)
    load_button.click(function() {
      var solution = $(this).data('solution');
      clearwalls(mapid);
      for (var i in solution) {
        var block = solution[i];
        var x = block[0] + 1; 
        var y = block[1]; 
        var id = mapid + ',' + x + ',' + y;
        $("[id='" + id + "']").click();
      }
    })
    solution_el.append(load_button);

    var delete_button = $('<button> Delete </button>')
    delete_button.data('name', name)
    delete_button.data('mapid', mapid)
    delete_button.click(function() {
      var name = $(this).data('name');
      var mapid = $(this).data('mapid');
      if (window.confirm("Are you sure?")) {
        bm_solution_storage.delete_solution(mapid, name);
        refresh_solution_store_display();
      }
    })
    solution_el.append(delete_button);

    $('#bm_save_solution_list').append(solution_el);
  }
}

////////////////////////////////////////////
// INITIALIZE
////////////////////////////////////////////

$(document).ready(function() {
  $(window).click(function() {
    // TODO: this is a bit of a hack..
    setTimeout(function() {
      var old_bm_mapid = bm_mapid;
      bm_mapid = get_current_map_id();
      console.log(old_bm_mapid, bm_mapid)
      if (old_bm_mapid !== bm_mapid) {
        refresh_solution_store_display();
      }
    }, 100);
  });
  bm_mapid = get_current_map_id();

  if ($('#bm_button_toolbar').length == 0) {
    var button_toolbar = $('<div id="bm_button_toolbar" style="text-align: center"></div>');
    $('#difficulties').after(button_toolbar);

    var show_values_button = $('<button id="bm_show_values">Show values</button>');
    button_toolbar.append(show_values_button);
    show_values_button.click(bm_toggle);
  }

  $('#difficulties').parent().css('margin-left', '250px');

  if ($('#saved_solutions').length == 0) {
    //var solutions_toolbar = $('<div id="saved_solutions" style="text-align: center"></div>');
    //$('#bm_button_toolbar').after(solutions_toolbar);
    var solutions_toolbar = $('<div id="saved_solutions" style="position:absolute; left:50px; width:150px; text-align:center"></div>')
    $('#bm_button_toolbar').after(solutions_toolbar);

    var save_solution_input = $('<input id="bm_save_solution_name" placeholder="solution label/name">');
    solutions_toolbar.append(save_solution_input);
    var save_solution_button = $('<button id="bm_save_solution">Save solution</button>');
    solutions_toolbar.append(save_solution_button);
    save_solution_button.click(save_current_solution);

    //var clear_solutions_button = $('<button id="bm_clear_solution">Clear solution</button>');
    //solutions_toolbar.append(clear_solution_button);
    
    var solutions_list = $('<div id="bm_save_solution_list" style="text-align:center; border:1px solid white;"></div>')
    solutions_toolbar.append(solutions_list);

  }
  refresh_solution_store_display();

})

