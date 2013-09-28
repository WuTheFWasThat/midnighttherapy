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


var middleware = [
  function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }
];

app.post('/place_greedy', middleware, function(req, res){
  var t = new Date().getTime();
  var result = Analyst.place_greedy(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  console.log("\nPLACE GREEDY:")
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);
});

app.post('/improve', middleware, function(req, res){
  var t = new Date().getTime();
  var result = Analyst.improve(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  console.log("\nIMPROVE:")
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);
});

app.post('/play_map', middleware, function(req, res){
  var t = new Date().getTime();
  var result = Analyst.play_map(JSON.parse(req.param('board')));
  console.log("\nPLACE GREEDY:")
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);
});

app.post('/compute_value', middleware, function(req, res){
  var t = new Date().getTime();
  var result = Analyst.compute_value(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  //console.log("\nCOMPUTE VALUE:")
  //console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);

});

app.post('/compute_values', middleware, function(req, res){
  var t = new Date().getTime();
  var result = Analyst.compute_values(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  var time_elapsed = new Date().getTime() - t;

  console.log("\nCOMPUTE VALUES:")
  console.log("ms elapsed: " , time_elapsed);
  console.log("find_pathery_path count: " + result.find_pathery_path_count);
  console.log("ms / #find_pathery_path: " , time_elapsed / result.find_pathery_path_count)

  res.json(result);
});

app.use(express.static(__dirname));

app.listen(2222);
