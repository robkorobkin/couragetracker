<?php




	Class Public_Controller extends CT_Controller {
	
		function __construct(){	
			parent::__construct();
		}


		function login($payload){
			
			$user = new User();
			$user -> loadFromLogin($payload);

			if($user -> status == 'raw') {
				$this -> _sendConfirmationEmail($user);
				return array("status" => "raw");
			}
			return$user -> export();
		}



		function createUser($userJSON = false){
			$newUser = new User();
			$newUser -> setContentFromHash($userJSON);
			$newUser -> insert();
			$newUser -> sendWelcomeEmail();
			return array("status" => "success");
		}


		// REQUESTS AN EMAIL WITH A RESET LINK BE SENT TO SPECIFIED EMAIL
		function sendReminder($email){
			
			$user = new User();
			$user -> loadByField(array("email" => $email));
			$user -> refreshToken();
			
			
			// SEND EMAIL TO RESET PASSWORD
			$email_parameters = array(
				'recipient' => $user -> email,
				'subject' 	=> 'Click to reset your password!',
				'template' 	=> 'reset_pw.html',
				'madlibs' 	=> array(
					"first_name" => $user -> first_name,
					"reset_password_url" => APP_URL . "/index.php?v=reset_pw&access_token=" . $user -> access_token
				)
			);
			$this -> sendgridClient -> loadAndSendEmail($email_parameters);
			

			return array(
				"status" => "success",
			);
		}
	}