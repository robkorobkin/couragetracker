class Residents_Controller extends CT_Controller {


	constructor(settings){

		super(settings);
		
		this.api = 'admin';

		this.component = 'Residents';

		this.primaryKey = 'residentId';

		this.tableConfiguration = [
			['residentId', 'ID'],
			['name', 'Name'],
			['movein_date', 'Move In'],
			['acesScoreVal', 'ACE'],
			['harmScoreVal', 'HARM'],
			['examCount', 'Count'],
			['lastExamDate', 'Last Assessed'],
			['lastScore', 'Last Score']
		]

			




	}


	loadListView (){
		this.setHeader('Residents', 'Add Resident');
		super.loadListView();
	}

	// PERSON / TAKE EXAM VIEW

	// SHARED SUBNAV
	_handleResidentSubNav (mode){
		$('#dash_tab').click(() => ViewController.loadView("ResidentDash"));

		$('#takenew_tab').click(() => {
			ViewModel.examTemplate = recovery_capital_assessmentJSON;
			ViewController.loadView("ResidentExam")
		});
		

		$('#residentinfo_tab').click(() => ViewController.loadView("ResidentInfo"));
		$('#' + mode + "_tab").addClass('active');


		let r = ViewModel.selected_resident;
		this.setLeftHeader(escapeForHtml(r.first_name) + ' ' + escapeForHtml(r.last_name));	
	}


	// DASHBOARD VIEW - LOADS CHART, HAS "POST RANDOM" BUTTON, ToDo: SHOW EXAM TABLE
	loadSelectionView (){

		let selected_resident = ViewModel.selected_resident;
		ViewModel.examList = selected_resident.examList;


		// MAIN BODY + LOAD
		let main_html = TemplateLoader.writeResidentDashMainHTML(selected_resident) + // includes subnav
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


		this._handleResidentSubNav('dash');


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
			var exam = new Exam(recovery_capital_assessmentJSON);
			exam.resident = ViewModel.selected_resident;
			exam.generateRandomResults();
			exam.submitExamToServer((resident)=>{
				var r = new Resident(resident);
				ViewModel.selected_resident = r
				ViewModel.residentList.loadResident(r); 
				ViewController.loadView('ResidentDash');
			})
		});
	}

	loadResidentInfoView () {

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







		$('#aces_take').click(() => {
			ViewModel.examTemplate = aces_assessmentJSON;
			ViewController.loadView("ResidentExam");
		})
		$('#aces_view').click(() => {
			ViewModel.selected_exam = ViewModel.selected_resident.acesExam;
			ViewController.loadView("ExamSummary");
		})
		$('#aces_delete').click(() => {
			if(confirm("Are you sure you want to remove this person's ACEs information?")){
				ViewModel.selected_resident.acesScore = '';
				ViewModel.selected_resident.save(ViewController.reloadResident);
			}
		})




		$('#harm_take').click(() => {
			ViewModel.examTemplate = harm_assessmentJSON;
			ViewController.loadView("ResidentExam");
		})
		$('#harm_view').click(() => {
			ViewModel.selected_exam = ViewModel.selected_resident.harmExam;
			ViewController.loadView("ExamSummary");
		})
		$('#harm_delete').click(() => {
			if(confirm("Are you sure you want to remove this person's Harm History?")){
				ViewModel.selected_resident.harmScore = '';
				ViewModel.selected_resident.save(ViewController.reloadResident);
			}
		})




		$('#harm_button').click(() => {
			ViewModel.examTemplate = harm_assessmentJSON;
			ViewController.loadView("ResidentExam");
		})
	}
}