var scorePages = new Object;
var currentPage = new Object; 

function scoresRequestPage(mapid, page) {
	// console.log('scoresRequestPage', mapid, page);
	if (typeof(ajax) != 'object') {
		setTimeout(function() {scoresRequestPage(mapid, page)},200);
		return false;
	}
	// Ask again if it's busy.
	switch (ajax.xmlhttp.readyState) {
		case 4:
		case 0:
		break;
		default:
			setTimeout(function() {scoresRequestPage(mapid, page)},300);
			return false;
	}
	
	//console.log("Requesting Page", mapid, page, ajax.inUse);
	
	// == Additionally, check for achievements.
	//ajax.requestFile = "do.php?r=reqScorePage&mapid="+mapid+"&reqPage="+page;
	ajax.requestFile = "a/score/"+mapid+"_"+page+".js";
	ajax.onCompletion = scoresRequestPageDone; // Specify function to be executed on response.
	//ajax.onLoading = '';
	//ajax.onLoaded = '';
	//ajax.onFail = '';
   ajax.runAJAX();// Do it!
	return true;
}

function scoresRequestLoading() {
	//Signify that it's working in some manner?
	//console.log("I'm loading teh page...");
}

function scoresRequestPageDone() {
	//console.log("Request Page Done", ajax.response);
	var JO = decryptJSON(ajax.response);
	if (JO == undefined) 
		return;
	scoresUpdatePage(JO.mapid, JO.page, scoresFormatPage(JO));
	if (JO.notificationtext != undefined) {
		showNotification(JO.notificationtext);
		if (checkSound(JO.mapid)) {
			soundManager.setVolume('achieve', 50);
			setTimeout("soundManager.play('achieve');", 350);
		}
	}
}

function scoresUpdatePage(mapid, page, html) {
	// console.log("Updating Page", mapid, page);
	scoresPreparePage(mapid, page);
	scorePages[mapid][page].html = html;
	//if (scorePages[mapid][page] == currentPage[mapid]) {
	if (page == currentPage[mapid]) {
		scoresShowPage(page, mapid);
	}
}

function scoresShowMyPage(mapid) {
	//Future use
}

function scoresShowPage(page, mapid) {
	mapid = mapid - 0;
	page = page - 0;
	// console.log('scoresShowPage', mapid, page);
	if (scoresPreparePage(mapid, page) == false) {
		currentPage[mapid] = page;
		// currentPage[mapid] = scorePages[mapid][page];
		//Signify some sort of loadingness?
		//Request Page
		scoresRequestPage(mapid, page);
		return;
	}
	
	if (typeof(scorePages[mapid][page].html) === 'undefined') {
		scoresRequestPage(mapid, page);
		currentPage[mapid] = page;
		return;
	}
	//	console.log('scorpages', scorePages[mapid][page].html);
	updateDsp(mapid, 'dspScore', scorePages[mapid][page].html);
	//Also; update the page
	// console.log('here', scorePages[mapid][page], currentPage[mapid], scorePages[mapid][page] != currentPage[mapid]);
	
	if (page != currentPage[mapid]) {
		scoresRequestPage(mapid, page);
	}
	currentPage[mapid] = page;
	//currentPage[mapid] = scorePages[mapid][page];
}

function scoresPreparePage (mapid, page) {
	if (typeof(scorePages[mapid]) != 'object') {
		scorePages[mapid] = new Object;
		scorePages[mapid][page] = new Object;
		return false;
	}
	if (typeof(scorePages[mapid][page]) != 'object') {
		scorePages[mapid][page] = new Object;
		return false;
	}
	return true;
}

var scoresShowNavSideBtns = false;
function scoresFormatPage(JO) {
	
	var solutionsGiven = !JO.isCurrentMap;
	
	var p = "<table class='score'>";
	//console.log("jo object", JO);
	var navi = '';
	var naviColSpan = 3;
	if (solutionsGiven) naviColSpan++;
	if (JO.pageCount > 1) {
		navi = "<tr><th class='unselectable' colspan='"+naviColSpan+"' style='text-align:center;'>"+formatPageNavi(JO, "scoresShowPage", JO.mapid)+"</th></tr>"; 
		p = p+navi;
	}
	
	var localTime = new Date();
	var updatedLocalTime = new Date();
	updatedLocalTime.setTime(JO.updateTime * 1000);

	p = p+"<tr title='Last-Update: "+updatedLocalTime.format("mmm d, h:MM TT")+"'>";
	p = p+"<th>Rank</th>";
	p = p+"<th style='width:125px; overflow:hidden; text-align:left; padding-left:42px;'>Name</th>";
	p = p+"<th>Moves</th>";
	if(solutionsGiven)
	{
		//Only show points column when solutions are given (ie. on old maps on the scoreboard)
		p = p+"<th>Points</th>";
	}
	p = p+"</tr>";
	
	var showedLastUser = true;
	var x = 0;
	
	var previousI = 0;
	for (var i in JO.users) {
		var u = JO.users[i];
		var scoredLocalTime = new Date();
		scoredLocalTime.setTime(scoredLocalTime.getTime() - u.secondsSinceScored * 1000);
		
		var styleClass = '';
		
		if (previousI != i + 1 && previousI < i - 1 && previousI != 0) {
			styleClass = 'border-top: 6px solid #777799;';
		}
		
		var wasLongAgo = localTime.getTime() > (scoredLocalTime.getTime() + 43200000); 	//12*60*60*1000
		var scoredTimeFormat = (wasLongAgo ? "mmm d, h:MM:ss TT" : "h:MM:ss TT");
		var scoredTimeStr = scoredLocalTime.format(scoredTimeFormat);
		
		var rowclass = 'scoreRow'+((i % 2)+1);

		if (u.ID == userObj.ID) {
			rowclass = 'scoreRowSelf';
		}		
		if (typeof pointerSolutionID != 'undefined' && u.solutionID == pointerSolutionID && goToScorePointer) {
			goToScorePointer = false;
			setTimeout("useSolution(\""+JO.mapid+"\", \""+u.solution+"\", \""+u.moves+"\", \""+u.wallColor+"\", \""+u.wallEmblem+"\", \""+u.solutionID+"\");", 400);
			rowclass += ' solutionSelected';
		}
		
		if (solutionsGiven) {
			rowclass += ' scoreRowSolutionAvailable';
			p += "<tr class='"+rowclass+"' id='solution_"+u.solutionID+"'";
			p += "onmouseover='showTempSolution(\""+JO.mapid+"\", \""+u.solution+"\", \""+u.moves+"\", \""+u.wallColor+"\", \""+u.wallEmblem+"\", \""+u.wallOrientation+"\")'";
			p += "onclick='useSolution(\""+JO.mapid+"\", \""+u.solution+"\", \""+u.moves+"\", \""+u.wallColor+"\", \""+u.wallEmblem+"\", \""+u.wallOrientation+"\", \""+u.solutionID+"\");saveScoreLocation("+JO.page+", "+u.solutionID+");'";
			p += "onmouseout='restoreSolution(\""+JO.mapid+"\")' ";
			p += " style='"+styleClass+";' title='Last improved "+scoredTimeStr+"'>";
		} else {
			p = p+ "<tr class='"+rowclass+"' style='"+styleClass+"' title='Last improved "+scoredTimeStr+"'>";
		}
		// background-color: "+u.background+";
		
		p = p+ "<td class='scoreMedal' style='color:"+u.displayColor+"'>";
		
		if (u.medal == 'gold') {
			p = p+ "<img title='Current Champion' src='../images/MedalGoldCAR.png'>";
		} else if (u.medal == 'silver') {
			p = p+ "<img title='Tied Top Score' src='../images/MedalSilverCAR.png'>";
		}
		p = p+ i+ "</td>";
		p = p+ "<td style='vertical-align: middle;'>";
		p = p+ "	<div class='grid_td' style='float:left; width:35px; height:35px; background:"+u.wallColor+" url("+linkEmblem(u.wallEmblem, u.wallOrientation)+");'>";
		p = p+ "		<div style='background-color:transparent;' class='grid_td_inner grid_td_rocks'>";
		p = p+ "		</div>";
		p = p+ "	</div>";
		p = p+ "";
		p = p+ "<span class='scoreName'><a href='achievements?id="+u.ID+"' style='color:"+u.displayColor+"'>"+u.display+"</a></span>";
		p = p+ "</td>";
		if (solutionsGiven) {
			p = p+ "<td style='text-align:right;'><a href='javascript: void(0);'>"+u.moves+"</a></td>";
			p = p+ "<td style='text-align:right;'>"+u.points+"</td>";
		} else {
			p = p+ "<td style='text-align:right;'>"+u.moves+"</td>";
			//No second <td> since there is not Points column
		}
		p = p+ "</tr>";
		
		previousI = i;
	}
	
	//p = p+"<tr><th colspan='3' style='text-align:center;'>"+navi+"</th></tr>";
	p = p+navi;
	p = p+"</table>";
	
	var nextPage = JO.page - 0 + 1;
	var prevPage = JO.page - 1;
	
	//TODO: Re'enable this somehow?
	if (JO.pageCount > 1 && scoresShowNavSideBtns) {
		if (JO.page < JO.pageCount) {
			p = p+"<a href='javascript:scoresShowPage("+nextPage+", "+JO.mapid+")' class='rightBtn scoreActive'>&gt;</a>";
		} else
			p = "<div class='rightBtn scoreDisabled'>&gt;</div>"+p;
		if (JO.page > 1) {
			p = "<a href='javascript:scoresShowPage("+prevPage+", "+JO.mapid+")' class='leftBtn scoreActive'>&lt;</a>"+p;
		} else 
			p = "<div class='leftBtn scoreDisabled'>&lt;</div>"+p;
	}
	p = "<div class='scoreContainer1'>"+p+"</div>";
	
	//console.log(p);
	//console.log('jo page', JO.page);
	//console.log('jo pagecount', JO.pageCount); 
	//javascript:scoresShowPage($mapid, $x)
	//p = JO.navi+p;
	return p;
}

//Memberlist related functions:
var membersPages = new Object;
var membersCurrentPage = 1;
var membersPageDivide = 50;
var membersOrderBy = 'totalMovesThisWeek';
var membersOrder = 'DESC';

function membersRequestPage(page) {
	//console.log('membersRequestPage', page);
	if (typeof(ajax) != 'object') {
		setTimeout(function() {membersRequestPage(page)},200);
		return false;
	}
	// Ask again if it's busy.
	switch (ajax.xmlhttp.readyState) {
		case 4:
		case 0:
		break;
		default:
			setTimeout(function() {membersRequestPage(page)},300);
			return false;
	}
	
	//console.log("Requesting Page", page, ajax.inUse);
	// == Additionally, check for achievements.
	
	var requestString = "do.php?r=reqMemberPage&reqPage="+page+"&orderBy="+membersOrderBy
	requestString += "&order="+membersOrder
	requestString += "&membersPageDivide="+membersPageDivide
	
	ajax.requestFile = requestString;
	ajax.onCompletion = membersRequestPageDone; // Specify function to be executed on response.
	//ajax.onLoading = '';
	//ajax.onLoaded = '';
	//ajax.onFail = '';
   ajax.runAJAX();// Do it!
	return true;
}

function membersRequestPageDone() {
	//console.log("Request Page Done", ajax.response);
	var JO = decryptJSON(ajax.response);
	if (JO == undefined) 
		return;
	membersUpdatePage(JO.page, membersFormatPage(JO));
}
function membersToggleOrder() {
	if (membersOrder == 'ASC')
		membersOrder = 'DESC';
	else
		membersOrder = 'ASC';
}

function membersShowPage(page, orderBy, force) {

	if (orderBy) {
		if (membersOrderBy == orderBy)
			membersToggleOrder();
		membersOrderBy = orderBy;
	}

	page = page - 0;
	//console.log('membersShowPage', page);
	if (membersPreparePage(page) == false) {
		membersCurrentPage = page;
		//Signify some sort of loadingness?
		//Request Page
		membersRequestPage(page);
		return;
	}
	
	if (typeof(membersPages[page].html) === 'undefined') {
		membersRequestPage(page);
		membersCurrentPage = page;
		return;
	}
	document.getElementById('members').innerHTML = membersPages[page].html
	
	//Also; update the page
	
	if (page != membersCurrentPage || orderBy || force) {
		membersRequestPage(page);
	}
	membersCurrentPage = page;
}

function membersPreparePage (page) {
	if (typeof(membersPages) != 'object') {
		membersPages = new Object;
		membersPages[page] = new Object;
		return false;
	}
	if (typeof(membersPages[page]) != 'object') {
		membersPages[page] = new Object;
		return false;
	}
	return true;
}

function membersUpdatePage(page, html) {
	//console.log("Updating Page", page);
	membersPreparePage(page);
	membersPages[page].html = html;
	if (page == membersCurrentPage) {
		membersShowPage(page);
	}
}

function formatPageNavi(JO, callback) {
	var r = '';
	var showedPrevPage = true;
	for (var i = 1; i <= JO.pageCount; i++) {
		if (
				(JO.page > i - 3 && JO.page < i + 3) 
				|| (i == 1) 
				|| (i == JO.pageCount)
				|| (i == JO.userPage)
			) {
			
			if (!showedPrevPage) 
				r = r + ' ... ';
			if (JO.page == i) {
				r = r + " <b class='unselectable' style='color:#aaaabb; font-size:150%;'>" + i + "</b>";
			} else if (i == JO.userPage) {
				r = r + " <a class='unselectable' href='javascript:"+callback+"("+i+", "+arguments[2]+", "+arguments[3]
					+ ")' style='color:#99cc99;' title='You are on this page'><i>" + i + '</i></a>';
			} else {
				r = r + " <a class='unselectable' href='javascript:"+callback+"("+i+", "+arguments[2]+", "+arguments[3]+")'>" + i + '</a>';
			}
			showedPrevPage = true;
		} else {
			showedPrevPage = false;
		}
	}
	var nextPage = JO.page - 0 + 1;
	var prevPage = JO.page - 1;
	if (JO.pageCount > 1) {
		if (JO.page < JO.pageCount) {
			r = r+" <a class='scoreRight unselectable' title='Last' href='javascript:"+callback+"("+JO.pageCount+", "+arguments[2]+", "+arguments[3]+")'>&gt;&gt;&gt;</a>";
			r = r+" <a class='scoreRight unselectable' title='Next' href='javascript:"+callback+"("+nextPage+", "+arguments[2]+", "+arguments[3]+")'>&gt;</a>";
		} else {
			r = r+" <span class='scoreRight unselectable'>&gt;&gt;&gt;</span>";
			r = r+" <span class='scoreRight unselectable'>&gt;</span>";
		}
		if (JO.page > 1) {
			r = " <a class='scoreLeft unselectable' title='Previous' href='javascript:"+callback+"("+prevPage+", "+arguments[2]+", "+arguments[3]+")'>&lt;</a>"+r;
			r = " <a class='scoreLeft unselectable' title='First' href='javascript:"+callback+"(1, "+arguments[2]+", "+arguments[3]+")'>&lt;&lt;&lt;</a>"+r;
		} else {
			r = r+" <span class='scoreLeft unselectable'>&lt;&lt;&lt;</span>";
			r = r+" <span class='scoreLeft unselectable'>&lt;</span>";
		}
	}

	return r;
}

function membersFormatPage(JO) {
	// console.log("Formating page");
	
	var p = "<table class='membersList score'>";
	var navi = '';
	if (JO.pageCount > 1) {
		navi = "<tr><th colspan='10' style='text-align:center;'>"+formatPageNavi(JO, "membersShowPage")+"</th></tr>"; 
		p = p+navi;
	}
	
	var headers = new Object;
	headers['display'] = {'name':'Name', 'title':'They call him... Dovahkiin!'};
	headers['championPoints'] = {'name':'Points', 'title':'Total Champion Points Earned'};
	headers['totalMazes'] = {'name':'Mazes', 'title':'Total Mazes Played (aka. How Awesome You Are)'};
	headers['totalMoves'] = {'name':'Moves', 'title':'Total Moves Mazed'};
	headers['totalMovesThisWeek'] = {'name':'Past Week', 'title':'Total Moves In Past 7 Days (Excluding Today)'};
	headers['totalTies'] = {'name':'Ties', 'title':'Total Ties'};
	headers['totalWins'] = {'name':'Wins', 'title':'Total Wins - for bragging rights only'};
	headers['dateJoined'] = {'name':'Joined', 'title':'Pathery Life Began'};
	headers['dateLogin'] = {'name':'Last Login', 'title':'Last Pathery Fix'};
	
	
	p = p+"<tr title='Updated "+JO.updateTime+"'>";
	p = p+"<th>Rank</th>";

	var sortIndicator;
	for (var i in headers) {
		sortIndicator = '';
		if (i == membersOrderBy) {
			if (membersOrder == 'DESC')
				sortIndicator = ' &#8679;';
			else 
				sortIndicator = ' &#8681;';
		}
		p += "<th class='"+i+"' title='" + headers[i].title + "'>";
		p += "<a title='' href='javascript:membersShowPage("+ membersCurrentPage+",\""+i+"\")'>"+ headers[i].name +"</a>"+sortIndicator+"</th>";
	}

	p = p+"</tr>";
	
	var showedLastUser = true;
	var x = 0;
	
	var previousI = 0;
	
	for (var i in JO.users) {
		var u = JO.users[i];
		var scoredLocalTime = new Date();
		scoredLocalTime.setTime(scoredLocalTime.getTime() - u.secondsSinceScored * 1000);
		
		var styleClass = '';
		
		if (previousI != i + 1) {
			if (previousI < i - 1 && previousI != 0) {
				styleClass = 'border-top: 6px solid #777799;';
			}
		}
				
		if (u.wallEmblem == undefined) u.wallEmblem = 'blank.png';

		p = p+ "<tr style='"+styleClass+" background-color: "+u.background+"; color:"+u.displayColor+";' title=''>";
		p = p+ "<td style='text-align:left;'>";
		p = p+ i+ "</td>";
		
		p = p+ "<td style='vertical-align: middle;width:180px;'>";
		p = p+ "	<div class='grid_td' style='float:left; width:35px; height:35px; background:"+u.wallColor+" url("+linkEmblem(u.wallEmblem, u.wallOrientation)+");'>";
		p = p+ "	 <div style='background-color:transparent;' class='grid_td_inner grid_td_rocks'>";
		p = p+ "	 </div>";
		p = p+ "	</div>";
		p = p+ " <span class='memberName' style='float:left;'><a href='achievements?id="+u.ID+"' style='color:"+u.displayColor+"'>"+u.display+"</a></span>";
		p = p+ "</td>";
		
		p = p+ "<td style='text-align:right;'>"+u.championPoints+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.totalMazes+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.totalMoves+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.totalMovesThisWeek+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.totalTies+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.totalWins+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.dateJoined+"</td>";
		p = p+ "<td style='text-align:right;'>"+u.dateLogin+"</td>";
		p = p+ "</tr>";
		
		previousI = i;
	}
	p = p+navi;
	p = p+"</table>";
	return p;
}
