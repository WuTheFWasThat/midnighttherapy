var ready_done = false,
ready = function() {
	if (ready_done)
		return;
	ready_done = true;
	loadSol();
	if (isChallenge)
		challengeLoad();
}

if (document.readyState === 'complete')
	ready();
else if (document.addEventListener) { // gecko, webkit, opera, IE 9
	document.addEventListener("DOMContentLoaded", ready, false);
	window.addEventListener("load", ready, false);
}
else if (document.attachEvent) { // IE 8-
	document.attachEvent("onreadystatechange", ready);
	window.attachEvent("onload", ready);
}

var wallColor = false;
var wallEmblem = false;
var wallOrientation = 0;

var isChallenge = false;
var isTutorial = false;

var solution = new Array();
var count = new Array();
var mapdata = new Array();
var mapjson = new Array();
var htmlnotification = '';
var jsonmapdata = new Object;
//var jsonmapdata.solutions = new Array();
var mapType; // 1 = simple, 2 = normal, ...; used for mixpanel tracking

function loadSol(sol, moves) {
	if (sol == null)
		if (document.getElementById('mapsol') != undefined)
			sol = document.getElementById('mapsol').innerHTML;

	if (sol) {

		tmp = sol.split(':');
		position = tmp[1].split('.');
		mapid = tmp[0];

		clearwalls(mapid);

		for(var i in position) {
			if (document.getElementById(mapid+','+position[i]) != undefined) {
				object = document.getElementById(mapid+','+position[i]);
				grid_click(object);

			}
		}
	}
	if (moves && mapid) {
		updateDsp(mapid, 'dspCount', moves+ " moves");
	}
}

function showNotification(html) {
	var div = document.createElement('div');
	var pref = '<div class="notification" align="center">';
	pref += '<div class="notification_close"><a href="javascript:" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);">[Close]</a> </div> ';
	pref += '<div style="overflow:auto;height:295px;">';
	var suff = '</div></div>';
	//var suff = '<button onclick="">'
	//suff += 'Close</button></div>';
	div.innerHTML = pref+html+suff;
	document.body.appendChild(div.firstChild);
}

function changeWallColor(newColor) {
	playerWallColor = newColor;
	loadSol(null);
}
function changeWallEmblem(newEmblem) {
	playerWallEmblem = newEmblem;
	loadSol(null);
}

function linkEmblem(emblem, orientation) {
	return '';
}
function setWallStyle(playerObject) {

	if (typeof playerObject !== 'object') return;

	wallColor = playerObject.wallColor;
	wallEmblem = playerObject.wallEmblem;
	wallOrientation = playerObject.wallOrientation;
}



function grid_click(obj) {

	//Prepare data
	tmp = obj.id.split(',');
	mapid = tmp[0] - 0;
	y = tmp[1];
	x = tmp[2];

	//The users solution - prepare it if it's not started
	if (solution[mapid] == undefined) {
		getmapdata(mapid);
	}

	//Is this placing a wall, or removing one?
	var tmp = obj.id;
	childdiv = document.getElementById('child_'+tmp);
	if (obj.cv) {
		//Removing a wall
		obj.cv = false;

		//Remove Customized Background Color & Image
		obj.style.backgroundColor = '';
		obj.style.backgroundImage = '';
		obj.setAttribute("class", "o");
		childdiv.setAttribute("class", "child");

		mapdata[mapid].usedWallCount++;
		//Remove wall
		solution[mapid] = solution[mapid].replace('.'+y+','+x+'.', '.');
	} else {
		//Placing a wall
		if (mapdata[mapid].usedWallCount < 1) {
			updateDsp(mapid, 'dspWalls', "OUT!");
			return;
		}
		obj.cv = true;

		//Color goes on the bottom, Parent.
		//Then the chosen emblem in the Parent.
		// Then the emblem and color are smoothed with the faceted tile on top.

		//childdiv.removeAttribute("class");
		childdiv.setAttribute("class", "child w");

		if (wallColor == false) setWallStyle(userObj);
		if (wallColor == false) wallColor = '#666';

		obj.style.backgroundColor = wallColor;
		if (wallEmblem) {
			obj.style.backgroundImage="url("+linkEmblem(wallEmblem, wallOrientation)+")";
		}

		//Add Wall
		solution[mapid] += y+','+x+'.';
		mapdata[mapid].usedWallCount--;
	}
	if (isChallenge == true) {
		challengeWall(mapid);
	}
	updateDsp(mapid, 'dspWalls', mapdata[mapid].usedWallCount+" walls");
}

function updateDsp(mapid, element, data) {
	//if (mapdata[mapid] == undefined)
	//	return;
	//if (mapdata[mapid].example != true) {
	if (document.getElementById(mapid+','+element) != undefined) {
		handle = document.getElementById(mapid+','+element);
		handle.innerHTML = data;
	}
//}
}

function getmapdata(mapid) {

	if (typeof(mapdata[mapid]) != 'object')
		mapdata[mapid] = decryptJSON(jsonmapdata[mapid]);

	mapdata[mapid].usedWallCount = mapdata[mapid].walls;
	solution[mapid] = '.';
	updateDsp(mapid, 'dspWalls', mapdata[mapid].usedWallCount+" walls");
}

function doSend(mapid) {
  if (solution[mapid] == undefined) { getmapdata(mapid); }

  var mapcode = mapdata[mapid].code;
  var sol = solution[mapid];

   console.log(mapcode)
   console.log(sol)

  $.ajax({
    type: 'POST',
    mapcode: mapcode,
    solution: sol,
    success: request_path_done
  });

}

function request_path_done(JO) {
	var mapid = JO.mapid;
	mapjson[mapid] = JO;

	var speedbox = document.getElementById(mapid+',speed'),
	speed = speedbox.options[speedbox.selectedIndex].text,
	mute = !checkSound(mapid);

	nowTime = new Date().getTime();

	if (JO.blocked) {
		var lastTarget;
		for(i in JO.path) {
			if (JO.path[i].blocked != true) continue;
			lastTarget = JO.path[i].lastTarget;
		}
		if (lastTarget == 'f') lastTarget = 'finish';
		alert("The path is blocked, can't reach "+lastTarget);

		//return;
	}


	var disptext = "Record: "+JO.best+" by "+JO.bestby;
	if (isChallenge)
		disptext = '';
	updateDsp(JO.mapid, 'dspID', disptext);

	mapdata[mapid].moveCount = new Object;
	mapdata[mapid].usedTiles = new Array();
	mapdata[mapid].restoreTiles = new Array();
	mapdata[mapid].pathColor = new Object;

	mapdata[mapid].pathsPending = JO.path.length;
	mapdata[mapid].isMultiPath = (JO.path.length > 1);

	for(i in JO.path) {
		mapdata[mapid].moveCount[i] = 0;
		mapdata[mapid].pathColor[i] = '#ffffff';
		animatePath(JO.path[i].path, mapid, JO.path[i].start, i);
	}
}


function requestSol(mapID) {
	ajax.requestFile = "do.php?r=getsol&mapID="+mapID; //prepare strdata
	ajax.onCompletion = requestSolDone; // specify function to be executed on response
	ajax.runAJAX();
}

function requestChallengeSolution(mapID, challengeID) {
	ajax.requestFile = "do.php?r=getChallengeSolution&mapID="+mapID+'&challengeID='+challengeID; //prepare strdata
	ajax.onCompletion = requestSolDone; // specify function to be executed on response
	ajax.runAJAX();
}

function requestSolDone() {
	var JO;
	JO = decryptJSON(ajax.response);
	if (JO.solution == 'undefined')
		return;
	//clearwalls(JO.mapid);
	loadSol(JO.mapid + ":" + JO.solution, JO.moves);
}

function clearwalls(mapid) {
	if (solution[mapid] == undefined) return;
	walls = solution[mapid].split('.');
	for(var i in walls) {
		tmp = walls[i].split(',');
		eid = mapid+','+tmp[0]+','+tmp[1];
		if (document.getElementById(eid) != undefined) {
			obj = document.getElementById(eid);
			obj.cv = false;

			childdiv = document.getElementById('child_'+obj.id);

			//Reset childdiv to it's default.
			childdiv.removeAttribute("class");
			childdiv.setAttribute("class", "child");

			//return the td obj back to it's default.
			obj.style.backgroundColor = '';
			obj.style.backgroundImage = '';
			obj.setAttribute("class", "o");
		}
	}
	solution[mapid] = undefined;
	getmapdata(mapid);
}

//TODO:An undo button rather than confirm..
function resetwalls(mapid) {
	answer = confirm("Remove walls and start fresh?");
	if (answer) {
		clearwalls(mapid);
	}
}

function decryptJSON(text) {
	if (typeof(text) == 'undefined') return false;
	var JO;
	if (typeof(JSON) == 'undefined') {
		JO = !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, ''))) && eval('(' + text + ')');
	} else {
		JO = JSON.parse(text);
	}
	return JO;
}


function animatePath(path, mapid, start, pathNumber) {
	var tmp = start.split(',');
	var y = tmp[0];
	var x = tmp[1];

	var p = path;
	//Prepare the path
	var c = p.substring(0, 1);
	p = p.substring(1);

	document.getElementById(mapid+',btn').disabled = true;
	doanimate(x, y, p, c, mapid, pathNumber);
}

function animatePathDone(mapid) {
	document.getElementById(mapid+',btn').disabled = false;
	if (isChallenge == true) {
		challengeGo(mapid);
	}
	if (typeof(currentPage) == "object") {
		scoresRequestPage(mapid, currentPage[mapid]);
	}

	//Mark off challenges
	//TODO: This hack is stupidd :(
	if(isChallenge && isTutorial == false)
	{
		for(var i = 0; i < mapjson[mapid].completedChallenges.length; i++)
		{
			var challengeId = mapjson[mapid].completedChallenges[i];
			var handle = document.getElementById("challenge_id_" + challengeId);

			if (handle.className.indexOf('challenge_complete') < 0) {

				handle.className = "challenge_complete";
				flashelement("challenge_id_" + challengeId, 4);
			}
		}
	}
}

function checkSound(mapid) {
	if (getCookie('pref_mute') == 'true') {
		return false;
	}
	if (typeof(soundManager) != 'object') {
		return false;
	}
	return true;
}

function doanimate(x, y, p, c, mapid, pathNumber) {

	//x, y  position
	//p  path string being trunicated.
	//c  current target code.
	//t  next target code.
	t = p.substring(0, 1);

	//Animate current square, and move to next one.
	if (count[mapid] == undefined) {
		count[mapid] = 0;
	}
	//Set the color for the first target.
	if (count[mapid] == 0 && !(c > 0))
		mapdata[mapid].pathColor[pathNumber] = targetColor(c);

	//Display movecount

	if (mapdata[mapid].moveCount[1] > 0 && mapdata[mapid].moveCount[0] > 0) {
		var colorScores = '<span class="green">' + mapdata[mapid].moveCount[0] + '</span> + ';
		colorScores += '<span class="red">' + mapdata[mapid].moveCount[1] + '</span> = ' + count[mapid] + " moves";
		updateDsp(mapid, 'dspCount', colorScores);
	//updateDsp(mapid, 'dspCount', '<span class="green">' + mapdata[mapid].moveCount[0] + ' + ' + mapdata[mapid].moveCount[1] + ' = ' + count[mapid] + " moves");
	} else {
		updateDsp(mapid, 'dspCount', count[mapid]+ " moves");
	}
	//document.getElementById(mapid+',dspCount').innerHTML = count[mapid]+ " moves";

	//Get a handle on the element.
	eid = mapid+','+x+','+y;
	//Verify.
	if (document.getElementById(eid) == undefined) {
		console.error("Path exited field...?");
		animatePathDone(mapid);
		return;
	}
	handle = document.getElementById(eid);

	//Animate the first square in a path.
	if (count[mapid] == 0 && !(c > 0)) {
		count[mapid]--;
		mapdata[mapid].moveCount[pathNumber]--;
		c = t;
		if (!(c > 0))
			c = '2';
	}

	switch(c) {
		//The path is moving to a new position
		case '1': 		//1 - Up
		case '2':		//2 - Right
		case '3': 		//3 - Down
		case '4': 		//4 - Left
			//Track move count
			count[mapid]++;
			mapdata[mapid].moveCount[pathNumber]++;

			//Notify users on score levels;
			switch(count[mapid]) {
				case 100: case 200: case 300: case 400:
				case 500: case 600: case 700: case 800:
				case 900: case 1000:
					if (checkSound(mapid)) {
						soundManager.setVolume('charm', 40);
						soundManager.setPan('charm', 75)
						soundManager.play('charm');
					}
					//Flash
					flashelement(mapid+',dspCount', 4);
					break;
			}

			var childID = 'child_'+handle.id;
			childdiv = document.getElementById(childID);
			if (childdiv.className.indexOf('w') < 0) {
				childdiv.setAttribute('class', 'transition path'+pathNumber+'-'+c);

				handle.style.backgroundColor = mapdata[mapid].pathColor[pathNumber];

				var string = "if (document.getElementById('"+'child_'+eid+"').className == 'transition path"+pathNumber+'-'+c+"')";
				string += "document.getElementById('"+'child_'+eid+"').setAttribute('class', 'child');";
				setTimeout(string, 855);

				//Maintain disabled appearnce of checkpoints
				if (handle.pressed == true) {
					setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '#dddddd';", 865);
				} else {
					string = "if (document.getElementById('"+childID+"').className.indexOf('w') < 0) ";
					string += "document.getElementById('"+eid+"').style.backgroundColor = '';";
					setTimeout(string, 865);
				}
			}

			break;
		//Teleports
		case 't': case 'm': case 'g': case 'i': case 'k':
		//Outs
		case 'u': case 'n': case 'h': case 'j': case 'l':

		case 'r':
			if (mapdata[mapid].isMultiPath == false) {
				handle.style.backgroundColor = '#dddddd';
				setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '#dddddd';", 865);
				handle.pressed = true;
			} else {
				if (contains(mapdata[mapid].usedTiles, eid)) {
					handle.style.backgroundColor = '#dddddd';
					setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '#dddddd';", 865);
					handle.pressed = true;
				} else {
				//mapdata[mapid].usedTiles.push(eid);
				//break;
				}
			}

			if (contains(mapdata[mapid].usedTiles, eid) == false)
				mapdata[mapid].usedTiles.push(eid);

	//mapdata[mapid].restoreTiles.push("document.getElementById('"+eid+"').style.backgroundColor = '';");
	//mapdata[mapid].restoreTiles.push("document.getElementById('"+eid+"').pressed = false;");

	//alert(mapdata[mapid].pathColor[pathNumber]);

	//break;
	}

	//Sound effects
	if (t == 'r') {
		if (checkSound(mapid)) {
			soundManager.setVolume('bling', 40);
			soundManager.setPan('bling', -75)
			soundManager.setVolume('blingb', 40);
			soundManager.setPan('blingb', 75)
			if (pathNumber == 0)
				soundManager.play('bling');
			if (pathNumber == 1)
				soundManager.play('blingb');
		}
	}

	//Done messing with current target
	//Now take pre-action regarding the next tile.

	//Speaking of the next tile - does it exist?
	//End of the line?
	if (t == '') {
		mapdata[mapid].pathsPending--;
		//console.log('path pending', mapdata[mapid].pathsPending);
		if (mapdata[mapid].pathsPending > 0)
			return;

		//console.log('path pending complete', mapdata[mapid].pathsPending);

		//Did we beat or tie any records?
		//Saw someone do this, thought it was clever.
		//Switch for range result.
		var disptext = ""
		var improvedScore = (count[mapid] > mapjson[mapid].mybest && mapjson[mapid].mybest != "0");
		switch (true) {
			case (count[mapid] > mapjson[mapid].best):
				disptext = "Beat "+mapjson[mapid].bestby+"'s record of "+mapjson[mapid].best+" with "+count[mapid]+"!";
				break;

			case (count[mapid] == mapjson[mapid].best):
				disptext = "Tied "+mapjson[mapid].bestby+"'s record of "+mapjson[mapid].best;
				break;

			case (mapjson[mapid].mybest == "0"):
				disptext = "You scored "+count[mapid]+"!";
				break;

			case (count[mapid] > mapjson[mapid].mybest):
				disptext = "Improved score "+mapjson[mapid].mybest+ " to "+count[mapid];
				break;

			case (count[mapid] == mapjson[mapid].mybest):
				disptext = "Tied personal best of "+count[mapid];
				break;

			case (count[mapid] < mapjson[mapid].mybest):
				disptext = "You got "+count[mapid]+". Your best is "+mapjson[mapid].mybest;
				break;
		}
		//if anything worth mentioning happend let them know.
		if (disptext != "") {
			if (checkSound(mapid) && improvedScore) {
				soundManager.setVolume('charm', 50);
				soundManager.setVolume('sc', 50);
				soundManager.play('charm');
				soundManager.play('sc');
			}
			updateDsp(mapid, 'dspID', disptext);
			flashelement(mapid+',dspID', 8, "#FF3377");
		}

		//This is the end, lets reset stuff to defaults.
		count[mapid] = 0;
		mapdata[mapid].pathColor[pathNumber] = '#ffffff';
		//Bring the color back to our checkpoints/teleports.
		var eid;
		for(var i in mapdata[mapid].usedTiles) {
			//eval(mapdata[mapid].restoreTiles[i]);
			//setTimeout((mapdata[mapid].restoreTiles[i]), 2000);
			eid = mapdata[mapid].usedTiles[i];

			setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '';", 2500);
			setTimeout("document.getElementById('"+eid+"').pressed = false;" , 2500);

		}
		//Clear
		mapdata[mapid].usedTiles = new Array();
		//We're done,
		animatePathDone(mapid);
		return;
	}


	//The next tile exists, how fast should we get there?
	rs = 84;
	//How fast should we be going?
	selectbox = document.getElementById(mapid+',speed');
	var selectedSpeed = selectbox.options[selectbox.selectedIndex].value;
	switch (selectedSpeed) {
		case '1':
			rs =180;
			break;

		case '2':
			rs =94;
			break;

		case '3':
			rs =44;
			break;

		case '4':
			rs =22;
			break;

		case '5':
			rs =0;
			break;

	}


	//The next path code.
	switch(t) {
		//Are we just moving someplace?
		case '1':
			x--;
			break; 		//1 - Up
		case '2':
			y++;
			break; 		//2 - Right
		case '3':
			x++;
			break; 		//3 - Down
		case '4':
			y--;
			break; 		//4 - Left
		//Special codes within the path.
		//Did we aquire a target?
		//Checkpoint targets:

		case 'a': case 'b': case 'c':
		case 'd': case 'e': case 'f':
			rs = rs + 410;
			if (selectedSpeed <= 2) rs = rs + 200;
			mapdata[mapid].pathColor[pathNumber] = targetColor(t);
			break;

		//Hey, we've ran into a teleport.
		case 'u':	//tp1
		case 'n': 	//tp2
		case 'h': 	//tp3
		case 'j': 	//tp4
		case 'l': 	//tp5
			//Get teleport coords
			tmp = p.split(t);
			loc = tmp[1].split(',');
			y = loc[0];
			x = loc[1];

			//Flash teleport-out
			//Teleport Element ID
			tpEid = mapid+','+x+','+y;
			if (checkSound(mapid)) {
				soundManager.setVolume('ufoblip', 30);
				if (pathNumber == 0)
					soundManager.setPan('ufoblip', 70);
				else
					soundManager.setPan('ufoblip', -70);
				soundManager.play('ufoblip');
			}
			document.getElementById(tpEid).style.backgroundColor='';

			flashelement(tpEid, 8, mapdata[mapid].pathColor[pathNumber]);

			//The path once teleported - and an r to indicate to gray the teleport-out too.
			p = 'q'+tmp[2];
			//Slow down
			rs = rs + 1200;
			break;
	}
	//Remove move from p
	p = p.substring(1);
	//rs = (10 * p.length) + 40;
	// if (mapdata[mapid].moveCount[1] < mapdata[mapid].moveCount[pathNumber] - 2
	// || mapdata[mapid].moveCount[0] < mapdata[mapid].moveCount[pathNumber] - 2)
	// rs = rs + 100;

	if (count[mapid] % 2 == 1 && rs == 0) {
		doanimate(x,y,p,t,mapid,pathNumber);
	} else  {
		setTimeout("doanimate("+x+","+y+",'"+p+"','"+t+"','"+mapid+"','"+pathNumber+"')",rs);
	}
}


function targetColor(target) {
	var r = '#ccc';
	switch(target) {
		case 'a':
			r = '#F777FF';
			break;
		case 'b':
			r = '#FFFF11';
			break;
		case 'c':
			r = '#FF4466';
			break;
		case 'd':
			r = '#ff9911';
			break;
		case 'e':
			r = '#00FFFF';
			break;
		case 'f':
			r = '#ccc';
	}
	return r;
}


function flashelement(eid, times, color, speed) {

	if (typeof(document.getElementById(eid)) == 'undefined') return;
	var elementToFlash = document.getElementById(eid);
	if (elementToFlash.isBeingFlashed == true) return;
	elementToFlash.isBeingFlashed = true;

	if (!color) {
		color = "#FFFF44";
	}
	if (!speed) {
		speed = 220;
	}
	speedon = speed * .5;

	var currentclass = elementToFlash.className;
	if (elementToFlash.classOrigName != undefined)
		currentclass = elementToFlash.classOrigName;
	var currentColor = elementToFlash.style.backgroundColor;
	elementToFlash.className='no_transition '+currentclass;
	elementToFlash.style.backgroundColor = '#000000';
	for (var i=0; i<times; i++) {
		//Flash bright
		setTimeout("document.getElementById('"+eid+"').style.color = '#000000'", i*speed);
		setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '"+color+"'", i*speed);
		//Flash out
		setTimeout("document.getElementById('"+eid+"').style.color = ''", (i*speed) + speedon);
		setTimeout("document.getElementById('"+eid+"').style.backgroundColor = ''", (i*speed) + speedon);
	}
	setTimeout("document.getElementById('"+eid+"').style.backgroundColor = '"+currentColor+"'", (i*speed) + 200);
	setTimeout("document.getElementById('"+eid+"').isBeingFlashed = false", (i*speed) + 220);
}


function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}


//Shows a solution temporarly
function useSolution(mapid, inputSolution, moves, tempWallColor, tempWallEmblem, tempWallOrientation, solutionID) {

	$('.solutionSelected').removeClass('solutionSelected');
	$('#solution_'+solutionID).addClass('solutionSelected');

	solution[mapid] = inputSolution;
	var animateA = "showTempSolution(\""+mapid+"\", \""+inputSolution+"\", \""+moves+"\", \""+tempWallColor+"\", \""+tempWallEmblem+"\", \""+tempWallOrientation+"\");";
	var animateB = "showTempSolution(\""+mapid+"\", \""+inputSolution+"\", \""+moves+"\", false, false, false);";
	//TODO: Sticky colors for the placed walls by the user would be cool.
	//var animateC = "wallColor = false; wallEmblem = false;";
	setTimeout(animateA, 50);
	setTimeout(animateB, 150);
	setTimeout(animateA, 250);
	setTimeout(animateB, 350);
	setTimeout(animateA, 450);
	setTimeout(animateB, 550);
}
//Shows a solution for temporary use, see 'RestoreSolution'
function showTempSolution(mapid, tempSolution, moves, tempWallColor, tempWallEmblem, tempWallOrientation) {

	//console.log('showTempSolution', mapid, solution, moves, tempWallColor, tempWallEmblem);
	var savedSolution = '';
	if (typeof tempSolution == 'undefined') tempSolution = '';

	if (typeof solution[mapid] !== 'undefined') {
		savedSolution = solution[mapid];
	}

	wallColor = tempWallColor;
	wallEmblem = tempWallEmblem;
	wallOrientation = tempWallOrientation;

	position = tempSolution.split('.');

	clearwalls(mapid);
	for(var i in position) {
		if (document.getElementById(mapid+','+position[i]) != undefined) {
			object = document.getElementById(mapid+','+position[i]);
			grid_click(object);

		}
	}
	if (moves && mapid) {
		updateDsp(mapid, 'dspCount', moves+ " moves");
	}

	mapdata[mapid].savedSolution = savedSolution;
}
//Restores a solution after a showTempSolution
function restoreSolution(mapid) {
	showTempSolution(mapid, mapdata[mapid].savedSolution, 0, false, false);
}

function displayMap(data, mapid, divID, goalSize, solution, moves, challengeMap) {
	clearwalls(mapid);
    $("#"+divID).html(mapAsHTML(data, goalSize)).fadeIn('fast');
    console.dir("MAPDATA", mapdata)
    //$("#"+divID).html(mapAsHTML(data, goalSize)).show();
    mapdata[mapid].savedSolution = solution;
    restoreSolution(mapid);
}

var Tile = {
"o" : "Open",
"s" : "Start",
"f" : "Finish",
"c" : "Checkpoint",
"r" : "Rock",
"t" : "Teleport In",
"u" : "Teleport Out",
"p" : "Unbuildable",
"x" : "Single-Path-Rock"};

//Map as object. If target width is NULL or False, default width is used.
function mapAsHTML(map, targetWidth, mapEditor) {

	map.mapid = map.ID;
	//console.log("MapID:", map.mapid);
	//console.log("MapObj", map);
	mapdata[map.ID] = map;
	getmapdata(map.ID);

	//Map bigger than target width?
	if (!targetWidth || (map.width * 35) <= targetWidth)
	{
		//Use standard size.
		targetWidth = (map.width * 35);
	}

	var scale = map.width / targetWidth;
	//alert(scale);

	//var width = parseInt(map.width / scale);
	//var height = parseInt(map.height / scale);

	var tileWidth = parseInt((map.width / scale) / map.width);
	var tileHeight = tileWidth;

	var width = tileWidth * map.width;
	var height = tileHeight * map.height;

	var mapgrid = '';

	mapgrid += '<div style="clear:both;"></div><div class="map playable" style="width:'+width+'px; height:'+height+'px">';

	for (var y in map.tiles) {
		for (var x in map.tiles[y]) {
			var type = map.tiles[y][x][0];
			var value = map.tiles[y][x][1];
			if (!value) value = '';

			//TODO: If we want to change this line to something that's not retarded _
				// we'll need to do a TON of other work... See Blossom "Implement mapclass"
			var oldy = (y*1)+1;
			var idHandle = map.ID+','+oldy+','+x;

			//oldy is used for Position too... for now
			if (type == 'o') {
				mapgrid += "<div style='float:left; width:"+tileWidth+"px; height:"+tileHeight+"px; ' class='mapcell "+type+value+"' title='Position: "+x+","+oldy+"' id='"+idHandle+"' onClick='grid_click(this)' >";
				mapgrid += "<div id='child_"+idHandle+"' class='child'></div></div>";
			} else {
				mapgrid += "<div style='float:left; width:"+tileWidth+"px; height:"+tileHeight+"px; ' class='mapcell "+type+value+"' title='"+Tile[type]+" "+value+" On: "+x+","+oldy+"' id='"+idHandle+"' >";
				mapgrid += "<div id='child_"+idHandle+"' class='child'></div></div>";
			}
		}
	}
	mapgrid += '</div><div style="clear:both"></div>';

	var r = '';

	r += "<div id='"+map.ID+",outer' class='grid_outer' style='width:"+(width)+"px;height:"+(height+45)+"px;'>";

	r += "	<div class='grid_dsp_left' style='width:60%;'>";
	r += "		<div id='"+map.ID+",dspID' title='MapID: "+map.ID+"'>";
	r += "		MapID: "+map.ID;
	r += "		</div>";
	r += "	</div>";

	r += "		<div id='"+map.ID+",dsptr' class='grid_dsp_right' style='width:38%;'>";
	r += "		<span id='"+map.ID+",dspWalls' class='grid_dsp_data'> ";
	r += "		"+map.walls+" walls";
	r += "		</span>";
	r += "		<span>";
	r += "		( <a href='javascript:resetwalls("+map.ID+")'>Reset</a> )";
	r += "		</span>";
	r += "	</div>";

	r += mapgrid;


	r += "	<div id='"+map.ID+",dspbl' class='grid_dsp_left' style='width:60%;'> ";
	r += "	<input id='"+map.ID+",btn' type='button' onclick='doSend("+map.ID+")' value='Go!' />";
	r += "	Speed:";
	r += getSpeedOptions(map.ID);
	r += "	</div>";

	r += "	<div class='grid_dsp_mid' style='width:5%;'>";
	r += getMuteOption(map.ID);
	r += "	</div>";

	r += "	<div id='"+map.ID+",dspbr' class='grid_dsp_right' style='width:34%;'> ";
	r += "		<div id='"+map.ID+",dspCount' class='grid_dsp_data'> ";
	r += "		0 moves";
	r += "		</div>";
	r += "	</div>";
	r += "</div>";

	return r;
}


function setMute(value)
{
	var value = getCookie('pref_mute');
	$('.mapMute').removeClass("mapMute_"+value);
	if (value == 'true')	{
		value = 'false';
		soundManager.setVolume('pit', 20);
		soundManager.setPan('pit', -60)
		soundManager.play('pit');
	} else {
		value = 'true';
	}
	savePref('mute', value);
	$('.mapMute').addClass("mapMute_"+value);
}

function setSpeed(value) {
	$(".selectSpeed").val(value);
	savePref('speed', value);
}

function getMuteOption(mapID) {
	var r = '';
	var muted = 'false';
	if (getCookie('pref_mute') == 'true') {
		muted = "true";
	}
	r += "<a title='Mute sound?' class='mapMute mapMute_"+muted+" unselectable' href='javascript:setMute()' id='mapMute'/></a>";
	return r;
}

function getSpeedOptions(mapID) {
	var listObj = new Object;
	var selectedSpeed = 2;
	if (getCookie('pref_speed')) {
		selectedSpeed = getCookie('pref_speed');
	}
	listObj[1] = 'Slow';
	listObj[2] = 'Med';
	listObj[3] = 'Fast';
	listObj[4] = 'Ultra';
	if (userObj.hasInsaneSpeed) listObj[5] = 'Insane';
	var r = '';
	r += "	<select class='selectSpeed' onChange='setSpeed(this.value)' id='"+mapID+",speed'>";
	for (var i in listObj) {
		r += "<option value='"+i+"'";
		if (i == selectedSpeed) r += "selected='selected'";
		r += ">"+listObj[i]+"</option>";
	}
	r += "	</select>";
	return r;
}


function savePref(pref, value) {
	setCookie('pref_'+pref, value, 9999);
}

//Cookie functions from w3schools.com
function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}
function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
		{
			return unescape(y);
		}
	}
	return "";
}
