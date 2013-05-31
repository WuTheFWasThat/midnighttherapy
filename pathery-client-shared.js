var bm_mapid = null;
var bm_old_solution = null;

function draw_single_value(mapid, i, j, value, css) {
    var elt = $('[id="child_' + mapid + ',' + (i+1) + ',' + j + '"]');
    for (var attr in css) {
      if (css.hasOwnProperty(attr)) {
        elt.css(attr, css[attr]);
      }
    }
    elt.text(value);
}

function get_current_map_id() {
    return parseInt($('.shown-maps .grid_outer').attr('id').split(',')[0]);
}


var interval_var;

function bm_toggle() {
  if (interval_var) {
    clearInterval(interval_var);
    interval_var = null;
    $('.map .child').text('');
    $('.client_score').text('');
    $('#bm_button').text('Show values')
  } else {
    interval_var = setInterval(draw_values, 1000);
    $('#bm_button').text('Hide values')
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
  if (!$('#' + mapid + 'client_score').length) {
    var my_score = $('<span id="' + mapid + 'client_score" class="client_score"></span>');
    $('[id="' + mapid + ',dspbl"]').append(my_score);
  }
  $('#' + mapid + 'client_score').text(txt);
}

$(document).ready(function() {
  var my_button;
  if ($('#bm_button').length == 0) {
    my_button = $('<button id="bm_button">Show values</button>');
    $('#difficulties').append(my_button);
    my_button.click(bm_toggle);
  }
})

