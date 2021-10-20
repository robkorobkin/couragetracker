<?php


// Admin_Model
// - This model conains the core API calls for powering the admin interface.

// 		METHODS
		// - createResident
		// - updateResident
		// - deleteResident
		// - getResidentById
		// - getFullResidentById
		// - createExam
		// - deleteExam



	Class Admin_Controller extends CT_Controller {
	
		function __construct(){	
			parent::__construct();
		}


		function fetchSelection($query){

			if(!isset($query -> component) || !in_array($query -> component, array('Residents')))
				handleError('Component not ok: ' . $query -> component);

			if(!isset($query -> select)) 
				handleError('Need k:v selection in query.');

			switch($query -> component){

				case 'Residents' :
					$resident = new Resident();
					return $resident -> selectRow($query -> select) -> export();

			}
		}



		function logout(){
			$this -> user -> refreshToken();
			return array("status" => "success");
		}




		function createResident($payload = false){

			// BUILD NEW RESIDENT OBJECT
			$newResident = new Resident();
			$newResident -> setContentFromHash($payload);
			$newResident -> houseId = $this -> user -> current_house['houseId'];

			// INSERT IT & RETURN IT
			$newResident -> insert();
			return $newResident -> export();
		}

			

		function updateResident($payload){

			if(!isset($payload -> residentId) || !is_int($payload -> residentId)) 
				exit ("Please provide a ResidentId integer in the payload.");


			// GET, LOAD AND SAVE RESIDENT
			$resident = new Resident();
			$resident -> loadFromDB($payload -> residentId);
			$resident -> setContentFromHash($payload);
			$resident -> updated = date('Y-m-d  h:i:s A');
			
	
			// SAVE IT AND RETURN IT
			$resident -> save();
			return $resident -> export();
		}

		function deleteResident($residentId = false){

			$resident = new Resident();
			$resident -> loadFromDB($residentId);
			// ToDo: MAKE SURE RESIDENT EXISTS AND USER HAS PERMISSION TO DELETE IT
			
			$resident -> delete();

			// RETURN RESIDENT LIST
			return $this -> getResidentList();
		}

		
	
		function fetchResidentsList(){

			$residentList = new ResidentList();
			return $residentList -> select($this -> user -> current_houseId) -> export();


		}



		function createExam($payload){


			// READ THE PAYLOAD & EXTRACT
			if(!$payload) exit ("No payload provided");
			extract((array)$payload);
			if(!$residentId || !is_int($residentId)) exit ("No resident provided");


			// GET THE RESIDENT
			$resident = new Resident();
			$resident -> loadFromDB($residentId);
			// ToDo: Make Sure User has access to this resident: resident -> houseId == user -> houseId?


			// BUILD NEW EXAM OBJECT
			$exam = new Exam();
			$exam -> setResident($resident);
			$exam -> setContentFromHash($payload);
			$exam -> insert();
	
			
			// ITERATE FOR RESIDENT
			$resident -> oneMoreExam();
			return $resident -> export();
		}

		function deleteExam($examId){
			if(!$examId || !is_int(intval($examId))) exit ("No payload provided");

			// LOOK UP EXAM AND THE GET RESIDENT ID
			$exam = new Exam();
			$exam -> loadFromDB($examId);
			$resident = $exam -> resident;

			// ToDo: check to see if the admin has access?
			$exam -> delete();
			
			return $resident -> export();
		}
		


		function updateUser($payload = false){
			if(!$payload) $this -> _handleError("No payload provided");
			extract($payload);
			if(!$userId || !is_int($userId)) $this -> _handleError("We need a User Id.");


			$user = new User();
			$user -> loadByField(array("userId" => $userId));
			

			// CHECK TO SEE IF YOU HAVE ACCESS TO DO THE UPDATE
			if($this -> user -> access_token != $user -> access_token && $this -> user -> status != 'super'){
				$this -> _handleError(
					"You are trying to update a user other than the one you are logged in as, and you are not an admin.");
			}
		
			
			// UPDATE IT
			$user -> update($payload);


			// RETURN IT
			return array(
				"status" => "success",
				"selectedUser" => $user -> export()
			);
		}

		function selectHouse($houseId){
			$this -> user -> selectHouse($houseId);
			return array( "status" => "success");
		}



	}
