// ==UserScript==
// @name       Pathery Assist
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  Assistance for playing Pathery
// @match      http://www.pathery.com/home
// @match      http://www.pathery.com/mapeditor*
// @match      http://www.pathery.com/scores*
// @match      http://www.pathery.com/
// @match      http://beta.pathery.net/home
// @match      http://beta.pathery.net/mapeditor*
// @match      http://beta.pathery.net/scores*
// @match      http://beta.pathery.net/
// @match      http://blue.pathery.net/home
// @match      http://blue.pathery.net/mapeditor*
// @match      http://blue.pathery.net/scores*
// @match      http://blue.pathery.net/
// @copyright  2012+, You
// @grant      none
// ==/UserScript==


// IF YOU'RE NOT RUNNING A SERVER:
$.ajax({
  url: 'https://raw.githubusercontent.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js',
  type: 'GET',
  success: function(data) { eval(data); },
});

// ALTERNATIVELY, IF YOU ARE RUNNING A SERVER:
//mt_local_testing = true;
//mt_url='http://127.0.0.1:2222/'  // OR WHATEVER YOUR SERVER IS
//$.ajax({
//  url: mt_url + 'pathery-client.js',
//  type: 'GET',
//  success: function(data) { eval(data); },
//});
