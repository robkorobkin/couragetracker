<?php 

	Class ExamsModel extends CT_Model {



		// CONSTRUCT...
		function __construct($api_payload){

			

			$this -> tableName = 'exams';


			$this -> meta_fields = array(
				'examGuid' => $this -> generateKey(),
				//'userId' => $this -> user -> userId, // ToDo: fix this once auth system is back in place
				'blastId' => 0,
				'created' => date('Y-m-d  h:i:s A'),
				'updated' => date('Y-m-d  h:i:s A'),
				'submittedVia' => 'admin'
			);
			
			$this -> content_fields = array(
				'version',
				'date_taken',
				'status',
				'residentId',
				'userId'
			);


			$this -> json_fields = array(
				'answers'
			);

			$this -> search_fields = array(
				'residentId', 'blastId', 'houseId'
			);

			parent::__construct($api_payload);


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


		



		function oneMoreExam(){

			$sql = 'UPDATE residents set examCount = examCount + 1 AND updated = "' . date('Y-m-d h:i:s A') . '" ' .
					'where residentId=' . $this -> residentId;
					
			$this->db->sql($sql);
		}




	}