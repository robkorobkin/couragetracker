/********************************************
*	VIEW: EXAM LIST
*
*	loadExamListView()
*	_loadExamListTable()
*	openExam()
********************************************/


class Exams_Controller extends CT_Controller {



	loadExamListView (){

		// LOAD THE HTML
		this.setLeftHeader('Recovery Capital Assessments:');
		this.setMainBody(TemplateLoader.writeExamListMainHTML());

		ViewController.loadResidentList(function(){
			ViewController._loadExamListTable(ViewModel.examList);
		})		
	}

	_loadExamListTable (){
		
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
	}

	openExam (eIndex){
		ViewModel.selected_exam = ViewModel.examList.mainList[eIndex]; 
		ViewController.loadView('ExamSummary');
	}


}