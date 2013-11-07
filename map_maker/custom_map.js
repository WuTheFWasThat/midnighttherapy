var fs = require('fs');

function addMap(map_arr, map) {
  var mapStr = map.myName + ':\n';
  //mapStr += map.forumMapCode();
  mapStr += map.toMapCode();
  map_arr.push(mapStr);
}

var $ = require('jquery').create();
var async = require('async');

function forumAddMap(mapname) {
  return function(cb) {
    var map = require('./map_types/' + mapname).generate();
    var mapStr = map.myName + ':\n';
    mapStr += '[code]\n';
    mapStr += map.forumMapCode() + '\n';
    mapStr += '[/code]\n';

    var shortener_url = 'https://www.googleapis.com/urlshortener/v1/url'
    var url = 'http://blue.pathery.net/mapeditor?code=' + map.toMapCode()

    var response = $.ajax({
      type: "POST",
      url: shortener_url,
      data: JSON.stringify({'longUrl': url}),
      contentType: 'application/json',
      success: function(response) {
        mapStr += response.id;
        console.log(mapStr);
        cb(null, mapStr)
      },
      error: function(err) {
        cb(err, null)
      }
    })
  }
}

var main = function() {
  var maps = [];

  var files = fs.readdirSync('./map_types');

  var map_types = []
  for (var k in files) {
    if (files[k][0] == '.') {continue;}
    var map_type = files[k].split('.js')[0]
    map_types.push(map_type);
  }

  var async_list = []
  for (var k =0; k < map_types.length; k++) {
    var map_type = map_types[k];
    async_list.push(forumAddMap(map_type));
  }

  async.series(async_list, function(err, results) {
    var outStr = results.join('\n');
    fs.writeFileSync('out.txt', outStr);
  });

  // var code = "13x7.c1.r10.w9.t0.Simple.:0s.0r.10f.0s.5r.5f.0s.0r.6r.1r.1f.0s.11f.0s.2r.4a.3f.0s.1r.4r.4f.0s.2r.6r.1f.";
  // var map = parseMapCode(code);
  // outStr = '';
  // outStr += map.dilate(3).toMapCode();
}

if (require.main === module) {
  main();
}

