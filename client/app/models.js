

var appConfig = {
	api_url : "server/api.php"
}


/*************************
*	BASE LIST - All of the List objects extend this.
*	- search_filter
*	- sort_by
*************************/


class BaseList {

	constructor(){
		this.sorting_by = '';
		this.sorting_order = "abc";
		this.mainList = [];
		this.search_fields = [];
	}


	loadList(listJSON){
		this.mainList.length = 0; // empty it without losing the byte address
		for(let rowJSON of listJSON){
			this.mainList.push(this.getNewRowObj(rowJSON)); /// defined in model - list constructor
		}
	}






	// SHARED METHOD = SEARCH FILTER - filters "display" field according to text match
	search_filter(search_term){
		search_term = search_term.toLowerCase();
		for(let item of this.mainList){
			item.display = false;
			for(let f of this.search_fields) if(item[f].toLowerCase().indexOf(search_term) == 0) item.display = true;
		}
	}


	// SHARED METHOD = SORT BY
	sort_by(fieldName){


		// ADDED - SUPPORTS SORTING BY SECOND-LEVEL FIELDS (JUST PUT A PERIOD IN THE SORT TERM)
		if(fieldName.indexOf('.') !== -1){
			let path = fieldName.split('.');
			let p1 = path[0]; let p2 = path[1];

			if(this.sorting_by != fieldName){
				this.sorting_order = "abc";
				this.mainList.sort((a,b)=>{ return a[p1][p2] > b[p1][p2]});	
			}
			else if(this.sorting_order == "abc"){
				this.sorting_order = "cba";
				this.mainList.sort((a,b)=>{ return a[p1][p2] < b[p1][p2]});	
			}
			else {
				this.sorting_order = "abc";
				this.mainList.sort((a,b)=>{ return a[p1][p2] > b[p1][p2]});	
			}

		}

		// NORMAL SORT AGAINST TOP LEVEL FIELDS
		else {
			if(this.sorting_by != fieldName){
				this.sorting_order = "abc";
				this.mainList.sort((a,b)=>{ return a[fieldName] > b[fieldName ]});	
			}
			else if(this.sorting_order == "abc"){
				this.sorting_order = "cba";
				this.mainList.sort((a,b)=>{ return a[fieldName] < b[fieldName ]});	
			}
			else {
				this.sorting_order = "abc";
				this.mainList.sort((a,b)=>{ return a[fieldName] > b[fieldName ]});	
			}
		}

		this.sorting_by = fieldName;
	}
}



class Resident {

	constructor(residentJSON){

		this.residentId = -1;
		this.first_name = '';
		this.last_name = '';
		this.phone = '';
		this.email = '';
		this.dob = '';
		this.movein_date = '';
		this.status = "Current Resident";
		this.display = true;
		this.created = '';
		this.updated = '';
		this.acesScore = '';
		this.harmScore = '';
		this.lastExam = '---';


		this.examList = new ExamList();
		


		if(residentJSON) {

			this.isNew = false;

			for(var field in this){
				if(field in residentJSON) {
					this[field] = residentJSON[field];
				}
			}
			this.name = this.first_name + ' ' + this.last_name;

			this.movein_date_display = (this.movein_date == '') ? '---' : formatDateForOutput(this.movein_date);


			if("exams" in residentJSON && residentJSON.exams.length != 0){
				this.examList.loadForResident(residentJSON.exams, this);


				// these could also come from the API...
				this.lastExam =	formatDateForOutput(resident.examList.lastExam);
				this.examCount = resident.examList.examCount
				this.lastScore = resident.examList.lastScore;
			}
			else {

			}


			if(this.acesScore && this.acesScore != ''){
				this.acesExam = new Exam(aces_assessmentJSON, this.acesScore);
				this.acesExam.resident = this;
				this.acesScoreVal = this.acesExam.totalScore;
			}
			else this.acesScoreVal = '';

			if(this.harmScore != ''){
				this.harmExam = new Exam(harm_assessmentJSON, this.harmScore);
				this.harmExam.resident = this;
				this.harmScoreVal = this.harmExam.totalScore;
			}
			else this.harmScoreVal = '';

		}

		else this.isNew = true;
	}


	save(callbackFunction){

		// copy these fields into request object
		var fields = ["status", "first_name", "last_name", "phone", "email", "movein_date", "dob", "status",
						"acesScore", "harmScore"];
		var req = {}
		for(var fIndex in fields){ 
			var f = fields[fIndex];
			req[f] = this[f];
		}

		let isNew = this.isNew;

		if(isNew){
			var method = "createResident" ;
		}
		else {
			var method = "updateResident";
			req.residentId = parseInt(this.residentId);
		}
		
		api.callApi(method, req, function(response){
			response.isNew = isNew;
			callbackFunction(response);
		});		
	}

	savePersonalScore(exam, callbackFunction){
		let personalScore = {
			date_taken  : exam.date_taken,
			answers 	: exam.answers	
		}
		if(exam.examTemplate.version == 2) this.acesScore = personalScore;
		if(exam.examTemplate.version == 3) this.harmScore = personalScore;

		this.save(callbackFunction);
	}
}

class ResidentList extends BaseList {

	constructor (residentJSON){
		super();
		this.search_fields.push('first_name', 'last_name', 'examList.lastExam','examList.examCount','examList.lastScore');


		this.sorting_order = "abc";
		this.sort_by("first_name");
		this.getNewRowObj = (json) => new Resident(json);
	}


}



class ExamTemplate {

	constructor(examTemplateJSON){
		for(var field in examTemplateJSON){
			this[field] = examTemplateJSON[field]; // for now, just copy in the JSON
		}
	}
}



class Exam {

	constructor (examTemplate, exam){

		this.examTemplate = examTemplate; 

		this.isNew = true;

		this.resident = false;

		this.date_taken = formatDateForInput(); // default submit date to when the object is constructed

		this.answers = [];

		this.questionsAnswered = 0;

		this.totalScore = 0;

		this.avgScore = 0;

		this.display = true;


		this.groupedAnswers = {};
		for(let o in this.examTemplate.options) this.groupedAnswers[o] = [];


		for(var q of this.examTemplate.questions) this.answers.push(0);

		
	
		if(exam){

			this.isNew = false;
			var fields = ["examId","residentId","houseId","version","created","updated", "date_taken"];
			for(var f of fields) {
				if(f in exam){
					this[f] = exam[f];	
				}
			}

			this.answers = exam.answers;
			this.processExamResults();
			this.date_taken_label = formatDateForOutput(exam.date_taken)
			
		}
	}

	// answers array is loaded either with DOM or SQL, build the rest of the object
	processExamResults() {

		for(var qNum = 0; qNum < this.answers.length; qNum++){
			var qAnswer = this.answers[qNum];
			if(qAnswer != 0 && qAnswer != ','){
				this.questionsAnswered++;
				this.totalScore += qAnswer;
				if(qAnswer != 0) this.groupedAnswers[qAnswer].push(this.examTemplate.questions[qNum]);
			}
		}

		this.avgScore = Math.round((this.totalScore / this.questionsAnswered) * 100) / 100;
	}

	generateRandomResults(){
		this.answers = [];
		for(var q of this.examTemplate.questions) {
			var random_score =  Math.floor(Math.random() * 5) + 1;
			this.answers.push(random_score);
		}
	}

	submitExamToServer (callbackFunction){

		var payload = {
			residentId  : parseInt(this.resident.residentId),
			date_taken  : this.date_taken,
			version 	: this.examTemplate.version,
			answers 	: this.answers
		}


		api.callApi('createExam', payload, function(resident){
			callbackFunction(resident);
		})
	}

	delete (callbackFunction){
		var payload = this.examId;
		api.callApi('deleteExam', this.examId, callbackFunction);
	}
}



class ExamList extends BaseList {

	constructor(){
		super();
		this.mainList = [];
		this.examLabels = [];
		this.examTemplate = recovery_capital_assessmentJSON; // defined in data.js


		this.lastExam = 0;
		this.lastExam_display = '---';
		this.lastScore = 0;
		this.examCount = 0;

		this.questionList = [];



		this.monthList = { }

		// let months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		// for(let m of months) {
		// 	this.monthList[m] = 	{ 
		// 								examList : [], 
		// 								summary : {
		// 									questionsAnswered : 0,
		// 									totalScore : 0,
		// 									avgScore : 0,
		// 									groupedAnswers : { 1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0 }
		// 								}
		// 							};
		// }
	}

	loadFromResidentList(residentList){
		this.mainList = [];

		for(let resident of residentList.mainList){
			for(let exam of resident.examList.mainList){
				this.mainList.push(exam);

				// let m = this.monthList[getMonthFromDate(exam.date_taken)];

				// m.examList.push(exam);
				// for(let a of exam.answers){
				// 	m.summary.questionsAnswered++;
				// 	m.summary.totalScore += parseInt(a);
				// 	m.summary.groupedAnswers[a]++;
				// }
				// m.summary.avgScore = Math.round((m.summary.totalScore / m.summary.questionsAnswered) * 100) / 100;

			}
		}
	}

	loadForResident(residentExamJSON, resident){

		for(var exam of residentExamJSON){
			let e = new Exam(recovery_capital_assessmentJSON, exam);
			e.resident = resident;
			this.mainList.push(e);
		}
		if(this.mainList.length > 0){
			this.lastExam = this.mainList[0].date_taken;
			this.lastExam_display = formatDateForOutput(this.mainList[0].date_taken);
			this.lastScore = this.mainList[0].totalScore;
			this.examCount = this.mainList.length;
		}

		// FIX LABELS
		for(let exam of this.mainList){
			let l = exam.date_taken_label;
			let i = 1;
			while(this.examLabels.includes(l)){
				i++;
				l = exam.date_taken_label + ' #' + i;
			}
			exam.date_taken_label = l;
			this.examLabels.push(l);
		}




		// BUILD QUESTION LIST
		for(let q of this.examTemplate.questions){
			this.questionList.push({
				q : q,
				a : []
			});
		}

		for(let exam of this.mainList){
			for(let qIndex = 0; qIndex < exam.answers.length; qIndex++){
				let score = exam.answers[qIndex];
				this.questionList[qIndex].a.push({
					s : score,
					d : exam.date_taken
				});
			}
		}

	//	console.log(this.questionList);

			
	}

	getExamByLabel(label){
		for(let e of this.mainList) if(e.date_taken_label == label) return e;
	}
}



class User {

	constructor(uJSON){

		this.fields = [	'userId', 'email', 'first_name', 'last_name', 'password', 'created', 'updated', 
						'status', 'current_house', 'housename', 'houses' ];

		for(let f of this.fields) this[f] = '';
		this.isNew = true;
		this.display = true;


		if(uJSON){
			for(let f of this.fields) {
				if(f in uJSON){
					this[f] = uJSON[f];	
				}
			}
			this.isNew = false;
			this.created_display = formatDateForOutput(this.created.split(' ')[0]);
			if(!this.housename) this.housename = '---';
		}
	}

	// copy these fields into request object
	save(callbackFunction){
		let req = {}
		for(let f of this.fields){ 
			req[f] = this[f];
		}


		if(this.isNew){
			var method = "user_createUser" ;
		}
		else {
			var method = "user_updateUser";
			req.userId = parseInt(this.userId);
		}
		
		api.callApi(method, req, function(response){
			console.log(response)
			callbackFunction(response);
		});
	}


	deactivate(callbackFunction){
		api.callApi('user_deactivateUser', parseInt(this.userId), function(){
			callbackFunction();
		});

	}
}

class UserList extends BaseList {

	constructor(){
		super();
		this.search_fields.push('first_name', 'last_name', 'housename');
	}

	loadList(userListJSON){
		this.mainList.length = 0; // empty it without losing the byte address
		for(let uJSON of userListJSON){
			this.mainList.push(new User(uJSON));
		}
	}
}



class House {

	constructor(hJSON){

		this.fields = ['houseId', 'housename', 'street', 'city', 'state', 'zip', 'created', 'updated'];

		for(let f of this.fields) this[f] = '';
		this.isNew = true;
		this.display = true;
		this.userList = [];


		if(hJSON){
			for(let f of this.fields) {
				if(f in hJSON){
					this[f] = hJSON[f];	
				}
			}
			this.isNew = false;
			this.created_display = formatDateForOutput(this.created.split(' ')[0]);

			if('users' in hJSON && hJSON.users.length != 0){
				this.userList = hJSON.users;
			}
		}
	}

	// copy these fields into request object
	save(callbackFunction){
		let req = {}
		for(let f of this.fields){ 
			req[f] = this[f];
		}


		if(this.isNew){
			var method = "user_createHouse" ;
		}
		else {
			var method = "user_updateHouse";
			req.userId = parseInt(this.userId);
		}
		
		api.callApi(method, req, function(response){
			console.log(response)
			callbackFunction(response);
		});
	}


	
}

class HouseList extends BaseList {

	constructor(){
		super();
		this.search_fields.push('street', 'city', 'housename');
		this.getNewRowObj = (json) => new House(json);
	}

}




api = {

	apiPath : appConfig.api_url,

	access_token : '',

	initial_request : true,


	callApi : function(method, payload, callbackFunction){

		if(method.split('_').length != 2) method = "admin_" + method;

		var req = {
			method: method,
			payload: payload,
			initial_request : this.initial_request
		}


		if('access_token' in localStorage && localStorage.access_token != '') {
			req.access_token = localStorage.access_token;
		}
		else {
			window.location = "index.php";
		}


		let apiCallBack = function(response){

			if('user' in response) {
				ViewModel.user = response.user;
				
				 // method appended from controller 
				api.loadUser(response.user);

			}


			if('status' in response && response.status == 'error'){
				$('#error_message').html(escapeForHtml(response.message));
				return;	
			}

			callbackFunction(response.payload);
		}

		$.ajax({
			type: 'POST',
			url: this.apiPath,
			data: JSON.stringify(req),
			success: apiCallBack,
			contentType: "application/json",
			dataType: 'json'
		});

		this.initial_request = false;
		
	},

	logout : function(){
		localStorage.access_token = '';
		window.location = "index.php";
	}
}


var ChartController = {

	// TEMPLATE COLORS
	template_colors : {
		1 : "red", // "rgba( 59, 30, 141, .8)",
		2 : "rgba( 30, 96, 141, .8)",
		3 : "rgba( 30, 141, 116, .8)",
		4 : "rgba( 55, 141, 30, .8)",
		5 : "rgba( 245, 241, 91, .8)"
	},


	

	
	_resetConfig : function(){

		// READ SCORE OPTIONS FROM GLOBAL EXAM TEMPLATE - Could be set elsewhere, but this seems fine.
		this.score_options = ViewModel.examTemplate.options;


		// Prevents double-click on bubble
		this.clicked = false;

		this.config = 
			{
				type: 'bar',

				data: {
					labels: [],
					datasets: []
				},
				options: {
					scales: {
						xAxes: [{ stacked: true }],
						yAxes: [{ stacked: true }]
					},

					// canvas is sized to specs of DOM Element
					canvas : {
						//width:"1000px !important",
						// height:"600px !important"
					},
					
					events : ['click'],

					onClick : function(payload, payload2){
						if(this.clicked) return;
						let label = payload2[0]._model.label;
						this.clicked = true;
						ChartController.openByLabel(label);
					}


				}
			}

		// BUILD ARCHITECTURE, LABELS AND BG COLORS
		let graph_datasets = [];
		for(var score in this.score_options){
			graph_datasets.push({
		        label: score + ' - ' + this.score_options[score], 	// "1 - Strongly Disagree",
		        data: [], 										// [20, 10, 5, 0, 0, 0],
		        backgroundColor: this.template_colors[score], 			// rgba( 245, 241, 91, .8)
		        borderColor: "rgba(10,20,30,1)",
		        borderWidth: 1
		    })
		}
		this.config.data.datasets = graph_datasets;

	},


	loadChart : function(chartType, payload){
		if(!("get_ConfigFor" + chartType in this)) console.log("chart type not found: " + chartType);

		let chart_config = this["get_ConfigFor" + chartType](payload);
		var ctx = document.getElementById('myChart');
		var myChart = new Chart(ctx, chart_config);
	},


	get_ConfigForResident : function(resident) {

		let elist = resident.examList.mainList;

		if(elist.length == 0) return false;
		this._resetConfig();

		// NOW INPUT DATA FROM THE ACTUAL EXAMS
		// resident >> examList >> exam >> groupedAnswers >> { 0 : <array> }
		let labels = [];
		for(let exam of elist){
			let groupedAnswers = exam.groupedAnswers;
			for(score in groupedAnswers){
				this.config.data.datasets[score - 1].data.push(groupedAnswers[score].length);
			}
			this.config.data.labels.push(exam.date_taken_label)
		}

		return this.config;

	},

	get_ConfigForHouse : function(houseExamList){

	}
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




