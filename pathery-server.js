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
  console.log("\nPLACE GREEDY:")
  var t = new Date().getTime();
  var result = Analyst.place_greedy(JSON.parse(req.param('board')), JSON.parse(req.param('solution')), JSON.parse(req.param('remaining')));
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);
});

app.post('/improve_solution', middleware, function(req, res){
  console.log("\nIMPROVE:")
  var t = new Date().getTime();
  var result = Analyst.improve_solution(JSON.parse(req.param('board')), JSON.parse(req.param('solution')), {});

  console.log("ms elapsed: " , new Date().getTime() - t)

  console.log(req.param('solution'))
  console.log(result)

  res.json(result);
});

app.post('/play_map', middleware, function(req, res){
  console.log("\nPLACE GREEDY:")
  var t = new Date().getTime();
  var result = Analyst.play_map(JSON.parse(req.param('board')));
  console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);
});

app.post('/compute_value', middleware, function(req, res){
  //console.log("\nCOMPUTE VALUE:")
  var t = new Date().getTime();
  var result = Analyst.compute_value(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  //console.log("ms elapsed: " , new Date().getTime() - t)

  res.json(result);

});

app.post('/compute_values', middleware, function(req, res){
  console.log("\nCOMPUTE VALUES:")
  var t = new Date().getTime();
  var result = Analyst.compute_values(JSON.parse(req.param('board')), JSON.parse(req.param('solution')));
  var time_elapsed = new Date().getTime() - t;

  console.log("ms elapsed: " , time_elapsed);
  console.log("find_pathery_path count: " + result.find_pathery_path_count);
  console.log("ms / #find_pathery_path: " , time_elapsed / result.find_pathery_path_count)

  res.json(result);
});

/////////////////////
// FOR UGLI
///////////////////

app.post('/generate_map', middleware, function(req, res){
  var maptype = req.param('type')

  var Analyst = require('./src/analyst')
  var util = require('./map_maker/map_util');

  // TODO: what to do about different map type folders?

  try {
    var map_gen = require('./map_maker/map_types/' + maptype)
  } catch (e) {
    var map_gen = require('./map_maker/old_maps/' + maptype)
  }

  var map = map_gen.generate();
  var value = Analyst.compute_value(map.toBoard())
  var tries = 1;
  while (isNaN(value)) {
    var map = map_gen.generate();
    var value = Analyst.compute_value(map.toBoard())
    tries += 1;
  }
  console.log('value', value, 'tries', tries)

  var code = map.toMapCode();
  var tiles = map.toDumbTiles();

  var header_stuff = map.calcHeaderContents();

  var result = {
    "ID":0,
    "tiles": tiles,

    "teleports":header_stuff.t,
    "checkpoints":header_stuff.c,

    "width": map.m,
    "height": map.n,
    "walls": map.walls,
    "name": maptype,
    "flags":null,
    "dateCreated":null,
    "dateExpires":1374724800,
    "isBlind":false,
    "isMultiPath":false,
    "code":code
  }
  res.json(result);
});

app.use(express.static(__dirname));

app.listen(2222);
