

// Template Loader: global static
// - all functions take data objects, return HTML strings, no manipulation


TemplateLoader = {


	/********************************************
	*	VIEW: RESIDENT LIST
	*
	*	getResidentListHTML(residents) 		: takes residents list, returns HTML for view
	*	_getResidentListTableHTML(residents) 	: takes residents array, returns HTML for table sub-component
	********************************************/

	writeResidentListMainHTML : function(){

		var html = 	'<div id="residentList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-first_name">Name</th>' +
								'<th id="control-movein_date">Move In</th>' +
								'<th id="control-acesScoreVal">ACE</th>' +
								'<th id="control-harmScoreVal">HARM</th>' +
								'<th id="control-examList.lastExam">Last Assessed</th>' +
								'<th id="control-examList.examCount">Count</th>' +
								'<th id="control-examList.lastScore">Last Score</th>' +
							'</tr>' +
							'<tbody class="mainTable" id="residentTable">' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},


	_writeResidentListTableHTML : function(residentList){

		var html = '';
		$(residentList.mainList).each(function(index, resident){

			if(resident.display){
				html += '<tr id="resident_' + parseInt(resident.residentId) + '">' +
							'<td>' + escapeForHtml(resident.first_name) + ' ' + escapeForHtml(resident.last_name) + '</td>' + 
							'<td>' + escapeForHtml(resident.movein_date_display) + '</td>' +
							'<td>' + escapeForHtml(resident.acesScoreVal) + '</td>' +
							'<td>' + escapeForHtml(resident.harmScoreVal) + '</td>' +
							'<td>' + escapeForHtml(formatDateForOutput(resident.examList.lastExam)) + '</td>' +
							'<td>' + escapeForHtml(resident.examList.examCount) + '</td>' +
							'<td>' + escapeForHtml(resident.examList.lastScore) + '</td>' +
						'</tr>';

			}
		});

		return html;
	},


	writeExamSummaryMainHTML : function(exam){


		var html = 	'<div id="survey_summary">' +
						'<b>' + exam.examTemplate.title + ' of:</b>' +
						'<br /><a id="resident_clickback" href="#">' + 
							exam.resident.first_name + ' ' + exam.resident.last_name + 
						'</a>' +
						'<br /><br /><b>Survey Summary</b><br />' +
						'Date Taken: ' + escapeForHtml(exam.date_taken_label) +
						'<br />Score: ' + escapeForHtml(exam.totalScore) + 
						'<br />Average Score: ' + escapeForHtml(exam.avgScore) +
						'<br /><br /><br /><i>Questions Ranked:</i><br /><br />';

			var qGroups = [];
			$.each(exam.groupedAnswers, function(score, questions){
				if(questions.length == 0) return;
				qGroups.push('<b>' + exam.examTemplate.options[score] + '</b><br />' + questions.join('<br />'));
			})

			html += qGroups.reverse().join('<br /><br />');

			if(exam.isNew){
				html += '<div style="clear: both; margin-top: 30px;"></div>' +
						'<button id="submit_button" type="button" class="btn btn-raised btn-primary">SUBMIT</submit>' + 
						'<button id="back_button" type="button" class="btn btn-raised btn-secondary">BACK</button>';
			}
			else {

				html +=		'<br /><br /><br /><br /><h5>Delete Questionnaire</h5><i>This cannot be undone.</i><br /><br />' +
							'<button id="delete_button" type="button" class="btn btn-raised btn-danger">DELETE</button>';
			}
			html += '</div>';

		return html;
	},



	/********************************************
	*	VIEW: RESIDENT EDITOR
	*
	*	getResidentListViewHTML(residents) 		: takes residents list, returns HTML for view
	*	_getResidentListTableHTML(residents) 	: takes residents array, returns HTML for table sub-component
	********************************************/


	// JUST DOES THE HTML - STATE AND EVENTS ARE SET IN CONTROLLER
	writeResidentSubNavHTML : function(){
		var subnavHTML =
		'<ul class="nav nav-tab">' +
			'<li class="nav-item">' +
				'<a class="nav-link" id="dash_tab" href="#">Questionnaires</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" id="takenew_tab" href="#">TAKE NEW</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link"  id="residentinfo_tab" href="#">Resident Info</a>' +
			'</li>' +
		'</ul>';
		return subnavHTML;
	},


	writeResidentDashMainHTML : function (selected_resident){

		let html = 	this.writeResidentSubNavHTML() +
					'<div class="chart-container" style="position: relative; height:450px; width:800px">' +
						'<canvas id="myChart"></canvas>' +
					'</div>' 
					// + '<button id="postrandomexam_button" type="button" class="btn btn-raised btn-secondary">POST RANDOM EXAM</button>' +
					// '<br /><br /><br />';

		// SHOW THE TABLE OF RECENT EXAMS

		return html;
	},


	writeResidentEditorMainHTML : function (selected_resident){

		let html = 	'';

		if(!selected_resident.isNew) html += this.writeResidentSubNavHTML();

		html +=	'<form id="resident_edit_frame">' +
					 

				 	// NAME INPUTS
					'<div class="form-group">' +
						'<label for="resident_first_name" id="label_first_name" class="bmd-label-floating">First Name</label>' +
						'<input type="text" class="form-control" id="resident_first_name">' +
					'</div>' +
					'<div class="form-group">' +
						'<label for="resident_last_name"  id="label_last_name" class="bmd-label-floating">Last Name</label>' +
						'<input type="text" class="form-control" id="resident_last_name">' +
					'</div>' +


					// STATUS SELECT BOX
					'<div class="form-group">' +
						'<label for="resident_status" class="bmd-label-floating">Status</label>' +
						'<select class="form-control" id="resident_status">' +
							'<option>Current Resident</option>' +
							'<option>Former Resident</option>' +
						'</select>' +
					'</div>' +

					
					// DOB INPUT
					'<div class="form-group">' +
						'<label for="resident_dob" class="bmd-label-floating">Date of Birth (YYYY-MM-DD)</label>' +
						'<input type="text" class="form-control" id="resident_dob">' +
					'</div>' +


					// MOVE-IN DATE INPUT
					'<div class="form-group">' +
						'<label for="resident_movein_date" class="bmd-label-floating">Move-In Date (YYYY-MM-DD)</label>' +
						'<input type="text" class="form-control" id="resident_movein_date">' +
					'</div>' +


 
 					// PHONE / EMAIL INPUTS
 					'<div class="form-group">' +
						'<label for="resident_email" class="bmd-label-floating">Email</label>' +
						'<input type="email" class="form-control" id="resident_email">' +
					'</div>' +

					'<div class="form-group">' +
						'<label for="resident_phone" class="bmd-label-floating">Phone</label>' +
						'<input type="phone" class="form-control" id="resident_phone">' +
					'</div>' +

 
 					// BUTTONS
					'<div id="btnFrame">';
						

				if(selected_resident.isNew) {
					html +=  
						'<button id="add_button" type="button" class="btn btn-raised btn-primary">ADD</button>' + 
						'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>';
				}

				else {
					html +=

						// SAVE / CANCEL
						'<button id="save_button" type="button" class="btn btn-raised btn-primary">SAVE</button>' +
						'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +




						// TAKE ACES AND HARM SCORES
						'<br /><br /><br /><br />';


						// ACES SCORE
						html += '<h5>ACEs Score:</h5>';
						if(selected_resident.acesScore == ''){
							html += '<button id="aces_take" type="button" class="btn btn-raised btn-primary">ADD ACES SCORE</button>';
						}

						else {
							html += '<div class="scorebox">' +
										'<div class="scoreCircle">' + selected_resident.acesScoreVal + '</div>' +
										'<button id="aces_view" type="button" class="btn btn-raised btn-secondary">VIEW</button>' +
										'<button id="aces_take" type="button" class="btn btn-raised btn-primary">REPLACE</button>' +
										'<button id="aces_delete" type="button" class="btn btn-raised btn-danger">DELETE</button>' +
									'</div>';
						}
						
						// HARM SCORE
						html += '<br /><br /><br /><h5>Harm Score:</h5>';
						if(selected_resident.harmScore == ''){
							html += '<button id="harm_take" type="button" class="btn btn-raised btn-primary">ADD HARM SCORE</button>';
						}

						else {
							html += '<div class="scorebox">' +
										'<div class="scoreCircle">' + 
											selected_resident.harmScoreVal + 
										'</div>' +
										'<button id="harm_view" type="button" class="btn btn-raised btn-secondary">VIEW</button>' +
										'<button id="harm_take" type="button" class="btn btn-raised btn-primary">REPLACE</button>' +
										'<button id="harm_delete" type="button" class="btn btn-raised btn-danger">DELETE</button>' +
									'</div>';
						}

						



						// DELETE RESIDENT
						html +=
						'<br /><br /><br /><br /><h5>Delete Resident</h5><i>This cannot be undone.</i><br /><br />' +
						'<button id="delete_button" type="button" class="btn btn-raised btn-danger">DELETE</button>';
				}


		html +=			'</div>' +
					'</form>';

		return html;
	},


	/********************************************
	*	VIEW: TAKE EXAM
	*
	*	getExamHTML(exam) 						: takes exam, returns HTML for exam view
	*	getExamSummaryHTML(examAnswer, exam) 	: takes examAnswer and exam, returns HTML to display summary
	********************************************/


	writeExamMainHTML : function(examTemplate){


		let keyArr = [];
		for(let kIndex in examTemplate.options) keyArr.push(examTemplate.options[kIndex]);
		let keyStr = keyArr.join (' - ');

		let html = 	this.writeResidentSubNavHTML() +
					'<div id="resident_questionnaire_frame">' +

						'<h3>' + examTemplate.title + '</h3>' +
						
						// DATE TAKEN 
						'<div class="form-group">' +
							'<label for="exam_date_taken" id="exam_date_takenlabel" class="bmd-label-floating">Date Taken (YYYY-MM-DD):</label>' +
							'<input type="text" class="form-control" id="exam_date_taken">' +
						'</div>' +

						'<div class="examlegend">KEY: ' + keyStr + '</div>' +



						'<table id="resident_survey_questions" class="exam_' + examTemplate.version + '">';
					
			$(examTemplate.questions).each(function(qIndex){
				var question = examTemplate.questions[qIndex];
				
				var btnHtml = '<form class="btnHtml">';
				for(var score in examTemplate.options){
					var txt = examTemplate.options[score];
					btnHtml += '<div class="radio">' +
									'<label><input type="radio" name="field_' + qIndex + '" value="' + score + '" ' +
											'title="' + score + ' - ' + txt + '" ' +
											'id="question_' + qIndex + '_' + score + '" '  +
											'data-mdb-toggle="tooltip" data-mdb-placement="top"/></label>' +
								'</div>';
				}
				btnHtml += '</form>';


				html += '<tr class="question" id="question_' + qIndex + '">' + 
							'<td>' + btnHtml + '</td>' +
							'<td>' + question + '</td>' +
						'</tr>';
			});

		html += '</table>';

		// SAVE BUTTON
		html += '<div id="btn_frame">' +
					'<button id="save_btn"  type="button" class="btn btn-raised btn-primary">SAVE</button>' +
				'</div>';

		html += '</div>';

		return html;
	},



	/********************************************
	*	VIEW: EXAM LIST
	*
	*	getExamListHTML(residents) 			: returns HTML for view
	*	_getExamListTableHTML(residents) 	: takes exam array, returns HTML for table sub-component
	********************************************/

	writeExamListMainHTML : function(){

		var html = 	'<div id="examList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-date_taken">Date</th>' +
								'<th id="control-resident.first_name">Name</th>' +
								'<th id="control-avgScore">Average Score</th>' +
								'<th id="control-totalScore">Total Score</th>' +
							'</tr>' +
							'<tbody class="mainTable" id="examTable">' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},

	_writeExamListTableHTML : function(examList){
		var html = '';
		$(examList.mainList).each(function(index, exam){
			if(exam.display){
				html += '<tr id="person_' + index + '">' +
							'<td id="field-name' + index + '">' + 
								escapeForHtml(formatDateForOutput(exam.date_taken)) + 
							'</td>' + 
							'<td>' + 
								escapeForHtml(exam.resident.first_name) + ' ' + escapeForHtml(exam.resident.last_name) + 
							'</td>' +
							'<td>' + escapeForHtml(exam.avgScore) + '</td>' +
							'<td>' + escapeForHtml(exam.totalScore) + '</td>' +
						'</tr>';
			}
		});
		return html;
	},

	writeQbyQHTML : function(examList, examTemplate){
		let html = 	'<div class="questionByQuestionHeader">QUESTION BY QUESTION</div>' +

					'<div class="legend">' + 
						'<div class="row">' + 
							'<div class="indicatorCircle status_5"></div> Strongly Agree' +
						'</div>' +
						'<div class="row">' + 
							'<div class="indicatorCircle status_4"></div> Agree' +
						'</div>' +	
						'<div class="row">' + 
							'<div class="indicatorCircle status_3"></div> Sometimes Agree' +
						'</div>' +
						'<div class="row">' + 
							'<div class="indicatorCircle status_2"></div> Disagree' +
						'</div>' +
						'<div class="row">' + 
							'<div class="indicatorCircle status_1"></div> Strongly Disagree ' + 
						'</div>' +
					'</div>' +

					'<table id="resident_survey_questions">';
					
		for(let qIndex = 0; qIndex < examList.questionList.length; qIndex++){

			let question = examList.questionList[qIndex];

			let indicatorHTML = '';
			for(let a of question.a){
				indicatorHTML += '<div class="indicatorCircle status_' + a.s + '"></div>';

			}

			// 

			html += '<tr class="question questionReview" id="question_' + qIndex + '">' + 
						'<td style="vertical-align: top">' + indicatorHTML + '</td>' +
						'<td>' + 
							'<div class="trigger" id="trigger_' + qIndex + '">' + escapeForHtml(question.q) + '</div>' +
							'<div class="details" id="details_' + qIndex + '" style="display: none">';

			for(let a of question.a){
					html +=		'<div class="row">' +
									formatDateForOutput(a.d) + ' - ' + examTemplate.options[a.s] +
								'</div>';
			}


			html +=			'</div>' +
						'</td>' +
					'</tr>';
		}

		html += '</table>';

		return html;
	},


	/********************************************
	*	VIEW: USER LIST
	*
	*	getusersListHTML(userss) 		: returns HTML for view
	*	_getuserssListTableHTML(users) 	: takes houses array, returns HTML for table sub-component

	// "userId": "4",
	// "email": "rob.korobkin@gmail.com",
	// "first_name": "Rob",
	// "last_name": "Korobkin",
	// "created": "2021-06-18  02:20:02 PM",
	// "updated": "2021-06-18  02:20:50 PM",
	// "status": "admin",
	// "current_house": "4",
	// "housename": "Courage House"

	********************************************/

	writeUserListMainHTML : function(){

		let html = 	'<div id="usersList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-userId">ID</th>' +
								'<th id="control-first_name">First Name</th>' +
								'<th id="control-last_name">Last Name</th>' +
								'<th id="control-email">Email</th>' +
								'<th id="control-created">Created</th>' +
								'<th id="control-housename">House</th>' +
								'<th id="control-status">Status</th>' +
							'</tr>' +
							'<tbody class="mainTable" id="usersTable">' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},


	_writeUserListTableHTML : function(userList){

		let html = '';
		$(userList).each(function(index, user){


			if(user.display){
				html += '<tr id="user_' + parseInt(user.userId) + '" class="userrow_' + escapeForHtml(user.status) + '">' +
							'<td>' + 
								parseInt(user.userId) + 
							'</td>' + 
							'<td>' + 
								escapeForHtml(user.first_name) + 
							'</td>' + 
							'<td>' + 
								escapeForHtml(user.last_name) + 
							'</td>' +
							'<td>' + 
								escapeForHtml(user.email) + 
							'</td>' + 
							'<td>' + 
								// convert "2021-06-18  02:20:02 PM" to "June 18, 2021"
								escapeForHtml(formatDateForOutput(user.created.split(' ')[0])) + 
							'</td>' +
							'<td>' + escapeForHtml(user.housename) + 
							'</td>' +
							'<td>' +
								escapeForHtml(user.status) + 
							'</td>'
						'</tr>';


			}
		});
		return html;
	},

	writeUserMainHTML : function(user, houseList){

		let html = 	

		'<form id="user_edit_frame">' +
					 

		 	// NAME INPUTS
		 	this.writeField('user_email', 'Email') +
		 	this.writeField('user_first_name', 'First Name') +
		 	this.writeField('user_last_name', 'Last Name') +
		 	this.writeField('user_password', 'Password') +
		 	this.writeField('user_password2', 'Password (repeat)');


		html +=	
			'<div class="form-group">' +
				'<label class="bmd-label-floating" for="user_status">Status</label>' +
				'<select id="user_status" class="form-control">' +
					'<option value="raw">Raw</option>' +
					'<option value="confirmed">Confirmed</option>' +
					'<option value="active">Active</option>' +
					'<option value="admin">Admin</option>' +
					'<option value="deactivated">Deactivated</option>' +
				'</select>' +
			'</div>' +
			'<div id="error_message"></div>';


		 	if(user.isNew) {
				html +=  
					'<div id="btnFrame">' +
						'<button id="add_button" type="button" class="btn btn-raised btn-primary">ADD</button>' + 
						'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
					'</div>' +
				'</form>';
				return html;
			}


			// STATIC INFO
		
		 	// ADD STATUS DROP DOWN


		html +=
			'<div id="btnFrame">' +
				'<button id="save_button" type="button" class="btn btn-raised btn-primary">SAVE</button>' +
				'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
				'<button id="deactivate_button" type="button" class="btn btn-raised btn-danger">DEACTIVATE</button>' +
			'</div>' +

			
			'<br /><br /><br /><div class="info-panel">' +
				'<b>USER INFO:</b>' +
				'<br />Status: ' + user.status + 
				'<br />Created: ' + user.created + 
				'<br />Updated: ' + user.updated + 
			'</div>' +


			'<br /><br /><br />' +

			'<div class="info-panel">' +
				'<b>HOUSES:</b>';

				for(let house of user.houses){
					html += '<br />' + house.housename + 
						' - <a id="removeacess_' + house.houseId + '" class="remove_link">Remove Access</a>';
				}

		html +=
				'<div class="form-group">' +
					'<label class="bmd-label-floating" for="addhouse_selector">Add House</label>' +
					'<select id="addhouse_selector" class="form-control">';

						for(let house of houseList.mainList){
							html += '<option value="' + house.houseId + '">' + house.housename + '</option>';
						}

		html +=		'</select>' +
				'</div>' +
				'<button id="addhouse_button" type="button" class="btn btn-raised btn-primary">GRANT ACCESS</button>' +
			'</div>';


		return html;
	},


	
	


	/********************************************
	*	VIEW: HOUSE LIST
	*
	*	getHouseListHTML() 				: returns HTML for view
	*	_getHouseListTableHTML(houses) 	: takes houses array, returns HTML for table sub-component
	* 	
		FIELDS:
			houseId
			housename
			street
			city
			state
			zip
			created
			updated

	********************************************/

	writeHouseListMainHTML : function(){

		let html = 	'<div id="housesList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-houseId">ID</th>' +
								'<th id="control-housename">Name</th>' +
								'<th id="control-street">Street</th>' +
								'<th id="control-city">City</th>' +
								'<th id="control-state">State</th>' +
							'</tr>' +
							'<tbody class="mainTable" id="contentTable">' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},

	_writeHouseListTableHTML : function(houseList){
		let html = '';
		$(houseList).each(function(index, house){
			if(house.display){
				html += '<tr id="house_' + parseInt(house.houseId) + '">' +
							'<td>' + 
								parseInt(house.houseId) + 
							'</td>' + 
							'<td>' + escapeForHtml(house.housename) + '</td>' +
							'<td>' + escapeForHtml(house.street) + '</td>' +
							'<td>' + escapeForHtml(house.city) + '</td>' +
							'<td>' + escapeForHtml(house.state) + '</td>' +
						'</tr>';
			}
		});
		return html;
	},

	writeHouseMainHTML : function(house){

		let html = 
			
			'<form id="objectform">' +

				 	// NAME INPUTS
				 	this.writeField('housename', 'House name') +
				 	this.writeField('street', 'Street') +
				 	this.writeField('city', 'City') +
				 	this.writeField('state', 'State') +
				 	this.writeField('zip', 'Zip');


		if(house.isNew) {
			html +=  
				'<div id="btnFrame">' +
					'<button id="add_button" type="button" class="btn btn-raised btn-primary">ADD</button>' + 
					'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
				'</div>' +
			'</form>';
			return html;
		}



		// BUTTONS
		html +=
			'<div id="btnFrame">' +
				'<button id="save_button" type="button" class="btn btn-raised btn-primary">SAVE</button>' +
				'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
				//'<button id="delete_button" type="button" class="btn btn-raised btn-danger">DELETE</button>' +
			'</div>';
	



		// STATIC INFO
		html += 	
			'<br /><br /><br /><div class="info-panel">' +
				'<b>HOUSE INFO:</b>' +
				'<br />Created: ' + house.created + 
				'<br />Updated: ' + house.updated + 
			'</div>' +
			'<br /><br /><br />' +
			'<div class="info-panel">' +

				'<h3>UPDATE MEMBERS</h3><br /><br />' +

				// REQUESTS TO JOIN
				'<b>REQUESTS TO JOIN (Check to Accept):</b><br />';
				for(let user of house.userList.requested){
					html += '<input type="checkbox" class="requestbox" id="requested_' + user.userId + '" />&nbsp;&nbsp;' +
							'<label for="requested_' + user.userId + '">' + user.first_name + ' ' + user.last_name + '</label>' +
							'<br />';	
				}


				// ACTIVE USERS
				html += '<br /><br /><br /><b>ACTIVE MEMBERS (Check to Demote):</b><br />';
				for(let user of house.userList.active){
					html += '<input type="checkbox" class="activebox" id="active_' + user.userId + '" />&nbsp;&nbsp;' +
							'<label for="active_' + user.userId + '">' + user.first_name + ' ' + user.last_name + '</label>' +
							'<br />';	
				}

				
				html += '<br /><br /><br /><b>ADD USERS:</b><br />' +
				'<div class="form-group">' +
					'<label class="bmd-label-floating" for="adduser_selector">Add User</label>' +
					'<select id="adduser_selector" class="form-control">' +
						'<option value="">Select...</option>';
						for(let user of house.userList.potential){
							html += '<option value="' + user.userId + '">' + user.first_name + ' ' + user.last_name + '</option>';
						}
		html +=		'</select>' +

					'<br /><br /><br /><button id="updatemembers_button" type="button" class="btn btn-raised btn-primary">UPDATE MEMBERS</button>'
				'</div>' +
				

			'</div>' + 

		'</form>';

		
		return html;
	},



	writeField : function(fieldName, label){

		let f = escapeForHtml(fieldName);

		let html = '<div class="form-group">' +
						'<label for="field_' + f + '" id="label_' + f + '" class="bmd-label-floating">' + escapeForHtml(label) +'</label>' +
						'<input type="text" class="form-control" id="field_' + f + '">' +
					'</div>';

		return html;

	},


	writeListMainHTML : function(config){

		let html = 	'<div id="mainList_view">' +
						'<table id="mainTable">' +
							'<thead>' +
								'<tr class="headerRow">';


		$(config).each((i,f) => html+= '<th id="control-' + escapeForHtml(f[0]) + '">' + escapeForHtml(f[1]) + '</th>');


		html +=					'</tr>' +
							'</thead>' +
							'<tbody>' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},


	_writeListTableHTML : function(mainList, config){
		let html = '';
		$(mainList).each(function(index, rowObj){
			if(rowObj.display){

				html += '<tr id="row_' + rowObj[config[0][0]] + '">' + "\n";
					$(config).each((i,f) => html+= '<td>' + escapeForHtml(rowObj[f[0]]) + '</td>' + "\n");
				html +=	'</tr>' + "\n" + "\n";
			}
		});
		return html;
	}


}

function escapeForHtml(unsafe) {

	unsafe = String(unsafe);

	if(!unsafe || unsafe == '') return '';

    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
