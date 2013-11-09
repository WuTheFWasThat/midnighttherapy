var wallColor = "#ffdd88";

var solution = new Array();
var count = new Array();
var mapdata = new Array();
var mapjson = new Array();

function loadSol(sol, moves) {
	if (sol == null) {
		if (document.getElementById('mapsol') != undefined) {
			sol = document.getElementById('mapsol').innerHTML;
        }
    }

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

function linkEmblem(emblem, orientation) { return ''; }


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

		obj.style.backgroundColor = wallColor;

		//Add Wall
		solution[mapid] += y+','+x+'.';
		mapdata[mapid].usedWallCount--;
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

	var speedbox = document.getElementById('speed'),
	speed = speedbox.options[speedbox.selectedIndex].text,

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

function decryptJSON(text) {
	if (typeof(text) == 'undefined') return false;
    return JSON.parse(text);
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
	selectbox = document.getElementById('speed');
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



function displayMap(data, mapid, divID, goalSize, solution) {
	clearwalls(mapid);
    $("#"+divID).html(mapAsHTML(data, goalSize)).fadeIn('fast');
    //$("#"+divID).html(mapAsHTML(data, goalSize)).show();
    mapdata[mapid].savedSolution = solution;
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
	mapdata[map.ID] = map;
	getmapdata(map.ID);

	//Map bigger than target width?
	if (!targetWidth || (map.width * 35) <= targetWidth) {
		//Use standard size.
		targetWidth = (map.width * 35);
	}

	var scale = map.width / targetWidth;

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

	r += "	<div class='grid_dsp_left' style='width:30%;'>";
	r += "	Speed:";
	r += getSpeedOptions();
	r += "	</div>";

	r += "	<div class='grid_dsp_left' style='width:30%; text-align:center'>";
	r += "		<div id='"+map.ID+",dspCount' class='grid_dsp_data'> ";
	r += "		0 moves";
	r += "		</div>";
	r += "	</div>";

	r += "		<div id='"+map.ID+",dsptr' class='grid_dsp_right' style='width:38%;'>";
	r += "		<span id='"+map.ID+",dspWalls' class='grid_dsp_data'> ";
	r += "		"+map.walls+" walls";
	r += "		</span>";
	r += "		<span>";
	r += "		( <a href='javascript:clearwalls("+map.ID+")'>Reset</a> )";
	r += "		</span>";
	r += "	</div>";

	r += mapgrid;

	return r;
}


function setSpeed(value) {
	$(".selectSpeed").val(value);
	savePref('speed', value);
}

function getSpeedOptions() {
	var listObj = new Object;
	var selectedSpeed = 2;
	if (getCookie('pref_speed')) {
		selectedSpeed = getCookie('pref_speed');
	}
	listObj[1] = 'Slow';
	listObj[2] = 'Med';
	listObj[3] = 'Fast';
	listObj[4] = 'Ultra';
    listObj[5] = 'Insane';
	var r = '';
	r += "	<select class='selectSpeed' onChange='setSpeed(this.value)' id='speed'>";
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
