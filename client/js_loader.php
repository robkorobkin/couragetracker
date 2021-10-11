<?php

	header('Content-Type: application/javascript');

	$controllers = array(
		'controller__root.js',
		'controller_blasts.js',
		'controller_exams.js',
		'controller_houses.js',
		'controller_residents.js',
		'controller_users.js'
	);

	foreach($controllers as $c) echo file_get_contents('app/controllers/' . $c);






	echo file_get_contents('app/app.js');
