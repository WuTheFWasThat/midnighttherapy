var fs = require('fs');

function addMap(map_arr, map) {
  var mapStr = map.myName + ':\n';
  //mapStr += map.forumMapCode();
  mapStr += map.toMapCode();
  map_arr.push(mapStr);
}

function forumAddMap(map_arr, mapname) {
  var map = require('./map_types/' + mapname).generate();
  var mapStr = map.myName + ':\n';
  mapStr += '[code]\n';
  mapStr += map.forumMapCode() + '\n';
  mapStr += '[/code]\n';
  map_arr.push(mapStr);
}

var main = function() {
  var maps = [];

  var files = fs.readdirSync('./map_types');
  for (var k in files) {
    if (files[k][0] == '.') {continue;}
    var map_type = files[k].split('.js')[0]
    forumAddMap(maps, files[k]);
  }

  var outStr = maps.join('\n');

  // var code = "13x7.c1.r10.w9.t0.Simple.:0s.0r.10f.0s.5r.5f.0s.0r.6r.1r.1f.0s.11f.0s.2r.4a.3f.0s.1r.4r.4f.0s.2r.6r.1f.";
  // var map = parseMapCode(code);
  // outStr = '';
  // outStr += map.dilate(3).toMapCode();

  fs.writeFileSync('out.txt', outStr);
  return;
}

if (require.main === module) {
  main();
}

