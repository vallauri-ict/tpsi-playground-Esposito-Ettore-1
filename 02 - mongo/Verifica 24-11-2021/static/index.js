$(document).ready(function() {
    let _sltId = $("#sltId");
    let _txtValue = $("#txtValue").val(""); //firefox lo teneva anche dopo l'aggiorna

    let request = inviaRichiesta("get", "/api/getFacts");
    request.done(function (Facts) {
        console.log(Facts);

        for(let fact of Facts)
        {
            $("<option>", {
                "appendTo" : _sltId,
                "text" : fact._id,
                "val" : fact._id + "|" + fact.value
            });
        }
        _sltId.prop("selectedIndex", -1);
    });
    request.fail(errore);

    _sltId.on("change", function () {
        _txtValue.val(_sltId.val().split("|")[1]);
    });

    $("#btnSalva").on("click", function () {
        let request = inviaRichiesta("post", "/api/setFact", { "id" : _sltId.val().split("|")[0], "value" : _txtValue.val() });
        request.done(function (res) {
            console.log(res);

            alert("Fatto aggiornato correttamente");
        });
        request.fail(errore);
    });
});
