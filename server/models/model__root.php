<?php


	// DEFINE GLOBAL STATICS
	$db = new Database();
	$db -> connect();

	
	
	
	// DEFINE ROOT CLASS
	Class CT_Model {

		function __construct(){	
			global $db, $app_user;
			$this -> db = $db;
			$this -> user = $app_user;

			$this -> json_fields = array();
		}


		// HANDLE ERROR - COULD / SHOULD ALSO INCLUDE LOGGING
		function _handleError($message){
			$response = array(
				"status" => "error",
				"message" => $message
			);
			exit(json_encode($response, JSON_PRETTY_PRINT));
		}


		/**** UTILITIES ****/

		// GENERATE GUID
		function _generateKey(){

			return bin2hex(random_bytes(5));

			//ctype_xdigit - will check if incoming keys could have been generated with this
		}

		// see if PW meets standards - MAKE SURE IT ISN'T A SQL INJECTION, CURRENTLY EMPTY
		function _checkPW($password){
			return true;
		}

		function password_verify($newpw, $oldpw){
			if(password_verify($newpw, $oldpw)) return true;
			return false;
		}


		/**** SHARED FUNCTIONS ****/

		// GET ROW FOR INSERT / UPDATE
		function row(){
			$row = array();
			foreach($this -> content_fields as $f) $row[$f] = $this -> $f;
			foreach($this -> meta_fields as $f) $row[$f] 	= $this -> $f;
			foreach($this -> json_fields as $f) $row[$f . 'JSON'] = json_encode($this -> $f);
			return $row;
		}


		function loadFromRow($row){
			foreach($this -> content_fields as $f) 	$this -> $f = $row[$f];
			foreach($this -> meta_fields as $f) 	$this -> $f = $row[$f];
			$pk = $this -> primary_key;
			$this -> $pk = (int) $row[$pk];
			return $row;
		}


		function setContentFromHash($hash){
			foreach($this -> content_fields as $f){
				if(!isset($hash -> $f)) $this -> handleError("Payload does not include the field: " . $f);
				$this -> $f = $this -> db -> escapeString($hash -> $f);
			}

			foreach($this -> json_fields as $f){
				$this -> $f = $hash -> $f;
			}
		}



		function select($key_value){

			$key_value = (array) $key_value; // api might pass it in as an object


			// VALIDATE PAYLOAD
			if(!$key_value || !is_array($key_value)) 
				$this -> _handleError("Please provide a key value pair.");

			$f = array_key_first($key_value);
			$v = $this -> db -> escapeString($key_value[$f]);


			// ARE WE SEARCHING BY A LEGAL FIELD?
			if(!in_array($f, $this -> search_fields)) 
				handleError("You're not currently allowed to search by: " . $f);

			if($f == 'email' && !(filter_var($v, FILTER_VALIDATE_EMAIL))) {
				handleError("Not a valid email.");
			}


			// MAKE SELECTION
			$sql = 'SELECT * from ' . $this -> tableName . ' where ' . $f . '="' . $v . '"';
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();
			if(count($response) == 0) 
				handleError("Row not found.");
			$db_row = $response[0];
			$this -> loadFromRow($db_row);



			return $this;
		}
	}


	// INCLUDE CHILD CLASSES
	require_once('model_exam.php');
	require_once('model_house.php');
	require_once('model_houselist.php');
	require_once('model_resident.php');
	require_once('model_residentlist.php');
	require_once('model_user.php');


	