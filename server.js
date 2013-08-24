var express = require('express');

var app = express();
app.use(express.static(__dirname));

var port = 2222;
app.listen(port);
console.log("Serving files from port", port);