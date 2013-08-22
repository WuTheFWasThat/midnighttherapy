// NOTE: set bm_local_testing to use local version

var PatherySolver  = {};

(function() {
  if (typeof bm_local_testing === 'undefined') {
    var url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
  } else {
    var url = 'http://127.0.0.1:2222/';
  }

  // SHARED WITH PATHERY-FULL
  function get_shared_client(cb) {
    $.getScript(url + 'pathery-client-shared.js', cb)
  }

  PatherySolver.compute_values = function(code, solution, cb) {
    $.ajax({
      url: 'http://127.0.0.1:2222/compute_values',
      type: 'POST',
      data: {'mapcode': code, 'solution': solution},
      dataType: 'json',
      success: cb
    });
  }

  PatherySolver.compute_value = function(code, solution, cb) {
    $.ajax({
      url: 'http://127.0.0.1:2222/compute_value',
      type: 'POST',
      data: {'mapcode': code, 'solution': solution},
      dataType: 'json',
      success: cb
    })
  }

  PatherySolver.place_greedy = function(code, solution, remaining, cb) {
    $.ajax({
      url: 'http://127.0.0.1:2222/place_greedy',
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
