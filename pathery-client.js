// NOTE: set bm_local_testing to use local version

var PatherySolver  = {};

if (typeof bm_local_testing === 'undefined') {
  var bm_url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
} else {
  var bm_url = 'http://127.0.0.1:2222/';
}

(function() {

  // SHARED WITH PATHERY-FULL
  function get_shared_client(cb) {
    $.getScript(bm_url + 'pathery-client-shared.js', cb)
  }

  PatherySolver.compute_values = function(code, solution, cb) {
    $.ajax({
      bm_url: 'http://127.0.0.1:2222/compute_values',
      type: 'POST',
      data: {'mapcode': code, 'solution': solution},
      dataType: 'json',
      success: cb
    });
  }

  PatherySolver.compute_value = function(code, solution, cb) {
    $.ajax({
      bm_url: 'http://127.0.0.1:2222/compute_value',
      type: 'POST',
      data: {'mapcode': code, 'solution': solution},
      dataType: 'json',
      success: cb
    })
  }

  PatherySolver.place_greedy = function(code, solution, remaining, cb) {
    $.ajax({
      bm_url: 'http://127.0.0.1:2222/place_greedy',
      type: 'POST',
      data: {'mapcode': code, 'solution': solution, 'remaining': remaining},
      dataType: 'json',
      success: cb
    })
  }

  PatherySolver.is_remote = true;


  function start_up() {
  }
  get_shared_client(start_up);

})()
