<!-- LOGIN FORM -->
<form id="resetpw_form">


	<div id="reset_form" style="display: none">
		<h4>Reset Your Password:</h4>
		<div class="form-group">
			<label for="reset_pw" id="resetlabel_pw" class="bmd-label-floating">Password:</label>
			<input type="password" class="form-control" id="reset_pw">
		</div>
		<div class="form-group">
			<label for="reset_pw2" id="resetlabel_pw2" class="bmd-label-floating">Password (Repeat):</label>
			<input type="password" class="form-control" id="reset_pw2">
		</div>

		<button id="reset_button" type="button" class="btn btn-raised btn-primary">RESET</button>

		<div style="color: red; margin-top: 15px; display: none" id="reset_errorbox" ></div>	
	</div>
	


	<div id="reset_confirm" style="display: none">
		<h4>Password Reset Successfully!</h4>
		<button id="gotologin_button" type="button" 
				style="margin-top: 15px;"
				class="btn btn-raised btn-primary">LOGIN NOW</button>
	</div>

</form>