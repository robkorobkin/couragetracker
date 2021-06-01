

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

	selected_user : false
}

/* LAUNCH THE APP */
$(function(){
	ViewController.loadResidentList();
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

	loadResidentList : function(){

		ViewModel.residentList.fetchResidentList(function(response){
			ViewModel.residentList.loadData(response);
			ViewModel.examList.loadFromResidentList(ViewModel.residentList);
			ViewController.loadView("ResidentList");
		});

	},

	loadResidentListView : function(){


		// LOAD THE HTML
		this.setLeftHeader('Residents' +
							'<button type="button" class="btn btn-raised btn-success" ' +
 							'style="float: right" ' +
 							// ' style="clear: both; display: block; margin: 10px 0 20px;"' +
 							' id="addresident_button"> Add Resident</button>');

		this.setMainBody(TemplateLoader.writeResidentListMainHTML());
		this._loadResidentListTable();

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
			ViewController.openPerson(-1);
		})

		
	},

	_loadResidentListTable : function(){
		
		var html = TemplateLoader._writeResidentListTableHTML(ViewModel.residentList);

		$('#residentTable').html(html);

		$('#residentTable tr').click(function(){
			var rIndex = this.id.split('_')[1];
			ViewController.openPerson(rIndex);
		})
	},



	openPerson : function(rIndex) {

		if(rIndex == -1){
			ViewModel.selected_resident = new Resident();
			ViewController.loadView('ResidentInfo');
			return;
		}

		// if rIndex == -1, this returns a blank Resident object
		ViewModel.residentList.getResidentByIndex(rIndex, function(resident){
			ViewModel.selected_resident = resident;
			ViewController.loadView('ResidentDash');
		});
	
	},





// EXAM VIEW

	



// EXAM SUMMARY VIEW

	loadExamSummaryView : function(){

		let exam = ViewModel.selected_exam;

		this.setMainBody(TemplateLoader.writeExamSummaryMainHTML(exam));

		this.setLeftHeader('Questionnaire: ' + exam.resident.first_name + ' ' + exam.resident.last_name);	

		$('#submit_button').click(function(){

			var payload = exam.exportForAPI();

			api.Submit('saveExam', payload, function(){

			});
		})

	},




// PERSON EDITOR VIEW

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

		var selected_resident = ViewModel.selected_resident;

		// MAIN BODY + LOAD
		this.setMainBody(TemplateLoader.writeResidentDashMainHTML(selected_resident));
		this.handleResidentSubNav('dash');

		// LOAD CHART
		ChartController.loadChart("Resident", selected_resident);


		// MAKE AN EXAM OBJECT AND POINT APP MODEL TO IT
		$('#postrandomexam_button').click( ()=> {
			var exam = new Exam();
			exam.residentId = ViewModel.selected_resident.residentId;
			exam.generateRandomResults();
			exam.saveToServer((resident)=>{
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
			ViewModel.selected_resident = false;
			ViewController.loadView('ResidentList');
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
				selected_person.save(function(updatedResident){
					var r = new Resident(updatedResident);
					ViewModel.selected_resident = r
					ViewModel.residentList.loadResident(r); 
					ViewController.loadView('ResidentDash');
				});
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


		$('#save_btn').click(function(){


			// MAKE AN EXAM OBJECT AND POINT APP MODEL TO IT
			var exam = new Exam();
			exam.residentId = ViewModel.selected_resident.residentId;
			ViewModel.selected_exam = exam;


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
		this._loadExamListTable(ViewModel.examList);

		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.examList.sort_by(sort_field);
			ViewController._loadExamListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.examList.search_filter(search_term);
			ViewController._loadExamListTable();
		})
		
	},

	_loadExamListTable : function(){
		
		var html = TemplateLoader._writeExamListTableHTML(ViewModel.examList);
		$('#examTable').html(html);

		$('#examTable tr').click(function(){
			var eIndex = this.id.split('_')[1];
			ViewController.openExam(eIndex);
		})
	},

	openExam : function(eIndex){
		ViewModel.selected_exam = ViewModel.examList.examList[eIndex]; 
		ViewController.loadView('ExamSummary');
	},



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
		
		var html = TemplateLoader._writeUserListTableHTML(ViewModel.userList.mainList);
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
		this.setLeftHeader(user.first_name + ' ' + user.last_name);
		this.setMainBody(TemplateLoader.writeUserMainHTML(user));

		api.callApi('user_fetchUserByUserId', user.userId, function(userJSON){
			ViewModel.selected_user = new User(userJSON);
			// ViewController._loadUserInfoTable();
		})
		
	},


}
