<?php
	
	require_once("ct_load.php");


	// LOAD ENVIRONMENT
	CT_Controller::LoadGlobalEnvironment();


	// READ REQUEST
	$api_request = json_decode(file_get_contents('php://input'));	
	if(!$api_request) {
		handleError("JSON Decoding Error:\n\n" . json_last_error_msg());
	}
	

	// EXECUTE
	$api_response = CT_Controller::Execute($api_request);
	echo json_encode($api_response, JSON_PRETTY_PRINT);	





	


	// AUTHENTICATION
	// global $app_user;
	// $app_user = new User();
	// $controller -> user = $app_user;

	// // don't login public methods
	// if($controllerName != 'public'){

	// 	if(!isset($api_request -> access_token))
	// 		handleError("No access token. We both know you shouldn't be here.");
	// 	$app_user -> selectRow(array("access_token" => $api_request -> access_token));
	// 	$app_user -> loadHouses();

	// 	// on initial load, give user information on themselves
	// 	if(isset($api_request -> initial_request) && $api_request -> initial_request && $api_request -> access_token != '' ){
	// 		$api_response['user'] = $app_user -> export();
	// 	}
	// }


