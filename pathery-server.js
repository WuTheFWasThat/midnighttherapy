/////////////////////////////////////////////////////
// SERVER ONLY
/////////////////////////////////////////////////////

var express = require('express');
var Analyst = require('./src/analyst.js');

var app = express();

// configure Express
app.configure(function() {
  app.use(express.bodyParser());
  app.use(app.router);
});

app.post('/place_greedy', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  var result = Analyst.place_greedy(req.param('mapcode'), req.param('solution'), req.param('remaining'));
  console.log("\nPLACE GREEDY:")
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);

});

app.post('/compute_value', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  var result = Analyst.compute_value(req.param('mapcode'), req.param('solution'));
  //console.log("\nCOMPUTE VALUE:")
  //console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);

});

app.post('/compute_values', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  var result = Analyst.compute_values(req.param('mapcode'), req.param('solution'));
  var time_elapsed = new Date().getTime() - t;

  console.log("\nCOMPUTE VALUES:")
  console.log("ms elapsed: " , time_elapsed);
  console.log("find_pathery_path count: " + result.find_pathery_path_count);
  console.log("ms / #find_pathery_path: " , time_elapsed / result.find_pathery_path_count)

  res.json(result);
});

app.use(express.static(__dirname));

app.listen(2222);
