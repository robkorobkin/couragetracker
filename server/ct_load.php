<?php

	// GLOBALS
	global $api_request, $api_response, $db, $sendgridClient;



	// SET ERROR HANDLING
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	date_default_timezone_set('America/New_York');

	function handleError($message){
		global $api_response;
		$api_response["status"] = "error";
		$api_response["message"] = $message;

		// COULD LOG ERROR HERE?

		exit(json_encode($api_response));
	}



	// Read the Request
	$api_request = json_decode(file_get_contents('php://input'));	
	if(!$api_request) {
		handleError("JSON Decoding Error:\n\n" . json_last_error_msg());
	}



	// Begin the Response
	$api_response = array(
		"status" => "success"
	);

	



	// LOAD MODELS
	require_once('../../config.php');
	require_once("php_crud.php");
	require_once("emails/client_sendgrid.php");
	require_once("controllers/controller__root.php");
	require_once("models/model__root.php");
	

	// DB - MAKING THIS GLOBAL AVOIDS RECONNECTING TO SQL A MILLION TIMES
	$db = new Database();
	$db -> connect();


	// GLOBAL EMAIL CLIENT
	$sendgrid_config = array(
		'access_token' => SENDGRID_ACCESSTOKEN,
		'from_email' => SENDGRID_FROMEMAIL
	); 
	$sendgridClient = new RKSendGrid($sendgrid_config);

	
	


	