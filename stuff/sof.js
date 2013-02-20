// 

document.keyIsDown = false;
document.lastIssue = false;
document.timeStampIt = false;
document.issueSelected = -1; // id of subject selected
document.activeStep = 1; 
document.myURL = "";
document.timeStamps = [];
document.forumRegionsSelected = [];

function popThis(element, array) {
	returnArr = array.slice(0); // make a copy of the array
	for (id in array) {
		if (array[id] == element) {
			returnArr.splice(id, 1); // remove the element passed to the function
		}
	}
	return returnArr;
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
		jsonWrap("gettime/", {time: posix}, cb);
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
	if (document.activeStep == 4) {
		updateReviewSubjects();
		updateReviewBodies();
	}
}

function jsonWrap(url, dict, cb) {
	// AJAXes things, while also updating the spiffy status div so we know what's going on with the AJAXing of things.
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
	// back when I wrote this comment it made sense
	return (message.name.english.indexOf(this) > -1);
}

function updateCategories() {
	buildMsgs("cat", document.categories);
}

function filterIssues(cat) {
	ro = {};
	for (id in document.issues) {
		thissue = document.issues[id]
		if (thissue.category.english == cat) {
			ro[id] = thissue;
		}
	}
	return ro;
}

function updateIssues() {
	filteredIssues = filterIssues(document.catSelected);
	buildMsgs("issue", filteredIssues);
}

function buildMsgs(target, msgs) {
	targetDiv = $("#" + target + "results");
	targetDiv.empty();
	newHTML = "";
	for (id in msgs) {
		msg = msgs[id];
		newHTML += "<div class='result' id='" + target + id + "'>" + msg.name.english + "</div>";
	}
	targetDiv.html(newHTML);
	bindDynamics();
}

function updateReviews() {
	for (id in document.shards) {
		if ($("#"+document.shards[id]).hasClass("loggedin")) {
			$(".row" + document.shards[id]).show();
			$(".row" + document.shards[id]).unbind("click");
			$(".row" + document.shards[id]).click(function (e) {
				selectForumRegion(this.id);
			});
		}
	}
}

function updateReviewSubjects() {
	for (id in document.locaData) {
		newSub = document.issues[document.issueSelected].name[document.locaData[id].language];
		newSub = "[" + document.timeStamps[id]['long'] + "] " + newSub;
		$("#" + id + "subject").html(newSub);
	}
}

function updateReviewBodies() {
	for (id in document.locaData) {
		newBody = document.issues[document.issueSelected].long[document.locaData[id].language];
		$("#" + id + "body").html(newBody);
	}
}

function selectmsg(msgid) {
	ele = $("#" + msgid);
	mType = msgid.replace(/(\d+)/, "");
	lastMsg = (mType == "issue") ? document.lastIssue : document.lastCategory;
	id = msgid.replace(/issue|cat/, "");
	if (lastMsg) {
		lastMsg.toggleClass("selected"); // unselect old selected msg
	}
	ele.toggleClass("selected"); // select new message
	if (mType == "cat") {
		document.catSelected = document.categories[id].name.english;
		document.lastCategory = ele;
		updateIssues();
		$("#issuesearchdiv").show();
		$("#reviewpane").hide();
	} else {
		document.lastIssue = ele;
		document.issueSelected = id;
		updateReviewSubjects();
		updateReviewBodies();
		$("#loginbox").show();
		if ($(".shardlogin.loggedin").length > 0) {
			$("#reviewpane").show();
		}
		if (hasPlaceholder(document.issues[id].long.english)) {
			fillPlaceholder();
		}

	}
}

function getAllPlaceholders(msg) {
	i = 0;
	pos = 0;
	console.log("wtf");
	phregexp = /\b[A-Z]([A-Z]|_)+\b/g;
	placeholders = [];
	console.log("about to match");
	matches = msg.match(phregexp);
	console.log("other side");
	console.log(matches);
	if (!matches) {
		console.log("huh");
		return [];
	}
	console.log("fuck both of you");
	while ( (index = msg.substr(pos).search(phregexp)) > -1) {
		placeholders.push([index, matches[i]]);
		pos = index + matches[i].length;
		i++;
		console.log("pos is now " + pos + " meaning the new subst is " + msg.substr(pos));
	}
	return placeholders;

}

function fillPlaceholder() {

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

function scrollView(ele, con) {
	// element and the container with overflow: scroll; both need to be jquery elements
	curTop = ele.position().top;
	curScroll = con.scrollTop();
	adjustment = curTop - 170;
	newScroll = curScroll + adjustment;
	con.scrollTop(newScroll);
}

function selectForumRegion(ele) {
	if ($("#" + ele).hasClass("regionSelected")) {
		document.forumRegionsSelected = popThis(ele, document.forumRegionsSelected);
	} else {
		document.forumRegionsSelected.push(ele);		
	}
	$("#" + ele).toggleClass("regionSelected");
	if (document.forumRegionsSelected.length > 0) {
		$("#doitbutton").removeClass("disabled");
	} else {
		$("#doitbutton").addClass("disabled");
	}
}

function shardClick(shardid) {
	if (shardid == "na") {
		shardname = "North America";
	} else if (shardid == "euw") {
		shardname = "Europe West";
	} else if (shardid == "eune") {
		shardname = "Europe Nordic and East";
	}
	$("#loginmodalheader").html("Login to <b>" + shardname+"</b>");
	$("#loginusername").val("");
	$("#loginpassword").val("");
	document.loginModalShardID = shardid;
	$("#loginmodal").modal();
	$("#loginusername").focus();
}

function doLogin() {
	$("#wrongcredentials").hide();
	$("#missingcredentials").hide();
	$("#loginloading").toggleClass("hide");
	jsonWrap("fakelogin", {username: $("#loginusername").val(), password: $("#loginpassword").val(), shard: document.loginModalShardID}, takeLogin);
}

function takeLogin(data) {
	$("#loginloading").toggleClass("hide");
	if (data.status == "success") {
		$("#loginmodal").modal('hide');
		flipClasses(document.loginModalShardID, "notloggedin", "loggedin");
		$("#" + document.loginModalShardID).removeAttr('title');
		$("#" + document.loginModalShardID).unbind('click');
		updateReviews();
		$("#reviewpane").show();
	} else {
		$("#" + data.msg).show();
	}
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
	for (id in document.forumRegionsSelected) {
		ele = document.forumRegionsSelected[id];
		txt = "";
		sc = ele.replace(/row/, "");
		dbug("sc is " + sc + " at id " + id);
		lD = document.locaData[sc];
		txt = lD.region + " (" + lD.language + ")";
		newHtml += "<li>" + txt + "</li>";
	}
	newHtml += "</ul>";
	modalRegs.html(newHtml);

	$("#doitmodal").modal();
}

function hasPlaceholder(msg) {
	return (msg.search(/\b[A-Z]([A-Z]|_)+\b/) > -1);
}

function doPublish() {
	checkedBoxes = $(".pcheck:checked").toArray();
	for (id in checkedBoxes) {
		ele = checkedBoxes[id];
		sc = ele.id.replace(/publish/, "");
		language = document.locaData[sc]['language'];
		forumurl = document.locaData[sc]['forumurl'];
		title = document.issues[document.issueSelected]['name'][language];
		body = document.issues[document.issueSelected]['long'][language];
		
		console.log("Forum url is " + forumurl);
		console.log("Title is " + title);
		console.log("Body is " + body);
	}
	
}

function bindStatics() {
	// event bindings for elements that persist through searches and similar
	$("#issuesearchdiv").hide();
	$("#loginbox").hide();
	$(".previewrow").hide();
	$("#modalpublish").click(function (e) {
		doPublish();
	});
	$("#loginbutton").click(function (e) {
		doLogin();
		e.stopPropagation();
	});
	$(".shardlogin").click(function (e) {
		shardClick(this.id);
	});
	$("#doitbutton").click(function (e) {
		showPublishModal();
	});
	$("#selectall").click(function (e) {
		selectAllRegions();
	});
	$(".pcheck").click(function (e) {
		publishClick($(this));
	});

	document.shards = []
	for (id in document.locaData) { 
		thisshard = document.locaData[id].shard; 
		if (document.shards.indexOf(thisshard) == -1) {
			document.shards.push(thisshard);
		} 
	}

}

function bindDynamics() {
	// event bindings for elements that are destroyed and recreated on searches
	$(".result").unbind("click");
	$(".result").click(function (e) {
		selectmsg(this.id);
		e.stopPropagation();
	});
}

function flipClasses(elementId, class1, class2) {
	// given an element (or an elementId) and two class names, flip between the classes; if element has neither class, do nothing
	// fool-proofed against Daniel
	// Challenge accepted! -- Future Daniel
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
