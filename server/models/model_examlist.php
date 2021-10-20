<?php 

	Class ExamList extends CT_Model {

		// CONSTRUCT...
		function __construct(){

			parent::__construct();

			$this -> search_fields = array('residentId', 'houseId');

			$this -> tableName = 'exams';
		}



		function select($where, $fail_gracefully = true){

			// LOAD MAIN LIST - IF EMPTY, RETURN AN EMPTY ARRAY (DON'T BREAK)
			parent::select($where, $fail_gracefully);

			return $this;

		}
		

		function export(){
			return $this -> selected_list;
		}

	}