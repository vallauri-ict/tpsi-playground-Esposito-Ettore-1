"use strict"

$(document).ready(function() {	
	let _eMail = $("#usr");
	let _password = $("#pwd");
	let _lblErrore = $("#lblErrore").hide();

	let _divCambioPassword = $("#changePassword").hide();
	let _changeMail = $("#changeUsr");
	let _oldPassword = $("#oldPwd");
	let _newPassword = $("#newPwd");
	let _newPaswordRep = $("#newPwdRep");
	let _lblChangeErrore = $("#lblChangeErrore").hide();

	let _divResetPassword = $("#resetPassword").hide();
	let _resetMail = $("#resetUsr");
	let _lblResetErrore = $("#lblResetErrore").hide();

	let action = "logging";

		
	$(document).on('keydown', function(event) {	
		if (event.keyCode == 13) 
		{
			switch(action)
			{
				case "logging":
					controllaLogin();
					break;
				case "changeing":
					controllaChange();
					break;
				case "resetting":
					controllaReset();
					break;
			}
		}  		   
 	});

    // *** SEZIONE LOGIN *** //

	$("#btnLogin").on("click", controllaLogin);
	
	function controllaLogin(){
        _eMail.removeClass("is-invalid");
		_eMail.prev().removeClass("icona-rossa");  				
        _password.removeClass("is-invalid");
		_password.prev().removeClass("icona-rossa"); 

		_lblErrore.hide();		
		
		let ok = true;
        if (_eMail.val() == "") {
            _eMail.addClass("is-invalid");  
			_eMail.prev().addClass("icona-rossa");  
			ok = false;
        } 
		if (_password.val() == "") {
            _password.addClass("is-invalid"); 
			_password.prev().addClass("icona-rossa");
			ok = false; 
        }	
		
		if(ok)
		{
			let request = inviaRichiesta('POST', '/api/login',  
				{ 
				  	"mail": _eMail.val(),
				  	"password": _password.val() 
				}
			);
			request.fail(function(jqXHR, test_status, str_error) {
				if (jqXHR.status == 401) // unauthorized
				{
					_lblErrore.show();
					_lblErrore.children("p").html("<strong>Attenzione!</strong> " + jqXHR.responseText);
				}
				else
					errore(jqXHR, test_status, str_error);
			});
			request.done(function (data) {
				switch(data.ris)
				{
					case 'ok':
						window.location.href = "index.html";
						break;
					case 'change':
						$("#login").hide();
						_changeMail.val(_eMail.val());
						_oldPassword.val(_password.val());

						$("#btnChangePassword").trigger("click");
						break;
					default:
						_lblErrore.show();
						_lblErrore.children("p").html("<strong>Attenzione!</strong> La risposta del server non è valida");
						break;
				}
				
			});		
		}
	}
		
	_lblErrore.children("button").on("click", function(){
		_lblErrore.hide();
	});

	// *** SEZIONE CAMBIO PASSWORD *** //

	$("#btnChangePassword").on("click", function () {
		$("#login").hide();
		_divCambioPassword.show();
		action = "logging";
	});

	$("#btnChange").on("click", controllaChange);
	
	function controllaChange(){
        _changeMail.removeClass("is-invalid");
		_changeMail.prev().removeClass("icona-rossa");  				
        _oldPassword.removeClass("is-invalid");
		_oldPassword.prev().removeClass("icona-rossa"); 
		_newPassword.removeClass("is-invalid");
		_newPassword.prev().removeClass("icona-rossa");
		_newPaswordRep.removeClass("is-invalid");
		_newPaswordRep.prev().removeClass("icona-rossa");

		_lblChangeErrore.hide();		
		
		let ok = true;
        if (_changeMail.val() == "") {
            _changeMail.addClass("is-invalid");  
			_changeMail.prev().addClass("icona-rossa"); 
			ok = false;
        } 
		if (_oldPassword.val() == "") {
            _oldPassword.addClass("is-invalid"); 
			_oldPassword.prev().addClass("icona-rossa");
			ok = false;
        }	
		if (_newPassword.val() == "" || _newPassword.val() == _oldPassword.val()) {
            _newPassword.addClass("is-invalid"); 
			_newPassword.prev().addClass("icona-rossa");

			_lblChangeErrore.show();
			_lblChangeErrore.children("p").html("<strong>Attenzione!</strong> La nuova password non può essere uguale alla precedente");
			ok = false;
        }	
		if (_newPaswordRep.val() == "" || _newPassword.val() != _newPaswordRep.val()) {
            _newPaswordRep.addClass("is-invalid"); 
			_newPaswordRep.prev().addClass("icona-rossa");

			_lblChangeErrore.show();
			_lblChangeErrore.children("p").html("<strong>Attenzione!</strong> Le due password non combaciano");
			ok = false;
        }	

		if(ok) 
		{
			let request = inviaRichiesta('POST', '/api/changePsw',  
				{ 
				  	"mail": _changeMail.val(),
				  	"oldPassword": _oldPassword.val(),
					"newPassword": _newPassword.val()
				}
			);
			request.fail(function(jqXHR, test_status, str_error) {
				if (jqXHR.status == 401) // unauthorized
				{
					_lblChangeErrore.show();
					_lblChangeErrore.children("p").html("<strong>Attenzione!</strong> " + jqXHR.responseText);
				}
				else
					errore(jqXHR, test_status, str_error);
			});
			request.done(function(data) {
				window.location.href = "index.html";				
			});		
		}
	}
		
	_lblChangeErrore.children("button").on("click", function(){
		_lblChangeErrore.hide();
	});

	// *** SEZIONE RESET PASSWORD *** //
	$("#btnResetPassword").on("click", function () {
		$("#login").hide();
		_divResetPassword.show();
		action = "resetting";
	});

	$("#btnReset").on("click", controllaReset);
	
	function controllaReset(){
        _resetMail.removeClass("is-invalid");
		_resetMail.prev().removeClass("icona-rossa");  				

		_lblResetErrore.hide();		
		
		let ok = true;
        if (_resetMail.val() == "") {
            _resetMail.addClass("is-invalid");  
			_resetMail.prev().addClass("icona-rossa"); 
			ok = false;
        }

		if(ok) 
		{
			let request = inviaRichiesta('POST', '/api/resetPsw',  
				{ 
				  	"mail": _resetMail.val(),
				}
			);
			request.fail(function(jqXHR, test_status, str_error) {
				if (jqXHR.status == 401) // unauthorized
				{
					_lblResetErrore.show();
					_lblResetErrore.children("p").html("<strong>Attenzione!</strong> " + jqXHR.responseText);
				}
				else
					errore(jqXHR, test_status, str_error);
			});
			request.done(function (data) {
				_divResetPassword.hide();
				_changeMail.val(_resetMail.val());

				$("#btnChangePassword").trigger("click");
				
				alert("Le è arrivata una mail con una password temporanea.\nUtilizzi quella per il primo accesso e le sarà consentito di modificarla");
			});		
		}
	}

	_lblResetErrore.children("button").on("click", function(){
		_lblResetErrore.hide();
	});
});