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

  var result = pathery.compute_value(req.body.mapcode, req.body.solution);
  res.end(JSON.stringify(result));

});

app.post('/compute_values', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");

  var t = new Date().getTime();
  var result = pathery.compute_values(req.body.mapcode, req.body.solution);
  console.log("COMPUTE VALUES, TIME ELAPSED")
  console.log(new Date().getTime() - t)

  res.end(JSON.stringify(result));
});

app.listen(2222);
