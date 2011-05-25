filter = "all";
addedNew = false;
editmode = false;

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

function dbug(stuff) {

	try {
		time = new Date();
		hours = time.getHours();
		minutes = time.getMinutes();
		seconds = time.getSeconds();
		ms = time.getMilliseconds();
		tstamp = "["+hours+":"+minutes+":"+seconds+"."+ms+"] ";
		console.log(tstamp + stuff);

	} catch(e) {
		
	}

}
function jsonWrap(url, dict, cb) {

	$("#ajaxstatus").text("Sending...");
	$.getJSON(url, dict, function(data) {
		//dbug("return received");
		$("#ajaxstatus").text("Thinking...");
		cb(data);
		$("#ajaxstatus").text("synced");
	});
	$("#ajaxstatus").text("Waiting for sync...");

}

function updateSearch() {
	query = $("#maininput").val();
	//$.getJSON("/serversonfire/ajax/", { query : query, filter: document.filter},  takeAnswer);
	jsonWrap("/serversonfire/ajax/", {query: query, filter: document.filter}, takeAnswer);
}


function newlines(text) {

	return text.replace(/\n/g, "<br>");

}

function addNewMessage() {
		$("#maininput").val("");
		jsonWrap("/serversonfire/edit/addnewrow/", {}, takeAnswer);
		document.addedNew = true;

}
function takeAnswer(JSONobj) {
	$(".resultrow").remove();
	for (rowid in JSONobj.reply) {
	
		row = JSONobj.reply[rowid];
		$("#unholy").append("<tr class='resultrow'><td id='english_"+row.id+"' class='resultfield'>"+row.english+"</td><td id='french_"+row.id+"' class='resultfield'>"+row.french+"</td><td id='german_"+row.id+"' class='resultfield'>"+row.german+"</td><td id='spanish_"+row.id+"' class='resultfield'>"+row.spanish+"</td><td id='polish_"+row.id+"' class='resultfield'>"+row.polish+"</td></tr>");
	}
	bindStuff();

	if (document.addedNew) {
		scrollDown();
		$("#english_" + row.id).click();
		document.addedNew = false;
	}
}

function scrollDown() {
	$("body").animate({scrollTop: $("body").height()}, 200);
}

function scrollUp() {
	$("body").animate({scrollTop: "0px"}, 200);
}


function bindStuff() {

	// Bind search functionality
	$("#maininput").keyup(function (e) {
		if (e.keyCode == 13 || e.keyCode == 27) {
			$(this).blur();
			return;
		}
		updateSearch();
	});

	
	if (window.editmode) {
		$("#addnewmessage").click(addNewMessage);
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
			$(this).append("<textarea id='" + my_id + "_editbox' class='editbox'>" + orig_text + "</textarea><br><input type=button  parentid='" + my_id + "' value='Save' class='savebutton'><input type=button id='" + my_id + "_cancelbutton' parentid='" + my_id + "' value='Cancel' class='cancelbutton'> <input type=button parentid='"+my_id +"' value='Delete' class='deletebutton'>");
			ebox = $("#" + my_id + "_editbox");
			ebox.blur(function () { 
				$("#" + my_id + "_cancelbutton").click();}
			);
			$(".cancelbutton").click(function () {
				my_id = $(this).attr("parentid");
				field = $("#" + my_id);
				console.log("field is:");
				console.log(field);
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
				$.get("/serversonfire/edit/takeedit/", {newtext : new_text, id : my_id});
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
					$.get("/serversonfire/edit/delete/", {id : my_id});
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
