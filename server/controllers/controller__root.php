<?php


	// DEFINE ROOT CLASS
	class CT_Controller {


		function LoadGlobalEnvironment(){

			global $db, $sendgridClient;


			// SET ERROR HANDLING
			ini_set('display_errors', 1);
			ini_set('display_startup_errors', 1);
			error_reporting(E_ALL);
			date_default_timezone_set('America/New_York');


			// AND THE HANDLER, DECLARING IT THIS WAY SHOULD PUT IT INTO THE GLOBAL NAMESPACE
			function handleError($message){
				global $api_response;
				$api_response["status"] = "error";
				$api_response["message"] = $message;

				// COULD LOG ERROR HERE?

				exit(json_encode($api_response));
			}


			// DB - MAKING THIS GLOBAL AVOIDS RECONNECTING TO SQL A MILLION TIMES
			$db = new Database(); // config in global config
			$db -> connect();


			// GLOBAL EMAIL CLIENT
			$sendgrid_config = array(
				'access_token' => SENDGRID_ACCESSTOKEN,
				'from_email' => SENDGRID_FROMEMAIL
			); 
			$sendgridClient = new RKSendGrid($sendgrid_config);

		}


		static function Execute($api_request = false){

			if(!$api_request) handleError('No request submitted.');

			// LOAD MODEL
			$model = self::ModelFactory($api_request); // also validates api request
			$modelName = $api_request -> model; 
			$method = $api_request -> method;
			if(!method_exists ($model, $method)) {
				handleError($modelName . " model does not support the method: " . $method);
			}

			$api_response = array(
				"status" => "success",
				"payload" => $model -> $method($api_request -> payload)
			);

			return $api_response;

		}


		static function ModelFactory($api_request){


			// VALIDATE MODEL + METHOD
			if(!isset($api_request -> model) || !is_string($api_request -> model)) {
				handleError("No model specified.");
			}
			$modelName = $api_request -> model;

			if(!isset($api_request -> method) || !is_string($api_request -> method)) {
				handleError("No method specified.");
			}
			$method = $api_request -> method;

			if(!isset($api_request -> payload)) {
				handleError("No payload provided.");
			}
			$api_payload = $api_request -> payload;

			if(!is_object($api_payload)) {
				handleError("Payload must be an object.");
			}
			if(!isset($api_payload -> where)){
				$api_payload -> where = new stdClass();
			}
			if(!is_object($api_payload -> where)) handleError('where must be a k/v hash object');
			
			if(!isset($api_payload -> content)){
				$api_payload -> content = new stdClass();
			}
			if(!is_object($api_payload -> where)) handleError('content must be a k/v hash object');




			// INSTANTIATE AND RETURN MODEL
			switch($modelName){
				case 'Residents' 	: return new ResidentsModel($api_payload);
				case 'Exams' 		: return new ExamsModel($api_payload);
				case 'Blasts' 		: return new BlastsModel($api_payload);
				case 'Houses' 		: return new HousesModel($api_payload);
				case 'Users' 		: return new UsersModel($api_payload);
			}
			handleError('Model not found:' . $modelName);
		}


	}




	// 		global $db, $sendgridClient;
	// 		$this -> db = $db;
	// 		$this -> sendgridClient = $sendgridClient;
	// 	}



	// 