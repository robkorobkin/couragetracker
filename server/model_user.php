<?php

	Class UserModel {
	
		function __construct(){	

			$this -> db = new Database();
			$this -> db -> connect();

			//$this -> user = $user;

		}


		/**********************************
		*	PRIVATE METHODS
		*	- Handle Error(message)
		* 	- Get New Access Token
		* 	- Check PW(passwor) - validate for entropy
		* 	- Get User By Email (email) - quick getter to search for email internally
		* 	- Get User By Access Token
		* 	- Get User By User ID

		* 	- Send Confirmation Email (user) 
				- Called both when new user created and also if they try to log in before they've confirmed it.

		**********************************/

		function _handleError($message){
			return array(
				"status" => "error",
				"message" => $message
			);
		}


		function _getNewAccessToken(){
			return uniqid();
		}

		// see if PW meets standards - MAKE SURE IT ISN'T A SQL INJECTION, CURRENTLY EMPTY
		function _checkPW($password){
			return true;
		}


		function _getUserByField($key_value){

			// VALIDATE PAYLOAD
			if(!$key_value || !is_array($key_value)) exit ("Please provide a key value pair.");


			// FIELD
			$f = array_key_first($key_value);
			if(!in_array($f, array("email", "access_token", "userId"))) exit("You're not currently allowed to search by: " . $f);

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = $f . '="' . $this -> db -> escapeString($key_value[$f]) . '"';
			$this -> db -> select("users", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) return false;
			$user = $response[0];

			return $user;
		}


		// LOADS USER WITH RELATIONAL DATA TOO
		function _getFullUserByUserId($userId){

			$user = $this -> _getUserByField(array("userId" => $userId));

			$sql = 'SELECT h.*, u.* from houses h, usershouses u where u.userId=' . intval($user['userId']) . ' AND u.houseId=h.houseId';
			$this -> db -> sql($sql);
			$user['houses'] = $this -> db -> getResponse();

			return $user;
		}


		function _getHouseByHouseId($houseId) {
			
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




		/**********************************
		*	SEND EMAILS
		**********************************/


		function _sendConfirmationEmail($newUser) {
			global $sendgridClient;

			$confirm_email_url = APP_URL . "/index.php?v=confirm_email&access_token=" . $newUser['access_token'];
		
// // ONLY WAY NOT TO HAVE WEIRD INDENTS IN EMAIL
$body = 

"Hi " . $newUser['first_name'] . ",

Your registration for RC Tracker is almost complete.

Please click the link below to confirm your email address:
" . $confirm_email_url . "

Once you do, we'll bring you through the final steps of setting up your account.

Thanks so much!

Rob Korobkin
RC Tracker - Lead Developer";


			$email_parameters = array(
				'recipient' => $newUser['email'],
				'subject' => 'Welcome to RC Tracker!',
				'body' => $body
			);

			if(!$sendgridClient -> loadAndSendEmail($email_parameters)){
				$error_message = $sendgridClient -> error_message;
				exit($error_message);
			}

		}


		function _sendReminderEmail($user) {
			global $sendgridClient;

			// SEND EMAIL - ToDo: THIS NEEDS WORK
			$resetpassword_url = APP_URL . "/index.php?v=reset_pw&access_token=" . $user['access_token'];

// // ONLY WAY NOT TO HAVE WEIRD INDENTS IN EMAIL
$body = 

"Hi " . $user['first_name'] . ",

Please click the link below to reset your password:
" . $resetpassword_url . "

Thanks so much!

Rob Korobkin
RC Tracker - Lead Developer";


			$email_parameters = array(
				'recipient' => $user['email'],
				'subject' => 'Click to reset your password!',
				'body' => $body
			);

			if(!$sendgridClient -> loadAndSendEmail($email_parameters)){
				$error_message = $sendgridClient -> error_message;
				exit($error_message);
			}
	
		}





		/**********************************
		*	API ENDPOINTS
		*
		*	BASIC SESSION STUFF
		*	- loadUser(access_token) - loads full user, runs on all signed API calls
		* 	- confirmAccessToken(access_token) - returns user, doesn't check for permissions
		* 	- login, takes email / pw - returns user object
		* 	- confirmEmail - If API from email is submitted, update status of user to "confirmed"
		* 	- Send Reminder (email) - If a person gets locked out, this sends an email to reset their password
		* 	- resetPW - This handles the reset, after they follow the link
		**********************************/


		function loadUser($access_token){

			if(!$access_token || !is_string($access_token)) return $this -> _handleError("No access_token provided.");
			

			// GET THE USER
			$user = $this -> _getUserByField(array('access_token' => $access_token));
			if(!$user) return false;


			// FIGURE OUT WHAT THE USER HAS ACCESS TO
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


				// LOAD DATA FOR EVERY HOUSE - WE MAY WANT TO CONSOLIDATE THIS WITH THE PERMISSIONS CHECK ABOVE
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



		// CONFIRM ACCESS TOKEN
		// - SIMPLER THAN LOAD USER - JUST GETS USER, NOT PERMISSIONS
		function confirmaccesstoken($access_token){
			if(!$access_token || !is_string($access_token)) return $this -> _handleError("No access token submitted.");
			$user = $this -> _getUserByField(array("access_token" => $access_token));
			if(!$user) return $this -> _handleError("Access token not found.");
			return array(
				"status" => "success",
				"user" => $user
			);
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
			$user = $this -> _getUserByField(array("email" => $loginRequest["email"]));
			if(!$user) return $this -> _handleError("User not in database.");


			// CHECK PASSWORD
			$dbpw = $user["password"];
			$newpw = $loginRequest["password"];
			if(!password_verify($newpw, $dbpw)) {
				return $this -> _handleError("Bad password");
			}


			// MAKE NEW ACCESS TOKEN
			$access_token = $this -> _getNewAccessToken();
			$sql = "UPDATE users SET access_token=\"" . $access_token . "\" where userId=" . $user["userId"];
			$user['access_token'] = $access_token;
			$this->db->sql($sql);


			// IF USER HASN'T CONFIRMED THEIR EMAIL YET, DO THAT
			if($user['status'] == 'raw'){
				$this -> _sendConfirmationEmail($user);
				return array("status" => "raw");
			}


			return array(
				"user" => $user,
				"response" => array(
					"access_token" => $access_token,
					"status" => $user['status']
				)
			);
		}


		function logout($access_token){
			if(!$access_token || !is_string($access_token)) return $this -> _handleError("No access token provided.");


			// MAKE NEW ACCESS TOKEN TO LOCK THE DOOR - DON'T SEND THIS BACK TO USER
			$new_access_token = $this -> _getNewAccessToken();
			$sql = "UPDATE users SET access_token=\"" . $this -> db -> escapeString($new_access_token) . "\" 
					where access_token=\"" . $this -> db -> escapeString($access_token) . '"';

			$this->db->sql($sql);
			return array("logout" => "successful");
		}



		
		// THIS RUNS ONLOAD WHEN THE USER FOLLOWS THE SECRET LINK THAT GOT EMAILED TO THEM
		function confirmemail($access_token){
			$user = $this -> _getUserByField(array("access_token" => $access_token));
			if(!$user) return $this -> _handleError("Bad access token. Please try again.");

			$sql = "UPDATE users set status='confirmed' where access_token=\"" . $access_token . "\"";
			$this->db->sql($sql);

			return array("completed" => true);
		}

		


		// REQUESTS THAT EMAIL WITH RESET LINK BE SENT TO SPECIFIED EMAIL (AVAILABLE WITHOUT LOGIN)
		function sendReminder($email){
			
			if(!$email || !is_string($email)) return $this -> _handleError("No email submitted.");

			if (!(filter_var($email, FILTER_VALIDATE_EMAIL))) {
				return $this -> _handleError("Not a valid email.");
			}

			$user = $this -> _getUserByField(array("email" => $email));
			if(!$user) return $this -> _handleError("User not found. It does not appear that you have an account.");
			if($user['status'] == 'locked out')  return $this -> _handleError("It appears your account has been locked out.");


			// RESET ACCESS TOKEN
			$access_token = $this -> _getNewAccessToken();
			$sql = "UPDATE users SET access_token=\"" . $access_token . "\" where userId=" . $user["userId"];
			$this->db->sql($sql);
			$user['access_token'] = $access_token;

			
			$this -> _sendReminderEmail($user);

			return array(
				"status" => "success",
			);
		}
	
		// RESET PASSWORD - UPDATES PASSWORD FOR THE LOGGED-IN USER, CALLED FROM LINK TO RESET
		function resetPW($password){
			if(!$password || !is_string($password)) return $this -> _handleError("No password submitted.");
			if(!$this -> _checkPW($password)) return $this -> _handleError("Password doesn't meet standards.");

			$sql = "UPDATE users set password=\"" . password_hash($password, PASSWORD_DEFAULT) . "\" WHERE userId=" . $this -> user['userId'];

			$this -> db -> sql($sql);
			return array(
				"status" => "success"
			);
		}





		/**********************************
		*	API ENDPOINTS
		*
		*	USER - PERSONAL MANAGEMENT STUFF
		*	- createUser(payload) - reads JSON user object and creates user for it in database
		* 	- updateUser
		**********************************/

		function createUser($userJSON){
			if(!$userJSON) exit ("No payload provided");


			// BUILD NEW RESIDENT OBJECT
			$newUser = array();
			$fields = array("email", "password", "first_name", "last_name");
			foreach($fields as $f){
				if(!isset($userJSON -> $f)) exit("Payload does not include the field: " . $f);
				$newUser[$f] = $this -> db -> escapeString($userJSON -> $f);
			}
			$newUser['created'] = date('Y-m-d  h:i:s A');
			$newUser['updated'] = date('Y-m-d  h:i:s A');
			$newUser['current_house'] = 0;
			$newUser['status'] 	= "raw"; 


			// CHECK IF EMAIL IS GOOD
			if (!(filter_var($newUser["email"], FILTER_VALIDATE_EMAIL))) {
				return $this -> _handleError("Bad email.");
			}
			
			

			// CHECK IF EMAIL IS ALREADY IN THE DATABASE
			$checkUser = $this -> _getUserByField(array("email" => $newUser['email']));
			if($checkUser){
				return $this -> _handleError("Uh oh. That email is already registered.");
			}


			// ToDo: Make sure password passes validation requirements.


			// HASH THE PASSWORD
			$newUser['password'] = password_hash($newUser['password'], PASSWORD_DEFAULT);
			$newUser['access_token'] = $this -> _getNewAccessToken();

			
			// INSERT IT
			$insert_id = $this -> db -> insert("users", $newUser);
			if(!$insert_id) $this -> _handleError("Unable to add user to database");


			// SEND THEM THE CONFIRMATION EMAIL
			$this -> _sendConfirmationEmail($newUser);


			// RETURN SUCCESS
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
				return $this -> _handleError("Bad email.");
			}
			
			// ToDo: Make sure password passes validation requirements.

			// HASH THE PASSWORD
			$updatedUser['password'] = password_hash($updatedUser['password'], PASSWORD_DEFAULT);


			// GET THE OLD USER
			$oldUser = $this -> _getUserBy(array("UserId" => $payload -> userId));
		

			// CHECK TO SEE IF YOU HAVE ACCESS TO DO THE UPDATE
			if($oldUser['access_token'] == $this -> active_user['access_token'] && $this -> active_user['status'] != 'admin'){
				return $this -> _handleError("You are trying to update a user other than the one you are logged in as.");
			}
		
			
			// UPDATE IT
			$where = array("userId" => $payload -> userId);
			if(!$this -> db -> update("users", $updatedUser, $where)){
				return $this -> _handleError("Something went wrong. Not clear why it didn't save.");
			}

			return $this -> _getFullUserByUserId();
		}



		
		/**********************************
		*	API ENDPOINTS
		*
		*	USER - ADMIN MANAGEMENT STUFF
		*	- fetchUserList - for now, at least, this just does a basic lookup for ALL the users. may need more work.
		* 	- fetchUserById - gets full user, endpoint wrapper on _getFullUser
		**********************************/

		function fetchUserList(){

			$user = $this -> user;
			if($user['status'] != 'admin') return $this -> _handleError("You don't have admin access. Can't load.");

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
			return $user;
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
					"status='active' "
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
			if(!$confirm) $this -> _handleError("House failed to save.");
			return array("newHouse" => $this -> getHouseByHouseId($houseId));
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



	
	}


