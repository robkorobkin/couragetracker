<?php 

	Class ResidentsModel extends CT_Model {


		

		// CONSTRUCT...
		function __construct($api_payload){

			parent::__construct($api_payload);


			// primary key
			$this -> primary_key = 'residentId';
			$this -> tableName = 'residents';


			// set up meta fields
			$this -> meta_fields = array(
				'houseId' => 0,
				'examCount' => 0,
				'created' => date('Y-m-d  h:i:s A'),
				'updated' => date('Y-m-d  h:i:s A'),
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

			$this -> table = 'residents';


			// $this -> exams = new ExamList($api_payload); // must circle back to this

			
		} 



// GETTERS

		// APPEND EXAM DATA FOR API RETURN
		function export(){
			$response = parent::export();
			// $response['exams'] = $this -> exams -> selected_list;
			return $response;
		}

		
		function selectRow($where){
			parent::selectRow($where);
			
			// $this -> exams -> select($where);
			// $this -> debug();

			return $this;
		}
			

// SETTERS

		

		

// OPERATIONS		

		

		function oneMoreExam(){

			$sql = 'UPDATE residents set examCount = examCount + 1 AND updated = "' . date('Y-m-d h:i:s A') . '" ' .
					'where residentId=' . $this -> residentId;
					
			$this->db->sql($sql);
		}

		



	}