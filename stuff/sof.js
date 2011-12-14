document.folds = [];
document.transFolds = [];
document.langFilter = "";
document.searchTimeout = false;
document.keyIsDown = false;
document.addedNew = false;
editmode = false;
document.lastSearch = "";
document.allCategories = [];

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
	//dbug("sending...");
	$.getJSON(url, dict, function(data) {
		//dbug("return received");
		$("#ajaxstatus").text("Thinking...");
		cb(data);
		$("#ajaxstatus").text("synced");
	});
	$("#ajaxstatus").text("Waiting for sync...");
	//dbug("end of wrap");

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
	//dbug("taking answer...");
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
		// dbug("Category name is "  + category.name);
		html = "<div class='catdeselected cat_toggle' id='" + category.name.replace(/ /g, "-") + "'> <span class='fw'>[+]</span> " + category.name + " (" + category.numMatches + " " + resString + " found)</div>";
		
		for (msgid in category.messages) {
		
			row = category.messages[msgid];
					
			html += "<div id='en"+row.id+"' class='result result_" + category.name.replace(/ /g, "-") + "'>"+row.english + "<br>[<a href='#' id='"+row.id+"' class='toggletrans'>Show translations</a>]<br>";
			html += "<table width=100% class='trans transid"+row.id+"'>";
			html += "<tr class='transrow'><td class='translang'>GERMAN</td><td id='german"+row.id+"' class='resultfield translation'>" + row.german + "</td></tr>"; 
			html += "<tr class='transrow'><td class='translang'>FRENCH</td><td id='french"+row.id+"' class='resultfield translation'>" + row.french + "</td></tr>"; 
			html += "<tr class='transrow'><td class='translang'>SPANISH</td><td id='spanish"+row.id+"' class='resultfield translation'>" + row.spanish + "</td></tr>"; 
			html += "<tr class='transrow'><td class='translang'>POLISH</td><td id='polish"+row.id+"'class='resultfield translation'>" + row.polish + "</td></tr>"; 
			html += "</table>";
			html += "</div>";
		}
		if (window.editmode) { 
			html += "<tr><td class='addnewmessage_td' colspan='5'><input type=button value='Add new message in this category' class='addnewmessage styleButton' id='" + category.name + "'>";
		}
		$("#allcats").append(html);
	}
	document.allCategories = tempCategories;
	for (id in tempCategories) {
		foldCat = tempCategories[id].replace(/ /g, "-");
		tempFolds = document.folds;
		//dbug(document.folds);
		if (!(foldCat in document.folds)) {
			// dbug("adding " + foldCat);
			document.folds[foldCat] = "invisible";
			tempFolds = popThis(foldCat, tempFolds);
		} else {
			// dbug("already in: " + foldCat);
			tempFolds = popThis(foldCat, tempFolds);
		}
	}
	for (id in tempFolds) {
		// dbug("removing " + id);
		popCat = tempFolds[id];
		document.folds = popThis(popCat, document.folds);
	}
	bindStuff();
	updateFolds();
	updateTrans();
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
			dbug("FORCED SYNC!");
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
	$(".toggletrans").click(function() {
		transId = $(this).attr("id");
		toggleTrans(transId);
		updateTrans();
	
	});
	if (window.editmode) {
		//dbug("we are edit");
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
			//dbug("constructing edit view for " + my_id);
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
				// dbug("newcat is " + newCat);
				fieldId = $(this).attr("id").replace("changecat", "");
				changeCategory(fieldId, newCat);
				$("#"+fieldId+"_cancelbutton").click();
				
			
			});
			$(".cancelbutton").click(function () {
				my_id = $(this).attr("parentid");
				// dbug("my_id is " + my_id);
				field = $("#" + my_id);
				field.empty();
				field.data("edit", false);
				field.append(field.data('original_text'));
				field.addClass("resultfield");
				return false;
			});
			$(".savebutton").click(function () {
				//dbug("Save invoked");
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

//Same functionality as categories; hide/show translations. toggleTrans(id) switches the state, updateTrans sets all translations to their proper state
function toggleTrans(id) {
	dbug("Checking " + id + " in " + document.transFolds + ": " + $.inArray(id, document.transFolds));
	if ($.inArray(id, document.transFolds) > -1) {
		dbug("Already in. Popping!");
		document.transFolds = popThis(id, document.transFolds);
		// one time hide. 
		$(".transid" + id).css("display", "none");
		$("#" + id).html("Show translations");
	} else {
		dbug("pushing like a pusher");
		document.transFolds.push(id);
	}
}

function updateTrans() {
// all translations are folded in upon creation. Every search activity is creation; thus, keep only a list of opened translations. Go through these after each search and reopen them, but catch errors and pop translations that trigger errors (were removed by search activity)
	for (id in document.transFolds) {
		myid = document.transFolds[id];
		try {
			$(".transid" + myid).css("display", "block");
			$("#"+myid).html("Hide translations");
		} catch(e) {
			dbug("caught a naughty id: " + myid)
			document.transFolds = popThis(document.transFolds[id], document.transFolds);
		}
	
	}

}

function updateFolds() {
	dbug("toggling visibility " + document.folds + " $$$");
	for (cat in document.folds) {
	
		dbug("setting " + cat + " to " + document.folds[cat]);
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
		// dbug(cat + ' not found');
		return;
	}
	if (document.folds[cat] == "visible") {
		document.folds[cat] = "invisible";
	} else {
		document.folds[cat] = "visible";
	}
	updateFolds();
}