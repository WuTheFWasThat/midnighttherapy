Analyst = require('../src/analyst.js');
repr = require('../map_maker/map_repr.js');
fs = require('fs');

var files = fs.readdirSync('./tests');
var NUMTIMES_DEFAULT = 200;
for (var i in files) {
  var filename = files[i];
  var testcase = require('./tests/' + filename);

  // calculate board
  var boardDenseMap = repr.parseMapCode(testcase.code);
  var board = boardDenseMap.toBoard();
  // calculate solution
  var solution = testcase.sol;
  // calculate numTimes
  var numTimes = testcase.numTimes;
  if (numTimes == undefined) {
    numTimes = NUMTIMES_DEFAULT;
  }

  // Do the test
  console.log("Test " + filename);
  var t = new Date().getTime();
  for (var i = 0; i < numTimes; i++) {
    var result = Analyst.place_greedy(board, solution, 3);
  }

  var time_elapsed = new Date().getTime() - t;

  var avgTime = time_elapsed/numTimes;
  console.log("ms elapsed:                      " , time_elapsed);
  console.log("average time:                    " , avgTime);
  console.log("find_pathery_path count:         " , result.find_pathery_path_count);
  console.log("average ms / #find_pathery_path: " , avgTime / result.find_pathery_path_count)
  console.log("#find_pathery_path / s: " , 1000 * result.find_pathery_path_count / avgTime)
}
