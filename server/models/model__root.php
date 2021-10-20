<?php

	
	// DEFINE ROOT CLASS
	Class CT_Model {

		function __construct($api_payload){	
			global $db, $app_user;
			$this -> db = $db;
			$this -> user = $app_user;

			$this -> content_fields = array();
			$this -> meta_fields = array();
			$this -> json_fields = array();
			$this -> search_fields = array();


			// VALIDATE PAYLOAD
			$this -> where = $api_payload -> where;
			$this -> content = $api_payload -> content;


		}


	

		// API METHODS
		function fetchObject($payload){
			return $this -> selectRow($payload -> where) -> export();
		}


		function fetchList($payload){
			return $this -> select($payload -> where) -> selected_list;
		}


		function create($payload){
			echo "flag 1.  ";
			$this -> newSelectedObject() -> loadContent($payload -> content);
			echo "flag 2.  ";
			$pk = $this -> db -> insert($this -> table, $this -> row());
			return $this -> selectRow(array($this -> primary_key => $pk)) -> export();
		}


		function update($payload){
			$this -> selectRow($payload -> where) -> loadContent($payload -> content);
			$whereStr = $this -> primary_key . "=" . $this -> selected_object -> {$this -> primary_key};
			return $this -> db -> update($this -> table, $this -> row(), $whereStr) -> export();
		}


		function delete($payload){
			$this -> selectRow($payload -> where);
			$whereStr = $this -> primary_key . "=" . $this -> selected_object -> {$this -> primary_key};
			$sql = "DELETE FROM " . $this -> table . " WHERE " . $whereStr;
			$this->db->sql($sql);
			unset($payload -> where[$this -> primary_key]);
			return $this -> select($payload -> where) -> selected_list;
		}
		



		// PUBLIC METHODS, WITHIN SERVER / NOT ACROSS API

		// SELECTED OBJECT TO API RESPONSE 
		// - AS LONG AS OBJECT HAS MAINTAINED STATE OKAY, THIS SHOULD WORK
		// - MAKING IT A METHOD ENABLES YOU TO ADD STUFF IN CHILD CLASSES
		function export(){

			$response = array();
			print_r($this -> selected_object);

		}


		// NEW SELECTED OBJECT
		function newSelectedObject(){
			$this -> selected_object = new stdClass();

			foreach($this -> content_fields as $f) 
				$this -> selected_object -> $f = '';
			

			foreach($this -> meta_fields as $f => $v) 
				$this -> selected_object -> $f = $v;


			foreach($this -> json_fields as $f) {
				$this -> selected_object -> $f = new stdClass();
			}
			return $this;
		}



		// GET DB ROW FROM SELECTED OBJECT
		function row(){
			$row = array();
			
			foreach($this -> content_fields as $f) 
				$row[$f] = $this -> selected_object -> $f;
			

			foreach($this -> meta_fields as $f => $v) 
				$row[$f] 	= $this -> selected_object -> $f;


			foreach($this -> json_fields as $f) {
				$row[$f . 'JSON'] = json_encode($this -> selected_object -> $f);
			}

			return $row;
		}


		// UPDATE SELECTED OBJECT FROM API REQUEST
		function loadContent($content){

			foreach($this -> content_fields as $f) 	{
				if(!isset($content -> $f)) handleError("Payload does not include the field: " . $f);
				$this -> selected_object -> $f = $this -> db -> escapeString($content -> $f);
			}


			foreach($this -> json_fields as $f) {
				if(!isset($content -> $f)) $v = false;
				else if(is_object($content -> $f)) handleError('Must be an object: ' . $f);
				else $v = $content -> $f;
				$this -> selected_object -> $f = $v;
			}
			
		}




		// LOADS SELECTED LIST FROM DB
		function select($key_value, $fail_gracefully = false){

			$key_value = (array) $key_value; // api might pass it in as an object


			// VALIDATE PAYLOAD
			if(!$key_value || !is_array($key_value)) 
				handleError("Please provide a key value pair for the where.");

			$f = array_key_first($key_value);

			$v = $key_value[$f];
			if(!is_string($v) && !is_numeric($v)) handleError("Please provide a key value pair for the where.");
			$v = $this -> db -> escapeString($v);


			// ARE WE SEARCHING BY A LEGAL FIELD?
			if(!in_array($f, $this -> search_fields)) 
				handleError("You're not currently allowed to search by: " . $f);

			if($f == 'email' && !(filter_var($v, FILTER_VALIDATE_EMAIL))) {
				handleError("Not a valid email.");
			}


			// MAKE SELECTION
			$sql = 'SELECT * from ' . $this -> tableName . ' where ' . $f . '="' . $v . '"';
			$this -> selected_list = $this -> db -> sql($sql) -> getResponse($fail_gracefully);


			// UNZIP JSON 
			foreach($this -> selected_list as $rowIndex => $row) {
				foreach($this -> json_fields as $f) {
					$this -> selected_list[$rowIndex][$f] = json_decode($this -> selected_list[$rowIndex][$f . 'JSON']);
					unset($this -> selected_list[$rowIndex][$f . 'JSON']);
				}
			}


			
			return $this;
		}

		// LOADS SELECTED OBJECT FROM DB OFF OF WHERE (K => V)
		function selectRow($key_value){
			$this -> selected_object = new stdClass();

			$db_row = $this -> select($key_value) -> selected_list[0];

			foreach($this -> content_fields as $f){
				$this -> selected_object -> $f = $db_row[$f];
			}
			print_r($selected_object);
			
			foreach($this -> meta_fields as $f => $v){
				$this -> selected_object -> $f = $db_row[$f];
			}
			print_r($selected_object);
			
			foreach($this -> json_fields as $f){
				$v = $db_row[$f . 'JSON'] != '' ? json_decode($db_row[$f . 'JSON']) : false;
				$this -> selected_object -> $f = $v;
			}
			print_r($selected_object);

			return $this;
		}





		/**** UTILITIES ****/

		// GENERATE GUID
		function generateKey(){

			return bin2hex(random_bytes(5));

			//ctype_xdigit - will check if incoming keys could have been generated with this
		}

		// see if PW meets standards - MAKE SURE IT ISN'T A SQL INJECTION, CURRENTLY EMPTY
		function checkPW($password){
			return true;
		}

		function password_verify($newpw, $oldpw){
			if(password_verify($newpw, $oldpw)) return true;
			return false;
		}


		/**** SHARED FUNCTIONS ****/
		function debug($prefix = ''){
			$skip = array('db','user','json_fields','search_fields','tableName','primary_key','meta_fields','content_fields');
			foreach($this as $k => $v){
				if(in_array($k, $skip)) continue;
				echo $prefix . $k . "\n"; 
				if(is_object($v) && isset($v -> debug)) { // at this point, aces / harm are objects, but not Objects
					print_r($v);
					$v -> debug('----/');
				}
				else print_r($v); 
				echo "\n\n";
			}
		}
	}
