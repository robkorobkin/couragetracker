<?php 

	Class ResidentList {


		// CAN MAKE MORE COMPLICATED, ADD LOGGING, ETC. LATER
		function handleError($message){
			echo $message;
			exit();
		}


		// CONSTRUCT...
		function __construct(){

			global $db;
			$this -> db = $db;

			$this -> mainList = array();


		} 

		function loadByHouseID($houseId){

			// LOAD MAIN LIST
			if(!$houseId || !is_numeric($houseId)) $this -> handleError("Please provide a HouseId integer. Received: " . $houseId);
			$config['where'] = 'houseId=' . $houseId;
			$this -> db -> select("residents", $config);
			$this -> mainList = $this -> db -> getResponse();

			
			// WHAT IF... WHEN WE SAVE AN EXAM WE ITERATE THE RESIDENT FIELDS ACCORDINGLY

			// get exams and append to resident list
			// $sql = 	"SELECT e.residentId, e.version, e.answers, e.date_taken, e.examId " .
			// 		"FROM exams e, residents r where e.residentId = r.residentId AND r.houseId=" . $houseId . 
			// 		" ORDER BY e.date_taken DESC";
			// $this -> db -> sql($sql);
			// $examsRaw = $this -> db -> getResponse();

			// $exams = array();
			// foreach($examsRaw as $e){
			// 	$exams[$e['residentId']][] = array(
			// 		"answers" => $e['answers'], 
			// 		"v" => $e['version'],
			// 		"date_taken" => $e['date_taken'],
			// 		"examId" => $e['examId']
			// 	);
			// }

			// foreach($this -> mainList as $rIndex => $r){
			// 	if(isset($exams[$r['residentId']])){
			// 		$this -> mainList[$rIndex]['exams'] = $exams[$r['residentId']];	
			// 	}
			// 	else $this -> mainList[$rIndex]['exams'] = array();
			// }

		}
		

		function export(){
			return $this -> mainList;
		}

	}