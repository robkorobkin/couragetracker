<?php


	Class BlastModel {	// extends CT_Model?
	
		function __construct(){	

			$this -> db = new Database();
			$this -> db -> connect();

		}




		/*

		generateBlast

			input: Blast object

			- validate, create exams, send notifications, store state

			output: Blast object

		*/

		function generateBlast($blast){

			// - validate user
			if(!$this -> user -> isAdmin) $this -> handleError("This action is only available to authorized users.");

			$houseId = $this -> user -> current_house;


			// validate blast object
			$fields = array('note', 'config');
			foreach($fields as $f) if(!isset($blast[$f]) ) $this -> handleError("This field is missing: " . $f);


			// create blast object (so you have blastId, gets updated at the end of this function)
			$newBlast = array(
				'houseId'	=> $houseId,
				'userId'	=> $this -> user -> userId,
				'note'		=> $blast['note'],
				'created'	=> date('Y-m-d  h:i:s A')

				// blastId - auto-incremented
			);

			$blastId = $this -> db -> insert('blasts', $newBlast);




			// - go through residentIdList
			$textNum = 0;
			$emailNum = 0;
			$examHash = array();

			foreach($blas['config'] as $residentId => $requestCode){

				if(!is_int($residentId)) $this -> handleError("Resident ID must be an integer. Given: " . $residentId);

				// 	- Get Resident
				$sql = 'SELECT * FROM residents where residentId=' . $residentId;
				$resident = $this -> db -> query($sql);


				// 	- Validate Resident.
				if($resident -> houseID != $houseId) $this -> handleError("Resident #" . $residentId . " not in the house.");


				// 	- Generate ExamGuid
				$examGuid = uniqid();
				$returnObj[$residentId] = $examGuid;

				// - Create Exam
				$newExam = array(
					// examId - this is generated on creation
					'examGuid' => $examGuid,
					'residentId' => $residentId,
					'blastId' => $blastId,
					'version' => 2,
					'status' => 'assigned',
					'created' => date('Y-m-d  h:i:s A')
					// 'updated', 'answers', 'date_taken', 'submittedBy' - these fields fill when the exam is taken
				);
				$this -> db -> insert('exams', $newExam);



				// 	- Generate Link to Exam.
				$linkAddress = APP_DOMAIN . "/simple.php?e=" . $examGuid;


				// 	- Send Link via Phone / Email.
				if($requestCode == 'text' || $requestCode == 'textemail'){
					$linkAddress .= '&m=text';
					// SEND TEXT
					$textNum++;
				}

				if($requestCode == 'email' || $requestCode == 'textemail'){
					$linkAddress .= '&m=email';
					// SEND EMAIL
					$emailNum++;
				}

			}



			// - Return 
			return $this -> fetchBlast($blastId);
		}


		/* 

		fetchBlast

				input: blastId

				retrieve blast, retrieve exams, merge

				output: Blast object

		*/

		function fetchBlast($blastId){
			if(!is_int($blastId)) $this -> handleError('Need integer. Received: ' . $blastId);


			// GET BLAST
			$sql = 'SELECT * from blasts where blastId=' . $blastId;
			$blast = $this -> db -> get($sql);
			if(!$blast) $this -> handleError("No blast found for blastId: " . $blastId);

			if($blast -> houseId != $this -> user -> current_house) 
				$this -> handleError("This blast isn't associated with the house that you're currently looking at.");



			// GET EXAMS, MERGED WITH RESIDENT INFO
			$sql = 'SELECT e.*, r.* from exams e, residents r where r.residentId = e.residentId AND blastId=' . $blastId;
			$exams = $this -> db -> getRows($sql);
			$blast['exams'] = $exams;


			return $blast;
		}


		
		/* 

		openBlastExam

				input: examGuid

				retrieve exam,resident based on ExamGuid 

				output: Exam object

		*/


		function openBlastExam($examGuid){

			// retrieve exam,resident based on ExamGuid 
			// 		- (no validation, if you have the link you can take the exam)


			$sql = 'SELECT e.*, r.* from exams e, residents r where e.residentId=r.residentId AND e.examGuid=' . $examGuid;
			$exam = $this -> db -> get($sql);


			// output: Exam object	
			return $exam;
		}






		/* 

		saveBlastExam

			input: Exam object

			saves exam, updates blast

			output: confirmation

		*/

		function saveBlastExam($exam){

			// saves exam


			// updates blast
		}

	}





