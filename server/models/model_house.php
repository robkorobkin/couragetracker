<?php 

	Class House extends CT_Model {



		// CONSTRUCT...
		function __construct(){

			parent::__construct();

			$this -> primary_key = 'houseId';
			$this -> houseId	 = 0;


			$this -> meta_fields = array(
				'created',
				'updated'
			);
			$this -> created = date('Y-m-d  h:i:s A');	
			$this -> updated = date('Y-m-d  h:i:s A');


			$this -> content_fields = array(
				'housename',
				'street',
				'city',
				'state',
				'zip'
			);
			foreach($this -> content_fields as $f) $this -> $f = '';

			$this -> users = array();

		} 


		function loadByHouseId($houseId) {
			
			// VALIDATE PAYLOAD
			if(!$houseId || !is_int($houseId)) exit ("Please provide a houseId as the payload.");

			// QUERY DATABASE FOR HOUSE
			$config['where'] = 'houseId=' . intval($houseId);
			$this -> db -> select("houses", $config);
			$response = $this -> db -> getResponse();
			if(count($response) == 0) 
				$this -> handleError("No user found.");
			$this -> loadFromRow($response[0]);

			

			return $house;
		}
	}