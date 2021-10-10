<?php



// fetchUserByUserId($userId) 	/ return $user;
// deactivateUser($userId)		/ return confirm;
// loseAccessToHouse(userId, houseId) / return updated user object
// grantAccessToHouse(userId, houseId) / return updated user object 

// createHouse(house) / return house
// updateHouse(house) / return house
// _lookupHouseAssignment($houseId, $userId) / return false / status
// requestHouseAssignment(houseId, userId) / return confirm

// fetchHouseList() / returns all houses
// fetchHouseByHouseId($houseId) / return house



// 		*	USER ADMIN STUFF
// 		*	- fetchUserList - for now, at least, this just does a basic lookup for ALL the users. may need more work.
// 		* 	- fetchUserById - gets full user, endpoint wrapper on _getFullUser


	Class SuperController extends CT_Controller {
	
		function __construct(){	
			parent::__construct();
		}



		/**********************************
		*	API ENDPOINTS - ADMIN MANAGEMENT STUFF
		**********************************/

		function fetchUserList(){

			// QUERY DATABASE FOR RESIDENT
			$sql = 'SELECT u.userId, u.email, u.first_name, u.last_name, u.created, u.updated, u.status, u.current_house, h.housename 
					from users u LEFT JOIN houses h
					on u.current_house=h.houseId';
			$this -> db -> sql($sql);
			$users = $this -> db -> getResponse();

			return $users;
		}

		function fetchUserByUserId($userId){
			if(!$userId || !is_int(intval($userId))) return $this -> _handleError("No user id submitted.");
			if($this -> user['status'] != 'admin') return $this -> _handleError("You don't have admin access. Can't load.");

			$user = $this -> _getFullUserByUserId($userId);
			$user['password'] = '';
			return $user;
		}

		function deactivateUser($userId){


			// VALIDATE INPUT
			if(!$userId || !is_int($userId)) return $this -> _handleError ("No userid or bad userid.");
			

			// RIGHT NOW - ONLY SITE ADMINS CAN DEACTIVATE USERS
			if($this -> active_user['status'] != 'admin') return $this -> _handleError("Error: Only admins can delete users.");


			// CAN'T DELETE YOURSELF
			if($this -> active_user['userId'] == $userId) return $this -> _handleError("You cannot delete yourself.");


			// GET THE OLD USER
			$oldUser = $this -> _getFullUserByUserId($userId);
		
			// DO SOMETHING WITH USER BEFORE YOU DEACTIVATE IT??



			// PERFORM DEACTIVATION
			$updatedUser = array(
				"status" => "deactivated",
				"updated" => date('Y-m-d  h:i:s A')
			);
			if(!$this -> db -> update("users", $updatedUser, "userId=" . $userId)){
				return $this -> _handleError("Something went wrong. Not clear why it didn't save.");
			}


			 // log this somewhere?

			
			return array("status" => "true");
		}

		function loseAccessToHouse($payload){


			// PROCESS NEW INPUT INTO DATA OBJECT
			if(!$payload) exit ("No payload provided");
			if($this -> active_user['status'] != 'admin') return $this -> _handleError("Error: Only admins can delete users.");


			$req = array();
			$fields = array("userId", "houseId");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				if(!is_int($payload -> $f))  exit("This field must be an integer: " . $f);

				$req[$f] = $payload -> $f;
			}


			$sql = "DELETE FROM usershouses where userId=" . $req['userId'] . " AND houseId=" . $req['houseId'];
			$this->db->sql($sql);

			if($payload -> return_type == "user"){
				return $this -> fetchUserByUserId($req['userId']);	
			}
			
			else if($payload -> return_type == "house"){
				return $this -> fetchHouseByHouseId($req['houseId']);	
			}

			else $this -> _handleError("Can't return type: " . $payload -> return_type);			
		}

		function grantAccessToHouse($payload){

			// PROCESS NEW INPUT INTO DATA OBJECT
			if(!$payload) exit ("No payload provided");

			$req = array();
			$fields = array("userId", "houseId");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				if(!is_int($payload -> $f))  exit("This field must be an integer: " . $f);

				$req[$f] = $payload -> $f;
			}

			if(!isset($payload -> return_type)) exit("Payload does not specify return type: house or user.");


			// CHECK TO SEE IF THE USER ALREADY HAS ACCESS?
			$this -> db -> sql("SELECT * from usershouses where houseId=" . $req['houseId'] . " AND userId=" . $req['userId']);
			$assignments = $this -> db -> getResponse();
			if(count($assignments) != 0){
				return $this -> _handleError("Client should have blocked this. Assignment already exists.");
			}


			// INSERT
			$assignment = array(
				"userId"	=> $req['userId'],
				"houseId"	=> $req['houseId'],
				"created"	=> date('Y-m-d  h:i:s A'),
				"updated"	=> date('Y-m-d  h:i:s A'),

				// for now, "user" is the only assignment status available
				"status"	=> "user" 
			);
			$this -> db -> insert("usershouses", $assignment);


			if($payload -> return_type == "user"){
				return $this -> fetchUserByUserId($req['userId']);	
			}
			
			else if($payload -> return_type == "house"){
				return $this -> fetchHouseByHouseId($req['houseId']);	
			}

			else $this -> _handleError("Can't return type: " . $payload -> return_type);		
		}
		

		/**********************************
		*	API ENDPOINTS
		*
		*	HOUSE - BASIC MANAGEMENT
		*	- createHouse
		* 	- updateHouse
		* 	- _lookupHouseAssignment - (private) takes a houseId and a userId and sees if they have a relationship
		* 	- requestHouseAssignment
		* 	- fetchHouseList
		**********************************/

		function createHouse($payload){	

			if(!$payload) exit ("No payload provided");


			// BUILD NEW HOUSE OBJECT
			$newHouse = array();
			$fields = array('housename', 'street', 'city', 'state', 'zip');
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$newHouse[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$newHouse['created'] = date('Y-m-d  h:i:s A');
			$newHouse['updated'] = date('Y-m-d  h:i:s A');


			// INSERT IT
			$insert_id = $this -> db -> insert("houses", $newHouse);



			// IF HOUSE ISN'T BEING CREATED BY AN ADMIN, GRANT CREATOR ACCESS

			if($this -> active_user['status'] != 'admin'){
							// UPDATE AUTHORSHIP
				$connection = array(
					"houseId" 	=> $insert_id,
					"userId" 	=> $this -> user["userId"],
					"created" 	=> date('Y-m-d  h:i:s A'),
					"updated" 	=> date('Y-m-d  h:i:s A'),
					"status" 	=> "creator"
				);
				$this -> db -> insert("usershouses", $connection);


				// UPDATE USER OBJECT
				$sql = "UPDATE users set current_house=" . $insert_id . ", updated=\"" . date('Y-m-d  h:i:s A') . "\", " .
						"status='active' " .
						"WHERE userId=" . $this -> user["userId"];
				$this -> db -> sql($sql);

			}



			// RETURN INSERT ID
			return array(
				"status"	=> "success",
				"selectedHouse" => $this -> fetchHouseByHouseId($insert_id)
			);
		}

		function updateHouse($payload){	

			if(!$payload) exit ("No payload provided");


			// BUILD NEW RESIDENT OBJECT
			$newHouse = array();
			$fields = array('housename', 'street', 'city', 'state', 'zip');
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$newHouse[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$newHouse['updated'] = date('Y-m-d  h:i:s A');


			// ToDo: Is the user authorized to make this change?

			$houseId = intval($payload -> houseId);

			$confirm = $this -> db -> update("houses", $newHouse, "houseId=" . $houseId);
			if(!$confirm) return $this -> _handleError("House failed to save.");
			return array("selectedHouse" => $this -> fetchHouseByHouseId($houseId));
		}

		function _lookupHouseAssignment($houseId, $userId){
			if(!$houseId || !$userId) exit("please submit both a houseId and a userId");
			$sql = "SELECT * from usershouses where houseId=" . intval($houseId) . " and userId=" . intval($userId);
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			return $response[0];
		}

		function requestHouseAssignment($payload){
			if(!$payload) exit ("No payload provided");


			// BUILD NEW RESIDENT OBJECT
			$houseRequest = array();
			$fields = array('houseId', 'userId');
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$houseRequest[$f] = intVal($payload -> $f);
			}


			$ass = $this -> _lookupHouseAssignment($houseRequest['houseId'], $houseRequest['userId']);
			if($ass) {
				return $this -> _handleError("You've already requested access to that house. Level: " . $ass['status']);
			}

			$houseRequest['created'] 	= date('Y-m-d  h:i:s A');
			$houseRequest['updated']  	= date('Y-m-d  h:i:s A');
			$houseRequest['status'] 	= "requested";

			$this -> db -> insert("usershouses", $houseRequest);
			return array(
				"status" => "success"
			);
		}

		// THIS GETS ALL THE HOUSES, DOESN'T SCALE YET
		function fetchHouseList(){
			$sql = 'SELECT * from houses';
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();
			return $response;
		}

		function fetchHouseByHouseId($houseId){
			if(!isset($houseId) || !is_int($houseId)) exit("Bad House ID");
			
			$house = $this -> _getHouseByHouseId($houseId);

			if(!$house) exit("BAD HOUSE ID");


			$sql = 'SELECT * from users u, usershouses uh where u.userId=uh.userId AND uh.houseId=' . $houseId;
			$this -> db -> sql($sql);
			$house['users'] = $this -> db -> getResponse();

			return $house;
		}
	}


// THIS FILE WILL NEED ITS OWN CREATE USER
// REMEMBER TO SET STATUS
// status defaults to raw, but admins can manually set it when the user is created
// $newUser -> status = $userJSON -> status;
