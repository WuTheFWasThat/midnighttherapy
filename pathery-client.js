/*global $, mt_local_testing */

// NOTE: set mt_local_testing to use local version

var mt_url;
if (typeof mt_local_testing === 'undefined') {
  mt_url = 'https://raw.githubusercontent.com/WuTheFWasThat/midnighttherapy/master/';
} else {
  mt_url = mt_url || 'http://127.0.0.1:2222/';
}

// globals all mentioned here
var Analyst  = {};
Analyst.server = mt_url;
Analyst.post = function(path, data, cb) {
  $.ajax({
    url: Analyst.server + path,
    type: 'POST',
    data: data,
    dataType: 'json',
    success: cb,
  });
};

Analyst.compute_values = function(board, solution, cb) {
  this.post('compute_values',
    {'board': JSON.stringify(board), 'solution': JSON.stringify(solution)},
    cb);
};

Analyst.compute_value = function(board, solution, cb) {
  this.post('compute_value',
    {'board': JSON.stringify(board), 'solution': JSON.stringify(solution)},
    cb);
};

Analyst.place_greedy = function(board, solution, remaining, cb) {
  this.post('place_greedy',
    {'board': JSON.stringify(board), 'solution': JSON.stringify(solution), 'remaining': JSON.stringify(remaining)},
    cb);
};

Analyst.play_map = function(board, solution, remaining, cb) {
  this.post('play_map',
    {'board': JSON.stringify(board), 'solution': JSON.stringify(solution), 'remaining': JSON.stringify(remaining)},
    cb);
};

Analyst.improve_solution = function(board, solution, cb) {
  this.post('improve_solution',
    {'board': JSON.stringify(board), 'solution': JSON.stringify(solution)}, //, 'remaining': JSON.stringify(remaining)},
    cb);
};

var Therapist  = {};

(function() {
  // SHARED WITH PATHERY-FULL
  function get_therapist(cb) {
    $.getScript(mt_url + 'src/therapist.js', cb);
  }

  function start_up() {
    Therapist.toggle_values();  // note: must happen before scripts load for this to update button properly

    Therapist.register_hotkey('F', function(/*e*/) { // override existing GO
      var mapid = Therapist.get_mapid();
      var walls_left = Therapist.walls_remaining(mapid);

      if (!walls_left) {
        Therapist.send_solution(mapid);
        return;
      }

      Analyst.place_greedy(Therapist.get_board(mapid), Therapist.get_solution(mapid), walls_left, function(result) {
        Therapist.load_solution(mapid, result);
        Therapist.send_solution(mapid);
      });
    });

    Therapist.register_hotkey('I', function(/*e*/) {
      var mapid = Therapist.get_mapid();
      Analyst.improve_solution(Therapist.get_board(mapid), Therapist.get_solution(mapid), function(result) {
        Therapist.load_solution(mapid, result);
        Therapist.send_solution(mapid);
      });
    });

  }

  get_therapist(start_up);

})();
