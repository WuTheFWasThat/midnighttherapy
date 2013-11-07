var fs = require('fs');

var $ = require('jquery').create();
var async = require('async');

var Analyst = require('../src/analyst')

var main = function() {
  function forumAddMapMaker(mapname) {
    return function(cb) {
      var map = require('./map_types/' + mapname).generate();

      var value = Analyst.compute_value(map.toBoard())
      var tries = 1;
      while (isNaN(value)) {
        var map = require('./map_types/' + mapname).generate();
        var value = Analyst.compute_value(map.toBoard())
        tries += 1;
      }
      console.log('value', value, 'tries', tries)

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

  var map_types = []
  var files = fs.readdirSync('./map_types');
  for (var k in files) {
    if (files[k][0] == '.') {continue;}
    var map_type = files[k].split('.js')[0]
    map_types.push(map_type);
  }

  // var map_types = ['in_finite', 'rooms', 'no_end', 'INception'];
  var map_types = ['in_finite'];

  var async_list = []
  for (var k =0; k < map_types.length; k++) {
    var map_type = map_types[k];
    async_list.push(forumAddMapMaker(map_type));
  }

  async.series(async_list, function(err, results) {
    var outStr = results.join('\n');
    fs.writeFileSync('out.txt', outStr);
    // var code = "13x7.c1.r10.w9.t0.Simple.:0s.0r.10f.0s.5r.5f.0s.0r.6r.1r.1f.0s.11f.0s.2r.4a.3f.0s.1r.4r.4f.0s.2r.6r.1f.";
    // var map = parseMapCode(code);
    // outStr = '';
    // outStr += map.dilate(3).toMapCode();
  });
}

if (require.main === module) {
  main();
}

