
controllerFactory = (controllerName) => {

	let controller = false;

	switch(controllerName){
		

		case 'Residents' : 
			ViewModel.selected_list = new ResidentList();
			controller = new Residents_Controller();
			controller.newObject = (json) => new Resident(json); 
			return controller;


		case 'Blasts' : 
			ViewModel.selected_list = new BlastList();
			controller = new Blasts_Controller();
			controller.newObject = (json) => new Blast(json); 
			return controller;


		case 'Houses' : 
			ViewModel.selected_list = new HouseList();
			controller = new Houses_Controller();
			controller.newObject = (json) => new House(json); 
			return controller;
			

	}
}






class CT_Controller {

	constructor(settings){

	}


	

	loadComponent(componentName){
		$('.sidebarLink').removeClass('active');
		$('#' + componentName + 'Link').addClass('active');

		activeController = controllerFactory(componentName);
		activeController.loadView('List');
		ViewModel.component = componentName;
	}


	loadView (viewName) {

		// RESET VIEW
		$('#mainBody').html('');
		$('#mainHeaderText').html('');


		// UPDATE STATE
		ViewModel.active_view = viewName;


		// LOAD NEW VIEW
		this['load' + viewName + 'View']();
		window.scrollTo(0,0);

	}


	loadListView(){

		let html = TemplateLoader.writeListMainHTML(this.tableConfiguration);
		this.setMainBody(html);

		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.selected_list.sort_by(sort_field);
			this.updateTableHTML();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.selected_list.search_filter(search_term);
			activeController.updateTableHTML();
		})

		let payload = {}; // if we want to send something?

		api.callApi(this.api + '_fetch' + this.component + 'List', payload, function(listJSON){
			ViewModel.selected_list.loadList(listJSON);
			activeController.updateTableHTML();
		});

		$('#add_button').click(function(){
			activeController.open(-1);
		});
	}



	updateTableHTML(){
		let html = TemplateLoader._writeListTableHTML(ViewModel.selected_list.mainList, this.tableConfiguration);
		$('#mainTable tbody').html(html);

		$('#mainTable tbody tr').click(function(){
			let rowId = this.id.split('_')[1];
			activeController.open(rowId);
		})
	}


	open (rowId){

		if(rowId == -1){
			ViewModel.selected_object = this.newObject();
			this.loadView('Selection');
			return;
		}
		else {

			let payload = {
				component : this.component,
				select : {}
			}
			payload.select[this.primaryKey] = rowId;


			api.callApi(this.api + '_fetchSelection', payload, function(responseJSON){
				ViewModel.selected_object = activeController.newObject(responseJSON);
				activeController.loadView('Selection');
			})	
		}
	}




	setHeader (title, buttonTXT) {

		let html = escapeForHtml(title);
		if(buttonTXT) html += '<button type="button" class="btn btn-raised btn-success" style="float: right" ' +
 							' id="add_button"> ' + buttonTXT + '</button>';
		
		$('#mainHeaderText').html(html);
	}

	

	setMainBody (mainHTML) {
		$('#mainBody').html(mainHTML);
	}


	_loadSelectionHTML(selected_object){
		let templateMethod = 'write' + this.component + 'MainHTML';
		let html = TemplateLoader[templateMethod](selected_object) 
		this.setMainBody(html);
	}

	loadSelectionView (){

		let selected_object = ViewModel.selected_object;
		this._loadSelectionHTML(selected_object); // broken out for easy override in child classes

			

		if(!selected_object.isNew){
			for(var field in selected_object){
				if($('#field_' + field).length != 0) {
					$('#field_' + field).val(selected_object[field]);
				}
			}
		}

		// CANCEL BUTTON
		$('#cancel_button').click(() => activeController.loadListView());


		// SAVE / ADD BUTTON
		$('#save_button, #add_button').click(function(){

			// READ DOM
			let goAhead = true;

			console.log(selected_object)

			for(let field in selected_object){

				console.log(field)

				if($('#field_' + field).length != 0) {
					let v = $('#field_' + field).val()

					if(v == ''){
						$('#label_' + field).addClass('error');
						goAhead = false;
					}

					else {
						selected_object[field] = v;	
					}
				}
			}


			// POST TO API AND UPDATE MODEL
			if(goAhead){
				console.log('trying to submit to api');


				selected_object.save((responseJSON) => {
					ViewModel.selection = activeController.newObject(json);
					activeController.loadView('Summary');	
				});
			}
		});	
	}


	// RUN THIS WHEN THE USER LOADS (ATTACHED TO FIRST API CALL)
	loadUser (user) {

		ViewModel.active_user = user;

		if(user.status == 'super'){
			$('#super_links').show();
			// ViewModel.houseList.loadList(user.houses);
			// ViewModel.userList.loadList(user.allUsers);
		}
		$('#houseName').html(user.current_house.housename);
		
	}


	loadResidentExamView (){

		var resident = ViewModel.selected_resident;


		this.setMainBody(TemplateLoader.writeExamMainHTML(ViewModel.examTemplate));
		this.handleResidentSubNav('takenew');


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
	}


	// EXAM SUMMARY VIEW

	loadExamSummaryView (){

		let exam = ViewModel.selected_exam;

		this.setMainBody(TemplateLoader.writeExamSummaryMainHTML(exam));

		this.setLeftHeader(
			'Questionnaire: ' + exam.resident.first_name + ' ' + exam.resident.last_name
		);	

		$('#resident_clickback').click(() => { ViewController.openResident(ViewModel.selected_exam.resident.residentId )})

		$('#submit_button').click(function(){

			// if it's an RCA score, submit like normal:
			if(exam.examTemplate.version == 1){
				exam.submitExamToServer(ViewController.reloadResident);	
			}
			else {
				ViewModel.selected_resident.savePersonalScore(exam, ViewController.reloadResident);
			}
			
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
	}


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


function isValidPassword(pw){
	if(pw == '') return false;

	return true;
}
