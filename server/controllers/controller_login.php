<?php

	/**********************************
			
	LOGIN API

	- These are the endpoints that get called from the login pages, before the user enters the app.

	- They both require access_tokens to run, even though the user has not fully logged in yet.

	**********************************/


	Class LoginController extends CT_Controller {
	
		function __construct(){	
			parent::__construct();
		}

		
		// FROM EMAIL - WELCOME EMAIL / CONFIRMS ADDRESS
		function confirmemail(){
			$this -> user -> confirmEmail();
			return array("status" => "success");
		}

	
		// FROM EMAIL - RESET PASSWORD / ALLOWS USER TO RESET PW
		function resetPW($password){
			$this -> user -> setPw($password);
			return array("status" => "success");
		}

		function requestHouseAssignment($houseId){
			// CREATE USERSHOUSES ROW, STATUS REQUESTED
		}

	}