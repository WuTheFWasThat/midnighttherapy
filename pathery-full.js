bm_local = false;

///////////////////////////////////////
// SERVER
///////////////////////////////////////

// SHARED WITH PATHERY-CLIENT
function get_shared_server(cb) {
  if (bm_local) {
    $.getScript('file://localhost/Users/jeffwu/Dropbox/Projects/midnighttherapy/pathery-server-shared.js', cb)
  } else {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-server-shared.js', cb)
  }4
}

///////////////////////////////////////
// CLIENT
///////////////////////////////////////

// SHARED WITH PATHERY-CLIENT
function get_shared_client(cb) {
  if (bm_local) {
    $.getScript('file://localhost/Users/jeffwu/Dropbox/Projects/midnighttherapy/pathery-client-shared.js', cb)
  } else {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js', cb)
  }
}

function draw_values() {
  bm_mapid = get_current_map_id();

  if (bm_old_solution == solution[bm_mapid]) {
    return;
  }

  bm_old_solution = solution[bm_mapid];

  var result = compute_values(mapdata[bm_mapid].code, solution[bm_mapid]) 
  var value  = result.value;
  var values_list  = result.values_list;

  for (var k in values_list) {
    var values_dict = values_list[k];
    draw_single_value(bm_mapid, values_dict.i, values_dict.j, values_dict.val, values_dict.blocking);
  }
}

function refresh_score() {
  var mapid = get_current_map_id();
  write_score_value(compute_value(mapdata[mapid].code, solution[mapid]));
};


function start_up() {
  $(document).ready(function() {
  
   console.log('here')
    $(window).click(function() {
      refresh_score();
    })
    refresh_score();
  });
}

get_shared_server(function() { get_shared_client(start_up)});
