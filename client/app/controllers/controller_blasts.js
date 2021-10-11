class Blasts_Controller extends CT_Controller {

	loadBlastListView (){

		// LOAD THE HTML
		this.setLeftHeader('Blasts' +
							'<button type="button" class="btn btn-raised btn-success" style="float: right" ' +
 							' id="generateblast_button">Generate Blast!</button>');

		this.setMainBody(TemplateLoader.writeBlastListMainHTML());


		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.blastList.sort_by(sort_field);
			ViewController._loadBlastListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.blastList.search_filter(search_term);
			ViewController._loadBlastListTable();
		})

		let payload = {}; // if we want to send something?

		api.callApi('fetchBlastList', payload, function(blastListJSON){
			ViewModel.blastList.loadList(blastListJSON);
			ViewController._loadBlastListTable();
		});

		$('#generateblast_button').click(function(){
			ViewController.openBlast(-1);
		});
	}

	_loadBlastListTable (){
		
		let html = TemplateLoader._writeBlastListTableHTML(ViewModel.blastList.mainList);
		$('#blastsTable').html(html);

		$('#blastsTable tr').click(function(){
			var blastId = this.id.split('_')[1];
			ViewController.openBlast(blastId);
		})
	}

	openBlast (blastId){

		if(blastId == -1){
			ViewModel.selected_blast = new Blast();
			ViewController.loadView('BlastSummary');
			return;
		}
		else {
			api.callApi('user_fetchBlastByBlastId', parseInt(blastId), function(blastJSON){
				ViewModel.selected_blast = new Blast(blastJSON);
				ViewController.loadView('BlastSummary');
			})	
		}
	}

	loadBlastSummaryView (){


		let blast = ViewModel.selected_blast;

		let house = ViewModel.user.current_house;


		// LOAD THE HTML
		let h = '';
		if(!blast.isNew) {
			h = escapeForHtml('SURVERY BLAST: ' + blast.displayDate);
		}
		else {
			h = 'Generate Blast!';
		}

		this.setLeftHeader(h);
		this.setMainBody(TemplateLoader.writeBlastMainHTML(house, blast));


		// CANCEL BUTTON
		$('#cancel_button').click(() => ViewController.loadBlastListView());



		// SAVE / ADD BUTTON
		$('#generate_blast').click(function(){


			let goAhead = false;


			let request = {
				config : {
					residents : {}
				},
				notes : ''
			}


			// PARSE HTML FORM INTO UPDATING BLAST MODEL
			$('#blastTable input').each(function(i, el){
				if(el.checked){

					goAhead = true;

					let id = el.id.split('_')[1];
					if(!(id in request.config.residents)) request.config.residents[id] = '';

					let mode = el.id.split('_')[2];
					request.config.residents[id] += mode;
				}
			})

			request.note = $('#blast_note').val();



			// POST TO API AND UPDATE MODEL
			console.log(request)

			if(goAhead){
				console.log('trying to submit to api');


				blast.generateBlast((responseJSON) => {
					ViewModel.selected_blast = new Blast(house, responseJSON.selectedHouse);
					ViewController.loadView('BlastSummary');	
				});
			}
		});	


	}

}