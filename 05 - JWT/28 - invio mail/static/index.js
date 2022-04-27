"use strict"

$(document).ready(function() {
    let _btnInvia = $("#btnInvia");

    _btnInvia.on("click", function() {
        let mail = {
            "to": $("#txtTo").val(),
            "subject": $("#txtSubject").val(),
            "message": $("#txtMessage").val()
        };
        let newMailRQ = inviaRichiesta('POST', '/api/newMail', mail);
        newMailRQ.done(function(data) {
            console.log(data);
            alert("Mail inviata correttamente");
        });
        newMailRQ.fail(errore);
    });
});