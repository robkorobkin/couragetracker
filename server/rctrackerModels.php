<?php

	Class RCTrackerModel {
	
		function __construct(){	

			$this -> db = new Database();
			$this -> db -> connect();

		}


		function createResident($payload){

			if(!$payload) exit ("No payload provided");

			// BUILD NEW RESIDENT OBJECT
			//print_r($this -> user);
			$newResident = array();
			$newResident['houseId'] = $this -> user['current_house']['houseId'];
			$fields = array("status", "first_name", "last_name", "phone", "email", "movein_date", "dob");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$newResident[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$newResident['examCount'] 	= 0;
			$newResident['created'] = date('Y-m-d  h:i:s A');
			$newResident['updated'] = date('Y-m-d  h:i:s A');
			
	
			// INSERT IT
			$insert_id = $this -> db -> insert("residents", $newResident);


			return $this -> getFullResidentById($insert_id);

		}

		function updateResident($payload){

			if(!$payload) exit ("No payload provided");
			extract((array)$payload);


			// GET RESIDENT THAT WE'RE UPDATING
			if(!isset($residentId)) exit ("Please provide a ResidentId integer in the payload.");
			if(!is_int($residentId)) exit ("ResidentId is not an integer.");
			$resident = $this -> getResidentById($residentId);


			// BUILD NEW RESIDENT OBJECT
			$fields = array("status", "first_name", "last_name", "phone", "email", "movein_date", "dob");
			foreach($fields as $f){
				if(!isset($payload -> $f)) exit("Payload does not include the field: " . $f);
				$resident[$f] = $this -> db -> escapeString($payload -> $f);
			}
			$resident['updated'] = date('Y-m-d  h:i:s A');
			
	
			// UPDATE IT
			$this -> db -> update("residents", $resident, "residentId=" . $residentId);


			// RETURN FULL RESIDENT
			return $this -> getFullResidentById($residentId);

		}

		function deleteResident($residentId){


			// GET RESIDENT THAT WE'RE UPDATING
			if(!isset($residentId)) exit ("Please provide a ResidentId integer as the payload.");
			if(!is_int($residentId)) exit ("ResidentId is not an integer.");
			$resident = $this -> getResidentById($residentId);
			// ToDo: MAKE SURE RESIDENT EXISTS AND USER HAS PERMISSION TO DELETE IT


			// BUILD NEW RESIDENT OBJECT
			$sql = "DELETE FROM RESIDENTS WHERE ResidentId=" . $residentId;
			$this->db->sql($sql);
	
			
			// RETURN RESIDENT LIST
			return $this -> getResidentList();

		}

		function getResidentById($residentId){

			// VALIDATE PAYLOAD
			if(!$residentId || !is_int($residentId)) exit ("Please provide a ResidentId integer as the payload.");

			// QUERY DATABASE FOR RESIDENT
			$config['where'] = 'residentId=' . $residentId;
			$this -> db -> select("residents", $config);
			$response = $this -> db -> getResponse();


			if(count($response) == 0) exit("Resident not found. ResidentId=" . $residentId);
			$resident = $response[0];

			return $resident;
		}


		function getFullResidentById($residentId){

			$resident = $this -> getResidentById($residentId);

			// QUERY DATABASE FOR EXAMS
			$config['where'] = 'residentId=' . $residentId;
			$this -> db -> select("exams", $config);
			$response = $this -> db -> getResponse();
			$resident['exams'] = $response;

			return $resident;

		}


 

	
		function getResidentList(){

			$houseId = intval($this -> user['current_house']["houseId"]);

			$config['where'] = 'houseId=' . $houseId;
			$this -> db -> select("residents", $config);
			$residents = $this -> db -> getResponse();

			// get exams and append to resident list
			$sql = 	"SELECT e.residentId, e.version, e.answers, e.date_taken " .
					"FROM exams e, residents r where e.residentId = r.residentId AND r.houseId=" . $houseId . 
					" ORDER BY e.date_taken DESC";
			$this -> db -> sql($sql);
			$examsRaw = $this -> db -> getResponse();

			$exams = array();
			foreach($examsRaw as $e){
				$exams[$e['residentId']][] = array(
					"answers" => $e['answers'], 
					"v" => $e['version'],
					"date_taken" => $e['date_taken']
				);
			}

			foreach($residents as $rIndex => $r){
				if(isset($exams[$r['residentId']])){
					$residents[$rIndex]['exams'] = $exams[$r['residentId']];	
				}
				else $residents[$rIndex]['exams'] = array();
			}

			return $residents;




		}



		function createExam($payload){


			// READ THE PAYLOAD & EXTRACT
			if(!$payload) exit ("No payload provided");
			extract((array)$payload);


			// GET THE RESIDENT
			if(!$residentId) exit ("No resident provided");
			$resident = $this -> getResidentById($residentId);
			// ToDo: Make Sure User has access to this resident: resident -> houseId == user -> houseId


			// BUILD NEW EXAM OBJECT
			$newExam = array();

			$newExam['residentId'] 	= $residentId;
			$newExam['date_taken']	= $payload -> date_taken;

			if(!isset($payload -> version) || !is_int($payload -> version)) exit("Payload must include an integer version number.");
			$newExam["version"] = $payload -> version;


			if(!isset($payload -> answers)) exit("Payload does not include any exam answers.");
			if(!is_array($payload -> answers) || count($payload -> answers) == 0) exit("Answers must be an array.");
			$newExam["answers"] = json_encode($payload -> answers);

			$newExam['created'] = date('Y-m-d h:i:s A');
			$newExam['updated'] = date('Y-m-d h:i:s A');
			
	
			// INSERT IT
			$insert_id = $this -> db -> insert("exams", $newExam);


			// ITERATE FOR RESIDENT
			$sql = 'UPDATE residents set examCount = examCount + 1 AND updated = "' . date('Y-m-d h:i:s A') . '" ' .
					'where residentId=' . $residentId;
					
			$this->db->sql($sql);


			return $this -> getFullResidentById($residentId);

		}


		
	}




