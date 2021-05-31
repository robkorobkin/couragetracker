<!-- LOGIN FORM -->
<form id="login_form" <?php if($mode != "login") echo 'style="display: none;"'; ?>>
	<h4>Login</h4>
	<div class="form-group">
		<label for="login_email" id="loginlabel_email" class="bmd-label-floating">User Email</label>
		<input type="text" class="form-control" id="login_email">
	</div>
	<div class="form-group">
		<label for="login_password"  id="loginlabel_password" class="bmd-label-floating">Password</label>
		<input type="password" class="form-control" id="login_password">
	</div>

	<button id="login_button" type="button" class="btn btn-raised btn-primary">LOGIN</button>

	<div style="color: red; margin-top: 15px; display: none" id="login_errorbox" ></div>

	<div style="clear: both; margin-top: 15px"></div>
	<a id="forgot_button" href="#">Forgot your password?</a>

	<div style="border-top: solid 5px #888; padding-top: 15px; color: #555;
				font-weight: bold; margin-top: 30px; margin-bottom: 15px">Or sign up now:</div>
	<a id="signup_button" href="#">Click here to register!</a>

</form>






<!-- REGISTRATION FORM -->
<form id="register_form" style="display: none;">

	<h4>Register Now!</h4>
	
	<!-- EMAIL (used as username) -->
	<div class="form-group">
		<label for="user_first_name" id="label_email" class="bmd-label-floating">Email</label>
		<input type="text" class="form-control" id="user_email">
	</div>

	<!-- PASSWORD -->
	<div class="form-group">
		<label for="user_last_name"  id="label_password" class="bmd-label-floating">Password (At least: 1 uppercase, 1 digit)</label>
		<input type="password" class="form-control" id="user_password">
	</div>
	<div class="form-group">
		<label for="user_last_name"  id="label_password2" class="bmd-label-floating">Password (Repeat)</label>
		<input type="password" class="form-control" id="user_password2">
	</div>

	<!-- NAME -->
	<div class="form-group">
		<label for="user_first_name" id="label_first_name" class="bmd-label-floating">First Name</label>
		<input type="text" class="form-control" id="user_first_name">
	</div>
	<div class="form-group">
		<label for="user_last_name"  id="label_last_name" class="bmd-label-floating">Last Name</label>
		<input type="text" class="form-control" id="user_last_name">
	</div>


	<button id="register_button" type="button" class="btn btn-raised btn-primary">REGISTER</button>
	<button id="cancelregistration_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>

	<div style="color: red; margin-top: 15px; display: none" id="register_errorbox" ></div>

</form>
<div id="register_confirm" style="display: none">
	<h2>Success!</h2>
	<p>Please check your email and click the confirmation link.</p>
</div>



<!-- FORGOT PASSWORD -->
<form id="forgotpassword_form" style="display: none">
	<h4>Forgot your password?</h4>
	<p style="margin-bottom: 0">Input your email and we'll send you a link to reset your password.</p>
	
	<div class="form-group">
		<label for="forgotpassword_email" id="forgotpasswordlabel_email" class="bmd-label-floating">Email</label>
		<input type="text" class="form-control" id="forgotpassword_email">
	</div>
	

	<button id="forgotpassword_button" type="button" class="btn btn-raised btn-primary">SEND REMINDER</button>
	<button id="cancelforget_button" type="button" class="btn btn-raised btn-secondary">CANCEL</button>

	<div style="color: red; margin-top: 15px; display: none" id="forgot_errorbox" ></div>

</form>