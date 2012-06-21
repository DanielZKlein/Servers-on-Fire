document.folds = [];
document.transFolds = [];
document.searchTimeout = false;
document.keyIsDown = false;
document.lastSearch = "";
document.allCategories = [];
document.translation = []; // array of arrays holding all translations, including English strings. translation[34]['german'] = "das ist gut";
document.msgSelected = -1;
document.activeStep = 1; // 1 or 2
document.searchWidth = 0;
document.ticktock = false; // currently not updating times
document.postTitle = [];
document.postBody = [];
document.postTitleTimestamped = false;
document.postBodyTimestamped = false;
document.postRegion = 'na';
document.nowTrans = []; // object with localized timestamps for the time now (local server time)
document.lD = []; // locadata; a dictionary of shortcuts, language names, region names, date formats etc

function getLocaData() {
	jsonWrap("getlocadata/", {}, takeLocaData);
}

function stampTitle() {
	document.postTitleTimestamped = ($("#pD-tstamptitle").attr('checked') === 'checked');
	updatePost();
}

function stampBody() {
	document.postBodyTimestamped = ($("#pD-tstampbody").attr('checked') === 'checked');
	updatePost();
}

function takeLocaData(locaData) {
	document.lD = locaData;
}

function useAsTitle() {
	document.postTitle = document.translation[document.msgSelected];
	updatePost();
}

function useAsBody() {
	document.postBody = document.translation[document.msgSelected];
	updatePost();
}

function changePostLanguage() {
	region = $("#pLang").val();
	document.postRegion = region;
	updatePost();
}

function updatePost() {

	region = document.postRegion;

	timestamp = document.nowTrans[region][0];
	dbug("timestamp is " + timestamp);
	pTitle = document.postTitle[document.lD[region].language];
	pBody = document.postBody[document.lD[region].language];
	if (document.postTitleTimestamped) {
		pTitle = "[" + timestamp + "] " +  pTitle;
	}
	if (document.postBodyTimestamped) {
		pBody = "[" + timestamp + "] " +  pBody;
	}
	dbug("pTitle is " + pTitle);
	$("#pD-title").html(pTitle);
	$("#pD-body").html(pBody);

}

function popThis(element, array) {
	returnArr = array.slice(0); // make a copy of the array
	for (id in array) {
		if (array[id] == element) {
			returnArr.splice(id, 1); // remove the element passed to the function
		}
	}
	return returnArr;
}

function selectElementText(el, win) {

    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

function doubleDigit(me) {

	me = me.toString();
	if (me.length == 1) {
		me = "0" + me;
	} 
	return me;
}

function dbug(stuff) {

	try {
		time = new Date();
		hours = doubleDigit(time.getHours());
		minutes = doubleDigit(time.getMinutes());
		seconds = doubleDigit(time.getSeconds());
		ms = time.getMilliseconds();
		tstamp = "["+hours+":"+minutes+":"+seconds+"."+ms+"] ";
		console.log(tstamp + stuff);

	} catch(e) {
		
	}

}

function timeTick() {
	if (!document.ticktock) {
		return;
	}
	getTime();
	setTimeout('timeTick()', 60000);
}

function getTime(posix, cb) {
	if (!cb) {
		cb = telltime;
	}
	if (posix) {
		jsonWrap("gettime/", {'time': posix}, cb);
	} else {
		jsonWrap("gettime/", {}, cb);
	}
}

function telltime(answer) {
	for (id in answer) {
		region = answer[id];
		document.nowTrans[id] = region;
		$("#datetime" + id).text(region[0]);
	}

}

function jsonWrap(url, dict, cb) {

	$("#ajaxstatus").text("Sending...");
	$.getJSON(url, dict, function(data) {
		$("#ajaxstatus").text("Thinking...");
		cb(data);
		$("#ajaxstatus").text("synced");
	});
	$("#ajaxstatus").text("Waiting for sync...");

}

function updateSearch() {
	// Yes, I'm checking for the exact text inside an html element. No, I do not value my sanity very highly
	status = $.trim($("#ajaxstatus").text());
	if (status != "synced") {
		return;
	}
	query = $("#maininput").val();
	jsonWrap("ajax/", {query: query}, takeAnswer);
}

function newlines(text) {
	result = "";
	lines = text.split("\n");
	for (id in lines) {
		line = lines[id];
		result = result + "<p>" + line + "</p>";
	}
	return result;
}

function takeAnswer(JSONobj) {
	document.translation = []; // get rid of translations
	$("#messages").empty(); // empty the messages div
	document.lastSearch = JSONobj.query; // save query for reusage
	tempCategories = []; // will save category names in here
	for (rowid in JSONobj.reply) {
		// each item in the JSONobj is a category with name, numMatches and messages
		category = JSONobj.reply[rowid];
		tempCategories.push(category.name);
		resString = "results";
		if (category.numMatches == 1) {
			resString = "result";
		}
		// CONSTRUCTING RESULTS
		catSafe = category.name.replace(/ /g, "-");
		html = "<div class='row-fluid cat_toggle closedFold' id='" + catSafe + "'><div class='span1 toggleIcon' id='" + catSafe + "-icon'><i class='icon-plus'></i></div><div class='cat_toggle span11'> " + category.name + " (" + category.numMatches + " " + resString + " found)</div></div>"; // I wished you could toggle cats in real life
		// create a row for the toggleable cat header. 1/11 split for +/- and cat name + numMatches
		for (msgid in category.messages) {
			row = category.messages[msgid];
			document.translation[row.id] = [];
			document.translation[row.id]['english'] = row.english;
			document.translation[row.id]['german'] = row.german;
			document.translation[row.id]['french'] = row.french;
			document.translation[row.id]['spanish'] = row.spanish;
			document.translation[row.id]['polish'] = row.polish;
			document.translation[row.id]['korean'] = row.korean;
			document.translation[row.id]['greek'] = row.greek;
			document.translation[row.id]['romanian'] = row.romanian;
			// save translations in global 
			html +="<div class='msgrow msgnormal row-fluid result_"+ catSafe + "' id='row"+row.id+"'>";
			html += "<div class='span12'>"+row.english+"</div></div>";
			// one row per message, split as above
		}
		
		$("#messages").append(html);

	}
	document.allCategories = tempCategories; // write all cats to global
	for (id in tempCategories) {
		foldCat = tempCategories[id].replace(/ /g, "-"); // "short messages" -> "short-messages"
		if (!(foldCat in document.folds)) {
			document.folds[foldCat] = "invisible"; // if there is a category we've not seen previously, default it to collapsed
		}
	}
	bindDynamics(); // bind message select and category collapse functionality to dynamically created elements
	updateFolds();
}

function checkSync() {
	if (!document.keyIsDown) {
		if (document.lastSearch != $("#maininput").val()) {
			dbug("checksync updating search");
			updateSearch();
		} 
	}
	setTimeout("checkSync()", 1000);

}

function inputKeyUp() {
	e = document.keyUpEvent;
	document.keyIsDown = false;
	if (e.keyCode == 13 || e.keyCode == 27) {
		dbug("blurring...");
		$(this).blur();
		updateSearch();
		return;
	}
	updateSearch();
}

function resizeBody() {

	totalHeight = window.innerHeight - 50;
	bigger = Math.floor(totalHeight * 0.6);
	smaller = Math.floor(totalHeight * 0.4);
	if (document.activeStep == 1) {
		$("#step1").css("height", bigger + "px");
		$("#step2").css("height", smaller + "px");
	} else {
		$("#step2").css("height", bigger + "px");
		$("#step1").css("height", smaller + "px");
	}
}

function scrollView(ele, con) {
	// element and the container with overflow: scroll; both need to be jquery elements
	curTop = ele.position().top;
	curScroll = con.scrollTop();
	// we want to scroll to relative position 100. Thus: 100 - curTop = adjustment to be made to curScroll
	adjustment = curTop - 100;
	newScroll = curScroll + adjustment;
	con.scrollTop(newScroll);

}

function bindStatics() {
	// event bindings for elements that persist through searches and similar
	$("#useAsTitle").click(function() { useAsTitle(); });
	$("#useAsBody").click(function() { useAsBody(); });
	
	$(window).resize(function () {
		resizeBody();
	});
	$("#pD-tstamptitle").change(function() {stampTitle()});
	$("#pD-tstampbody").change(function() {stampBody()});
	resizeBody();
	$("#step1").click(function (e) {
		if (document.activeStep === 2) {
			switchSteps();
			e.stopPropagation();
			// does not work for some reason
		}
	});
	$("#maininput").focus();
	$("#maininput").keydown(function () {
		if (!document.keyIsDown) {
			document.keyIsDown = true;
		}
	});
	$("#maininput").keyup(function (e) {
		if (document.searchTimeout) {
			clearTimeout(document.searchTimeout);
		}
		document.keyUpEvent = e;
		document.searchTimeout = setTimeout("inputKeyUp()", 200);
	});
	$("#pLang").change(function () { changePostLanguage(); });
	
}

function bindDynamics() {
	// event bindings for elements that are destroyed and recreated on searches
	$(".msgrow").click(function (e) {
		rowid = $(this).attr("id").replace(/row/, "");
		selectmsg(rowid);
		e.stopPropagation();
		
	});
	$(".cat_toggle").click(function() {
		cat = $(this).attr("id");
		toggleVis(cat);
	});

}

function flipClasses(elementId, class1, class2) {
	// given an element (or an elementId) and two class names, flip between the classes; if element has neither class, do nothing
	// fool-proofed against Daniel
	if (typeof(elementId) === "string") {
		if (elementId.charAt(0) === "#") {
			elementId = elementId.slice(1);
		}
		element = $("#"+elementId);
	} else {
		element = elementId;
	}
	if ((!element.hasClass(class1)) && (!element.hasClass(class2))) {
		return;
	}
	if (element.hasClass(class1)) {
		element.removeClass(class1);
		element.addClass(class2);
	} else {
		element.addClass(class1);
		element.removeClass(class2);
	}
}

function updateFolds() {
	for (cat in document.folds) {
	
		if (document.folds[cat] == "visible") {
			// This fold is open; the items are showing, the click icon is a minus, the select row itself is sunk into the page
			$("#"+cat+"-icon").html("<i class='icon-minus'></i>");
			flipClasses(cat, "openFold", "closedFold");
			$(".result_" + cat).css("display", "");
		
		} else {
			$("#"+cat+"-icon").html("<i class='icon-plus'></i>");
			flipClasses(cat, "openFold", "closedFold");
			$(".result_" + cat).css("display", "none");
		}
	
	}
}

function toggleVis(cat) {
	if (!document.folds[cat]) {
		return;
	}
	if (document.folds[cat] == "visible") {
		document.folds[cat] = "invisible";
	} else {
		document.folds[cat] = "visible";
	}
	updateFolds();
}

function switchSteps() {
	if (document.activeStep === 1) {
		document.activeStep = 2;
		$("#tempstaging").css("display", "none");
		$("#actualstaging").css("display", "block");
		$("#step1").addClass("areainactive");
		$("#step2").removeClass("areainactive");
		$("#step2").css("overflow-y", "scroll");
		document.ticktock = true;
		timeTick();

	} else {
		document.activeStep = 1;
		$("#tempstaging").css("display", "block");
		$("#actualstaging").css("display", "none");
		$("#step1").removeClass("areainactive");
		$("#step2").addClass("areainactive");
		$("#step2").css("overflow-y", "hidden");
		document.ticktock = false;
	}
	resizeBody();
}

function selectmsg(msgid) {
	if (document.activeStep === 1) {
		switchSteps();
	} 
	ele = $("#row" + msgid);
	flipClasses("row"+document.msgSelected, "selected", "msgnormal"); // unselect old selected msg
	flipClasses(ele, "selected", "msgnormal"); // select new message
	scrollView(ele, $("#step1"));
	document.msgSelected = msgid;
	trans = document.translation[msgid];
	for (id in document.lD) {
		$("#staging" + id).html(trans[document.lD[id].language]);
	}
	
	// $("#stagingna").html(trans.english);
	// $("#stagingeuw").html(trans.english);
	// $("#stagingeune").html(trans.english);
	// $("#stagingde").html(trans.german);
	// $("#stagingfr").html(trans.french);
	// $("#staginges").html(trans.spanish);
	// $("#stagingpl").html(trans.polish);
	// $("#stagingro").html(trans.romanian);
	// $("#staginggr").html(trans.greek);
	// $("#stagingkr").html(trans.korean);

}


function popStep(curSec, step) {
	ele = $(".step" + step);
	newCol = "rgb(255, " + curSec + ", " + curSec + ")";
	ele.css("background-color", newCol);
	if (curSec < 255) {
		curSec = curSec + 2 + Math.floor(curSec/10);
		setTimeout("popStep("+curSec+", "+step+")", 50);
	}
}


