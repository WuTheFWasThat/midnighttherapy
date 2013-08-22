// NOTE: set bm_local_testing to use local version

(function() {
  if (typeof bm_local_testing === 'undefined') {
    var url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
  } else {
    var url = 'http://127.0.0.1:2222/';
  }

  ///////////////////////////////////////
  // SERVER
  ///////////////////////////////////////

  function get_shared_server(cb) {
    $.getScript(url + '/pathery-server-shared.js', cb)
  }

  ///////////////////////////////////////
  // CLIENT
  ///////////////////////////////////////

  // SHARED WITH PATHERY-CLIENT
  function get_shared_client(cb) {
    $.getScript(url + '/pathery-client-shared.js', cb)
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
