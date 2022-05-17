"use strict"

window.onload = async function () {
    await caricaGoogleMaps();
    ready();
    
    function caricaGoogleMaps() {
        return new Promise(function(resolve, reject){
            let script = document.createElement('script');
            script.type = 'application/javascript';
            script.src = "https://maps.googleapis.com/maps/api/js?v=3&key=" + GOOGLEKEY;
            document.body.appendChild(script);
            script.onload = resolve;
            script.onerror = reject;
        });
    }
};

function ready () {
    let _mappa = document.getElementById("mappa");
    let _table = $("#table").empty();
    let _divDettagli = $("#divDettagli").hide();
    let _divNewPhoto = $("#divNewPhoto");
    let _formNexPhoto = _divNewPhoto.children("form").hide();
    let _sltFilter = $("#sltFilter");

    let mappaObj;
    let officeCoords = new google.maps.LatLng(44.7077582, 7.6877771);
    let currentDetails;

    let request = inviaRichiesta("get", "/api/perizie");
    request.done(function (data) {
        console.log(data);

        //filtro
        _sltFilter.html("");
        $("<option>", {
            "appendTo" : _sltFilter,
            "html" : "Tutti",
            "val" : ""
        });

        _sltFilter.on("change", function () {
            let url = _sltFilter.val() != "" ? "/api/perizieOperatore/" + _sltFilter.val() : "/api/perizie";

            let request2 = inviaRichiesta("get", url);
            request2.done(function (dataOp) {
                console.log(dataOp);
                CaricaDati(dataOp);
            });
            request2.fail(errore);
        });

        CaricaDati(data);

        let operatori = [];
        for(let perizia of data)
        {
            if(!operatori.includes(perizia.Operatore))
            {
                let request2 = inviaRichiesta("get", "/api/dettagliOperatore/" + perizia.Operatore);
                request2.done(function (data) {
                    console.log("operatore: ", data);

                    $("<option>", {
                        "appendTo" : _sltFilter,
                        "html" : data.User,
                        "val" : perizia.Operatore
                    });
                });
                operatori.push(perizia.Operatore);
            }
        }
    });
    request.fail(errore);
    
    function CaricaDati (data) {
        //mappa
        const mapOptions = {
            center : officeCoords,
            zoom : 10,
            mapTypeId : google.maps.MapTypeId.HYBRID
        };
        mappaObj = new google.maps.Map(_mappa, mapOptions);

        //markers
        for(let perizia of data)
        {
            let markerOptions = {
                map : mappaObj,
                position :  new google.maps.LatLng(perizia.Coordinate.lat, perizia.Coordinate.lng),
                title : perizia.Descrizione,
                zIndex : 3
            };
            let marker = new google.maps.Marker(markerOptions);

            let _details = $("<div>");
            _details.append([
                $("<h2>", { "html" : perizia.Descrizione }),
                $("<p>", { "html" : `Data: ${new Date(perizia.Data).toDateString()}` }),
                $("<p>", { "html" : `Coordinate: ${perizia.Coordinate.lat}, ${perizia.Coordinate.lng}` }),
                $("<button>", {
                    "addClass" : "btn btn-primary",
                    "html" : "Dettagli",
                    "on" : { "click" : () => Dettagli(perizia._id) }
                })
            ]);
            let infoWindow = new google.maps.InfoWindow({ content : _details[0], width : 150 });
            marker.addListener('click', function() {
                infoWindow.open(mappaObj, marker);
            });
        }

        //tabella
        _table.html("");
        for(let perizia of data)
            $("<tr>", {
                "appendTo" : _table,
                "append" : [
                    $("<td>", { "html" : perizia.Descrizione }),
                    $("<td>", { "append" : [
                        $("<i>", {
                            "addClass" : "fas fa-search-location",
                            "attr" : {
                                "lat" : perizia.Coordinate.lat,
                                "lng" : perizia.Coordinate.lng
                            }
                        })
                    ]}),
                    $("<td>", { "append" : [
                        $("<button>", {
                            "html" : "Dettagli",
                            "addClass" : "btn btn-primary",
                            "on" : {
                                "click" : function () { Dettagli(perizia._id) }
                            }
                        })
                    ]})
                ]
            });
    }

    $("#btnLogout").on("click", function () {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    $("#wrapper").on("click", "i.fas.fa-search-location", function () {
        let _sender = $(this);
        let lat = parseFloat(_sender.attr("lat"));
        let lng = parseFloat(_sender.attr("lng"));

        let pos = new google.maps.LatLng(lat, lng);
        mappaObj.panTo(pos);
    });

    _divNewPhoto.children("button").on("click", function () {
        _formNexPhoto.slideDown(300, () => window.scrollBy(0, window.innerHeight)).children().val("");
    });

    _formNexPhoto.children("button").eq(0).on("click", function () {
        _formNexPhoto.slideUp();
    });

    _formNexPhoto.children("button").eq(1).on("click", function () {
        let photo = _formNexPhoto.find("input[type=file]").prop('files')[0];
	    let comment = _formNexPhoto.find("input[type=text]").val();
        let id = currentDetails._id;
        if(!photo)
        {
            alert("Metti un'immagine!");
            return;
        }

        let formData = new FormData();
        formData.append("photo", photo);
        formData.append("id", id);
        if(comment != "")
            formData.append("comment", comment);

        let request = inviaRichiestaMultipart("post", "/api/newImage", formData);
        request.done(function (data) {
            console.log(data);

            alert("Inserimento riusicto");
            Dettagli(id);
        });
        request.fail(errore);
    });

    let directionsRenderer = new google.maps.DirectionsRenderer({ //metto globale per evitare di avere più route nello stesso momento
        polylineOptions: {
            strokeColor : "#44F",
            strokeWeight : 6,
            zIndex : 100
        }
    });
    $("i.fa-solid.fa-route").on("click", function () {
        let coords = currentDetails.Coordinate;
        let coordsObj = new google.maps.LatLng(coords.lat, coords.lng);

        var directionsService = new google.maps.DirectionsService();
        var routesOptions = {
            origin: officeCoords,
            destination: coordsObj,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives:false,
            avoidTolls:false,
        };
        directionsService.route(routesOptions, function(directionsRoutes) {
            if (directionsRoutes.status == google.maps.DirectionsStatus.OK)
            {                
                directionsRenderer.setMap(mappaObj);
                directionsRenderer.setRouteIndex(0);
                directionsRenderer.setDirections(directionsRoutes);
            }
            else
                alert("Errore nella creazione di un percorso");
        });
    });

    function Dettagli(id)
    {
        _divDettagli.slideUp(300, function () {
            _formNexPhoto.hide();
            let request = inviaRichiesta("get", `/api/dettagliPerizia/${id}`);
            request.done(function (data) {
                console.log(data);
                currentDetails = data;

                let _pDettagli = _divDettagli.children("p");
                _pDettagli.eq(0).children("input").val(data.Descrizione);
                _pDettagli.eq(1).children("span").html(data.Operatore);
                _pDettagli.eq(2).children("span").html(data.Data);
                _pDettagli.eq(3).children("span").html(data.Coordinate.lat + " - " + data.Coordinate.lng);
                _pDettagli.eq(3).children("i").attr({ "lat" : data.Coordinate.lat, "lng" : data.Coordinate.lng });

                let _imgContainer = _divDettagli.children(".container").empty();
                if(data.Foto.length != 0)
                {
                    let _row, count = 0;
                    for(let img of data.Foto)
                    {
                        if(count++ % 3 == 0)
                            _row = $("<div>").appendTo(_imgContainer).addClass("row");
    
                        _row.append($("<div>", { "addClass" : "col-sm-1" }));
                        _row.append($("<div>", {
                            "addClass" : "col-sm-3",
                            "append" : [
                                $("<div>", {
                                    "addClass" : "card",
                                    "append" : [
                                        $("<img>", {
                                            "addClass" : "card-img-top",
                                            "prop" : {
                                                "src" : img.url
                                            } 
                                        }),
                                        $("<div>", {
                                            "addClass" : "card-body",
                                            "append" : [
                                                $("<input>", {
                                                    "addClass" : "card-text ",
                                                    "prop" : {
                                                        "type" : "text"
                                                    },
                                                    "val" : img.Commento ? img.Commento : ""
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }));
                    }
                }
                else
                    _imgContainer.html("Non ci sono ancora foto");

                _divDettagli.slideDown(300, () => window.scrollBy(0, window.innerHeight));
            });
            request.fail(errore);
        });
    }

    $("i.fas.fa-upload").on("click", function () {
        let desc = $(this).prev().val();
        let id = currentDetails._id;

        let request = inviaRichiesta("post", "/api/updateDesc", { "id" : id, "desc" : desc });
        request.done(function (data) {
            window.location.reload();
        });
        request.fail(errore);
    });
}