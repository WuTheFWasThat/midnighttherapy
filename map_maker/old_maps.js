var fs = require('fs');

var map = require('./old_maps/' + 'Simple').generate();
var mc = map.toMapCode();
console.log(mc);
fs.writeFileSync('simple.txt', mc);