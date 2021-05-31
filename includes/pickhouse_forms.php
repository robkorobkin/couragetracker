
<div id="load_error" style="display: none">Something went wrong in loading this page. Please email the app administrator at rob.korobkin@gmail.com</div>





<!-- PICK HOUSE -->
<form id="houserequest_form" style="display: none">
	<h4>Select your house!</h4>
	<p>Welcome <span id="first_name_span"></span>!</p> 
	<p>Which recovery residence are you associated with?</p>

	<button id="startnewhouse_button" type="button" class="btn btn-raised btn-primary">REGISTER A NEW HOUSE</button>
	
	<br /><br />
	<div style="border-top: solid 5px #ccc; padding-top: 15px; font-weight: bold;">Or associate with an established house:</div>
	<div class="form-group">
		<label for="houserequest_housename" id="houserequestlabel_housename" class="bmd-label-floating">House Name / Address</label>
		<input type="text" class="form-control" id="houserequest_housename">
	</div>
	<div id="houselist_frame">
		
	</div>
</form>


<!-- SELECT HOUSE -->
<form id="houseselect_form" style="display: none">
</form>


<!-- REGISTER HOUSE -->
<form id="houseregister_form" style="display: none">
	<h4>Register Your House:</h4>
	<div class="form-group">
		<label for="houseregister_housename" id="houseregisterlabel_housename" class="bmd-label-floating">House Name</label>
		<input type="text" class="form-control" id="houseregister_housename">
	</div>
	<div class="form-group">
		<label for="houseregister_street" id="houseregisterlabel_street" class="bmd-label-floating">Street</label>
		<input type="text" class="form-control" id="houseregister_street">
	</div>
	<div class="form-group">
		<label for="houseregister_city" id="houseregisterlabel_city" class="bmd-label-floating">City</label>
		<input type="text" class="form-control" id="houseregister_city">
	</div>
	<div class="form-group">
		<label for="houseregister_state" id="houseregisterlabel_state" class="bmd-label-floating">State</label>
		<input type="text" class="form-control" id="houseregister_state">
	</div>
	<div class="form-group">
		<label for="houseregister_zip" id="houseregisterlabel_zip" class="bmd-label-floating">Zip</label>
		<input type="text" class="form-control" id="houseregister_zip">
	</div>

	<button id="houseregister_button" type="button" class="btn btn-raised btn-primary">REGISTER HOUSE</button>&nbsp;&nbsp;&nbsp;
	<button id="cancelhouseregister_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>
	<div style="color: red; margin-top: 15px; display: none" id="register_errorbox" ></div>

</form>

<div id="register_confirm" style="display: none">
	<h2>Success!</h2>
	<p>Your new house has been successfully created. Click below to begin getting some real work done!</p>
	<button id="houseenter_button" type="button" class="btn btn-raised btn-primary">Continue</button>
</div>