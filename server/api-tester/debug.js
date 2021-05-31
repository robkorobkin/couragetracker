

var local_url = "server/api.php";




function postWithAjax(myajax) {
	myajax = myajax || {};

	myajax.url = ($('#url').val() == '') ? local_url : $('#url').val();

	var mode = $('#mode_selector').val();

	if(mode == "JSON POST"){
		myajax.type = "post";
		myajax.contentType = 'application/json; charset=utf-8';
	    myajax.dataType = 'json';
	    myajax.data = $('#requestJson').val();	
	}

	if(mode == "GET"){
		myajax.type = "get";
		myajax.contentType = 'application/json; charset=utf-8';

		var t = $('#requestJson').val();
		
		if(t != '') {
			var params = JSON.parse(t);
			console.log(params)
			for(var key in params){
				myajax.url += key + '=' + params[key] + '&';
			}

			myajax.url = myajax.url.slice(0, -1);
		    console.log(myajax.url)
		}
	}


	myajax.complete = function(jqXHR) {
		$("#statuspre").text(
			"HTTP " + jqXHR.status + " " + jqXHR.statusText);
		if (jqXHR.status == 0) {
			httpZeroError();
		} else if (jqXHR.status >= 200 && jqXHR.status < 300) {
			$("#statuspre").addClass("alert-success");
		} else if (jqXHR.status >= 400) {
			$("#statuspre").addClass("alert-error");
		} else {
			$("#statuspre").addClass("alert-warning");
		}

		try {
			var response_data = JSON.parse(jqXHR.responseText);
			response_output = JSON.stringify(response_data, null, 2);
		}
		catch(error){
			console.log('trying to process error')
			console.log(error);
			response_output = jqXHR.responseText;	
		}

		$("#outputpre").text(response_output);

		var headersTxt = jqXHR.getAllResponseHeaders() +
										"\nRough Size: " + parseInt(jqXHR.responseText.length/1000) + "kb" +
										"\nQuery took " + ( (Date.now() - sendTime) / 1000) + " seconds";

		$("#headerpre").text(headersTxt);
	}

	if (jQuery.isEmptyObject(myajax.data)) {
		myajax.contentType = 'application/x-www-form-urlencoded';
	}

	$("#outputframe").hide();
	$("#outputpre").empty();
	$("#headerpre").empty();
	$("#outputframe").attr("src", "")
	$("#ajaxoutput").show();
	$("#statuspre").text("0");
	$("#statuspre").removeClass("alert-success");
	$("#statuspre").removeClass("alert-error");
	$("#statuspre").removeClass("alert-warning");

	$('#ajaxspinner').show();

	console.log(myajax);

	

	var req = $.ajax(myajax).always(function(){
		$('#ajaxspinner').hide();
	});
}

$("#submitajax").click(function(e) {
 	e.preventDefault();

 	

	// if(!isGoodJson(text)){
	// 	$("#statuspre").addClass("alert-error");
	// 	$("#statuspre").text("Your request is not valid JSON.");
	// 	console.log("BAD JSON");
	// 	return;
	// }

		sendTime = Date.now();

    postWithAjax();
});



function httpZeroError() {
	$("#errordiv").append(	'<div class="alert alert-error">' +
								'<a class="close" data-dismiss="alert">&times;</a>' +
								'<strong>Oh no!</strong>' +
								' Javascript returned an HTTP 0 error. One common reason this might happen is that you requested' +
								'a cross-domain resource from a server that did not include the appropriate CORS headers ' +
								' in the response. Better open up your Firebug... ' +
							'</div>');
}


$(function(){
	$('#requestJson').keydown(function(e){
		var keyCode = e.keyCode || e.which;

		// handle tab
		if (keyCode == 9) {
			e.preventDefault();
			var cursorPosition = $(this).prop("selectionStart");
			var requestText = $(this).val();
			var startText = requestText.slice(0, cursorPosition);
			var endText = requestText.slice(cursorPosition);
			$(this).val(startText + '      ' + endText);
			setCaretToPos(this, cursorPosition + 6);
		}
	});
})



// UTILITIES

// SET CURSOR POINTER
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}


// IS IT GOOD JSON?
function isGoodJson(text){
	var isGood = /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
	return isGood;
}




// function checkForFiles() {
// 	return $("#paramform").find(".input-file").length > 0;
// }

// function checkForAuth() {
// 	return $("#paramform").find("input[type=password]").length > 0;
// }

// function createUrlData(){
//   var mydata = {};
// 	var parameters = $("#allparameters").find(".realinputvalue");
// 	for (i = 0; i < parameters.length; i++) {
// 		name = $(parameters).eq(i).attr("name");
// 		if (name == undefined || name == "undefined") {
// 			continue;
// 		}
// 		value = $(parameters).eq(i).val();
// 		mydata[name] = value
// 	}
//   return(mydata);
// }

// function createMultipart(){
//   //create multipart object
//   var data = new FormData();

//   //add parameters
//   var parameters = $("#allparameters").find(".realinputvalue");
// 	for (i = 0; i < parameters.length; i++) {
// 		name = $(parameters).eq(i).attr("name");
// 		if (name == undefined || name == "undefined") {
// 			continue;
// 		}
//     if(parameters[i].files){
//   	  data.append(name, parameters[i].files[0]);
//     } else {
// 		  data.append(name, $(parameters).eq(i).val());
//     }
// 	}
//   return(data)
// }

// function createHeaderData(){
//   var mydata = {};
// 	var parameters = $("#allheaders").find(".realinputvalue");
// 	for (i = 0; i < parameters.length; i++) {
// 		name = $(parameters).eq(i).attr("name");
// 		if (name == undefined || name == "undefined") {
// 			continue;
// 		}
// 		value = $(parameters).eq(i).val();
// 		mydata[name] = value
// 	}
//   return(mydata);
// }

// $("#addauthbutton").click(function(e) {
//   e.preventDefault();
// 	if ($("#authentication").find(".realinputvalue").length == 0) {
// 		$('.httpauth:first').clone(true).appendTo("#authentication");
// 	}
// 	showHeaders();
// });

// $("#addheaderbutton").click(function(e) {
//   e.preventDefault();
// 	$('.httpparameter:first').clone(true).appendTo("#allheaders");
// 	showHeaders();
// });

// $("#addprambutton").click(function(e) {
//   e.preventDefault();
// 	$('.httpparameter:first').clone(true).appendTo("#allparameters");
// 	showHeaders();
// });

// $("#addfilebutton").click(function(e) {
//   e.preventDefault();
// 	$('.httpfile:first').clone(true).appendTo("#allparameters");
// 	showHeaders();
// });

// function showHeaders() {
// 	showAuthHeaders();
// 	showHeaderHeaders();
// 	showParamHeaders();
// }

// function showAuthHeaders() {
// 	if ($("#authentication").find(".realinputvalue").length > 0) {
// 		$("#addauthbutton").hide();
// 		$("#authentication").show();
// 	} else {
// 		$("#addauthbutton").show();
// 		$("#authentication").hide();
// 	}
// }

// function showHeaderHeaders() {
// 	if ($("#allheaders").find(".realinputvalue").length > 0) {
// 		$("#allheaders").show();
// 	} else {
// 		$("#allheaders").hide();
// 	}
// }

// function showParamHeaders() {
// 	if ($("#allparameters").find(".realinputvalue").length > 0) {
// 		$("#allparameters").show();
// 	} else {
// 		$("#allparameters").hide();
// 	}
// }

// //this specifies the parameter names
// $(".fakeinputname").blur(function() {
//   var newparamname = $(this).val();
//   $(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
// });


// $(".close").click(function(e) {
//   e.preventDefault();
//   $(this).parent().remove();
// 	showHeaders();
// });
