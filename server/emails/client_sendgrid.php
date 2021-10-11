<?php

	Class RKSendGrid {

		function __construct($sendgrid_config){

			$this -> dev = false; // VERBOSE


			// EXTRACT CONFIG
			$config_parameters = array('access_token', 'from_email');
			foreach($config_parameters as $field){
				if(!isset($sendgrid_config[$field])) handleError('Tried to load SendGridClient without: ' . $field);
			}
			extract($sendgrid_config);
			if (!(filter_var($from_email, FILTER_VALIDATE_EMAIL))) {
				handleError('Tried to load SendGridClient with invalid from_email: ' . $from_email);
			}


			$json_request = '{
			    "personalizations": [
			        {
			            "to": [
			                {
			                    "email": ""
			                }
			            ]
			        }
			    ],
			    "from": {
			        "email": "' . $from_email . '"
			    },
			    "subject": "",
			    "content": [
			        {
			            "type": "text\/plain",
			            "value": ""
			        }
			    ]
			}';

			$this -> request = json_decode($json_request, true);

			$this -> error_message = '';

			$this -> access_token = $access_token;
		}


		protected function setRecipient($email){
			if (!(filter_var($email, FILTER_VALIDATE_EMAIL))) {
				$this -> error_message = 'Tried to send email to invalid email: ' . $email;
				return false;
			}
			$this -> request['personalizations'][0]['to'][0]['email'] = $email;
			return true;
		}


		protected function setSubject($subject){

			// MAKE SURE THERE IS A SUBJECT AND IT ISN'T TOXIC (ToDo)
			if ($subject == '') {
				$this -> error_message = 'Tried to send email with invalid / empty subject: ' . $subject;
				return false;
			}
			$this -> request['subject'] = $subject;
			return true;
		}


		protected function setMessageContent($message){

			// MAKE SURE THERE IS A BODY AND IT ISN'T TOXIC (ToDo)
			if ($message == '') {
				$this -> error_message = 'Tried to send email with invalid / empty message: ' . $message;
				return false;
			}
			$this -> request['content'][0]['value'] = $message;
			return true;
		}


		protected function sendEmail(){
			$session = curl_init('https://api.sendgrid.com/v3/mail/send');

			
			// MAKE curl HAPPY!
			// Tell curl to use HTTP POST
			// Tell curl not to return headers, but do return the response
			// Tell PHP not to use SSLv3 (instead opting for TLS)
			curl_setopt ($session, CURLOPT_POST, true);
			curl_setopt($session, CURLOPT_HEADER, false);
			curl_setopt($session, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
			curl_setopt($session, CURLOPT_RETURNTRANSFER, true);


			// LOAD ACCESS TOKEN
			curl_setopt($session, CURLOPT_HTTPHEADER, [
				'Authorization: Bearer ' . $this -> access_token,
				'Content-Type: application/json']);


			// LOAD REQUEST
			curl_setopt( $session, CURLOPT_POSTFIELDS, json_encode($this -> request) );




			// CALL AND CLOSE
			$response = curl_exec($session);
			
			// if (!curl_errno($ch)) {
			// 	$info = curl_getinfo($ch);
			// 	echo 'Took ', $info['total_time'], ' seconds to send a request to ', $info['url'], "\n";
			// }


			if($response === false) {
				$this -> error_message = 'Curl error: ' . curl_error($session);
				return false;
			}
			$response_message = json_decode($response, true);
			curl_close($session);

			// // DEV: print everything out
			if($this -> dev) {
				print_r($response_message);
			}


			// FINAL VALIDATION
			if(isset($response_message['errors'])){
				$error_message = $response_message['errors'][0]['message'];
				handleError($error_message);

			}
			
			return true;
		}


		function loadAndSendEmail($email_parameters){


			// $email_parameters = array(
			// 	'recipient' => $newUser['email'],
			// 	'subject' => 'Welcome to RC Tracker!',
			// 	'template' => 'registration.html',
			// 	'madlibs' => array(
			// 		"first_name" => $newUser['first_name'],
			// 		"confirm_email_url" => APP_URL . "/index.php?v=confirm_email&access_token=" . $newUser['access_token']
			// 	)
			// );

			// $this -> sendgridClient -> loadAndSendEmail($email_parameters);

			// if(!$sendgridClient -> ){
			// 	$error_message = $sendgridClient -> error_message;
			// 	exit($error_message);
			// }



			// EXTRACT CONFIG
			$email_fields = array('recipient', 'subject', 'template', 'madlibs');
			foreach($email_fields as $field){
				if(!isset($email_parameters[$field])) {
					handleError('Tried to send email without: ' . $field);
				}
			}
			extract($email_parameters);



			// LOAD EMAIL
			if(!$this -> setRecipient($recipient)) handleError("Unable to set recipient: " . $recipient);
			if(!$this -> setSubject($subject))  handleError("Unable to set subject:" . $subject);



			// GENERATE TEMPLATE
			$templateHTML = file_get_contents('emails/' . $template);	
			if(!$templateHTML) handleError('Email template not found: ' . $template);
			foreach($madlibs as $k => $v){
				$keys[] = '{{' . $k . '}}';
				$values[] = $v;
			}
			$body = str_replace($keys, $values, $templateHTML);
			if(!$this -> setMessageContent($body))  handleError("Unable to set body:" . $subject);



			// SEND EMAIL
			if(!$this -> sendEmail()) {
				$error_message = 'ERROR';
				handleError("Failed to send email:" . $error_message);
			}
			
			return true;
		}

	}



?>