langFilter = "";
blurEvent = false;
blurId = -1;
searchTimeout = false;
keyIsDown = false;
addedNew = false;
editmode = false;
lastSearch = "";

function setFilter(ele) {

	lang = ele.text().toLowerCase();
	if (lang == document.langFilter) {
		document.langFilter = "";
		ele.removeClass("filter_lock");
		dbug("removed filter for " + lang);
	} else {
		oldFilter = document.langFilter;
		$("#"+oldFilter+"filter").removeClass("filter_lock");
		document.langFilter = lang;
		ele.addClass("filter_lock");
		dbug("changed filter to " + lang);
	}
	updateSearch();

}

function doBlur() {
	my_id = document.blurId;
	dbug("in doblur with id " + my_id);
	$("#" + my_id + "_cancelbutton").click();

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
	dbug("sending...");
	$.getJSON(url, dict, function(data) {
		dbug("return received");
		$("#ajaxstatus").text("Thinking...");
		cb(data);
		$("#ajaxstatus").text("synced");
	});
	$("#ajaxstatus").text("Waiting for sync...");
	dbug("end of wrap");

}

function updateSearch() {
	if ($("#ajaxstatus").text() != "synced") {
		return;
	}
	query = $("#maininput").val();
	jsonWrap("/serversonfire/ajax/", {query: query, filter: document.langFilter}, takeAnswer);
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
	$("#maininput").val("");
	document.addedNew = true;
	jsonWrap("/serversonfire/addnewrow/?category=" + category, {}, takeAnswer);
}

function addNewMessage() {
	category = $(this).attr("id");
	$("#maininput").val("");
	document.addedNew = true;
	jsonWrap("/serversonfire/addnewrow/?category=" + category, {}, takeAnswer);
}

function takeAnswer(JSONobj) {
	dbug("taking answer...");
	$("#allcats").empty();
	document.lastSearch = JSONobj.query

	for (rowid in JSONobj.reply) {
	
		category = JSONobj.reply[rowid];
		html = "	<table class='softable' id='cat_"+category.name+"'>	<colgroup width=20%>	<colgroup width=20%>	<colgroup width=20%>	<colgroup width=20%>	<colgroup width=20%>	<tr><th colspan=5 class='cat_toggle' visible='true'>"+category.name+"</th></tr>";

		for (msgid in category.messages) {
		
			row = category.messages[msgid];
					
			html += "<tr class='result_"+category.name+"'><td id='english_"+row.id+"' class='resultfield'>"+row.english+"</td><td id='french_"+row.id+"' class='resultfield'>"+row.french+"</td><td id='german_"+row.id+"' class='resultfield'>"+row.german+"</td><td id='spanish_"+row.id+"' class='resultfield'>"+row.spanish+"</td><td id='polish_"+row.id+"' class='resultfield'>"+row.polish+"</td></tr>";
		}
		html += "<tr><td class='addnewmessage_td' colspan='5'><input type=button value='Add new message in this category' class='addnewmessage' id='" + category.name + "'>";
		$("#allcats").append(html);
	}
	bindStuff();

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

function bindStuff() {

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
		//dbug("toggling visibility");
		visible = $(this).attr("visible");
		if (visible == "true") {
			$(this).attr("visible", "false");
			cat = $(this).text();
			$(".result_" + cat).css("display", "none");
		} else {
			$(this).attr("visible", "true");
			cat = $(this).text();
			$(".result_" + cat).css("display", "");
		}
	});
	if (window.editmode) {
		$("#addcat").click(addCat);
		dbug("we are edit");
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
			dbug("constructing edit view for " + my_id);
			orig_text = $(this).text();
			$(this).data('original_text', $(this).html());
			$(this).empty();
			$(this).append("<textarea id='" + my_id + "_editbox' class='editbox'>" + orig_text + "</textarea><br><input type=button  parentid='" + my_id + "' value='Save' class='savebutton'><input type=button id='" + my_id + "_cancelbutton' parentid='" + my_id + "' value='Cancel' class='cancelbutton'> <input type=button parentid='"+my_id +"' value='Delete' class='deletebutton'>");
			ebox = $("#" + my_id + "_editbox");
			ebox.blur(function () {
				my_id = $(this).attr("id");
				my_id = my_id.replace("_editbox", "");
				dbug("blurring " + my_id);
				document.blurId = my_id;
				document.blurEvent = setTimeout("doBlur()", 200);
			});
			$(".cancelbutton").click(function () {
				if (document.blurEvent) {
					clearTimeout(document.blurEvent);
					document.blurEvent = false;
					dbug("cleared one");
				}
				$(this).blur(function () {});
				field = $("#" + my_id);
				field.empty();
				field.data("edit", false);
				field.append(field.data('original_text'));
				field.addClass("resultfield");
				return false;
			});
			$(".savebutton").click(function () {
				if (document.blurEvent) {
					clearTimeout(document.blurEvent);
					document.blurEvent = false;
				}			
				dbug("Save invoked");
				my_id = $(this).attr("parentid");
				ebox = $("#" + my_id + "_editbox");
				new_text = ebox.val();
				console.log("about to save new text " + new_text + " for " + my_id);
				//# SEND NEW VALUE TO SERVER
				$.get("/serversonfire/takeedit/", {newtext : new_text, id : my_id});
				field = $("#" + my_id);
				field.empty();
				field.data("edit", false);
				field.append(newlines(new_text));
				field.addClass("resultfield");
				return false;
			});
			$(".deletebutton").click(function () {
				if (document.blurEvent) {
					clearTimeout(document.blurEvent);
					document.blurEvent = false;
				}			
				if (confirm("Are you certain you want to delete this message?")) {
					my_id = $(this).attr("parentid");
					$.get("/serversonfire/delete/", {id : my_id});
					updateSearch();
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
