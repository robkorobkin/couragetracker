<?php

	/**********************************
			
	LOGIN API

	- These are the endpoints that get called from the login pages, before the user enters the app.

	- They both require access_tokens to run, even though the user has not fully logged in yet.

	**********************************/


	Class Login_Controller extends CT_Controller {
	
		function __construct(){	
			parent::__construct();
		}

		
		// FROM EMAIL - WELCOME EMAIL / CONFIRMS ADDRESS
		function confirmemail(){
			$this -> user -> toggleStatus('confirmed');
			return "success";
		}

	
		// FROM EMAIL - RESET PASSWORD / ALLOWS USER TO RESET PW
		function confirmAccessToken(){
			return "success"; // User loaded correctly
		}
		function resetPW($password){
			$this -> user -> setPw($password);
			return array("status" => "success");
		}


		// REGISTER USER FLOW
		function fetchHouseList(){
			$houselist = new HouseList();
			return $houselist -> getHouseListForSignUp(); // just gets entire table
		}
		function requestHouseAssignment($houseId = false){
			$house = new House();
			$house -> loadByHouseId($houseId);
			return $house -> requestAccess($this -> user -> userId);
		}
		function createHouse($houseJSON = false){
			
			$house = new House();
			$house -> setContentFromHash($houseJSON);
			$house -> insert();

			// if there's a house, even if the house isn't official, the user can still start working on it
			$this -> user -> toggleStatus('active');
		}
		

	}