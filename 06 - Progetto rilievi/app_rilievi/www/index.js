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
    document.addEventListener('deviceready', function() {
        let _mappa = document.getElementById("mappa");
        let _table = $("#table").empty();
        let _divDettagli = $("#divDettagli").hide();
        let _divNewPhoto = $("#divNewPhoto");
        let _formNewPhoto = _divNewPhoto.children("form").hide();

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
                mapTypeId : google.maps.MapTypeId.HYBRID,

                disableDefaultUI:true,
                mapTypeControl: false,
                streetViewControl: true,
                zoomControl: false,
                fullscreenControl: true
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
            _formNewPhoto.slideDown(300, () => window.scrollBy(0, window.innerHeight)).children().val("");
        });

        _formNewPhoto.children("button").eq(0).on("click", function () {
            _formNewPhoto.slideUp();
        });


        let photoB64;
        let _divGallery = $("#divGalley"),
            _divCamera = $("#divCamera");
        let imgSource;
        _divNewPhoto.find(".btn-group").children().eq(0).on("click", function () {
            _divGallery.show();
            _divCamera.hide();
            _divCamera.children("img").hide();
            photoB64 = "";
            imgSource = "gallery";
        }).trigger("click");
        _divNewPhoto.find(".btn-group").children().eq(1).on("click", function () {
            _divGallery.hide();
            _divCamera.show();
            _divGallery.find("input").val("");
            imgSource = "camera";
        });

        $("#btnTakePhoto").on("click", function () {
            let cameraOptions = {
                sourceType: Camera.PictureSourceType.CAMERA,
                destinationType: Camera.DestinationType.DATA_URL,
                saveToPhotoAlbum: false
            };

            navigator.camera.getPicture(function (data) {
                console.log(data);
                photoB64 = "data:image/jpeg;base64," + data;
                _divCamera.children("img").prop("src", photoB64).show();
            }, function (err) { 
                console.log(err);
                _divCamera.children("img").hide();
            }, cameraOptions);
        });

        _formNewPhoto.children("button").eq(1).on("click", function () {
            if(imgSource == "gallery")
            {
                let photo = _formNewPhoto.find("input[type=file]").prop('files')[0];
                let comment = _formNewPhoto.find("input[type=text]").val();
                let id = currentDetails._id;
                if(!photo)
                {
                    showAlert("Metti un'immagine!");
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
    
                    showAlert("Inserimento riusicto");
                    Dettagli(id);
                });
                request.fail(errore);
            }
            else if (imgSource == "camera")
            {
                let comment = _formNewPhoto.find("input[type=text]").val();
                let id = currentDetails._id;
                if(!photoB64)
                {
                    showAlert("Scatta un'immagine!");
                    return;
                }
    
                let newImg = { 
                    "id" : id,
                    "img" : photoB64
                };
                if(comment != "")
                    newImg.comment = comment;
    
                let request = inviaRichiesta("post", "/api/newImageBase64", newImg);
                request.done(function (data) {
                    console.log(data);
    
                    showAlert("Inserimento riusicto");
                    Dettagli(id);
                });
                request.fail(errore);
            }
            else
            {
                showAlert("Scegli un'immagine");
            }
        });

        function Dettagli(id)
        {
            _divDettagli.slideUp(300, function () {
                _formNewPhoto.hide();
                let request = inviaRichiesta("get", `/api/dettagliPerizia/${id}`);
                request.done(function (data) {
                    console.log(data);
                    currentDetails = data;

                    let _pDettagli = _divDettagli.children("p");
                    _pDettagli.eq(0).children("span").html(data.Descrizione);
                    _pDettagli.eq(1).children("span").html(data.Operatore);
                    _pDettagli.eq(2).children("span").html(data.Data);
                    _pDettagli.eq(3).children("span").html(parseFloat(data.Coordinate.lat).toFixed(6) + " - " + parseFloat(data.Coordinate.lng).toFixed(6));
                    _pDettagli.eq(3).children("i").attr({ "lat" : data.Coordinate.lat, "lng" : data.Coordinate.lng });

                    let _imgContainer = _divDettagli.children(".container").empty();
                    if(data.Foto.length != 0)
                    {
                        for(let img of data.Foto)
                        {
                            $("<div>", {
                                "appendTo" : _imgContainer,
                                "addClass" : "row",
                                "append" : [
                                    $("<div>", { "addClass" : "col-1" }),
                                    $("<div>", {
                                        "addClass" : "col-10",
                                        "append" : $("<div>", {
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
                                    })
                                ]
                            });
                        }
                    }
                    else
                        _imgContainer.html("Non ci sono ancora foto");

                    _divDettagli.slideDown(300, () => window.scrollBy(0, window.innerHeight));
                });
                request.fail(errore);
            });
        }
    });
}

function showAlert(msg){
	navigator.notification.alert(
		msg,     // Messaggio da visualizzare
		function(){},      // callback anonima
		"Alert",           // Titolo finestra
		"ok"             // pulsante di chiusura (singolo)
	);
}