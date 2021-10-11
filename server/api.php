<?php
	
	require_once('ct_load.php');


	// LOAD THE METHOD
	if(!isset($api_request -> method)) {
		handleError("No method specified.");
	}
	$tmp = explode("_", $api_request -> method);
	if(count($tmp) != 2) handleError('Bad Method: ' . $method);


	// LOAD CONTROLLER
	$controllerName = $tmp[0];
	$controller = ControllerFactory($controllerName);


	// METHOD
	$method = $tmp[1];
	if(!method_exists ($controller, $method)) {
		handleError($controllerName . " controller does not support the method: " . $method);
	}


	// AUTHENTICATION
	global $app_user;
	$app_user = new User();
	$controller -> user = $app_user;

	// don't login public methods
	if($controllerName != 'public'){

		if(!isset($api_request -> access_token))
			handleError("No access token. We both know you shouldn't be here.");
		$app_user -> select(array("access_token" => $api_request -> access_token));
		$app_user -> loadHouses();

		// on initial load, give user information on themselves
		if(isset($api_request -> initial_request) && $api_request -> initial_request && $api_request -> access_token != '' ){
			$api_response['user'] = $app_user -> export();
		}
	}


	// CALL METHOD
	$payload = (isset($api_request -> payload)) ? $api_request -> payload : false;
	$api_response['payload'] = $controller -> $method($payload);
	echo json_encode($api_response, JSON_PRETTY_PRINT);	


