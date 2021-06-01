

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
							'<td>' + escapeForHtml(resident.examList.lastExam) + '</td>' +
							'<td>' + escapeForHtml(resident.examList.examCount) + '</td>' +
							'<td>' + escapeForHtml(resident.examList.lastScore) + '</td>' +
						'</tr>';

			}
		});

		return html;
	},



	/********************************************
	*	VIEW: RESIDENT EDITOR
	*
	*	getResidentListViewHTML(residents) 		: takes residents list, returns HTML for view
	*	_getResidentListTableHTML(residents) 	: takes residents array, returns HTML for table sub-component
	********************************************/

	writeExamSummaryMainHTML : function(exam){


		var html = 	'<div id="survey_summary">' +
						'<b>Recovery Capital Assessment of:</b>' +
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

			html += '</div>';

		return html;
	},


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
					'</div>' +
					'<button id="postrandomexam_button" type="button" class="btn btn-raised btn-secondary">POST RANDOM EXAM</button>';

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
							'<label for="resident_dob" class="bmd-label-floating">Date of Birth</label>' +
							'<input type="text" class="form-control" id="resident_dob">' +
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
							'<button id="save_button" type="button" class="btn btn-raised btn-primary">SAVE</button>' +
							'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
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

		let html = 	this.writeResidentSubNavHTML() +
					'<div id="resident_questionnaire_frame">' +
						
						// DATE TAKEN 
						'<div class="form-group">' +
							'<label for="exam_date_taken" id="exam_date_takenlabel" class="bmd-label-floating">Date Taken (YYYY-MM-DD):</label>' +
							'<input type="text" class="form-control" id="exam_date_taken">' +
						'</div>' +


						'<table id="resident_survey_questions">';
					
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
						'</div>';
			});

		html += '</table>' +
				'<div id="btn_frame">' +
					'<button id="save_btn"  type="button" class="btn btn-raised btn-primary">SAVE</button>' +
				'</div>' +
			'</div>';

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
								'<th id="control-first_name">Name</th>' +
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
		$(examList.examList).each(function(index, exam){
			if(exam.display){
				html += '<tr id="person_' + index + '">' +
							'<td id="field-name' + index + '">' + 
								escapeForHtml(exam.date_taken) + 
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



	/********************************************
	*	VIEW: USER LIST
	*
	*	getUsersListHTML(residents) 		: returns HTML for view
	*	_getUsersListTableHTML(residents) 	: takes users array, returns HTML for table sub-component
	********************************************/

	writeUserListMainHTML : function(){

		let html = 	'<div id="usersList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-userId">ID</th>' +
								'<th id="control-created">Created</th>' +
								'<th id="control-first_name">Name</th>' +
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
				html += '<tr id="user_' + index + '">' +
							'<td>' + 
								parseInt(user.userId) + 
							'</td>' + 
							'<td id="field-name' + index + '">' + 
								escapeForHtml(user.created_display) + 
							'</td>' + 
							'<td>' + 
								escapeForHtml(user.first_name) + ' ' + escapeForHtml(user.last_name) + 
							'</td>' +
							'<td>' + escapeForHtml(user.housename) + '</td>' +
							'<td>' + escapeForHtml(user.status) + '</td>' +
						'</tr>';
			}
		});
		return html;
	},

	writeUserMainHTML : function(user){

		let html = 	'<div id="users_view">' +

						'<br /><b>First Name: </b>' + user.first_name +
						'<br /><b>Last Name: </b>' + user.last_name +
						'<br /><b>Email: </b>' + user.email +
						
						'<br /><br /><b>User ID: </b>' + user.userId +
						'<br /><b>Created: </b>' + user.created +
						'<br /><b>Updated: </b>' + user.updated +
						'<br /><b>Status: </b>' + user.status +

						'<br /><br /><b>House: </b>' + user.housename +
					'</div>';

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
