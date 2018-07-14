// ==UserScript==
// @name       Pathery Assist
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  Assistance for playing Pathery
// @match      https://www.pathery.com/home
// @match      https://www.pathery.com/mapeditor*
// @match      https://www.pathery.com/scores*
// @match      https://www.pathery.com/
// @match      https://beta.pathery.net/home
// @match      https://beta.pathery.net/mapeditor*
// @match      https://beta.pathery.net/scores*
// @match      https://beta.pathery.net/
// @match      https://blue.pathery.net/home
// @match      https://blue.pathery.net/mapeditor*
// @match      https://blue.pathery.net/scores*
// @match      https://blue.pathery.net/
// @copyright  2012+, You
// @grant      none
// ==/UserScript==


// IF YOU'RE NOT RUNNING A SERVER:
var url = 'https://raw.githubusercontent.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js';

// ALTERNATIVELY, IF YOU ARE RUNNING A SERVER:
//mt_local_testing = true;
//mt_url='http://127.0.0.1:2222/'  // OR WHATEVER YOUR SERVER IS
//var url = mt_url + 'pathery-client.js'

$.ajax({
  url: url,
  type: 'GET',
  dataType: 'text',
  success: function(data) { eval(data); },
});
