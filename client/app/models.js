

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

		console.log('trying to sort by ' + fieldName);
		console.log(this.mainList)

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
		this.lastExam = '---';
		this.examList = [];
		this.lastScore = 0;
		this.examCount = 0;


		if(residentJSON) {

			this.isNew = false;

			for(var field in this){
				if(field in residentJSON) {
					this[field] = residentJSON[field];
				}
			}

			this.movein_date_display = (this.movein_date == '') ? '---' : formatDateForOutput(this.movein_date);


			if("exams" in residentJSON && residentJSON.exams.length != 0){
				for(var exam of residentJSON.exams){
					this.examList.push(new Exam(exam));
				}
				if(this.examList.length > 0){
					this.lastExam = formatDateForOutput(this.examList[0].date_taken);
					this.lastExamData = this.examList[0].date_taken;	
					this.lastScore = this.examList[0].totalScore;
					this.examCount = this.examList.length;
				}
				
			}
			else {

			}

		}

		else this.isNew = true;

	}


	save(callbackFunction){

		// copy these fields into request object
		var fields = ["status", "first_name", "last_name", "phone", "email", "movein_date", "dob", "status"];
		var req = {}
		for(var fIndex in fields){ 
			var f = fields[fIndex];
			req[f] = this[f];
		}

		if(this.isNew){
			var method = "createResident" ;
		}
		else {
			var method = "updateResident";
			req.residentId = parseInt(this.residentId);
		}
		
		api.callApi(method, req, function(response){
			callbackFunction(response);
		});
		
	}

}



class ResidentList extends BaseList {

	constructor (residentJSON){
		super();
		this.search_fields.push('first_name', 'last_name');
	}


	fetchResidentList(callbackFunction){
		api.callApi("getResidentList", false, function(response){
			callbackFunction(response);
		});
	}

	loadData(residentData){
		for(var rJSON of residentData){
			this.mainList.push(new Resident(rJSON));
		}
	}

	loadResident(newResident){
		var found = false;
		var residentId = newResident.residentId;


		// IF THE RESIDENT IS IN THE ARRAY, REPLACE IT
		var match = false;
		for(let rIndex = 0; rIndex < this.mainList.length; rIndex++){
			if(this.mainList[rIndex].residentId == residentId) {
				this.mainList[rIndex] = newResident;
				match = true;
			}
		}

		// IF NOT, PUSH IT ONTO THE END
		if(!match){
			this.mainList.push(newResident);
		}

	}

	getResidentByIndex (residentIndex, callbackFunction){
		this.open_resident = residentIndex;
		var self = this;
		if(residentIndex == -1) callbackFunction(new Resident());
		else {
			var r = this.mainList[residentIndex];
			api.callApi('getFullResidentById', parseInt(r.residentId), function(resident){
				var r = new Resident(resident);
				self.mainList[residentIndex] = r;
				callbackFunction(r);
			});
		}
	}


	delete (residentIdToDelete, callbackFunction){
		var self = this;
		api.callApi('deleteResident', parseInt(residentIdToDelete), function(residentList){
			self.mainList = [];
			self.loadData(residentList);
			callbackFunction();
			
		})
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

	constructor (exam){

		this.examTemplate = recovery_capital_assessmentJSON; // defined in data.js

		this.residentId = 0;

		this.date_taken = formatDateForInput(); // default submit date to when the object is constructed

		this.answers = [];

		this.questionsAnswered = 0;

		this.totalScore = 0;

		this.avgScore = 0;

		this.display = true;

		this.groupedAnswers = { 1 : [], 2 : [], 3 : [], 4 : [], 5 : [] };

		for(var q of this.examTemplate.questions) this.answers.push('');

		
	
		if(exam){
			var fields = ["examId","residentId","houseId","version","created","updated", "date_taken"];
			for(var f of fields) {
				if(f in exam){
					this[f] = exam[f];	
				}
			}
			this.answers = JSON.parse(exam.answers);
			this.processExamResults();
			
		}

	}


	// answers array is loaded either with DOM or SQL, build the rest of the object
	processExamResults() {

		for(var qNum = 0; qNum < this.answers.length; qNum++){
			var qAnswer = this.answers[qNum];
			if(qAnswer != ''){
				this.questionsAnswered++;
				this.totalScore += qAnswer;
				this.groupedAnswers[qAnswer].push(this.examTemplate.questions[qNum]);
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


	search_filter(search_term){

		search_term = search_term.toLowerCase();

		for(var exam of this.examList){
			if(exam.resident.first_name.toLowerCase().indexOf(search_term) == 0) exam.display = true;
			else if(exam.resident.last_name.toLowerCase().indexOf(search_term) == 0) exam.display = true;
			else exam.resident.display = false;
		}

	}


	saveToServer (callbackFunction){

		var payload = {
			residentId  : parseInt(this.residentId),
			date_taken  : this.date_taken,
			version 	: this.examTemplate.version,
			answers 	: this.answers
		}


		api.callApi('createExam', payload, function(resident){
			callbackFunction(resident);
		})
	}	
}

class ExamList {

	constructor(){
		this.examList = [];
		this.monthList = { }

		let months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		for(let m of months) {
			this.monthList[m] = 	{ 
										examList : [], 
										summary : {
											questionsAnswered : 0,
											totalScore : 0,
											avgScore : 0,
											groupedAnswers : { 1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0 }
										}
									};
		}
	}

	loadFromResidentList(residentList){

		for(let resident of residentList.mainList){
			for(let exam of resident.examList){
				exam.resident = resident;
				exam.first_name = resident.first_name;
				this.examList.push(exam);

				let m = this.monthList[getMonthFromDate(exam.date_taken)];

				m.examList.push(exam);
				for(let a of exam.answers){
					m.summary.questionsAnswered++;
					m.summary.totalScore += parseInt(a);
					m.summary.groupedAnswers[a]++;
				}
				m.summary.avgScore = Math.round((m.summary.totalScore / m.summary.questionsAnswered) * 100) / 100;

			}
		}
	}

	sort_by(fieldName){

		if(this.sorting_by != fieldName){
			this.sorting_order = "abc";
			this.examList.sort((a,b)=>{ return a[fieldName] > b[fieldName ]});	
		}
		else if(this.sorting_order == "abc"){
			this.sorting_order = "cba";
			this.examList.sort((a,b)=>{ return a[fieldName] < b[fieldName ]});	
		}
		else {
			this.sorting_order = "abc";
			this.examList.sort((a,b)=>{ return a[fieldName] > b[fieldName ]});	
		}
		this.sorting_by = fieldName;

	}		
}

class User {

	constructor(uJSON){

		if(uJSON){
			var fields = ['userId', 'email', 'first_name', 'last_name', 'created', 'updated', 'status', 'current_house', 'housename' ];
			for(var f of fields) {
				if(f in uJSON){
					this[f] = uJSON[f];	
				}
				else this[f] = '';
			}	
			this.display = true;
			this.created_display = formatDateForOutput(this.created.split(' ')[0]);
			if(!this.housename) this.housename = '---';
		}
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


api = {

	apiPath : appConfig.api_url,

	access_token : '',

	initial_request : true,


	callApi : function(method, payload, callbackFunction){

		var req = {
			method: method,
			payload: payload,
			initial_request : this.initial_request
		}


		if('access_token' in localStorage && localStorage.access_token != '') {
			req.access_token = localStorage.access_token;
		}
		else {
			window.location = "login.php";
		}


		let apiCallBack = function(response){
			if('user' in response) {
				ViewModel.user = response.user;
				
				 // method appended from controller 
				api.loadUser(response.user);

				response = response.response;
			}
			callbackFunction(response);
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
		window.location = "login.php";
	}



}


var ChartController = {

	// TEMPLATE COLORS
	template_colors : {
		1 : "rgba( 59, 30, 141, .8)",
		2 : "rgba( 30, 96, 141, .8)",
		3 : "rgba( 30, 141, 116, .8)",
		4 : "rgba( 55, 141, 30, .8)",
		5 : "rgba( 245, 241, 91, .8)"
	},


	

	
	_resetConfig : function(){

		// READ SCORE OPTIONS FROM GLOBAL EXAM TEMPLATE - Could be set elsewhere, but this seems fine.
		this.score_options = ViewModel.examTemplate.options;

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

		if(resident.examList.length == 0) return false;
		this._resetConfig();

		// NOW INPUT DATA FROM THE ACTUAL EXAMS
		// resident >> examList >> exam >> groupedAnswers >> { 0 : <array> }
		let labels = [];
		for(let exam of resident.examList){
			let groupedAnswers = exam.groupedAnswers;
			for(score in groupedAnswers){
				this.config.data.datasets[score - 1].data.push(groupedAnswers[score].length);
			}
			this.config.data.labels.push(formatDateForOutput(exam.date_taken))
		}

		return this.config;

	},

	get_ConfigForHouse : function(houseExamList){

	}
}






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




