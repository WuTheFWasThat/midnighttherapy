// NOTE: set bm_local_testing to use local version
bm_local_testing = true;

///////////////////////////////////////
// SERVER
///////////////////////////////////////

function get_shared_server(cb) {
  if (typeof bm_local_testing === 'undefined') {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-server-shared.js', cb)
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
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js', cb)
  } else {
    $.getScript('http://127.0.0.1:2222/pathery-client-shared.js', cb)
  }
}

function bm_start_up() {
}

get_shared_server(function() {
  PatherySolver.is_remote = false;

  get_shared_client(
    bm_start_up
  )
});
