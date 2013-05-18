var bm_mapid = null;
var bm_old_solution = null;

function draw_single_value(mapid, i, j, value, css) {
    if (Math.abs(value) > 200000000) {
      value = '';
    }
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

function draw_values() {
    bm_mapid = get_current_map_id();

    if (bm_old_solution == solution[bm_mapid]) {
      return;
    }

    bm_old_solution = solution[bm_mapid];

    $.post('http://127.0.0.1:2222/compute_values', 
          {'mapcode': mapdata[bm_mapid].code, 'solution': solution[bm_mapid]}, 
          function(old_mapid, old_solution) {
            return function(result) {
              if (bm_old_solution != old_solution) {
                return;
              }

              result = JSON.parse(result);
              var value  = result.value;
              var values_list  = result.values_list;

              for (var k in values_list) {
                var values_dict = values_list[k];
                draw_single_value(old_mapid, values_dict.i, values_dict.j, values_dict.val, values_dict.css);
              }
            }
          } (bm_mapid, bm_old_solution)
    )
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

function write_score_value(value) {
  if (parseInt(value) < 0) {
    value = 'Path blocked!';
  } else {
    value = value + ' moves';
  }
  if (!$('#' + mapid + 'client_score').length) {
    var my_score = $('<span id="' + mapid + 'client_score" class="client_score"></span>');
    $('[id="' + mapid + ',dspbl"]').append(my_score);
  }
  $('#' + mapid + 'client_score').text(value);
}

$(document).ready(function() {
  var my_button;
  if ($('#bm_button').length == 0) {
    my_button = $('<button id="bm_button">Show values</button>');
    $('#difficulties').append(my_button);
    my_button.click(bm_toggle);
  }

  function refresh_score() {
    var mapid = get_current_map_id();
    $.post('http://127.0.0.1:2222/compute_value', 
          {'mapcode': mapdata[mapid].code, 'solution': solution[mapid]}, 
          write_score_value
    )
  };

  $(window).click(function() {
    refresh_score();
    setTimeout(refresh_score, 500);
  })
  refresh_score();

  
});
