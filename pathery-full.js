is_full = true;

///////////////////////////////////////
// SERVER
///////////////////////////////////////

function get_shared_server(cb) {
  $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-server-shared.js', cb)
}

///////////////////////////////////////
// CLIENT
///////////////////////////////////////

// SHARED WITH PATHERY-CLIENT
function get_shared_client(cb) {
  $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js', cb)
}

function bm_get_values(mapid, cb) {
  var result = PatherySolver.compute_values(mapdata[mapid].code, solution[mapid]) 
  cb(result);
}

function bm_get_value(mapid, cb) {
  var result = PatherySolver.compute_value(mapdata[mapid].code, solution[mapid]);
  cb(result);
};

function bm_start_up() {
}

get_shared_server(function() { 
  get_shared_client(
    bm_start_up
  )
});
