// NOTE: set mt_local_testing to use local version

// globals all mentioned here
var Analyst  = {};
var Therapist  = {};
if (typeof mt_local_testing === 'undefined') {
  var mt_url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
} else {
  var mt_url = 'http://127.0.0.1:2222/';
}

(function() {

  ///////////////////////////////////////
  // SERVER
  ///////////////////////////////////////

  function get_analyst(cb) {
    $.getScript(mt_url + '/analyst.js', cb)
  }

  ///////////////////////////////////////
  // CLIENT
  ///////////////////////////////////////

  // SHARED WITH PATHERY-CLIENT
  function get_therapist(cb) {
    $.getScript(mt_url + '/therapist.js', cb)
  }

  function start_up() {
  }

  get_analyst(function() {
    get_therapist(
      start_up
    )
  });

})()
