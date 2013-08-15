is_full = false;

// SHARED WITH PATHERY-FULL
function get_shared_client(cb) {
  $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js', cb)
}

function bm_get_values(mapid, cb) {
    $.post('http://127.0.0.1:2222/compute_values', 
          {'mapcode': mapdata[mapid].code, 'solution': solution[mapid]}, 
            function(result) {
              cb(JSON.parse(result))
            }
    );
}

function bm_get_value(mapid, cb) {
  $.post('http://127.0.0.1:2222/compute_value', 
        {'mapcode': mapdata[mapid].code, 'solution': solution[mapid]}, 
        function(values) {cb(JSON.parse(values));}
  )
};


function bm_start_up() {
}

get_shared_client(bm_start_up);
