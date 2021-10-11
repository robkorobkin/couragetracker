class Residents_Controller extends CT_Controller {

	// RESIDENT LIST VIEW

	loadResidentList (callbackFunction){

		ViewModel.residentList.fetchResidentList(function(response){
			ViewModel.residentList.loadData(response);
			ViewModel.examList.loadFromResidentList(ViewModel.residentList);
			ViewModel.user.current_house.residentList = ViewModel.residentList;
			callbackFunction();
		});
	}

	openResident (residentId) {

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
	}

	reloadResident (updatedResident){

		ViewModel.examTemplate = recovery_capital_assessmentJSON;


		let r = new Resident(updatedResident);
		ViewModel.selected_resident = r
		ViewModel.residentList.loadResident(r); 
		ViewModel.isLoadingNewResident = (updatedResident.isNew);

		if(updatedResident.isNew){
			
			ViewController.loadView('ResidentList');
		}
		else ViewController.loadView('ResidentDash');
	}

	loadResidentListView (){


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
	}

	_loadResidentListTable (){
		
		var html = TemplateLoader._writeResidentListTableHTML(ViewModel.residentList);

		$('#residentTable').html(html);

		$('#residentTable tr').click(function(){
			var residentId = this.id.split('_')[1];
			ViewController.openResident(residentId);
		})
	}

	// PERSON / TAKE EXAM VIEW

	// SHARED SUBNAV
	handleResidentSubNav (mode){
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
	loadResidentDashView (){

		let selected_resident = ViewModel.selected_resident;
		ViewModel.examList = selected_resident.examList;


		// MAIN BODY + LOAD
		let main_html = TemplateLoader.writeResidentDashMainHTML(selected_resident) +
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