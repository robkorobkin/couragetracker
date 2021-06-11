

// ViewController : global static
// - all methods fetch template from TemplateLoader, attach DOM events / load data from model into template
// - all actual data is retained in ViewModel
// - ViewController just holds state of the app interfaces, only points to data about residents, exams, etc. in model


var ViewModel = {

	active_view : 'ResidentList',

	examTemplate : recovery_capital_assessmentJSON,

	residentList : new ResidentList(),

	examList : new ExamList(),

	userList : new UserList(),

	selected_resident : false,

	selected_exam : false,

	selected_user : false,

	isLoadingNewResident : false
}

/* LAUNCH THE APP */
$(function(){
	ViewController.loadView('ResidentList');
	api.loadUser = function(user){
		ViewController.loadUser(user);
	}
})


ViewController = {


	loadView : function(viewName) {

		$('.sidebarLink').removeClass('active');
		$('#' + viewName + 'Link').addClass('active');


		if( ('load' + viewName + 'View') in this) {


			// RESET VIEW
			$('#mainBody').html('');
			$('#mainHeaderText').html('');
			$('#mainHeaderRight').html('');


			// UPDATE STATE
			ViewModel.active_view = viewName;


			// LOAD NEW VIEW
			this['load' + viewName + 'View']();

		}
		else {
			alert('View Not Found');
		}

	},

	setLeftHeader : (leftHTML) => {
		$('#mainHeaderText').html(leftHTML);
	},

	setRightHeader : (rightHTML) => {
		$('#mainHeaderRight').html(rightHTML);
	},

	setMainBody : (mainHTML) => {
		$('#mainBody').html(mainHTML);
	},



	// RUN THIS WHEN THE USER LOADS (ATTACHED TO FIRST API CALL)
	loadUser : (user) => {
		if(user.status == 'admin'){
			$('#admin_links').show();
		}
		$('#houseName').html(user.current_house.housename);
		
	},


// RESIDENT LIST VIEW

	loadResidentList : function(callbackFunction){

		ViewModel.residentList.fetchResidentList(function(response){
			ViewModel.residentList.loadData(response);
			ViewModel.examList.loadFromResidentList(ViewModel.residentList);
			callbackFunction();
		});
	},

	openResident : function(residentId) {

		if(residentId == -1){
			ViewModel.selected_resident = new Resident();
			ViewController.loadView('ResidentInfo');
			return;
		}

		// if rIndex == -1, this returns a blank Resident object
		ViewModel.residentList.getResidentByResidentId(residentId, function(resident){
			ViewModel.selected_resident = resident;
			ViewController.loadView('ResidentDash');
		});
	},

	reloadResident : function(updatedResident){
		let r = new Resident(updatedResident);
		ViewModel.selected_resident = r
		ViewModel.residentList.loadResident(r); 
		ViewModel.isLoadingNewResident = (updatedResident.isNew);

		if(updatedResident.isNew){
			
			ViewController.loadView('ResidentList');
		}
		else ViewController.loadView('ResidentDash');
	},

	loadResidentListView : function(){


		// LOAD THE HTML
		this.setLeftHeader('Residents' +
							'<button type="button" class="btn btn-raised btn-success" ' +
 							'style="float: right" ' +
 							// ' style="clear: both; display: block; margin: 10px 0 20px;"' +
 							' id="addresident_button"> Add Resident</button>');

		this.setMainBody(TemplateLoader.writeResidentListMainHTML());
		

		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.residentList.sort_by(sort_field);
			ViewController._loadResidentListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.residentList.search_filter(search_term);
			ViewController._loadResidentListTable();
		})

		$('#addresident_button').click(function(){
			ViewController.openResident(-1);
		})

		this.loadResidentList(function(){

			// a bit of a hack - if you just added one, put it on top
			if(ViewModel.isLoadingNewResident){
				ViewModel.residentList.sorting_order = "abc";
				ViewModel.residentList.sorting_by = "created";
				ViewModel.residentList.sort_by("created")				
			}
			ViewController._loadResidentListTable();
		})
	},

	_loadResidentListTable : function(){
		
		var html = TemplateLoader._writeResidentListTableHTML(ViewModel.residentList);

		$('#residentTable').html(html);

		$('#residentTable tr').click(function(){
			var residentId = this.id.split('_')[1];
			ViewController.openResident(residentId);
		})
	},


// EXAM SUMMARY VIEW

	loadExamSummaryView : function(){

		let exam = ViewModel.selected_exam;

		this.setMainBody(TemplateLoader.writeExamSummaryMainHTML(exam));

		this.setLeftHeader('Questionnaire: ' + exam.resident.first_name + ' ' + exam.resident.last_name);	

		$('#resident_clickback').click(() => { ViewController.openResident(ViewModel.selected_exam.resident.residentId )})

		$('#submit_button').click(function(){
			exam.submitExamToServer(ViewController.reloadResident);
		})

		$('#back_button').click(function(){
			ViewController.loadView('ResidentExam');

			// reverse populate the view
			let exam = ViewModel.selected_exam;
			$('#exam_date_taken').val(exam.date_taken);

			for(let qIndex = 0; qIndex < exam.answers.length; qIndex++){
				let a = exam.answers[qIndex];
				if(a != '') $('#question_' + qIndex + '_' + a).attr('checked', true);
			}

		})

		$('#delete_button').click(function(){
			if(confirm("Are you sure you want to delete this questionnaire?")){
				ViewModel.selected_exam.delete(ViewController.reloadResident)
			}
		})
	},


// PERSON / TAKE EXAM VIEW

	// SHARED SUBNAV
	handleResidentSubNav : function(mode){
		$('#dash_tab').click(() => ViewController.loadView("ResidentDash"));
		$('#takenew_tab').click(() => ViewController.loadView("ResidentExam"));
		$('#residentinfo_tab').click(() => ViewController.loadView("ResidentInfo"));
		$('#' + mode + "_tab").addClass('active');


		let r = ViewModel.selected_resident;
		this.setLeftHeader(escapeForHtml(r.first_name) + ' ' + escapeForHtml(r.last_name));	
	},


	// DASHBOARD VIEW - LOADS CHART, HAS "POST RANDOM" BUTTON, ToDo: SHOW EXAM TABLE
	loadResidentDashView : function (){

		let selected_resident = ViewModel.selected_resident;
		ViewModel.examList = selected_resident.examList;


		// MAIN BODY + LOAD
		let main_html = TemplateLoader.writeResidentDashMainHTML(selected_resident) +
						'<br /><br /><br />' + 
						TemplateLoader.writeExamListMainHTML() + // just presents table architecture
						'<br /><br /><br />' + 
						TemplateLoader.writeQbyQHTML(selected_resident.examList, ViewModel.examTemplate); // Question by Question



		this.setMainBody(main_html);


		let numOfTestsTaken = selected_resident.examList.mainList.length;
		$('#resident_survey_questions td:first-child').css('width', (numOfTestsTaken * 30) + 'px');

		$('.trigger').click(function(){
			let qIndex = this.id.split('_')[1];
			$('#details_' + qIndex).toggle()
		})


		this.handleResidentSubNav('dash');


		this._loadExamListTable();
		

		// LOAD CHART
		if(ViewModel.examList.mainList.length != 0){
			ChartController.loadChart("Resident", selected_resident);
			ChartController.openByLabel = function(label){
				let exam = ViewModel.selected_resident.examList.getExamByLabel(label);
				ViewModel.selected_exam = exam;
				ViewController.loadView('ExamSummary');
			}	
		}
		else {
			$('.chart-container').html('<p>No recovery capital assessments have been recorded yet. Hit "TAKE NEW" above to begin one.</p>');
		}


		// MAKE AN EXAM OBJECT AND POINT APP MODEL TO IT
		$('#postrandomexam_button').click( ()=> {
			var exam = new Exam();
			exam.resident = ViewModel.selected_resident;
			exam.generateRandomResults();
			exam.submitExamToServer((resident)=>{
				var r = new Resident(resident);
				ViewModel.selected_resident = r
				ViewModel.residentList.loadResident(r); 
				ViewController.loadView('ResidentDash');
			})
		});
	},


	loadResidentInfoView : function() {

		var selected_person = ViewModel.selected_resident;


		this.setMainBody(TemplateLoader.writeResidentEditorMainHTML(selected_person));

		// HEADER
		if(selected_person.isNew) {
			this.setLeftHeader('Add Resident');	
		}
		else {
			this.handleResidentSubNav('residentinfo');
		}


		for(var field in selected_person){
			$('#resident_' + field).val(selected_person[field]);
		}

		

		// HANDLE BUTTON EVENTS
		$('#cancel_button').click(function(){
			ViewController.loadView('ResidentDash');
		})


		// SAVE / ADD BUTTON
		$('#save_button, #add_button').click(function(){

			// READ DOM
			var goAhead = true;
			var selected_person = ViewModel.selected_resident;
			for(var field in selected_person){
				if($('#resident_' + field).length != 0) {
					let v = $('#resident_' + field).val()

					if(v == '' && (field == "first_name" || field == "last_name")){
						$('#label_' + field).addClass('error');
						goAhead = false;
					}

					else {
						selected_person[field] = v;	
					}
				}
			}


			// POST TO API AND UPDATE MODEL
			if(goAhead){

				selected_person.save(ViewController.reloadResident);
			}
			

		})


		$('#delete_button').click(function(){
			if(confirm("Are you sure you want to delete this person and all of their questionnaires?")){
				ViewModel.residentList.delete(ViewModel.selected_resident.residentId, function(){
					ViewModel.selected_resident = false;
					ViewController.loadView('ResidentList');	
				})
			}
		})
	},


	loadResidentExamView : function(){

		var resident = ViewModel.selected_resident;


		this.setMainBody(TemplateLoader.writeExamMainHTML(ViewModel.examTemplate));
		this.handleResidentSubNav('takenew');


		$('#exam_date_taken').val(formatDateForInput());



		$('#save_btn').click(function(){


			// MAKE AN EXAM OBJECT AND POINT APP MODEL TO IT
			var exam = new Exam();
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
				ViewController.loadView('ExamSummary');
			}


			// OTHERWISE, CLIENT SIDE VALIDATION
			else {
				$(exam.answers).each(function(qNum, qAns){
					$('#question_' + qNum).css('color', 'black');
					if(qAns == '') $('#question_' + qNum).css('color', 'red');
				})
			}
			
		})
	},




// EXAM LIST VIEW


	/********************************************
	*	VIEW: EXAM LIST
	*
	*	loadExamListView()
	*	_loadExamListTable()
	*	openExam()
	********************************************/

	loadExamListView : function(){

		// LOAD THE HTML
		this.setLeftHeader('Recovery Capital Assessments:');
		this.setMainBody(TemplateLoader.writeExamListMainHTML());

		ViewController.loadResidentList(function(){
			ViewController._loadExamListTable(ViewModel.examList);
		})

		
	},



	_loadExamListTable : function(){
		
		var html = TemplateLoader._writeExamListTableHTML(ViewModel.examList);
		$('#examTable').html(html);

		$('#mainTable th').off("click").click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.examList.sort_by(sort_field);
			$('#mainTable th').off("click");
			ViewController._loadExamListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.examList.search_filter(search_term);
			ViewController._loadExamListTable();
		})


		$('#examTable tr').click(function(){
			var eIndex = this.id.split('_')[1];
			ViewController.openExam(eIndex);
		})
	},

	openExam : function(eIndex){
		ViewModel.selected_exam = ViewModel.examList.mainList[eIndex]; 
		ViewController.loadView('ExamSummary');
	},



// ADMIN - USER LIST / FEATURE

	/********************************************
	*	VIEW: USERS LIST
	*
	*	loadUserListView()
	*	_loaduserListTable()
	*	openExam()
	********************************************/

	loadUserListView : function(){

		// LOAD THE HTML
		this.setLeftHeader('RC Tracker - Users List');
		this.setMainBody(TemplateLoader.writeUserListMainHTML());

		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.userList.sort_by(sort_field);
			ViewController._loadUserListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.userList.search_filter(search_term);
			ViewController._loadUserListTable();
		})

		let payload = {}; // if we want to send something?

		api.callApi('user_getUserList', payload, function(userListJSON){
			ViewModel.userList.loadList(userListJSON);
			ViewController._loadUserListTable();
		})
		
	},

	_loadUserListTable : function(){
		
		let html = TemplateLoader._writeUserListTableHTML(ViewModel.userList.mainList);
		$('#usersTable').html(html);

		$('#usersTable tr').click(function(){
			var uIndex = this.id.split('_')[1];
			ViewController.openUser(uIndex);
		})
	},

	openUser : function(uIndex){
		ViewModel.selected_user = ViewModel.userList.mainList[uIndex]; 
		ViewController.loadView('UserSummary');
	},

	loadUserSummaryView : function(){

		let user = ViewModel.selected_user;

		// LOAD THE HTML
		this.setLeftHeader(escapeForHtml(user.first_name) + ' ' + escapeForHtml(user.last_name));
		this.setMainBody(TemplateLoader.writeUserMainHTML(user));

		api.callApi('user_fetchUserByUserId', user.userId, function(userJSON){
			ViewModel.selected_user = new User(userJSON);
			// ViewController._loadUserInfoTable();
		})
		
	},
}


// Thank You Google! 
function isValidDate(dateString) {
	var regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!dateString.match(regEx)) return false;  // Invalid format
	var d = new Date(dateString);
	var dNum = d.getTime();
	if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
	return d.toISOString().slice(0,10) === dateString;
}