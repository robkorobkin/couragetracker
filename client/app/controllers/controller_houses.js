
/********************************************
*	VIEW: HOUSES LIST
*
*	loadUserListView()
*	_loaduserListTable()
*	openExam()
********************************************/



class Houses_Controller extends CT_Controller {

	constructor(settings){

		super(settings);
		
		this.api = 'super';

		this.component = 'Houses';

		this.primaryKey = 'houseId';

		this.tableConfiguration = [
			['houseId', 'ID'],
			['housename', 'Name'],
			['street', 'Street'],
			['city', 'City'],
			['state', 'State']
		]

		
	}


	loadListView (){
		this.setHeader('Courage Tracker - Houses List', 'Add House');
		super.loadListView();
	}



	loadSelectionView (){

		let house = ViewModel.selected_object;

		// SET HEADER
		if(!house.isNew) super.setHeader(house.housename, 'Load House');
		else super.setHeader('ADD NEW HOUSE');
		

		// LOAD HOUSE
		$('#add_button').click(function(){
			api.callApi('user_loadHouse', parseInt(house.houseId), function(){
				ViewModel.active_user.current_house = house;
				$('#houseName').html(house.housename);
			})
		})


		// DO WE WANT TO BE ABLE TO "DEACTIVATE" HOUSES?

		// $('#deactivate_button').click(() => {
		// 	if(confirm("Are you sure you want to deactivate this user? " +
		// 				"Their name will still appear in the records, but they will no longer be able to log in.")){
		// 		user.deactivate((userListJSON) => ViewController.loadUserListView(userListJSON));
		// 	}
		// })


		super.loadSelectionView();


		$('#updatemembers_button').click(() => {

			let permissions = { } // uId : status

			$('.requestbox').each(function(){
				if(this.checked) {
					let uId = this.id.split('_')[1];
					permissions[parseInt(uId)] = 'active'
				}
			});


			$('.activebox').each(function() {				
				if(this.checked) {
					let uId = this.id.split('_')[1];
					permissions[parseInt(uId)] = 'demote'
				}
			});

			let addUserId = $('#adduser_selector').val();
			if(addUserId != '') permissions[parseInt(addUserId)] = 'active';


			// SUBMIT AND RELOAD THE UI
			let req = {
				houseId : house.houseId,
				permissions : permissions
			}
			api.callApi('super_updateMembers', req, (houseJSON) => {
				console.log(houseJSON)
				ViewModel.selected_object = new House(houseJSON);
				activeController.loadView('Selection');
			})	

		});

	}
}