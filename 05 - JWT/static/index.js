"use strict"
$(document).ready(function() {

    let _btnInvia = $("#btnInvia");
    let _btnLogout = $("#btnLogout");

    /* **************************** AVVIO **************************** */
    let mailRQ = inviaRichiesta('GET', '/api/elencoMail', );
    mailRQ.done(function(data) {
        $(".container").css("visibility", "visible")
        visualizzaMail(data);
    });
    mailRQ.fail(errore)



    /* ********************** Visualizza Mail  *********************** */
    function visualizzaMail(data) {
        $("#txtTo").val("");
        $("#txtSubject").val("");
        $("#txtMessage").val("");
        $('#mainForm table tbody').empty();
        for (let mail of data) {
            let tr = $('<tr>');
            let td;
            td = $('<td>').text(mail.from).appendTo(tr);
            td = $('<td>').text(mail.subject).appendTo(tr);
            td = $('<td>').text(mail.body).appendTo(tr);
            $('#tabMail tbody').append(tr);
        }
    }


    /* ************************* Invio Mail  *********************** */
    _btnInvia.on("click", function() {
        let mail = {
            "to": $("#txtTo").val(),
            "subject": $("#txtSubject").val(),
            "message": $("#txtMessage").val()
        }
        let newMailRQ = inviaRichiesta('POST', '/api/newMail', mail);
        newMailRQ.done(function(data) {
            console.log(data);
            alert("Mail inviata correttamente");
        });
        newMailRQ.fail(errore)
    });


    /*  Per il logout è inutile inviare una richiesta al server.
		E' sufficiente cancelare il cookie o il token dal pc client
		Una richiesta al server semplificherebbe la cancellazione del cookie  
		
		_btnLogout.on("click", function() {
            let rq = inviaRichiesta('POST', '/api/logout');
            rq.done(function(data) {
                window.location.href = "login.html"
            });
            rq.fail(errore)
        });
    */

    _btnLogout.on("click", function() {
        localStorage.removeItem("token")
        window.location.href = "login.html"
    });


});

