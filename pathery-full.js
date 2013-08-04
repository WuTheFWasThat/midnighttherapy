is_full = true;
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
  }
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
