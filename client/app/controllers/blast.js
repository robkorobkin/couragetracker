



// MODEL


// - Blast Table (SQL)
// 	- blastId
// 	- datetime
// 	- configJSON


// - Blast (Client)
// 	- blastId
// 	- datetime
// 	- displayDate
// 	- config
// 	- residentList
// 	- house (pointer)


class Blast {

	constructor(house, bJSON){

		this.house = house;

		this.fields = ['blastId', 'datetime', 'notes'];

		for(let f of this.fields) this[f] = '';
		this.isNew = true;
		this.display = true;
		this.userList = [];


		if(bJSON){
			for(let f of this.fields) {
				if(f in bJSON){
					this[f] = bJSON[f];	
				}
			}
			this.isNew = false;
			this.displayDate = formatDateTimeForOutput(this.datetime);
		}
	}

	generateBlast(blastConfig){
		console.log(blastConfig)
	}

	// copy these fields into request object
	// save(callbackFunction){
	// 	let req = {}
	// 	for(let f of this.fields){ 
	// 		req[f] = this[f];
	// 	}


	// 	if(this.isNew){
	// 		var method = "user_createHouse" ;
	// 	}
	// 	else {
	// 		var method = "user_updateHouse";
	// 		req.userId = parseInt(this.userId);
	// 	}
		
	// 	api.callApi(method, req, function(response){
	// 		console.log(response)
	// 		callbackFunction(response);
	// 	});
	// }


	
}

class BlastList extends BaseList {

	constructor(){
		super();
		this.search_fields.push('datetime');
	}

	loadList(blastListJSON){
		this.mainList.length = 0; // empty it without losing the byte address
		for(let bJSON of blastListJSON){
			this.mainList.push(new Blast(bJSON));
		}
	}
}




// CONTROLLER






let blastTemplateLoader = {
	/********************************************
	*	VIEW: HOUSE LIST
	*
	*	getHouseListHTML() 				: returns HTML for view
	*	_getHouseListTableHTML(houses) 	: takes houses array, returns HTML for table sub-component
	* 	
		FIELDS:
			houseId
			housename
			street
			city
			state
			zip
			created
			updated

	********************************************/

	writeBlastListMainHTML : function(){

		let html = 	'<div id="blastsList_view">' +
						'<table id="mainTable">' +
							'<tr class="headerRow">' +
								'<th id="control-blastId">ID</th>' +
								'<th id="control-date">Date</th>' +
								'<th id="control-sentnum">Sent</th>' +
								'<th id="control-returnednum">Returned</th>' +
							'</tr>' +
							'<tbody class="mainTable" id="blastsTable">' +
							'</tbody>' +
						'</table>' +
					'</div>';

		return html;
	},

	_writeBlastListTableHTML : function(houseList){
		let html = '';
		$(houseList).each(function(index, house){
			if(house.display){
				html += '<tr id="blast_' + parseInt(blast.blastId) + '">' +
							'<td>' + 
								parseInt(blast.blastId) + 
							'</td>' + 
							'<td>' + escapeForHtml(blast.displayDate) + '</td>' +
							'<td>' + escapeForHtml(house.sentnum) + '</td>' +
							'<td>' + escapeForHtml(house.returnednum) + '</td>' +
						'</tr>';
			}
		});
		return html;
	},

	writeBlastMainHTML : function(house, blast){

		let html = 
			
			'<form id="blast_edit_frame">';

				 	// INPUTS
				 	// this.writeField('blast_datetime', 'Date Time') +

		
		console.log(house)


		// LIST RESIDENTS

		html += '<table id="mainTable" style="width: auto">' +
					'<tr class="headerRowBlast">' +
						'<th>Name</th>' +
						'<th style="width: 70px; text-align: center">Text</th>' +
						'<th style="width: 70px; text-align: center">Email</th>' +
					'</tr>' +
					'<tbody class="mainTable" id="blastTable">';

		for(let resident of house.residentList.mainList){

				// NAME - TEXT - EMAIL - NEITHER
				html += '<tr>' + 
							'<td style="padding-right: 30px">' + resident.first_name + ' ' + resident.last_name + '</td>' +
							'<td>'+
								'<div class="checkbox">' +
									'<label><input type="checkbox" ' +
											'id="resident_' + resident.residentId + '_text" '  +
											'data-mdb-toggle="tooltip" data-mdb-placement="top" /></label>' + //  disabled
								'</div>' +
							'</td>' + 
							'<td>'+
								'<div class="checkbox">' +
									'<label><input type="checkbox"' +
											'id="resident_' + resident.residentId + '_email" '  +
											'data-mdb-toggle="tooltip" data-mdb-placement="top"/></label>' +
								'</div>' +
							'</td>' + 
						'</tr>';

		}
		html += 	'</tbody>' +
				'</table>' +
				'<br />' +
				
				'<div class="form-group">' +
					'<label for="blast_notes" id="label_blast_notes" class="bmd-label-floating">Add Notes:</label>' +
					'<textarea class="form-control" id="blast_notes" style="height: 100px; line-height: 25px"></textarea>' +
				'</div>';


		// TOGGLE, OPENS SEARCH BOX TO ADD FORMER RESIDENTS




		if(blast.isNew) {
			html +=  
				'<div id="btnFrame">' +
					'<button id="generate_blast" type="button" class="btn btn-raised btn-primary">SEND!</button>' + 
					'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
				'</div>' +
			'</form>';
			return html;
		}



		// BUTTONS
		html +=
			'<div id="btnFrame">' +
				'<button id="save_button" type="button" class="btn btn-raised btn-primary">SAVE</button>' +
				'<button id="cancel_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>' +
				//'<button id="delete_button" type="button" class="btn btn-raised btn-danger">DELETE</button>' +
			'</div>';
	



		// STATIC INFO
		html += 	
			'<br /><br /><br />' + 
			'<div class="info-panel">' +
				'<b>BLAST INFO:</b>' +
				'<br />Sent: ' + blast.displayDate + 
			'</div>' +
			'<br /><br /><br />' +
			'<div class="info-panel">' +
				'<b>RECIPIENTS:</b>' +
				'<table id="mainTable">';

//				console.log(house)

				for(let exam of blast.examList){
					console.log(exam);
					html += 
						'<tr>' +
							'<td><span class="blastStatus status_' + exam.status + '"></span></td>' +
							'<td>' + exam.resident.first_name + ' ' + exam.resident.last_name + '</td>' +
							'<td><span class="blastSubStatus status_' + exam.byText + '"></span></td>' +
							'<td><span class="blastSubStatus status_' + exam.byPhone + '"></span></td>' +
							'<td><a class="sendagain_' + parseInt(exam.residentId) + '">SEND AGAIN</a></td>' +
						'</tr>';
				}
				
		html +=		

			'</div>' + 

		'</form>';

		
		return html;
	}
}


for(let f in blastTemplateLoader) TemplateLoader[f] = blastTemplateLoader[f];


