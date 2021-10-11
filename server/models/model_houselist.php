<?php 

	Class HouseList extends CT_Model {



		// CONSTRUCT...
		function __construct(){

			parent::__construct();

			$this -> mainList = array();

		} 


		function getHouseListForSignUp() {

			$sql = 'SELECT * FROM houses';
			$this -> db -> sql($sql);
			return $this -> db -> getResponse();
			
		}
	}