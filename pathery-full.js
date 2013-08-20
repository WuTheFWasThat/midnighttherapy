// NOTE: set bm_local_testing to use local version
is_full = true;

///////////////////////////////////////
// SERVER
///////////////////////////////////////

function get_shared_server(cb) {
  if (typeof bm_local_testing === 'undefined') {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/blue/pathery-server-shared.js', cb)
  } else {
    $.getScript('http://127.0.0.1:2222/pathery-server-shared.js', cb)
  }
}

///////////////////////////////////////
// CLIENT
///////////////////////////////////////

// SHARED WITH PATHERY-CLIENT
function get_shared_client(cb) {
  if (typeof bm_local_testing === 'undefined') {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/blue/pathery-client-shared.js', cb)
  } else {
    $.getScript('http://127.0.0.1:2222/pathery-client-shared.js', cb)
  }
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
