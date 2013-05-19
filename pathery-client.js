// SHARED WITH PATHERY-FULL
$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js')

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

function refresh_score() {
  var mapid = get_current_map_id();
  $.post('http://127.0.0.1:2222/compute_value', 
        {'mapcode': mapdata[mapid].code, 'solution': solution[mapid]}, 
        write_score_value
  )
};


$(document).ready(function() {
  $(window).click(function() {
    refresh_score();
    setTimeout(refresh_score, 500);
  })
  refresh_score();

  
});
