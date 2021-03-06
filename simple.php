<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
		<title>Courage Tracke - Take Questionnaire!</title>


		<!-- GOOGLE FONTS -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"> 

		<!-- Material Design for Bootstrap fonts and icons -->
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons">

		<!-- Material Design for Bootstrap CSS -->
		<link rel="stylesheet" href="https://unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css?vasvasdv" integrity="sha384-wXznGJNEXNG1NFsbm0ugrLFMQPWswR3lds2VeinahP8N0zJw9VWSopbjv2x7WCvX" crossorigin="anonymous">




        <!-- LOAD APP STYLES -->
		<link rel="stylesheet" href="client/theme/simple.css?v=<?php echo time(); ?>">


		<!-- FAVICON -->
		<link rel="apple-touch-icon" sizes="180x180" href="client/theme/favicon/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="client/theme/favicon/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="client/theme/favicon/favicon-16x16.png">
		<link rel="manifest" href="client/theme/favicon/site.webmanifest">
		<link rel="mask-icon" href="client/theme/favicon/safari-pinned-tab.svg" color="#5bbad5">
		<meta name="msapplication-TileColor" content="#da532c">
		<meta name="theme-color" content="#ffffff">

	</head>

	<body>
	
<style>
html, body {
	background:  black;
}
	#mainBuffer {
		height:  667px; width:  375px;
		background: white;
		margin:  100px auto;
		overflow:  scroll;
	}

</style>


		<!-- MAIN CONTENT -->
		<div id="mainBuffer">

			<div id="mainContent" class="card">
					

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
		<script src="client/app/data.js"></script> <!-- HAS TEST FORMAT -->
		<script src="client/app/simple.js"></script>

	</body>
</html>