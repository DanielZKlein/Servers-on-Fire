// CURRENT TODO: go to views.py and filter out newlines

document.keyIsDown = false;
document.lastSubjectSearch = "";
document.lastBodySearch = "";
document.lastSubject = false; // jQuery object of the div corresponding to the selected message
document.lastBody = false;
document.timeStampIt = false;
document.subSelected = -1; // id of subject selected
document.bodSelected = -1;
document.activeStep = 1; 
document.myURL = "";
document.timeStamps = [];



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
	getTime();
	setTimeout('timeTick()', 30000);
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
		document.timeStamps[id] = [];
		document.timeStamps[id]['long'] = region[0];
		document.timeStamps[id]['short'] = region[1];
		$("#" + id + "time").text(region[1]);
	}
	if (document.activeStep == 3) {
		updateReviewSubs();
		updateReviewBods();
	}

}

function jsonWrap(url, dict, cb) {

	url = document.myURL + url;
	$("#ajaxstatus").text("Sending...");
	$.getJSON(url, dict, function(data) {
		$("#ajaxstatus").text("Thinking...");
		cb(data);
		$("#ajaxstatus").text("synced");
	});
	$("#ajaxstatus").text("Waiting for sync...");

}

function mfilter(message) {
	// array filter fun! array.filter(cb, thisobject); I'm passing query, which I'm looking for in the string
	return (message.english.indexOf(this) > -1);
}

function checkSync() {
	// in very rare situations, search bars can go out of sync; for instance if the page loses focus before a keyup can fire, or if Strange Things occur in the 200ms grace period. This function checks we're still synced
	if (!document.keyIsDown) {
		if (document.lastSubjectSearch != $("#subjectsearch").val()) {
			dbug("checksync updating subject search");
			updateSubjects();
		} 
		if (document.lastBodySearch != $("#bodysearch").val()) {
			dbug("checksync updating body search");
			updateBodies();
		} 

	}
	setTimeout("checkSync()", 1000);
}

function updateSearch(type) {
	if (type == "body") {
		updateBodies();
	} else {
		updateSubjects();
	}
}

function updateSubjects() {
	query = $("#subjectsearch").val();
	filteredSubs = document.subjects.filter(mfilter, query);
	buildMsgs("subject", filteredSubs);
	document.lastSubjectSearch = query;
}

function updateBodies() {
	query = $("#bodysearch").val();
	filteredBods = document.bodies.filter(mfilter, query);
	buildMsgs("body", filteredBods);
	document.lastBodySearch = query;
}

function buildMsgs(target, msgs) {
	targetDiv = $("#" + target + "results");
	targetDiv.empty();
	newHTML = "";
	for (id in msgs) {
		msg = msgs[id];
		newHTML += "<div class='result' id='" + target + msg.id + "'>" + msg.english + "</div>";
	}
	targetDiv.html(newHTML);
	bindDynamics();
}

function updateReviewSubs() {
	for (id in document.locaData) {
		newSub = document.subjects[document.subSelected][document.locaData[id].language];
		if (document.timeStampIt) {
			newSub = "[" + document.timeStamps[id]['long'] + "] " + newSub;
		}
		$("#" + id + "subject").html(newSub);
	}
}

function updateReviewBods() {
	for (id in document.locaData) {
		newBod = document.bodies[document.bodSelected][document.locaData[id].language];
		if (document.timeStampIt) {
			newBod = "[" +  document.timeStamps[id]['short'] + "] " + newBod;
		}
		$("#" + id + "body").html(newBod);
	}
}

function selectmsg(msgid) {
	ele = $("#" + msgid);
	mType = msgid.replace(/(\d+)/, "");
	lastMsg = (mType == "body") ? document.lastBody : document.lastSubject;
	id = msgid.replace(/body|subject/, "");
	if (lastMsg) {
		lastMsg.toggleClass("selected"); // unselect old selected msg
	}
	ele.toggleClass("selected"); // select new message
	scrollView(ele, ele.parent());
	if (document.activeStep == 1) {
		document.activeStep = 2;
		$("#bodysearchdiv").toggleClass("hidden");
	} else if ((document.activeStep == 2) && (mType == "body")) {
		document.activeStep = 3;
		$("#reviewpane").toggleClass("hidden");
	}
	if (mType == "body") {
		document.lastBody = ele;
		document.bodSelected = id;
		updateReviewBods();
	} else {
		document.lastSubject = ele;
		document.subSelected = id;
		updateReviewSubs();
	}
}

function newlines(text) {
	if (!text) {
		return "";
	}
	result = "";
	lines = text.split("\n");
	for (id in lines) {
		line = lines[id];
		result = result + "<p>" + line + "</p>";
	}
	return result;
}

function inputKeyUp(type) {
	e = document.keyUpEvent;
	document.keyIsDown = false;
	updateSearch(type);
}

function scrollView(ele, con) {
	// element and the container with overflow: scroll; both need to be jquery elements
	curTop = ele.position().top;
	curScroll = con.scrollTop();
	adjustment = curTop - 170;
	newScroll = curScroll + adjustment;
	con.scrollTop(newScroll);
}

function publishClick(ele) {
	if ($(".pcheck:checked").length > 0) {
		$("#doitbutton").removeClass("disabled");
	} else {
		$("#doitbutton").addClass("disabled");
	}
	checkAllRegionsSelected();
}

function tstampCheckClick(ele) {
	if (ele.is(":checked")) {
		document.timeStampIt = true;
	} else {
		document.timeStampIt = false;
	}
	updateReviewSubs();
	updateReviewBods();
}

function checkAllRegionsSelected() {
	if ($(".pcheck:checked").length == Object.keys(document.locaData).length) {
		// all are currently checked; set text of button to Deselect all and thereby prime the button to deselect
		$("#selectall").val("Deselect all regions");
		dbug("ALL CHECKED!");
	} else {
		// not all regions are currently checked; set text of button to Select all and thereby prime the button to select
		$("#selectall").val("Select all regions");
		dbug("NOT ALL CHECKED! checked length is " + $(".pcheck:checked").length + " and the other one is 10 right");
	}
	if ($(".pcheck:checked").length == 0) {
		$("#doitbutton").addClass("disabled");	
	}
}

function selectAllRegions() {
	action = $("#selectall").val().substr(0,2);
	if (action == "De") {
		$(".pcheck:checked").click();
	} else {
		$(".pcheck:not(:checked)").click();
	}
	checkAllRegionsSelected();
}

function showPublishModal() {
	if ($("#doitbutton").hasClass("disabled")) {
		dbug("returning");
		return;
	} else {
		dbug("continuing");
	}

	modalRegs = $("#modalregions");
	newHtml = "<ul>";
	checkedBoxes = $(".pcheck:checked").toArray();
	for (id in checkedBoxes) {
		ele = checkedBoxes[id];
		txt = "";
		sc = ele.id.replace(/publish/, "");
		dbug("sc is " + sc + " at id " + id);
		lD = document.locaData[sc];
		txt = lD.region + " (" + lD.language + ")";
		newHtml += "<li>" + txt + "</li>";
	}
	newHtml += "</ul>";
	modalRegs.html(newHtml);

	$("#doitmodal").modal();
}

function doPublish() {
	checkedBoxes = $(".pcheck:checked").toArray();
	for (id in checkedBoxes) {
		ele = checkedBoxes[id];
		sc = ele.id.replace(/publish/, "");
		language = document.locaData[sc]['language'];
		forumurl = document.locaData[sc]['forumurl'];
		title = document.subjects[document.subSelected][language];
		body = document.bodies[document.bodSelected][language];
		
		console.log("Forum url is " + forumurl);
		console.log("Title is " + title);
		console.log("Body is " + body);
	}
	
}

function bindStatics() {

	// event bindings for elements that persist through searches and similar
	$("#modalpublish").click(function (e) {
		doPublish();
	});
	$("#doitbutton").click(function (e) {
		showPublishModal();
	});
	$("#selectall").click(function (e) {
		selectAllRegions();
	});
	$(".tstamp").click(function (e) {
		tstampCheckClick($(this));
	});
	$(".pcheck").click(function (e) {
		publishClick($(this));
	});
	$("#subjectsearch").focus();
	$("#subjectsearch").keydown(function (e) {
		if (!document.keyIsDown) {
			document.keyIsDown = true;
		}
		if (e.keyCode == 13 || e.keyCode == 27) {
			$(this).blur();
			updateSubjects();
			e.stopPropagation();
			return;
	} 
	});
	$("#subjectsearch").keyup(function (e) {
		inputKeyUp('subject');
	});
	$("#bodysearch").keydown(function (e) {
		if (!document.keyIsDown) {
			document.keyIsDown = true;
		}
		if (e.keyCode == 13 || e.keyCode == 27) {
			$(this).blur();
			updateBodies();
			e.stopPropagation();
			return;
		} 
	});
	$("#bodysearch").keyup(function (e) {
		inputKeyUp('body');
	});
	
}

function bindDynamics() {
	// event bindings for elements that are destroyed and recreated on searches
	$(".result").click(function (e) {
		selectmsg(this.id);
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


function popStep(curSec, step) {
	ele = $(".step" + step);
	newCol = "rgb(255, " + curSec + ", " + curSec + ")";
	ele.css("background-color", newCol);
	if (curSec < 255) {
		curSec = curSec + 2 + Math.floor(curSec/10);
		setTimeout("popStep("+curSec+", "+step+")", 50);
	}
}


