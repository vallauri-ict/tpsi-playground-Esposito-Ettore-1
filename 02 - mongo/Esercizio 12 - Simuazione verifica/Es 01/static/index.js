$(document).ready(function() {
    let _dateStart = $("#dataStart");
    let _dateEnd = $("#dataEnd");

    $("#btmInvia").on("click", function () {
        let DataDa = _dateStart.val();
        let DataA = _dateEnd.val();

        let request = inviaRichiesta("post", "/api/servizio1", { "dataStart" : DataDa, "dataEnd" : DataA });
        request.done(function (data) {
            console.log(data);
        });
        request.fail(errore);
    });
});
