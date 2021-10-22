<?php 

	Class ResidentsModel extends CT_Model {


		

		// CONSTRUCT...
		function __construct($api_payload){

			// primary key
			$this -> primary_key = 'residentId';
			$this -> tableName = 'residents';


			// set up meta fields
			$this -> meta_fields = array(
				'houseId' => 0,
				'examCount' => 0,
				'created' => date('Y-m-d  h:i:s A'),
				'updated' => date('Y-m-d  h:i:s A'),
				'lastExamDate' => '',
				'lastScore' => 0
			);


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


			$this -> json_fields = array(
				"acesScore", 
				"harmScore"
			);


			$this -> search_fields = array('residentId', 'houseId');


			// $this -> exams = new ExamList($api_payload); // must circle back to this


			parent::__construct($api_payload);

			
		} 



		// WHEN RETRIEVING AN OBJECT, APPEND THE EXAMS
		function fetchObject($payload){

			$resident = parent::fetchObject($payload);
			

			// FETCH EXAMS - REDUNDANT WITH EXAMS MODEL, BUT IT WORKS
			$sql = 'SELECT * from exams where residentId=' . $resident -> residentId;
			$exams = $this -> db -> sql($sql) -> getResponse(true);
			foreach($exams as $rowIndex => $row) {
				$exams[$rowIndex]['answers'] = json_decode($exams[$rowIndex]['answersJSON']);
				unset($this -> selected_list[$rowIndex]['answersJSON']);
			}
		
			$resident -> exams = $exams;

			return $resident;
		}




		// VALIDATE CREATE / UPDATE
		function loadContent($content){

			parent::loadContent($content);

			$status_list = array('Current Resident', 'Former Resident');
			if(!in_array($this -> selected_object -> status, $status_list)) 
				handleError('Status must be Current Resident or Former Resident.');

			
		}
		



	}