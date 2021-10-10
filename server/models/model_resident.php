<?php 

	Class Resident extends CT_Model {


		// CAN MAKE MORE COMPLICATED, ADD LOGGING, ETC. LATER
		function handleError($message){
			echo $message;
			exit();
		}


		// CONSTRUCT...
		function __construct(){

			global $db;
			$this -> db = $db;


			// primary key
			$this -> residentId = 0;


			// set up meta fields
			$this -> meta_fields = array(
				'houseId',
				'examCount',
				'created',
				'updated',
			);
			$this -> houseId 	= 0;
			$this -> examCount 	= 0;
			$this -> created 	= date('Y-m-d  h:i:s A');
			$this -> updated 	= date('Y-m-d  h:i:s A');


			// set up content fields
			$this -> content_fields = array(
				"status", 
				"first_name", 
				"last_name", 
				"phone", 
				"email", 
				"movein_date",
				"dob"
			);
			foreach($this -> content_fields as $f) $this -> $f = '';


			$this -> json_fields = array(
				"acesScore", 
				"harmScore"
			);
			foreach($this -> content_fields as $f) $this -> $f = false;


			$this -> exams = array();
		} 



// GETTERS
		
		// GET ROW FOR INSERT / UPDATE
		function row(){
			$row = array();
			foreach($this -> content_fields as $f) $row[$f] = $this -> $f;
			foreach($this -> meta_fields as $f) $row[$f] = $this -> $f;
			return $row;
		}


		// APPEND EXAM DATA FOR API RETURN
		function export(){
			$response = $this -> row();
			$response['residentId'] = $this -> residentId;
			$response['exams'] = $this -> exams;
			$response['acesScore'] = $this -> acesScore;
			$response['harmScore'] = $this -> harmScore;
			return $response;
		}


// DATA LOADERS

		// READ RESIDENT FROM DB
		function loadFromDB($residentId){

			// VALIDATE PAYLOAD
			if(!$residentId || !is_int($residentId)) $this -> handleError("Please provide a ResidentId integer as the payload.");


			// QUERY DATABASE FOR RESIDENT
			$this -> db -> select("residents", array("where" => 'residentId=' . $residentId));
			$response = $this -> db -> getResponse();
			if(count($response) == 0) $this -> handleError("Resident not found. ResidentId=" . $residentId);
			$residentData = $response[0];


			// UPDATE INSTANCE WITH DB RESPONSE
			$this -> residentId = $residentData['residentId'];
			foreach($this -> content_fields as $f) $this -> $f = $residentData[$f];
			foreach($this -> meta_fields as $f) $this -> $f = $residentData[$f];
			foreach($this -> json_fields as $f) {
				$this -> $f = json_decode($residentData[$f . "JSON"]);
			}


			// LOAD EXAMS
			// $sql = 'SELECT examId, answers, version, date_taken FROM exams WHERE residentId=' . $this -> residentId;
			// $this -> db -> sql($sql);
			// $response = $this -> db -> getResponse();
			// $this -> exams = $response;
		}


		

			

// SETTERS

		

		

// OPERATIONS		

		function insert(){
			$this -> residentId = $this -> db -> insert("residents", $this -> row());
		}

		function save(){
			$this -> db -> update("residents", $this -> row(), "residentId=" . $this -> residentId);
		}

		function delete(){
			$sql = "DELETE FROM residents WHERE residentId=" . $this -> residentId;
			$this->db->sql($sql);
		}

		function oneMoreExam(){

			$sql = 'UPDATE residents set examCount = examCount + 1 AND updated = "' . date('Y-m-d h:i:s A') . '" ' .
					'where residentId=' . $this -> residentId;
					
			$this->db->sql($sql);
		}

		



	}