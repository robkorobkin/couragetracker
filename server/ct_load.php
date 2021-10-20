<?php

	require_once('../../config.php');
	require_once("php_crud.php");
	require_once("emails/client_sendgrid.php");
	require_once("controllers/controller__root.php");
	
	

	

	// LOAD MODELS
	require_once("models/model__root.php");
	require_once('models/model_exam.php');
	require_once('models/model_examlist.php');
	require_once('models/model_house.php');
	require_once('models/model_houselist.php');
	require_once('models/model_resident.php');
	require_once('models/model_residentlist.php');
	require_once('models/model_user.php');
