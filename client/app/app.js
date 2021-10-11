

// ViewController : global static
// - all methods: fetch template from TemplateLoader, attach DOM events / load data from model into template
// - all actual data is retained in ViewModel
// - ViewController only points to data about residents, exams, etc. in model


var ViewModel = {

	active_view : 'ResidentList',

	active_user : false,

	examTemplate : recovery_capital_assessmentJSON,

	mainList : false,

	selected_resident : false,

	selected_exam : false,

	selected_user : false,

	isLoadingNewResident : false
	
}

let rootController = new CT_Controller();
let activeController = false;


/* LAUNCH THE APP */
$(function(){
	
	rootController.loadComponent('Houses');

	api.loadUser = function(user){
		rootController.loadUser(user);
	}
})