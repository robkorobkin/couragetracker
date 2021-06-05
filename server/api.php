<?php

	define("APP_URL", "http://localhost/_rctracker");


	include("php_crud.php");
	include("rctrackerModels.php");
	include("userModels.php");
	date_default_timezone_set('America/New_York');
	


	// Read the Request
	$json = file_get_contents('php://input');
	$req = json_decode($json);	
	if(!$req) {
		echo "JSON Decoding Error:\n\n";
		echo json_last_error_msg();
		exit();
	}


	// LOAD THE METHOD
	if(!isset($req -> method)) {
		echo "No method specified.";
		exit();
	}
	$method = $req -> method;


	// AUTHENTICATION
	// ToDo
	// Should run here, every time web hook is hit.
	global $userModel;
	$userModel = new UserModel();

	// HANDLE NO ACCESS TOKEN (NOT LOGGED IN)
	if(!isset($req -> access_token)) {
		$userModel -> logged_in = false;
		if($method != "user_login" && $method != "sendReminder") exit("No access token. We both know you shouldn't be here.");
	}

	// VALIDATE ACCESS TOKEN / LOAD USER
	else {
		$user = $userModel -> loadUser($req -> access_token);

		// HANDLE BAD ACCESS TOKEN
		if(!$user) {
			echo json_encode(array("status" => "error", "message" => "Bad access token."), JSON_PRETTY_PRINT);
			exit();
		}
	}
	


	


	// INSTANTIATE MODEL (if it starts, user_... open user model) AND SEE IF IT SUPPORTS REQUESTED METHOD
	if(explode("_", $method)[0] == "user"){
		$model = $userModel;
		$method = explode("_", $method)[1];
	} 
	else {
		$model = new RCTrackerModel();
		$model -> user = $user;
	}

	if($method[0] == '_') exit("BAD METHOD - STOP TRYING TO HACK ME.");
	
	if(!method_exists ($model, $method)) {
		echo $req -> endpoint . " does not support the method: " . $method;
		exit();
	}

	$payload 	= (isset($req -> payload)) ? $req -> payload : false;
	$response 	= $model -> $method($payload);

	if(isset($req -> initial_request) && $req -> initial_request && $req -> access_token != '' ){
		$response = array(
			"user" => $user,
			"response" => $response
		);
	}



	// PERFORM REQUESTED ACTION AND PRINT RESPONSE (JSON-ENCODED)
	echo json_encode($response, JSON_PRETTY_PRINT);	


