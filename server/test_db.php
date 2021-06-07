<?php

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);


	include("config.php");


 	$conn = new mysqli(DB_HOST,DB_USER,DB_PASS,DB_NAME);


    if($conn->connect_errno > 0){
        exit($conn->error);
    }

    else{
        echo "SUCCESFULLY CONNECTED TO THE DATABASE";
    }



     $sql="INSERT INTO `logins` (`userId`, `loginTime`, `logoutTime`) VALUES ('1', 'time1', 'time2');";


    if($ins = $conn->query($sql)){
        echo $conn -> insert_id;
    }else{
        exit($conn->error);
    }