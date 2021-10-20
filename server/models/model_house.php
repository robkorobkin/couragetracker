<?php 

	Class House extends CT_Model {



		// CONSTRUCT...
		function __construct(){

			parent::__construct();

			$this -> tableName = 'houses';
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

			$this -> search_fields = array('houseId');

		} 

		function export(){
			$return = $this -> row();
			$return['users'] = $this -> users;
			$return['houseId'] = $this -> houseId;
			return $return;
		}


		function select($key_value, $fail_gracefully = false){
			

			parent::select($key_value);

			$sql = 'SELECT u.userId, u.first_name, u.last_name, u.status as userStatus, h.status as permissionStatus ' .
					'FROM users u ' .
					'LEFT JOIN usershouses h ' .
					'ON u.userId=h.userId AND h.houseId=' . $this -> houseId .
					' where u.status <> "raw" ';


			$users = $this -> db -> sql($sql) -> getResponse();

			$this -> db -> verbose();

			$this -> users = array(
				"requested" => array(),
				"active" => array(),
				"potential" => array()
			);

			foreach($users as $u){

				//print_r($u);

				if($u['permissionStatus'] == 'requested') 
					$this -> users['requested'][] = $u;
				
				else if($u['permissionStatus'] == 'active') 	
					$this -> users['active'][] = $u;

				else if($u['permissionStatus'] == '' && $u['userStatus'] != 'super') 			
					$this -> users['potential'][] = $u;
			}

			return $this;

		}


		// THIS COULD ALSO BE A METHOD ON A USER OBJECT
		
		function updateMembers($permissionsList = false){

			$permissionsList = (array) $permissionsList;

			if(!is_array($permissionsList)) handleError("payload must be an int/status hash");


			foreach($permissionsList as $uId => $permissionStatus){


				// VALIDATE INPUT
				if(!is_int($uId)) 
					handleError('bad user ID: ' + $uId);

				if(!in_array($permissionStatus, array("active", "demote"))) 
					handleError("bad status: " . $permissionStatus);



				// IS THERE AN EXISTING ROW?
				$whereStr = 'where userId=' . $uId . ' AND houseId=' . $this -> houseId;
				$sql = 'SELECT * from usershouses ' . $whereStr;
				// handleError($sql);
				$rowExists = $this -> db -> sql($sql) -> getRow(true);



				if($rowExists){

					/// IF WE'RE DEMOTING, DELETE IT
					if($permissionStatus == 'demote'){
						$sql = 'DELETE from usershouses ' . $whereStr;
						$this -> db -> sql($sql);
					}

					// IF WE'RE ACTIVATING (FROM REQUESTS), UPDATE IT
					if($permissionStatus == 'active'){
						$sql = 'UPDATE usershouses ' .
								'set status="' . $permissionStatus . '", updated="' . date('Y-m-d  h:i:s A') . '" ' .
								$whereStr;
						$this -> db -> sql($sql);		
					}
				}

				// IF WE'RE PROMOTING OUT OF THE BLUE
				else if($permissionStatus == 'active'){

					$assignment = array(
						"userId"	=> $uId,
						"houseId"	=> $this -> houseId,
						"created"	=> date('Y-m-d  h:i:s A'),
						"updated"	=> date('Y-m-d  h:i:s A'),
						"status"	=> $permissionStatus
						// could add a field to record who granted the user access?
					);
					$this -> db -> insert("usershouses", $assignment);
				}
				
			}


			// refresh your model to reflect new permissions
			$this -> select(array('houseId' => $this -> houseId));

			return $this;

		}



		function insert(){
			$this -> houseId = $this -> db -> insert("houses", $this -> row());
		}



	}