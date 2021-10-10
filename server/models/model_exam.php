<?php 

	Class Exam extends CT_Model {


		// CAN MAKE MORE COMPLICATED, ADD LOGGING, ETC. LATER
		function handleError($message){
			echo $message;
			exit();
		}


		// CONSTRUCT...
		function __construct(){

			global $db;
			$this -> db = $db;

			$this -> examId	= 0;


			$this -> meta_fields = array(
				'examGuid',
				'residentId',
				'userId',
				'blastId',
				'created',
				'updated'
			);
			$this -> examGuid = uniqid();
			$this -> residentId = 0;
			$this -> userId = 0;
			$this -> blastId = 0;
			$this -> created = date('Y-m-d  h:i:s A');	
			$this -> updated = date('Y-m-d  h:i:s A');


			$this -> content_fields = array(
				'version',
				'date_taken',
				'status',
				'submittedVia'
			);

			$this -> version = 1;
			$this -> date_taken = '';
			$this -> status	= 'completed';
			$this -> submittedVia = 'admin';


			$this -> json_fields = array(
				'answers'
			);
			$this -> answers = false;


			$this -> resident = new Resident();

		} 

// GET ROW FOR INSERT / UPDATE
		function row(){
			$row = array();
			foreach($this -> content_fields as $f) $row[$f] = $this -> $f;
			foreach($this -> meta_fields as $f) $row[$f] = $this -> $f;
			return $row;
		}


// DATA LOADERS

		// READ RESIDENT FROM DB
		function loadFromDB($examId){

			// VALIDATE PAYLOAD
			if(!$examId || !is_int($examId)) $this -> handleError("Please provide an ExamId integer as the payload.");


			// QUERY DB			
			$sql = 'SELECT * FROM exams where examId=' . $examId;
			$this -> db -> sql($sql);
			$response = $this -> db -> getResponse();
			if(count($response) == 0) $this -> handleError("The fuck? The exam you're trying to delete doesn't exist.");


			// LOAD RESIDENT
			$residentId = intval($response[0]['residentId']);
			$this -> resident -> loadFromDB($residentId);

		}		

// SETTERS

		function setResident($resident){
			$this -> resident = $resident;
			$this -> residentId = $resident -> residentId;
		}


		function setCotentFromHash($hash){

			$musthaves = array("date_taken", "version", "snswers");
			foreach($musthaves as $m) if(!isset($payload -> $m)) $this -> handleError("Payload missing: " . $m);

			$this -> date_taken = $this -> db -> escapeString($payload -> date_taken);
			$this -> version = int_val($payload -> version);


			if(!is_array($payload -> answers) || count($payload -> answers) == 0)  $this -> handleError("Answers must be an array.");
			$this -> answers = json_encode($payload -> answers);

		}


		

// OPERATIONS		

		function insert(){
			print_r($this -> row());
			$this -> examId = $this -> db -> insert("exams", $this -> row());
		}

		// function save(){
		// 	$this -> db -> update("residents", $this -> row, "residentId=" . $this -> residentId);
		// }

		function delete(){
			$sql = 'UPDATE exams set status="DELETED" where examId=' . $this -> examId;
			$this -> db -> sql($sql);
		}
		



	}