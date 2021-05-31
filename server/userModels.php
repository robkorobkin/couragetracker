<?php

	Class UserModel {
	
		function __construct(){	

			$this -> db = new Database();
			$this -> db -> connect();

			//$this -> user = $user;

		}


		function handleError($message){
			return array(
				"status" => "error",
				"message" => $message
			);
		}


		function getNewAccessToken(){
			return uniqid();
		}

		// see if PW meets standards - MAKE SURE IT ISN'T A SQL INJECTION
		function checkPW($password){
			return true;
		}


		function loadUser($access_token){

			if(!$access_token || !is_string($access_token)) return $this -> handleError("No access_token provided.");
			$user = $this -> getUserByAccessToken($access_token);
			if(!$user) return false;

			$this -> db -> select("usershouses", array("where" => "userId=" . intval($user['userId'])));
			$connections = $this -> db -> getResponse();
			if(count($connections) == 0){
				$user['message'] = "No houses.";
				$user['houses'] = array();
			}
			else {
				foreach($connections as $c){
					$user["houses"][intval($c['houseId'])] = $c['status'];
				}


				// if the user either doesn't have a current house, or no longer has access to it
				// set it to the top house that they do have access to and update database
				$current_house = intval($user['current_house']);
				$tophouseid = intval(array_key_first($user['houses']));

				if($current_house == 0 || !isset($user['houses'][$current_house])) {

					$user['current_house'] = $tophouseid;

					$sql = 	"UPDATE users set current_house=" . $tophouseid . 
							" WHERE userId=" . intval($user['userId']);

					$this->db->sql($sql);
				}


				// LOAD DATA FOR EVERY HOUSE
				foreach($user['houses'] as $houseId => $status){
					$this -> db -> sql("SELECT * from houses where houseId=" . $houseId);
					$house = $this -> db -> getResponse()[0];
					$house['access_level'] = $status;
					$user['houses'][$houseId] = $house;
				}
				$user['current_house'] = $user['houses'][$user['current_house']];

			}

			$this -> user = $user;
			
			return $user;
		}

		function createUser($payload){
			if(!$payload) exit ("No payload provided");


			// BUILD NEW RESIDENT OBJECT
			$newUser = array();
			$fields = array("email", "password", "first_name", "last_name");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$newUser[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$newUser['created'] = date('Y-m-d  h:i:s A');
			$newUser['updated'] = date('Y-m-d  h:i:s A');
			$newUser['current_house'] = 0;
			$newUser['status'] 	= "raw"; 


			// CHECK IF EMAIL IS GOOD
			if (!(filter_var($newUser["email"], FILTER_VALIDATE_EMAIL))) {
				return $this -> handleError("Bad email.");
			}
			
			

			// CHECK IF EMAIL IS ALREADY IN THE DATABASE
			$checkUser = $this -> getUserByEmail($newUser['email']);
			if($checkUser){
				return $this -> handleError("Uh oh. That email is already registered.");
			}


			// ToDo: Make sure password passes validation requirements.


			// HASH THE PASSWORD
			/**
			 * We just want to hash our password using the current DEFAULT algorithm.
			 * This is presently BCRYPT, and will produce a 60 character result.
			 *
			 * Beware that DEFAULT may change over time, so you would want to prepare
			 * By allowing your storage to expand past 60 characters (255 would be good)
			 */
			$newUser['password'] = password_hash($newUser['password'], PASSWORD_DEFAULT);
			$newUser['access_token'] = $this -> getNewAccessToken();

			
			// INSERT IT
			$insert_id = $this -> db -> insert("users", $newUser);

			if($insert_id){
				$confirm_email_url = APP_URL . "/login.php?v=confirm_email&access_token=" . $newUser['access_token'];
				return array(
					"confirm_url" => $confirm_email_url,
					"status" => "success"
				);
			}


			
		}

		function confirmemail($access_token){
			$user = $this -> getUserByAccessToken($access_token);
			if(!$user) return $this -> handleError("Bad access token. Please try again.");

			$sql = "UPDATE users set status='confirmed' where access_token=\"" . $access_token . "\"";
			$this->db->sql($sql);

			return array("completed" => true);
		}

		function sendReminder($email){
			
			if(!$email || !is_string($email)) return $this -> handleError("No email submitted.");

			if (!(filter_var($email, FILTER_VALIDATE_EMAIL))) {
				return $this -> handleError("Not a valid email.");
			}

			$user = $this -> getUserByEmail($email);
			if(!$user) return $this -> handleError("User not found. It does not appear that you have an account.");
			if($user['status'] == 'locked out')  return $this -> handleError("It appears your account has been locked out.");


			// RESET ACCESS TOKEN
			$access_token = $this -> getNewAccessToken();
			$sql = "UPDATE users SET access_token=\"" . $access_token . "\" where userId=" . $user["userId"];
			$this->db->sql($sql);

			// SEND EMAIL
			$resetpassword_url = APP_URL . "/login.php?v=reset_pw&access_token=" . $access_token;
			$this -> sendEmail(array(
				"email" => $email,
				"body" => "Please click this link to reset your password: " . $resetpassword_url
			));
			return array(
				"status" => "success",
				"resetpassword_url" => $resetpassword_url
			);

		}

		function confirmaccesstoken($access_token){
			if(!$access_token || !is_string($access_token)) return $this -> handleError("No access token submitted.");
			$user = $this -> getUserByAccessToken($access_token);
			if(!$user) return $this -> handleError("Access token not found.");
			return array(
				"status" => "success",
				"user" => $user
			);
		}


		function resetPW($password){
			if(!$password || !is_string($password)) return $this -> handleError("No password submitted.");
			if(!$this -> checkPW($password)) return $this -> handleError("Password doesn't meet standards.");

			$sql = "UPDATE users set password=\"" . password_hash($password, PASSWORD_DEFAULT) . "\" WHERE userId=" . $this -> user['userId'];

			$this -> db -> sql($sql);
			return array(
				"status" => "success"
			);
		}

		function updateUser($payload){
			if(!$payload) exit ("No payload provided");


			// PROCESS NEW INPUT INTO DATA OBJECT
			$updatedUser = array();
			$fields = array("email", "password", "first_name", "last_name");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$updatedUser[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$updatedUser['updated'] = date('Y-m-d  h:i:s A');


			// CHECK IF EMAIL IS GOOD
			if (!(filter_var($updatedUser["email"], FILTER_VALIDATE_EMAIL))) {
				return $this -> handleError("Bad email.");
			}
			
			// ToDo: Make sure password passes validation requirements.

			// HASH THE PASSWORD
			$updatedUser['password'] = password_hash($updatedUser['password'], PASSWORD_DEFAULT);




			// GET THE OLD USER
			$oldUser = $this -> getUserByUserId($payload -> userId);
		

			// CHECK TO SEE IF YOU HAVE ACCESS TO DO THE UPDATE
			if($oldUser['access_token'] == $this -> active_user['access_token'] && $this -> active_user['status'] != 'admin'){
				return $this -> handleError("You are trying to update a user other than the one you are logged in as.");
			}
		
			
			
			// UPDATE IT
			$where = array("userId" => $payload -> userId);
			if(!$this -> db -> update("users", $updatedUser, $where)){
				return $this -> handleError("Something went wrong. Not clear why it didn't save.");
			}

			return $this -> _getFullUserByUserId();
		}

		function getUserByEmail($email){

			// VALIDATE PAYLOAD
			if(!$email) exit ("Please provide an email as the payload.");

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = 'email="' . $this -> db -> escapeString($email) . '"';
			$this -> db -> select("users", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			$user = $response[0];

			return $user;
		}


		function getUserList(){

			$user = $this -> user;
			if($user['status'] != 'admin') return $this -> handleError("You don't have admin access. Can't load.");

			// QUERY DATABASE FOR RESIDENT
			$sql = 'SELECT u.userId, u.email, u.first_name, u.last_name, u.created, u.updated, u.status, u.current_house, h.housename 
					from users u LEFT JOIN houses h
					on u.current_house=h.houseId';
			$this -> db -> sql($sql);
			$users = $this -> db -> getResponse();

			return $users;
		}


		function fetchUserByUserId($userId){
			if(!$userId || !is_int(intval($userId))) return $this -> handleError("No user id submitted.");
			if($this -> user['status'] != 'admin') return $this -> handleError("You don't have admin access. Can't load.");

			$user = $this -> _getFullUserByUserId($userId);
			return $user;
		}


		function getUserByAccessToken($access_token){

			// VALIDATE PAYLOAD
			if(!$access_token) exit ("Please provide an access_token as the payload.");

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = 'access_token="' . $this -> db -> escapeString($access_token) . '"';
			$this -> db -> select("users", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			$user = $response[0];

			return $user;
		}

		function getUserByUserId($userId){

			// VALIDATE PAYLOAD
			if(!$userId) exit ("Please provide an userId as the payload.");

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = 'userId="' . intval($userId) . '"';
			$this -> db -> select("users", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			$user = $response[0];

			return $user;
		}

		function _getFullUserByUserId($userId){

			$user = $this -> getUserByUserId($userId);

			$sql = 'SELECT h.*, u.* from houses h, usershouses u where u.userId=' . intval($user['userId']) . ' AND u.houseId=h.houseId';
			$this -> db -> sql($sql);
			$user['houses'] = $this -> db -> getResponse();

			return $user;
		}

		function login($payload){
			if(!$payload) exit ("No payload provided");


			// BUILD NEW RESIDENT OBJECT
			$loginRequest = array();
			$fields = array("email", "password");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$loginRequest[$f] = $this -> db -> escapeString($payload -> $f);
			}


			// ATTEMPT TO FETCH USER
			$user = $this -> getUserByEmail($loginRequest["email"]);
			if(!$user) return $this -> handleError("User not in database.");


			// CHECK PASSWORD
			$dbpw = $user["password"];
			$newpw = $loginRequest["password"];
			if(!password_verify($newpw, $dbpw)) {
				return $this -> handleError("Bad password");
			}


			// MAKE NEW ACCESS TOKEN
			$access_token = $this -> getNewAccessToken();
			$sql = "UPDATE users SET access_token=\"" . $access_token . "\" where userId=" . $user["userId"];
			$this->db->sql($sql);

			return array(
				"access_token" => $access_token,
				"user" => $user,
				"status" => $user['status']
			);
		}

		function logout($access_token){
			if(!$access_token || !is_string($access_token)) return $this -> handleError("No access token provided.");

			// MAKE NEW ACCESS TOKEN
			$sql = "UPDATE users SET access_token=\"\" where access_token=\"" . $this -> db -> escapeString($access_token) . '"';
			$this->db->sql($sql);
			return array("logout" => "successful");
		}

		function reset($email){
			if(!$email || !is_string($email)) return $this -> handleError("No email provided.");
			if (!(filter_var($email, FILTER_VALIDATE_EMAIL))) {
				return $this -> handleError("Bad email.");
			}


			$user = $this -> getUserByEmail($email);
			if(!$user) return $this -> handleError("Can't find user.");



			$newpassword = generateRandomString(8);
			
			// UPDATE USER TABLE WITH NEW PASSWORD
			$newpasswordHash = password_hash($newpassword, PASSWORD_DEFAULT);
			$sql = "UPDATE users SET password=\"" . $newpasswordHash . "\" where userId=" . $user['userId'];
			$this->db->sql($sql);


			// SEND EMAIL
			$email_config = array(
				"subject" => "Reset Email",
				"body" => 	"Hello " . $user['first_name'] . ",\n\n" . 
							"Please follow this link to reset your password:\n" . 
							APP_URL . "?reset=" . $newpassword . 
							"\n\n Thanks!"
			);

			$this -> sendEmail($email_config);

			return(array("confirm" => true));
		}

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
			$sql = "UPDATE users set current_house=" . $insert_id . ", updated=\"" . date('Y-m-d  h:i:s A') . "\" " .
					"WHERE userId=" . $this -> user["userId"];
			$this -> db -> sql($sql);


			// RETURN INSERT ID
			return array(
				"status"	=> "success",
				"newHouse" 	=> $insert_id
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

			$houseId = parseInt($payload -> houseId);

			$confirm = $this -> db -> update("houses", $newHouse, array("houseId" => $houseId));
			if(!$confirm) $this -> handleError("House failed to save.");
			return array("newHouse" => $this -> getHouseByHouseId($houseId));

		}

		function getHouseByHouseId($houseId) {
			// VALIDATE PAYLOAD
			if(!$houseId) exit ("Please provide an userId as the payload.");

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = 'houseId=' . parseInt($houseId);
			$this -> db -> select("houses", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			$house = $response[0];

			return $house;
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


			$ass = $this -> lookupHouseAssignment($houseRequest['houseId'], $houseRequest['userId']);
			if($ass) {
				return $this -> handleError("You've already requested access to that house. Level: " . $ass['status']);
			}

			$houseRequest['created'] 	= date('Y-m-d  h:i:s A');
			$houseRequest['updated']  	= date('Y-m-d  h:i:s A');
			$houseRequest['status'] 	= "requested";

			$this -> db -> insert("usershouses", $houseRequest);
			return array(
				"status" => "success"
			);


		}

		function lookupHouseAssignment($houseId, $userId){
			if(!$houseId || !$userId) exit("please submit both a houseId and a userId");
			$sql = "SELECT * from usershouses where houseId=" . intval($houseId) . " and userId=" . intval($userId);
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			return $response[0];

		}



		function sendEmail($email_config){
			// print_r($email_config);
			// echo "\n\n\n I don't work yet.\n\n\n";
		}
		
	}




function generateRandomString($length = 10) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}


