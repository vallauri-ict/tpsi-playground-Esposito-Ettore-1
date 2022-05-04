"use strict"

$(document).ready(function() {
    let _table = $("#table").empty();
    let _divDettagli = $("#divDettagli").hide();

    let currentDetails;

    let request = inviaRichiesta("get", "/api/perizie");
    request.done(function (data) {
        for(let perizia of data) {
            $("<tr>", {
                "appendTo" : _table,
                "append" : [
                    $("<td>", { "html" : perizia.Descrizione }),
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
    });
    request.fail(errore);

    $("#btnLogout").on("click", function () {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    $("i.fas.fa-search-location").on("click", function () {
        window.open(`http://www.google.com/maps/place/${currentDetails.Coordinate.lat},${currentDetails.Coordinate.lng}`, '_blank').focus();
    });

    function Dettagli(id)
    {
        _divDettagli.slideUp(300, function () {
            let request = inviaRichiesta("get", `/api/dettagliPerizia/${id}`);
            request.done(function (data) {
                console.log(data);
                currentDetails = data;

                let _pDettagli = _divDettagli.children("p");
                _pDettagli.eq(0).children("span").html(data.Descrizione);
                _pDettagli.eq(1).children("span").html(data.Operatore);
                _pDettagli.eq(2).children("span").html(data.Data);
                _pDettagli.eq(3).children("span").html(data.Coordinate.lat + " - " + data.Coordinate.lng);

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
});