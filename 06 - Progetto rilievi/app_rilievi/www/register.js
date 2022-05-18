"use strict"

$(document).ready(function() {	
	let _eMail = $("#email");
	let _usr = $("#usr");
	let _lblErrore = $("#lblErrore");
	
    _lblErrore.hide();

	$("#btnRegister").on("click", controllaRegister);

	$(document).on('keydown', function(event) {	
	   if (event.keyCode == 13)
		   controllaRegister();
	});
	
	function controllaRegister(){
        _eMail.removeClass("is-invalid");
		_eMail.prev().removeClass("icona-rossa");
		_usr.removeClass("is-invalid");
		_usr.prev().removeClass("icona-rossa");

		_lblErrore.hide();		
		
		let ok = true;
        if (_eMail.val() == "") 
		{
            _eMail.addClass("is-invalid");  
			_eMail.prev().addClass("icona-rossa"); 
			ok = false; 
        }
		if (_usr.val() == "") {
            _usr.addClass("is-invalid");  
			_usr.prev().addClass("icona-rossa"); 
			ok = false;  
        }
		
		if (ok)
		{
			let request = inviaRichiesta('POST', '/api/register', { "mail": _eMail.val(), "user" : _usr.val()});
			request.done(function(data, textStatus, request) {
				showAlert("Ti è arrivata una mail con dentro la password temporanea che andrà cambiata al primo login.\n Può procedere a effettuare il login");
				window.location.href = "login.html";
			});
			request.fail(function(jqXHR, test_status, str_error) {
				if (jqXHR.status == 401 || jqXHR.status == 403 || jqXHR.status == 409) // unauthorized - forbidden - conflict
				{
					_lblErrore.show();
					_lblErrore.children("p").html("<strong>Attenzione!</strong> " + jqXHR.responseText);
				}
				else
					errore(jqXHR, test_status, str_error);
			});
		}
	}
		
	_lblErrore.children("button").on("click", function(){
		_lblErrore.hide();
	});
});

function showAlert(msg){
	navigator.notification.alert(
		msg,     // Messaggio da visualizzare
		function(){},      // callback anonima
		"Alert",           // Titolo finestra
		"ok"             // pulsante di chiusura (singolo)
	);
}