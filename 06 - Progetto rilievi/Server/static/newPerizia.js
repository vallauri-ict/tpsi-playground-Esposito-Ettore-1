"use strict"

window.onload = function () {
    let _txtDesc = $("#txtDesc");
    let _txtLat = $("#txtLat").val(44.7077582);
    let _txtLng = $("#txtLng").val(7.6877771);

    $("#btnAggiungi").on("click", function () {
        _txtDesc.addClass("is-valid");
        _txtLat.addClass("is-valid");
        _txtLng.addClass("is-valid");

        let ok = true;
        if(_txtDesc.val() == "")
        {
            _txtDesc.addClass("is-invalid");
            ok = false;
        }
        if(_txtLat.val() == "")
        {
            _txtLat.addClass("is-invalid");
            ok = false;
        }
        if(_txtLng.val() == "")
        {
            _txtLng.addClass("is-invalid");
            ok = false;
        }

        if(ok)
        {
            let newPerizia = {
                "Desc" : _txtDesc.val(),
                "Coordinate" : {
                    "lat" : _txtLat.val(),
                    "lng" : _txtLng.val()
                }
            };
    
            let request = inviaRichiesta("post", "/api/newPerizia", newPerizia);
            request.done(function (data) {
                alert("Nuova perizia aggiunta");
                document.location.href = "index.html";
            });
            request.fail(errore);
        }
    });
};