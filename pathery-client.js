// NOTE: set bm_local_testing to use local version
var bm_is_full = false;

// SHARED WITH PATHERY-FULL
function get_shared_client(cb) {
  if (typeof bm_local_testing === 'undefined') {
    $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client-shared.js', cb)
  } else {
    $.getScript('http://127.0.0.1:2222/pathery-client-shared.js', cb)
  }
}

var PatherySolver  = {};

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


function bm_start_up() {
}

get_shared_client(bm_start_up);
