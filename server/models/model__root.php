<?php

	
	// DEFINE ROOT CLASS
	Class CT_Model {

		function __construct($api_payload){	
			global $db, $app_user;
			$this -> db = $db;
			$this -> user = $app_user;
		}


		

	

		// API METHODS
		function fetchObject($payload){
			return $this -> selectRow($payload -> where) -> export();
		}


		function fetchList($payload){
			return $this -> select($payload -> where) -> selected_list;
		}


		function create($payload){
			if(!$payload -> content) handleError("Must have content.");
			$this -> newSelectedObject() -> loadContent($payload -> content);
			$pk = $this -> db -> insert($this -> tableName, $this -> row());
			return $this -> selectRow(array($this -> primary_key => $pk)) -> export();
		}


		function update($payload){
			if(!$payload -> where || !$payload -> content) handleError("Must have both where and content.");
			$whereStr = $this -> buildWhereStr($payload -> where);
			$this -> selectRow($payload -> where) -> loadContent($payload -> content);
			$this -> db -> update($this -> tableName, $this -> row(), $whereStr);
			return $this -> export();
		}


		function delete($payload){

			// VALIDATE
			if(!$payload -> where) handleError("Must have both where.");
			$whereStr = $this -> buildWhereStr($payload -> where);
			if(!isset($payload -> where -> {$this -> primary_key} )) handleError("Must have primary key to delete");


			// DELETE ROW AND UPDATE WHERE
			$this -> selectRow($payload -> where);
			$whereStr = $this -> primary_key . "=" . $this -> selected_object -> {$this -> primary_key};
			$this -> db -> update($this -> tableName, array("status" => "deleted"), $whereStr);
			unset($payload -> where -> {$this -> primary_key});


			// RETURN LIST FOR THE REST OF THE WHERE
			return $this -> select($payload -> where) -> selected_list;
		}
		



		// PUBLIC METHODS, WITHIN SERVER / NOT ACROSS API

		// SELECTED OBJECT TO API RESPONSE 
		// - AS LONG AS OBJECT HAS MAINTAINED STATE OKAY, THIS SHOULD WORK
		// - MAKING IT A METHOD ENABLES YOU TO ADD STUFF IN CHILD CLASSES
		function buildWhereStr($where){

			$where_str = '';

			if(!is_array($where) && !is_object($where)) handleError('please submit where as a key value pair');

			foreach($where as $k => $v) {
				
				if(!is_string($v) && !is_numeric($v)) handleError("Please provide a key value pair for the where.");
				$v = $this -> db -> escapeString($v);


				// ARE WE SEARCHING BY A LEGAL FIELD?
				if(!in_array($k, $this -> search_fields)) 
					handleError("You're not currently allowed to search by: " . $k);

				if($k == 'email' && !(filter_var($v, FILTER_VALIDATE_EMAIL))) {
					handleError("Not a valid email.");
				}

				if($where_str != '') $where_str .= ' AND ';
				$where_str .= $k . '="' . $v . '"';

			}

			if(in_array('status', $this -> content_fields)) $where_str .= ' AND status <> "deleted"';

			return $where_str;

		}


		function validateContent(){

		}


		function export(){
			return $this -> selected_object;

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

			if(!$content) handleError("No content in payload");
			

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
		function select($where, $fail_gracefully = false){


			// MAKE SELECTION
			$sql = 'SELECT * from ' . $this -> tableName . ' where ' . $this -> buildWhereStr($where);
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


			foreach($db_row as $k => $v){
				$this -> selected_object -> $k = $v;
			}

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
