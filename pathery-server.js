/////////////////////////////////////////////////////
// SERVER ONLY
/////////////////////////////////////////////////////

var express = require('express');
var pathery = require('./pathery-server-shared.js');

var app = express();

// configure Express
app.configure(function() {
  app.use(express.bodyParser()); 
  app.use(app.router);
});

app.post('/compute_value', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  var result = pathery.compute_value(req.body.mapcode, req.body.solution);
  //console.log("\nCOMPUTE VALUE:")
  //console.log("ms elapsed: " , new Date().getTime() - t)

  res.end(JSON.stringify(result));

});

app.post('/compute_values', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  console.log("\nCOMPUTE VALUES:")
  var result = pathery.compute_values(req.body.mapcode, req.body.solution);
  var time_elapsed = new Date().getTime() - t;
  console.log("ms elapsed: " , time_elapsed);
  console.log("find_full_path count: " + result.find_full_path_count);
  console.log("ms / find_full_path: " , time_elapsed / result.find_full_path_count)

  res.end(JSON.stringify(result));
});

app.post('/compute_values', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  console.log("\nCOMPUTE VALUES:")
  var result = pathery.compute_values(req.body.mapcode, req.body.solution);
  var time_elapsed = new Date().getTime() - t;
  console.log("ms elapsed: " , time_elapsed);
  console.log("find_full_path count: " + result.find_full_path_count);
  console.log("ms / find_full_path: " , time_elapsed / result.find_full_path_count)

  res.end(JSON.stringify(result));
});

app.listen(2222);
