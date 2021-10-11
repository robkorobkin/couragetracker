<?php 

	Class User extends CT_Model {


	

		// CONSTRUCT...
		function __construct(){

			parent::__construct();

			$this -> tableName = 'users';
			$this -> primary_key = 'userId';
			$this -> userId	= 0;


			$this -> meta_fields = array(
				'current_houseId',
				'access_token',
				'status',
				'created',
				'updated'
			);
			$this -> current_houseId = 0;
			$this -> access_token = $this -> _generateKey();
			$this -> status	= 'raw';
			$this -> created = date('Y-m-d  h:i:s A');	
			$this -> updated = date('Y-m-d  h:i:s A');


			$this -> content_fields = array(
				'email',
				'password',
				'first_name',
				'last_name'
			);

			$this -> email = '';
			$this -> password = '';
			$this -> first_name = '';
			$this -> last_name = '';
			

			$this -> search_fields = array("email", "access_token", "userId");


			$this -> current_house = new House();
			$this -> houses = false; //HouseList();

		} 
		function export(){
			$response = $this -> row();
			$response['userId'] = $this -> userId;
			unset($response['password']);
			$response['houses'] = $this -> houses;
			$response['current_house'] = $this -> current_house;
			//$response -> exams = $this -> exams;
			return $response;
		}


		function validate(){

			// CHECK IF EMAIL IS GOOD
			if (!(filter_var($this -> email, FILTER_VALIDATE_EMAIL))) {
				$this -> _handleError("Bad email.");
			}
			

			// CHECK IF EMAIL IS ALREADY IN THE DATABASE
			$sql = 'SELECT * from users where email="' . $this -> email . '"';
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();
			if(count($response) != 0) $this -> _handleError("Email already taken.");


			// HASH PW
			$this -> password = password_hash($this -> password, PASSWORD_DEFAULT);
		}
		

		function select($key_value){

			parent::select($key_value);


			if($this -> status == 'locked out')  
				$this -> _handleError("It appears your account has been locked out.");


			// LOAD CURRENT HOUSE?
			if($this -> current_houseId != 0){

				
				// GET HOUSE
				$this -> current_house -> select(array('houseId' => $this -> current_houseId));


				// MAKE SURE USER STILL HAS PERMISSION
				if($this -> status != 'super'){
					$sql = 'SELECT status from usershouses where userId=' . $this -> userId . ' AND houseId=' . $house['houseId'];
					$response = $this -> db -> sql($sql) -> getRow();

					// FOR NOW - JUST MAKE SURE THERE'S SOMETHING IN THE PERMISSIONS TABLE
					if(count($response) == 0) {
						$this -> current_house = false;
						$sql = 	"UPDATE users set current_house=0 WHERE userId=" . $this -> userId;
						$this->db->sql($sql);
					}
				}
			}

			return $this;

		}


		function loadFromLogin($payload){

			// BUILD REQUEST OBJECT
			if(!$payload) exit ("No payload provided");
			$loginRequest = array();
			$fields = array("email", "password");
			foreach($fields as $f){
				if(!isset($payload -> $f)) $this -> _handleError("Payload does not include the field: " . $f);
				$loginRequest[$f] = $this -> db -> escapeString($payload -> $f);
			}


			// ATTEMPT TO FETCH USER - LOADS INTO CURRENT INSTANCE
			$this -> loadByField(array("email" => $loginRequest["email"]));
			


			// CHECK PASSWORD
			$dbpw = $this -> password;
			$newpw = $loginRequest["password"];
			if(!$this -> password_verify($newpw, $dbpw)) {
				$this -> _handleError("Bad password");
			}


			// MAKE NEW ACCESS TOKEN
			$this -> refreshToken();

		}



		function loadHouses(){


			// SUPER ACCOUNTS - CAN ACCESS EVERYTHING
			if($this -> status == "super"){
				$this -> db -> sql("SELECT * from houses");
				$this -> houses = $this -> db -> getResponse();
				return;
			}



			// EVERYBODY ELSE IS BOUND BY THEIR PERMISSIONS 
			$sql = 	'SELECT h.*, u.status from houses h, usershouses u ' . 
					'where u.userId=' . $this -> userId . ' AND u.houseId=h.houseId';

			$this -> db -> sql($sql);
			$this -> houses = $this -> db -> getResponse();

			if($this -> status != 'active') return;


			// IF NO CURRENT HOUSE, BUT PERMISSIONS, SET TOP HOUSE AS CURRENT
			if(count($this -> houses) > 0 && $this -> current_house == false){
				$new_house = $this -> houses[0];

				$sql = 	"UPDATE users set current_houseId=" . $new_house -> houseId . " WHERE userId=" . $this -> userId;
				$this->db->sql($sql);

				$this -> current_house = $new_house;
			}
		
		}



		function selectHouse($houseId){

			if(!$houseId || !is_int($houseId)) $this -> _handleError("We need an int.");
			$houseId = intval($houseId);


			$goAhead = false;

			// IS THE USER AN ADMIN
			if($this -> status == 'admin') $goAhead = true;

			// IF NOT, DO THEY HAVE ACCESS TO THE HOUSE
			else if(isset($this -> houses[$houseId])) $goAhead = true;


			// IF GREEN LIGHT, UPDATE USER'S CURRENT_HOUSE
			if(!$goAhead) $this -> _handleError("Either you're not an admin or you don't have access.");

			$sql = "UPDATE users SET current_house=" . $houseId . " where userId=" . $this -> userId;
			$this->db->sql($sql);


		}


		
		function toggleStatus($status){
			if(!in_array($status, array('raw', 'confirmed', 'active', 'super'))) 
				handleError('Bad user status: ' . $status);
			$sql = "UPDATE users set status='" . $status . "' where  userId=" . $this -> userId; 
			$this->db->sql($sql);
		}


		function refreshToken(){
			$access_token = $this -> _generateKey();
			$sql = "UPDATE users SET access_token=\"" . $access_token . "\" where userId=" . $this -> userId;
			$this -> access_token = $access_token;
			$this->db->sql($sql);
		}

		function setPw($password){

			if(!$password || !is_string($password)) return $this -> _handleError("No password submitted.");
			if(!$this -> _checkPW($password)) return $this -> _handleError("Password doesn't meet standards.");

			$sql = "UPDATE users set password=\"" . password_hash($password, PASSWORD_DEFAULT) . "\" WHERE userId=" . $this -> userId;

			$this -> db -> sql($sql);
		}
			

		function insert(){

			$this -> validate();

			// INSERT IT
			$insert_id = $this -> db -> insert("users", $this -> row());
			if(!$insert_id) $this -> _handleError("Unable to add user to database");
			else $this -> userid = $insert_id;
		}

		function update($payload){
			$this -> setContentFromHash($payload);
			$this -> updated = date('Y-m-d  h:i:s A');
			$this -> validate();

			$row = $this -> row();
			if(!isset($payload -> password)) unsert($row['password']);

			if(!$this -> db -> update("users", $this -> row(), "userId=" . $this -> userId)){
				$this -> _handleError("Something went wrong. Not clear why it didn't save.");
			}
		}

		function sendWelcomeEmail(){
			global $sendgridClient, $api_response;

			$confirm_email_url = APP_URL . "/index.php?v=confirm_email&access_token=" . $this -> access_token;
			$api_response['url'] = $confirm_email_url;

			$email_parameters = array(
				'recipient' => $this -> email,
				'subject' 	=> 'Welcome to RC Tracker!',
				'template' 	=> 'registration.html',
				'madlibs' 	=> array(
					"first_name" => $this -> first_name,
					"confirm_email_url" => $confirm_email_url
				)
			);
			$sendgridClient -> loadAndSendEmail($email_parameters);

			return $confirm_email_url;
		}

	}		
