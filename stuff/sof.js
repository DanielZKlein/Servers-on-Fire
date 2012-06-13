document.folds = [];
document.transFolds = [];
document.langFilter = "";
document.searchTimeout = false;
document.keyIsDown = false;
document.addedNew = false;
editmode = false;
document.lastSearch = "";
document.allCategories = [];
document.translation = []; // array of arrays holding all translations, including English strings. translation[34]['german'] = "das ist gut";
document.msgSelected = -1;
document.activeStep = 1; // 1 or 2
document.searchWidth = 0;

function popThis(element, array) {
	returnArr = array.slice(0);
	for (id in array) {
		if (array[id] == element) {
			returnArr.splice(id, 1);
		}
	}
	return returnArr;
}


function changeCategory(id, newCat) {

	jsonWrap("/changecat/", { id : id, newcat : newCat}, takeAnswer);

}

function setFilter(ele) {

	lang = ele.text().toLowerCase();
	if (lang == document.langFilter) {
		document.langFilter = "";
		ele.removeClass("filter_lock");
	} else {
		oldFilter = document.langFilter;
		$("#"+oldFilter+"filter").removeClass("filter_lock");
		document.langFilter = lang;
		ele.addClass("filter_lock");
	}
	updateSearch();

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
	if ($("#ajaxstatus").text() != "synced") {
		return;
	}
	query = $("#maininput").val();
	jsonWrap("/ajax/", {query: query, filter: document.langFilter}, takeAnswer);
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

function addCat() {

	category = prompt("Name the new category");
	if (!category) {
		return;
	}
	$("#maininput").val("");
	document.addedNew = true;
	catForFold = category.replace(/ /g, "-");
	document.folds[catForFold] = "visible";
	jsonWrap("/addnewrow/?category=" + category, {}, takeAnswer);
}

function addNewMessage() {
	category = $(this).attr("id");
	catForFolds = category.replace(/ /g, "-");
	document.folds[catForFolds] = "visible";
	
	$("#maininput").val("");
	document.addedNew = true;
	jsonWrap("/addnewrow/?category=" + category, {}, takeAnswer);
}

function takeAnswer(JSONobj) {
	document.translation = [];
	$("#allcats").empty();
	document.lastSearch = JSONobj.query;
	tempCategories = [];
	for (rowid in JSONobj.reply) {
		category = JSONobj.reply[rowid];
		tempCategories.push(category.name);
		resString = "results";
		if (category.numMatches == 1) {
			resString = "result";
		}
		// CONSTRUCTING RESULTS
		html = "<div class='catdeselected cat_toggle' id='" + category.name.replace(/ /g, "-") + "'> <span class='fw'>[+]</span> " + category.name + " (" + category.numMatches + " " + resString + " found)</div>";
		
		html += "<table class='category_table result_"+category.name.replace(/ /g, "-") +"'>";
		
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
			
			html +="<tr class='msgrow' id='row"+row.id+"'><td><input type=button class='selectrow' value='Select'></td><td>"		
			html += "<td>"+row.english+"</td></tr>";
		}
		if (window.editmode) { 
// foobared
		}
		html += "</table>"; // category_table
		$("#allcats").append(html);
	}
	document.allCategories = tempCategories;
	for (id in tempCategories) {
		foldCat = tempCategories[id].replace(/ /g, "-");
		tempFolds = document.folds;
		if (!(foldCat in document.folds)) {
			document.folds[foldCat] = "invisible";
			tempFolds = popThis(foldCat, tempFolds);
		} else {
			tempFolds = popThis(foldCat, tempFolds);
		}
	}
	for (id in tempFolds) {
		popCat = tempFolds[id];
		document.folds = popThis(popCat, document.folds);
	}
	bindStuff();
	updateFolds();
	if (document.addedNew) {
		newRow = JSONobj.newRow;
		$("#english_" + newRow).click();
		document.addedNew = false;
	}
}

function checkSync() {
	if (!document.keyIsDown) {
		if (document.lastSearch != $("#maininput").val()) {
			updateSearch();
		} 
	}
	setTimeout("checkSync()", 1000);

}

function scrollDown() {
	$("body").animate({scrollTop: $("body").height()}, 200);
}

function scrollUp() {
	$("body").animate({scrollTop: "0px"}, 200);
}

function inputKeyUp() {
	e = document.keyUpEvent;
	document.keyIsDown = false;
	if (e.keyCode == 13 || e.keyCode == 27) {
		$(this).blur();
		updateSearch();
		return;
	}
	updateSearch();
}

function resizeBody() {

	$("body").height(window.innerHeight);

}

function bindStuff() {

	$(window).resize(function () {
		resizeBody();
	});
	resizeBody();
	$("#wrapper").click(function (e) {
		dbug("wrapper clicked");
		if (document.activeStep === 2) {
			switchSteps();
			e.stopPropagation();
			// does not work for some reason
		}
	});
	$(".msgrow").click(function (e) {
		rowid = $(this).attr("id").replace(/row/, "");
		selectmsg(rowid);
		e.stopPropagation();
		
	});
	$("#maininput").focus();
	$("#maininput").keydown(function () {
		if (!document.keyIsDown) {
			document.keyIsDown = true;
		}
	});
	// Bind search functionality
	$("#maininput").keyup(function (e) {
		if (document.searchTimeout) {
			clearTimeout(document.searchTimeout);
		}
		document.keyUpEvent = e;
		document.searchTimeout = setTimeout("inputKeyUp()", 200);
	});

	$(".cat_toggle").click(function() {
		cat = $(this).attr("id");
		//cat = $(this).text().replace(/ \[.*\]/, "").replace(/ /g, "-");
		toggleVis(cat);
	});
	if (window.editmode) {
		$(".addnewmessage").click(addNewMessage);
		$(".filterbutton").click(function() {
			document.filter = $(this).val();
			updateSearch();
		});

		$(".resultfield").click(function() {
			if ($(this).data("edit")) {
				return;
			} 
			$(this).data("edit", true);
			my_id = $(this).attr("id");
			orig_text = $(this).text();
			$(this).data('original_text', $(this).html());
			$(this).empty();
			newhtml = "<textarea id='" + my_id + "_editbox' class='editbox'>" + orig_text + "</textarea><br><input type=button  parentid='" + my_id + "' value='Save' class='savebutton styleButton'><input type=button id='" + my_id + "_cancelbutton' parentid='" + my_id + "' value='Cancel' class='cancelbutton styleButton'> <input type=button parentid='"+my_id +"' value='Delete' class='deletebutton styleButton'><br><select class='changecat' id='changecat"+my_id+"'>";
			for (id in document.allCategories) {
				cat = document.allCategories[id];
				newhtml = newhtml + "<option value='"+ cat + "'>" + cat + "</option>";
			}
			$(this).append(newhtml);
			$(".changecat").change(function () {
			
				newCat = $(this).val();
				fieldId = $(this).attr("id").replace("changecat", "");
				changeCategory(fieldId, newCat);
				$("#"+fieldId+"_cancelbutton").click();
				
			
			});
			$(".cancelbutton").click(function () {
				my_id = $(this).attr("parentid");
				field = $("#" + my_id);
				field.empty();
				field.data("edit", false);
				field.append(field.data('original_text'));
				field.addClass("resultfield");
				return false;
			});
			$(".savebutton").click(function () {
				my_id = $(this).attr("parentid");
				ebox = $("#" + my_id + "_editbox");
				new_text = ebox.val();
				console.log("about to save new text " + new_text + " for " + my_id);
				//# SEND NEW VALUE TO SERVER
				jsonWrap("/takeedit/", {newtext : new_text, filter: document.langFilter, id : my_id}, takeAnswer);
				field = $("#" + my_id);
				field.empty();
				field.data("edit", false);
				field.append(newlines(new_text));
				field.addClass("resultfield");
				return false;
			});
			$(".deletebutton").click(function () {
				if (confirm("Are you certain you want to delete this message?")) {
					my_id = $(this).attr("parentid");
					jsonWrap("/delete/", {id : my_id}, takeAnswer);
					
				}
			});

			$(this).removeClass("resultfield");
			$(this).click(function() {});
			
			ebox = $("#" + my_id + "_editbox");
			ebox.focus()
			return false;
		});

	} else {
		$(".resultfield").click(function() {
			selectElementText(document.getElementById($(this).attr("id")), document.window);
		});
	}
};

function updateFolds() {
	for (cat in document.folds) {
	
		if (document.folds[cat] == "visible") {
			oldText = $("#" + cat).html();
			$("#" + cat).removeClass("catdeselected");
			$("#" + cat).addClass("catselected");
			
			newText = oldText.replace("[+]", "[-]");
			$("#" + cat).html(newText);
			$(".result_" + cat).css("display", "");
		
		} else {
			oldText = $("#" + cat).html();
			newText = oldText.replace("[-]", "[+]");
			$("#" + cat).addClass("catdeselected");
			$("#" + cat).removeClass("catselected");

			$("#" + cat).html(newText);
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
		$(".step1").addClass("guidestepinactive");
		$(".step2").removeClass("guidestepinactive");
		$("#wrapper").addClass("areainactive");
		$("#stagingarea").removeClass("areainactive");
		$("#wrapper").animate({'height': '40%'}, 500);
		$("#stagingarea").animate({'height': '60%'}, 500);
		
		popStep(0, 2);
	} else {
		document.activeStep = 1;
		$("#tempstaging").css("display", "block");
		$("#actualstaging").css("display", "none");
		$(".step1").removeClass("guidestepinactive");
		$(".step2").addClass("guidestepinactive");
		$("#wrapper").removeClass("areainactive");
		$("#stagingarea").addClass("areainactive");
		$("#wrapper").animate({"height": "60%"}, 500);
		$("#stagingarea").css({"height": "40%"}, 500);
		popStep(0, 1);
	}
}

function selectmsg(msgid) {
	if (document.activeStep === 1) {
		switchSteps();
	} 
	$("#row"+document.msgSelected).removeClass("selected");
	$("#row"+msgid).addClass("selected");
	document.msgSelected = msgid;
	trans = document.translation[msgid];
	$("#stagingNAEN").html(trans.english);
	$("#stagingEUWEN").html(trans.english);
	$("#stagingEUNEEN").html(trans.english);
	$("#stagingDE").html(trans.german);
	$("#stagingFR").html(trans.french);
	$("#stagingES").html(trans.spanish);
	$("#stagingPL").html(trans.polish);
	$("#stagingRO").html(trans.romanian);
	$("#stagingGR").html(trans.greek);
	$("#stagingKR").html(trans.korean);

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
