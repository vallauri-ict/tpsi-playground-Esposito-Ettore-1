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

    let mappaObj;
    let officeCoords = new google.maps.LatLng(44.7077582, 7.6877771);
    let currentDetails;

    let request = inviaRichiesta("get", "/api/perizie");
    request.done(function (data) {
        console.log(data);

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
    });
    request.fail(errore);

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
        _formNexPhoto.slideDown().children().val("");
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

    function Dettagli(id)
    {
        _divDettagli.slideUp(300, function () {
            _formNexPhoto.hide();
            let request = inviaRichiesta("get", `/api/dettagliPerizia/${id}`);
            request.done(function (data) {
                console.log(data);
                currentDetails = data;

                let _pDettagli = _divDettagli.children("p");
                _pDettagli.eq(0).children("span").html(data.Descrizione);
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
                                        img.Commento ? $("<div>", {
                                            "addClass" : "card-body",
                                            "append" : [
                                                $("<p>", {
                                                    "addClass" : "card-text",
                                                    "html" : img.Commento
                                                })
                                            ]
                                        }): null
                                    ]
                                })
                            ]
                        }));
                    }
                }
                else
                    _imgContainer.html("Non ci sono ancora foto");

                _divDettagli.slideDown(300);
            });
            request.fail(errore);
        });
    }
}