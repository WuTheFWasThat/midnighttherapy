// NOTE: set mt_local_testing to use local version

// globals all mentioned here
var Analyst  = {};
Analyst.server = 'http://127.0.0.1:2222/',

Analyst.compute_values = function(code, solution, cb) {
  $.ajax({
    url: Analyst.server + 'compute_values',
    type: 'POST',
    data: {'mapcode': code, 'solution': solution},
    dataType: 'json',
    success: cb
  });
}

Analyst.compute_value = function(code, solution, cb) {
  $.ajax({
    url: Analyst.server + 'compute_value',
    type: 'POST',
    data: {'mapcode': code, 'solution': solution},
    dataType: 'json',
    success: cb
  })
}

Analyst.place_greedy = function(code, solution, remaining, cb) {
  $.ajax({
    url: Analyst.server + 'place_greedy',
    type: 'POST',
    data: {'mapcode': code, 'solution': solution, 'remaining': remaining},
    dataType: 'json',
    success: cb
  })
}

var Therapist  = {};

if (typeof mt_local_testing === 'undefined') {
  var mt_url = 'https://raw.github.com/WuTheFWasThat/midnighttherapy/master/'
} else {
  var mt_url = 'http://127.0.0.1:2222/';
}

(function() {

  // SHARED WITH PATHERY-FULL
  function get_therapist(cb) {
    $.getScript(mt_url + 'src/therapist.js', cb)
  }

  function start_up() {
    Therapist.showing_values = true;  // note: must happen before scripts load for this to update button properly

    Therapist.register_hotkey('g', function(e) {
      var mapid = Therapist.get_mapid();
      var walls_left = walls_remaining(mapid);
      if (walls_left) {
        Analyst.place_greedy(get_code(mapid), get_solution(mapid), walls_left, function(result) {
          console.log(result);
          Therapist.load_solution(mapid, result);
        })
      } else {
        doSend(mapid);
      }
    });
  }

  get_therapist(start_up);

})()
