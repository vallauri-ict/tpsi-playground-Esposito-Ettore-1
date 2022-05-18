"use strict"

window.onload = function () {
    document.addEventListener('deviceready', function() {
        let _txtDesc = $("#txtDesc");
        let _txtLat = $("#txtLat");
        let _txtLng = $("#txtLng");
        let _icon = $("i.far.fa-compass").hide();
        let _spinner = _icon.next();

        const gpsOptions = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};

        let watchId = navigator.geolocation.watchPosition(writeLocation, onError, gpsOptions);

        _icon.on("click", function () {
            watchId = navigator.geolocation.watchPosition(writeLocation, onError, gpsOptions);

            _icon.hide();
            _spinner.show();
        });

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
                    showAlert("Nuova perizia aggiunta");
                    document.location.href = "index.html";
                });
                request.fail(errore);
            }
        });

        function writeLocation (position) {
            console.log(position);

            _txtLat.val(position.coords.latitude);
            _txtLng.val(position.coords.longitude);

            _spinner.hide();
            _icon.show();

            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        function onError (err) {
            console.log(err);
        }
    });
};

function showAlert(msg){
	navigator.notification.alert(
		msg,     // Messaggio da visualizzare
		function(){},      // callback anonima
		"Alert",           // Titolo finestra
		"ok"             // pulsante di chiusura (singolo)
	);
}