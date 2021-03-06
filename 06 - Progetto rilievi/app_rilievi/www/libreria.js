"use strict"

const BASE_URL = "https://esposito-ettore-perizie.herokuapp.com";

function inviaRichiesta(method, url, parameters = {}) {
    let contentType;
    if (method.toUpperCase() == "GET") {
        contentType = "application/x-www-form-urlencoded; charset=UTF-8";
    } 
	else {
        contentType = "application/json; charset=utf-8";
        parameters = JSON.stringify(parameters);
    }

    return $.ajax({
        url: BASE_URL + url, //default: currentPage
        type: method,
        data: parameters,
        contentType: contentType,
        dataType: "json",
        timeout: 5000,
		beforeSend: function(jqXHR) { //aggiunge il token alla richiesta prima di mandarla
		   if ("token" in localStorage) {
				let token = localStorage.getItem("token");  
				jqXHR.setRequestHeader("authorization", token);
		   }
		},
		success: function(data, textStatus, jqXHR){ //eseguito prima del done
			let token = jqXHR.getResponseHeader('authorization');
			localStorage.setItem("token", token)  ;
		}
    });
}

function inviaRichiestaMultipart(method, url, formData){
    return $.ajax({
        url: BASE_URL + url,
        type: method,
        data: formData,
		contentType: false,
		processData: false,
		cache: false,
        dataType: "json",
        timeout : 5000,
        beforeSend: function(jqXHR) { //aggiunge il token alla richiesta prima di mandarla
            if ("token" in localStorage) {
                let token = localStorage.getItem("token");  
                jqXHR.setRequestHeader("authorization", token);
            }
        },
        success: function(data, textStatus, jqXHR){ //eseguito prima del done
            let token = jqXHR.getResponseHeader('authorization');
            localStorage.setItem("token", token)  ;
        }
    });
}

function errore(jqXHR, testStatus, strError) {
    if (jqXHR.status == 0)
        alert("Connection refused or Server timeout");
    else if (jqXHR.status == 200)
        alert("Formato dei dati non corretto : " + jqXHR.responseText);
    else if (jqXHR.status == 403) // forbidden
        window.location.href = "login.html";
    else
        alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
}