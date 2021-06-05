
appConfig = {
	api_url : "server/api.php"
}


ViewModel = {
	user : {
		userid : 23
	},
	requestedHouse : false
}

function changeView(viewName){
	$('#mainContent form').hide();
	$('#mainContent form#' + viewName + "_form").show();
}


$(function(){

	let html = '';
	
	$('#signup_button').click(function(){
		changeView('register')
	})
	$('#cancelregistration_button').click(function(){
		changeView('login')
	})
	$('#cancelhouseregister_button').click(function(){
		changeView('houserequest')
	})
	$('#startnewhouse_button').click(function(){
		changeView('houseregister')
	})
	$('#proceed_button').click(function(){
		window.location = "index.php";
	})

	// FORGOT / RESET FLOW
	$('#forgot_button').click(function(){
		changeView('forgotpassword')
	})
	$('#cancelforget_button').click(function(){
		changeView('login')
	})
	$('#forgotpassword_button').click(() => {
		sendPasswordReminder();
	})
	$('#login_button').click(() => {
		loginUser();
	})
	$('#reset_button').click(() => {
		resetPW();
	})
	$('#gotologin_button').click(function(){
		window.location = "index.php";
	})


	$('#register_button').click(() => {
		registerUser();
	})
	$('#houseregister_button').click(() => {
		registerHouse();
	});
	$('#houseenter_button').click(() => {
		window.location = 'client.php';
	});
	

	// HANDLE ONLOAD EVENTS
	if(mode == "confirm_email"){

		api.callApi('user_confirmemail', access_token, (response) => {
			if("status" in response && response.status == "error"){
				$('#confirmerror').html(escapeForScreen(response.message));
				return;
			}
			$('#confirmtext').show();
		});
	}
	if(mode == "reset_pw"){

		api.callApi('user_confirmaccesstoken', access_token, (response) => {

			if("status" in response && response.status == "error"){
				$('#resetpw_form').html(escapeForScreen(response.message)).show();
				return;
			}
			$('#reset_form').show();
		});
	}
	if(mode == "pickhouse"){

		api.callApi('user_fetchHouseList', access_token, (response) => {

			if("status" in response && response.status == "error"){
				$('#load_error').show();
				return;
			}

			ViewModel.house_list = response;
			for(let house of ViewModel.house_list){
				house.display = true;
			}


			$('#houserequest_form').show();
			$('#first_name_span').html(escapeForScreen(ViewModel.user.first_name));

			// WRITE HOUSE LIST
			writeHouseList();


		});
	}




/* ///////////////////////////

LOGIN USER

/////////////////////////// */

	loginUser = function(){


		// READ DOM INTO LOGIN REQUEST OBJECT 
		let login_request = {
			"email" : '',
			"password" : ''
		}
		let green_light = true;
		for(let field in login_request){
			let v = $('#login_' + field).val();
			let field_good = true;

			// Is it blank?
			if(v == '') {
				$('#loginlabel_' + field).addClass('error');
				field_good = false;
			}

			if(field_good) $('#loginlabel_' + field).removeClass('error');
			else green_light = false;

			login_request[field] = v;
		}

		
		// HANDLE LOGIN
		if(green_light){

			api.callApi("user_login", login_request, function(response){

				if(!("status" in response)){
					console.log('API is being weird.');
					return;
				}
				if(response.status == "error"){
					$('#login_errorbox').html(escapeForScreen(response.message)).show();
					return;
				}


				// SAVE USER OBJECT IN COOKIE
				localStorage.access_token = response.access_token;
				localStorage.userJSON = JSON.stringify(response.user);

				// if user has an active account, just bring them into the app
				if(response.status == "active" || response.status == "admin"){
					window.location = "client.php";
				}

				// if user has a "raw" account, bring them to pick a house
				if(response.status == "raw"){
					$('#register_confirm').show();
					$('#login_form').hide();
				}

				if(response.status == 'confirmed'){
					window.location = "index.php?v=pickhouse&access_token=" + response.access_token;				
				}


			})
		}		
	}




/* ///////////////////////////*

REGISTER USER

/////////////////////////// */

	registerUser = function () {

		// INIT USER OBJECT 
		let user = {
			"password" : '',
			"first_name" : '',
			"last_name" :'',
			"email" : ''
		}


		// READ DOM INTO USER OBJECT
		let green_light = true;
		for(let field in user){
			let v = $('#user_' + field).val();
			let field_good = true;

			// Is it blank?
			if(v == '') {
				$('#label_' + field).addClass('error');
				field_good = false;
			}

			// Is password legit?


			// Does password match?
			if(field == 'password'){
				let v2 = $('#user_password2').val();
				if(v != v2) {
					$('#label_password2').addClass('error').html('Password (Repeat) - Doesn\'t Match');
					field_good = false;
					v = '';
				}
				else $('#label_password2').removeClass('error').html('Password (Repeat)');
			}

			// Is email and email?

			if(field_good) $('#label_' + field).removeClass('error');
			else green_light = false;

			user[field] = v;

		}


		// CALL API
		if(green_light){
			api.callApi("user_createUser", user, function(response){
				if(!('status' in response)){
					console.log('Something weird with the API!'); return;
				}
				if(response.status == "error"){
					$('#register_errorbox').html(escapeForScreen(response.message)).show();
				}
				if(response.status == "success"){
					$('#register_confirm').show();
					$('#register_form').hide();
				}
			})
		}		
	}


/* ///////////////////////////

SEND PASSWORD REMINDER

/////////////////////////// */

	sendPasswordReminder = function(){


		// READ DOM INTO REQUEST OBJECT 
		let email = $('#forgotpassword_email').val();
		if(email == '') return;


		api.callApi("user_sendreminder", email, function(response){

			if(!("status" in response)){
				console.log('API is being weird.');
			}
			if(response.status == "error"){
				console.log('trying to update error box')
				$('#forgot_errorbox').html(escapeForScreen(response.message)).show();
			}

			// if user has an active account
			if(response.status == "success"){
				$('#forgotpassword_form').html('<p>Request received. Please check your email.</p>');
			}
		})			
	}


/* ///////////////////////////

RESET PASSWORD

/////////////////////////// */

	resetPW = function(){


		// READ DOM INTO USER OBJECT
		let green_light = true;

		let pw1 = $('#reset_pw').val();
		let pw2 = $('#reset_pw2').val();
		let message = '';


		// ARE THEY BLANK?
		if(pw1 == ''){
			$('#resetlabel_pw').addClass('error');
			green_light = false;
		}
		else $('#resetlabel_pw').removeClass('error');

		if(pw2 == ''){
			$('#resetlabel_pw2').addClass('error');
			green_light = false;
		}
		else $('#resetlabel_pw2').removeClass('error');


		// DO THEY MATCH
		if(pw1 != pw2){
			$("#reset_errorbox").html("Error: Passwords don't match.").show();
			green_light = false;
		}
		else $("#reset_errorbox").html("").hide();




		// CALL API
		if(green_light){
			api.callApi("user_resetPW", pw1, function(response){
				if(response.status == "error"){
					$('#reset_errorbox').html(escapeForScreen(response.message)).show();
				}
				else if(response.status == "success"){
					$('#reset_form').hide();
					$('#reset_confirm').show();
				}
			})
		}	


	}


	

	function writeHouseList(){
		let html = '';
		for(house of ViewModel.house_list){
			house.address = house.street + ', ' + house.city + ', ' + house.state;
			if(house.display){
				html += 	'<div class="house_listitem" id="house_' + parseInt(house.houseId) + '">' +
								'<h5>'+ house.housename +'</h5>' +
								'<p>' + house.address + '</p>' +
							'</div>';
			}
		}
		$('#houselist_frame').html(html);
		$('.house_listitem').click(function(){
			var houseid = parseInt(this.id.split('_')[1]);
			selectHouse(houseid);
		})
	}

	$('#houserequest_housename').keyup(function(event){
		let search_term = $('#houserequest_housename').val().toLowerCase();
		for(house of ViewModel.house_list){
			if(house.housename.toLowerCase().indexOf(search_term) !== -1) house.display = true;
			else if(house.address.toLowerCase().indexOf(search_term) !== -1) house.display = true;
			else house.display = false;
		}
		writeHouseList();
	});

	function selectHouse(houseid){
		let house = ViewModel.house_list.find(house => house.houseId == houseid);
		ViewModel.requestedHouse = house;

		let html = 	'<p>Click submit to request access to:</p>' +
					'<h5>'+ house.housename +'</h5>' +
					'<p>' + house.address + '</p>' +
					'<button id="requestaccess_button" type="button" class="btn btn-raised btn-primary">REQUEST ACCESS</button>&nbsp;&nbsp;&nbsp;' +
					'<button id="cancelhouserequest_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
					'<div id="request_errorbox" style="font-size: 13px; color: red; margin-top: 15px"></div>';


		$("#houserequest_form").hide();

		$('#houseselect_form').html(html).show();

		$('#requestaccess_button').click(function(){
			let req = {
				userId : ViewModel.user.userId,
				houseId : ViewModel.requestedHouse.houseId
			}
			api.callApi('user_requestHouseAssignment', req, function(response){
				if(response.status == "error"){
					$('#request_errorbox').html(escapeForScreen(response.message)).show();
				}
				else if(response.status == "success"){
					$('#houseselect_form').html("You're request has been submitted. Please give us some time to review it and get back to you.");
				}
			});
		})

		$('#cancelhouserequest_button').click(function(){
			$("#houserequest_form").show();

			$('#houseselect_form').hide();

		})
	}


	
	registerHouse = function(){
	
		let house = {
			'housename' : '',
			'street' : '',
			'city' : '',
			'state' : '',
			'zip' : ''
		}

		let green_light = true;


		for(let field in house){
			let v = $('#houseregister_' + field).val();
			let field_good = true;

			// Is it blank?
			if(v == '') {
				$('#houseregisterlabel_' + field).addClass('error');
				field_good = false;
			}

			

			if(field_good) $('#houseregisterlabel_' + field).removeClass('error');
			else green_light = false;

			house[field] = v;

		}

		if(green_light){
			api.callApi('user_createHouse', house, function(response){
				if(response.status == "error"){
					$('#register_errorbox').html(response.message);
				}
				else if(response.status == "success"){
					$('#houseregister_form').hide();
					$('#register_confirm').show();
				}
			})

		}
	}




});




api = {

	apiPath : appConfig.api_url,

	access_token : '',

	initial_request : true,


	callApi : function(method, payload, callbackFunction){

		var req = {
			method: method,
			payload: payload,
			access_token : access_token,
			initial_request : this.initial_request
		}

		let apiCallBack = function(response){
			if('user' in response) {
				ViewModel.user = response.user;
				response = response.response;
			}
			callbackFunction(response);
		}

		$.ajax({
			type: 'POST',
			url: this.apiPath,
			data: JSON.stringify(req),
			success: apiCallBack,
			contentType: "application/json",
			dataType: 'json'
		});

		this.initial_request = false;

		
	}

}


function escapeForScreen(rawStr){
	var encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
   		return '&#'+i.charCodeAt(0)+';';
	});
	return encodedStr;
}

