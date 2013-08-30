// NOTE: set bm_local_testing to use local version

if (typeof bm_local_testing === 'undefined') {
  var bm_url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
} else {
  var bm_url = 'http://127.0.0.1:2222/';
}

(function() {

  ///////////////////////////////////////
  // SERVER
  ///////////////////////////////////////

  function get_shared_server(cb) {
    $.getScript(bm_url + '/pathery-server-shared.js', cb)
  }

  ///////////////////////////////////////
  // CLIENT
  ///////////////////////////////////////

  // SHARED WITH PATHERY-CLIENT
  function get_shared_client(cb) {
    $.getScript(bm_url + '/pathery-client-shared.js', cb)
  }

  function start_up() {
  }

  get_shared_server(function() {
    PatherySolver.is_remote = false;

    get_shared_client(
      start_up
    )
  });

})()
