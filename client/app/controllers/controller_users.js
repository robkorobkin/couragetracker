	// ADMIN - USER LIST / FEATURE

	/********************************************
	*	VIEW: USERS LIST
	*
	*	loadUserListView()
	*	_loaduserListTable()
	*	openExam()
	********************************************/



class Users_Controller extends CT_Controller {


	loadListView (){

		// LOAD THE HTML
		this.setLeftHeader('RC Tracker - Users List' +
							'<button type="button" class="btn btn-raised btn-success" style="float: right" ' +
 							' id="adduser_button"> Add User</button>');

		this.setMainBody(TemplateLoader.writeUserListMainHTML());

		$('#mainTable th').click((e)=>{
			let sort_field = e.target.id.split('-')[1];
			ViewModel.userList.sort_by(sort_field);
			ViewController._loadUserListTable();
		});


		// ATTACH SEARCH BAR
		$('#mainSearch').off("keyup").keyup(function(){
			var search_term = $('#mainSearch').val();
			ViewModel.userList.search_filter(search_term);
			ViewController._loadUserListTable();
		})

		let payload = {}; // if we want to send something?

		api.callApi('user_fetchUserList', payload, function(userListJSON){
			ViewModel.userList.loadList(userListJSON);
			ViewController._loadUserListTable();
		});

		$('#adduser_button').click(function(){
			ViewController.openUser(-1);
		});
	}

	_loadUserListTable (){
		
		let html = TemplateLoader._writeUserListTableHTML(ViewModel.userList.mainList);
		$('#usersTable').html(html);

		$('#usersTable tr').click(function(){
			var uIndex = this.id.split('_')[1];
			ViewController.openUser(uIndex);
		})
	}

	openUser (userId){

		if(userId == -1){
			ViewModel.selected_user = new User();
			ViewController.loadView('UserSummary');
			return;
		}
		else {
			api.callApi('user_fetchUserByUserId', userId, function(userJSON){
				ViewModel.selected_user = new User(userJSON);
				ViewModel.userList.mainList.unshift(ViewModel.selected_user);
				ViewController.loadView('UserSummary');
			})	
		}
	}

	loadUserSummaryView (){


		// WITHIN CONTROLLER FOR FEATURED USER, "user" = Selected User
		let user = ViewModel.selected_user;


		// LOAD THE HTML
		let h = '';
		if(!user.isNew) {
			h = escapeForHtml(user.first_name) + ' ' + escapeForHtml(user.last_name);
		}
		else {
			h = 'ADD NEW USER';
		}

		this.setLeftHeader(h);
		this.setMainBody(TemplateLoader.writeUserMainHTML(user, ViewModel.houseList));


		// IF YOU'RE EDITING, LOAD THE FORM
		if(!user.isNew){
			for(var field in user){
				if($('#user_' + field).length != 0) {
					$('#user_' + field).val(user[field]);
				}
			}
		}

		// CANCEL BUTTON
		$('#cancel_button').click(() => ViewController.loadUserListView());

		$('#deactivate_button').click(() => {
			if(confirm("Are you sure you want to deactivate this user? " +
						"Their name will still appear in the records, but they will no longer be able to log in.")){
				user.deactivate(() => {
					ViewController.loadUserListView()
				});
			}
		})


		// SAVE / ADD BUTTON
		$('#save_button, #add_button').click(function(){

			// READ DOM
			var goAhead = true;

			for(var field in user){
				if($('#user_' + field).length != 0) {
					let v = $('#user_' + field).val()

					// If there's no first name, last name, or email, make the label red and bail
					if(v == '' && (field == "first_name" || field == "last_name" || field == "email")){
						$('#label_user_' + field).addClass('error');
						goAhead = false;
					}

					else {
						user[field] = v;	
					}
				}
			}


			// 	handle password 
			//		- if it's new, process it
			// 		- if it's an update, and it's set, process it
			// 		- if not, it must be an update with the field empty, do nothing

			if(user.isNew || user.password != '') {
				if(!isValidPassword(user.password)) {
					$('#label_user_password').addClass('error');
					goAhead = false;
				}
				if(user.password != $('#user_password2').val()){
					$('#label_user_password2').addClass('error');
					goAhead = false;
				}

			}



			// POST TO API AND UPDATE MODEL
			if(goAhead){
				user.save((responseJSON) => {
					ViewModel.selected_user = new User(responseJSON.selectedUser);
					ViewController.loadView('UserSummary');	
				});
			}
		});	



		// REMOVE ACCESS TO HOUSE
		$('.remove_link').click(function(){

			// build the request object
			let req = {
				houseId : parseInt($(this).attr('id').split('_')[1]),
				userId : parseInt(user.userId)
			}

			// submit it to server
			api.callApi('user_loseAccessToHouse', req, function(userJSON){
				
				// reload the UI (list still has old data, update when you reload it)
				ViewModel.selected_user = new User(userJSON);
				ViewController.loadView('UserSummary');
			})	
		})


		$('#addhouse_button').click(function(){

			// get value of select box
			let houseId = parseInt($('#addhouse_selector').val());


			// check if assignment already exists
			for(let assignment of user.houses){
				if(assignment.houseId == houseId){
					alert('Error. User is already assigned to that house.');
					return;
				}
			}

			// build the request object
			let req = {
				houseId : houseId,
				userId : parseInt(user.userId),
				return_type : "user"
			}

			// submit it to server
			api.callApi('user_grantAccessToHouse', req, function(userJSON){
				
				// reload the UI (list still has old data, update when you reload it)
				ViewModel.selected_user = new User(userJSON);
				ViewController.loadView('UserSummary');
			})	

		})

	}


}