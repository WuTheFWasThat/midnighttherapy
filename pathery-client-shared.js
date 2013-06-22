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

$(document).ready(function() {
  $(window).click(function() {
    bm_mapid = get_current_map_id();
  });
  bm_mapid = get_current_map_id();

  if ($('#bm_button_toolbar').length == 0) {
    var button_toolbar = $('<div id="bm_button_toolbar" style="text-align: center"></div>');
    $('#difficulties').after(button_toolbar);

    var show_values_button = $('<button id="bm_show_values">Show values</button>');
    button_toolbar.append(show_values_button);
    show_values_button.click(bm_toggle);
  }
})

