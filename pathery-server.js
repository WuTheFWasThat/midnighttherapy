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
  var result = pathery.compute_value(req.body.mapcode, req.body.solution);
  res.header("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(result));
});

app.post('/compute_values', function(req, res){
  var result = pathery.compute_values(req.body.mapcode, req.body.solution);
  res.header("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(result));
});

app.listen(2222);
