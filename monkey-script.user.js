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
// @match      http://beta.pathery.net/home
// @match      http://beta.pathery.net/mapeditor*
// @match      http://beta.pathery.net/scores*
// @match      http://beta.pathery.net/
// @match      https://blue.pathery.net/home
// @match      https://blue.pathery.net/mapeditor*
// @match      https://blue.pathery.net/scores*
// @match      https://blue.pathery.net/
// @match      http://blue.pathery.net/home
// @match      http://blue.pathery.net/mapeditor*
// @match      http://blue.pathery.net/scores*
// @match      http://blue.pathery.net/
// @copyright  2012+, You
// @grant      none
// ==/UserScript==


// IF YOU'RE NOT RUNNING A SERVER:
var url = 'https://raw.githubusercontent.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js';

// ALTERNATIVELY, IF YOU ARE RUNNING A SERVER:
//mt_local_testing = true;
//mt_url='http://127.0.0.1:2222/'  // OR WHATEVER YOUR SERVER IS
//var url = mt_url + 'pathery-client.js'

var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.onload = function() {
    if (xhr.status === 200) { 
        var child = document.createElement('script');
        child.text = xhr.responseText
        document.head.appendChild(child);
    } else { alert('Request failed.  Returned status of ' + xhr.status); }
};
xhr.send();
