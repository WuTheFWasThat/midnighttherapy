// NOTE: set mt_local_testing to use local version

// globals all mentioned here
var Analyst  = {};
var Therapist  = {};
var mt_url;
if (typeof mt_local_testing === 'undefined') {
  mt_url = 'https://raw.githubusercontent.com/WuTheFWasThat/midnighttherapy/master/';
} else {
  mt_url = 'http://127.0.0.1:2222/';
}

var start_assist = function() {

  var is_mapeditor = ($('#playableMapDisplay').length > 0);

  // wait until 5 minutes before, to start
  //if ((!is_mapeditor) && (tomorrow.getTime() - new Date().getTime() > (24 * 60 - 5) * 60 * 1000)) {
  //  return setTimeout(start_assist, 1000);
  //}


  (function() {

    ///////////////////////////////////////
    // SERVER
    ///////////////////////////////////////

    function get_analyst(cb) {
      $.getScript(mt_url + 'src/analyst.js', cb)
    }

    ///////////////////////////////////////
    // CLIENT
    ///////////////////////////////////////

    // SHARED WITH PATHERY-CLIENT
    function get_therapist(cb) {
      $.getScript(mt_url + 'src/therapist.js', cb)
    }

    function start_up() {
    }

    get_analyst(function() {
      get_therapist(
        start_up
      )
    });

  })()
}

start_assist()
