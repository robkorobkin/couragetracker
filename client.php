<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
		<title>RC Tracker</title>


		<!-- GOOGLE FONTS -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"> 

		<!-- Material Design for Bootstrap fonts and icons -->
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons">

		<!-- Material Design for Bootstrap CSS -->
		<link rel="stylesheet" href="https://unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css?vasvasdv" integrity="sha384-wXznGJNEXNG1NFsbm0ugrLFMQPWswR3lds2VeinahP8N0zJw9VWSopbjv2x7WCvX" crossorigin="anonymous">




        <!-- LOAD APP STYLES -->
		<link rel="stylesheet" href="client/theme/client.css?v=<?php echo time(); ?>">


	</head>

	<body>
	

		<!-- HEADER -->
		<div id="header">
			<div id="appLogoFrame">
				<div id="appLogo"></div>
			</div>

			<div id="mainSearchFrame">
				<input type="text" id="mainSearch" class="active">		
			</div>
			

			<div id="rightHeaderFrame">
				<div id="userIcon"></div>
			</div>
		</div>



		<!-- SIDEBAR -->
		<div id="sidebar" class="card">
			<div class="sidebarLink active" onclick="ViewController.loadView('ResidentList')" id="ResidentListLink">Residents</div>
			<div class="sidebarLink" onclick="ViewController.loadView('ExamList')" id="ExamListLink">Questionnaires</div>
			<div class="sidebarLink" id="AnalysisLink">Analysis</div>
			<div class="sidebarLink" onclick="api.logout()">Log Out</div>


			<div id="admin_links" style="display: none">
				<br /><br /><b style="color: #777">ADMIN</b>
				<div class="sidebarLink active"  id="UserListLink" onclick="ViewController.loadView('UserList')">Users</div>
				<div class="sidebarLink" id="HousesListLink" onclick="ViewController.loadView('HousesList')">Houses</div>
				<div class="sidebarLink" id="AllResidentsListLink" onclick="ViewController.loadView('AllResidentsList')">All Residents</div>
				<div class="sidebarLink" id="AllUsersListLink" onclick="ViewController.loadView('AllExamList')">All Exams</div>
			</div>
			

		</div>


		<!-- MAIN CONTENT -->
		<div id="mainBuffer">

			<div id="mainContent" class="card">
			
				<div id="mainHeader">
					<div id="mainHeaderText">Header Text</div>
					<div id="mainHeaderRight">RIGHT</div>
				</div>
				
				<div id="mainBody"></div>		

		    </div>

		</div>


		<!-- jQuery first, then arrive.js (locally), then Popper.js, then Bootstrap JS -->
		

		<script
			  src="https://code.jquery.com/jquery-3.6.0.min.js"
			  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
			  crossorigin="anonymous"></script>


        <script src="client/library/arrive.js"></script>
		<script src="https://unpkg.com/popper.js@1.12.6/dist/umd/popper.js" integrity="sha384-fA23ZRQ3G/J53mElWqVJEGJzU0sTs+SvzG8fXVWP+kJQ1lwFAOkcUOysnlKJC33U" crossorigin="anonymous"></script>
		<script src="https://unpkg.com/bootstrap-material-design@4.1.1/dist/js/bootstrap-material-design.js" integrity="sha384-CauSuKpEqAFajSpkdjv3z9t8E7RlpJ1UP0lKM/+NdtSarroVKu069AlsRPKkFBz9" crossorigin="anonymous"></script>
		<script>$(document).ready(function() { $('body').bootstrapMaterialDesign(); });</script>


	    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.min.js"></script>


		<!-- THEN LOAD THE APP, and awwayyy we gooo! -->
		<script src="client/app/data.js"></script>
		<script src="client/app/models.js"></script>
		<script src="client/app/templates.js"></script>
		<script src="client/app/controller.js"></script>

	</body>
</html>