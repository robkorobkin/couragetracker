<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
date_default_timezone_set('America/New_York');

function handleError($message){
	$response = array(
		"status" => "error",
		"message" => $message
	);
	exit(json_encode($response));
}

	// LOAD MODELS
	require_once('../../config.php');
	require_once("php_crud.php");
	require_once("emails/client_sendgrid.php");
	require_once("controllers/controller__root.php");
	require_once("models/model__root.php");
	

	// DEFINE GLOBAL STATICS - MIGHT AS WELL DO IT HERE
	
	// DB - MAKING THIS GLOBAL AVOIDS RECONNECTING TO SQL A MILLION TIMES
	$db = new Database();
	$db -> connect();


	// GLOBAL EMAIL CLIENT
	global $sendgridClient;
	$sendgrid_config = array(
		'access_token' => SENDGRID_ACCESSTOKEN,
		'from_email' => SENDGRID_FROMEMAIL
	); 
	$sendgridClient = new RKSendGrid($sendgrid_config);
	


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
	$tmp = explode("_", $req -> method);
	//if(count($tmp) != 2) $errorHandler -> handleError('Bad Method: ' . $method);


	// LOAD CONTROLLER
	$controllerName = $tmp[0];
	$controller = ControllerFactory($controllerName);


	// METHOD
	$method = $tmp[1];
	if(!method_exists ($controller, $method)) {
		handleError($controllerName . " model does not support the method: " . $method);
	}


	// AUTHENTICATION
	global $app_user;
	$app_user = new User();
	$controller -> user = $app_user;

	if($controllerName != 'public'){

		if(!isset($req -> access_token))
			exit("No access token. We both know you shouldn't be here.");

		$app_user -> loadByField(array("access_token" => $req -> access_token));
		$app_user -> loadHouses();
	}


	// CALL METHOD
	$payload 	= (isset($req -> payload)) ? $req -> payload : false;
	$apiResponse = array(
		'payload'	=> $controller -> $method($payload),
		'status' 	=> 'success'
	);


	if(isset($req -> initial_request) && $req -> initial_request && $req -> access_token != '' ){
		$apiResponse['user'] = $app_user -> export();
	}


	// Maybe some status information about the api call could be appended here, like runtime?


	// PERFORM REQUESTED ACTION AND PRINT RESPONSE (JSON-ENCODED)
	echo json_encode($apiResponse, JSON_PRETTY_PRINT);	


