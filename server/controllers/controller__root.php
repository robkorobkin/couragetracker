<?php


	



	
	// API FACTORY
	function ControllerFactory($controllerName){
		switch($controllerName){
			case 'public' 	: return new Public_Controller();
			case 'admin' 	: return new Admin_Controller();
		}
	}


	
	// DEFINE ROOT CLASS
	Class CT_Controller {

		function __construct(){	
			global $db, $sendgridClient;
			$this -> db = $db;
			$this -> sendgridClient = $sendgridClient;
		}



		// HANDLE ERROR - COULD / SHOULD ALSO INCLUDE LOGGING
		function _handleError($message){
			$response = array(
				"status" => "error",
				"message" => $message
			);
			exit(json_encode($response));
		}


	}


	// INCLUDE CHILD CLASSES
	require_once('controller_admin.php');
	require_once('controller_blast.php');
	require_once('controller_login.php');
	require_once('controller_public.php');
	require_once('controller_super.php');


	