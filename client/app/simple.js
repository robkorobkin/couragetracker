

// ViewController : global static
// - all methods: fetch template from TemplateLoader, attach DOM events / load data from model into template
// - all actual data is retained in ViewModel
// - ViewController only points to data about residents, exams, etc. in model


var ViewModel = {

	active_view : 'ResidentList',

	active_resident : false, // (no real user, just a resident)

	examTemplate : recovery_capital_assessmentJSON,

	selected_exam : false,

}


/* LAUNCH THE APP */
$(function(){
	
	// If there's no token in URL, bounce


	// Look up token. 


		// If we come back with exam and resident data, load the questionnaire.
		loadExamView();


		// Once it's submitted, show a simple final confirmation screen.




})



loadExamView = function(){

	let resident = ViewModel.active_resident;

	let html = writeExamMainHTML(ViewModel.examTemplate);

	$('#mainContent').html(html);

	$('#exam_date_taken').val(formatDateForInput());



	$('#save_btn').click(function(){


		// MAKE AN EXAM OBJECT AND POINT APP MODEL TO IT
		var exam = new Exam(ViewModel.examTemplate);
		exam.resident = ViewModel.selected_resident;
		ViewModel.selected_exam = exam;


		// HANDLE EXAM DATE
		let date_taken = $('#exam_date_taken').val();
		if(!isValidDate(date_taken)){
			$('#exam_date_takenlabel').addClass('error');
			return;
		}
		else {
			exam.date_taken = date_taken;
			exam.date_taken_label = formatDateForOutput(date_taken);
		}


		// READ HTML FORM INTO EXAM OBJECT
		$.each($('#resident_questionnaire_frame input'), function(qIndex, btn_html){
			var qNum = parseInt(btn_html.name.split('_')[1]);
			var qVal = parseInt(btn_html.value);
			if(btn_html.checked) {
				if(qNum in ViewModel.selected_exam.answers){
					exam.answers[qNum] = parseInt(qVal);						
				}
				else console.log(qNum + " is not a valid question number");
			}
		});


		// DIGEST INPUT			
		exam.processExamResults();


		// IF SURVEY IS FILLED OUT, VIEW THE SUMMARY OF IT
		if(exam.answeredQuestions == exam.answers.length || true){
			exam.submitExamToServer(ViewController.reloadResident);	
		}


		// OTHERWISE, CLIENT SIDE VALIDATION
		else {
			$(exam.answers).each(function(qNum, qAns){
				$('#question_' + qNum).css('color', 'black');
				if(qAns == '') $('#question_' + qNum).css('color', 'red');
			})
		}
		
	})
}


writeExamMainHTML = function(examTemplate){


	let keyArr = [];
	for(let kIndex in examTemplate.options) keyArr.push(examTemplate.options[kIndex]);
	let keyStr = '<div class="key">' +
					'<div>Strongly<br/>Disagree</div>' + 
					'<div>Disagree</div>' +
					'<div>Sometimes<br />Agree</div>' +
					'<div>Agree</div>' +
					'<div>Strongly<br />Agree</div>' +
				'</div>';



	let html = 	'<div id="resident_questionnaire_frame">' +

					'<h3>' + examTemplate.title + '</h3>' +
					
					// DATE TAKEN 
					'<div class="form-group">' +
						'<label for="exam_date_taken" id="exam_date_takenlabel" class="bmd-label-floating">Date Taken (YYYY-MM-DD):</label>' +
						'<input type="text" class="form-control" id="exam_date_taken">' +
					'</div>' +

					'<div class="examlegend">' + keyStr + '</div>' +



					'<table id="resident_survey_questions" class="exam_' + examTemplate.version + '">';
				
		$(examTemplate.questions).each(function(qIndex){
			var question = examTemplate.questions[qIndex];
			
			var btnHtml = '<div>';
			for(var score in examTemplate.options){
				var txt = examTemplate.options[score];
				btnHtml += '<div class="radio">' +
								'<label><input type="radio" name="field_' + qIndex + '" value="' + score + '" ' +
										'title="' + score + ' - ' + txt + '" ' +
										'id="question_' + qIndex + '_' + score + '" '  +
										'data-mdb-toggle="tooltip" data-mdb-placement="top"/></label>' +
							'</div>';
			}
			btnHtml += '</div>';


			html += '<div class="question" id="question_' + qIndex + '">' + 
						'<div class="questiontext">' + question + '</div>' +
						'<div class="buttons_outerframe">' + btnHtml + '</div>' +
					'</div>';
		});

	html += '</table>';

	// SAVE BUTTON
	html += '<div id="btn_frame">' +
				'<button id="save_btn"  type="button" class="btn btn-raised btn-primary">SAVE</button>' +
			'</div>';

	html += '</div>';

	return html;
}




// UTILITIES

function formatDateForInput(date) {
	var d 	= (date) ? new Date(date) : new Date();

	var month 	= '' + (d.getMonth() + 1),
	day 		= '' + d.getDate(),
	year 		= d.getFullYear();

	if (month.length < 2) 	month = '0' + month;
	if (day.length < 2) 	day = '0' + day;

	return [year, month, day].join('-');
}


function formatDateForOutput(date) {
	if(date == '') return date;
	
	let strs = date.split('-');
	let months = new Array("", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

	let return_str = months[parseInt(strs[1])] + ' ' + strs[2] + ', ' + strs[0];
	return return_str;

}

function getMonthFromDate(date){
	let strs = date.split('-');
	let months = new Array("", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
	return months[parseInt(strs[1])];
}




