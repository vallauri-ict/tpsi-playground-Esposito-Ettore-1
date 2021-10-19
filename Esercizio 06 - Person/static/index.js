"use strict"
$(document).ready(function() {
    let _lstNazioni = $("#lstNazioni");
    let _tabStudenti = $("#tabStudenti");
    let _divDettagli = $("#divDettagli");
    let _btnFirst = $("#btnFirst");
    let _btnPrev = $("#btnPrev");
    let _btnNext = $("#btnNext");
    let _btnLast = $("#btnLast");

    let idDett, naz;
    let personsNames = [];

    _divDettagli.hide();
    
    let request = inviaRichiesta("get", "/api/nazioni");
    request.done(function (nazioni) {
        console.log(nazioni);
        for(let nazione of nazioni.nazioni)
        {
            $("<a>", {
                "appendTo" : _lstNazioni,
                "addClass" : "dropdown-item",
                "text" : nazione,
                "on" : {
                    "click" : VisualizzaPersone
                }
            });
        }
    });
    request.fail(errore);

    _btnFirst.on("click", function () {
        idDett = 0;
        Dettagli(0);
        btnSet();
    });
    _btnPrev.on("click", function () {
        idDett--;
        Dettagli(idDett);
        btnSet();
    });
    _btnNext.on("click", function () {
        idDett++;
        Dettagli(idDett);
        btnSet();
    });
    _btnLast.on("click", function () {
        idDett = personsNames.length - 1;
        Dettagli(idDett);
        btnSet();
    });

    //elenco funzioni

    function VisualizzaPersone (reloadTable = false)
    {
        if(!reloadTable || typeof(reloadTable) != 'boolean')
            naz = $(this).text();
        let request = inviaRichiesta("post", "/api/persone", {"nazione" : naz});
        request.done(function (persons) {
            persons = persons.persone;
            console.log(persons);

            _divDettagli.hide();
            _tabStudenti.html("");
            personsNames = [];

            let i = 0;
            for (let pers of persons)
            {
                $("<tr>", {
                    "appendTo" : _tabStudenti,
                    "append" : [
                        $("<td>", { "text" : pers.name }),
                        $("<td>", { "text" : pers.city }),
                        $("<td>", { "text" : pers.state }),
                        $("<td>", { "text" : pers.cell }),
                        $("<td>", {
                            "append" : [
                                $("<button>", {
                                    "text" : "Dettagli",
                                    "addClass" : "btn btn-primary",
                                    "on" : {
                                        "click" : function () {
                                            let index = parseInt($(this).prop("id"));
                                            Dettagli(index);
                                            idDett = index;
                                            btnSet();
                                        }
                                    },
                                    "prop" : {
                                        "id" : i
                                    }
                                })
                            ]
                        }),
                        $("<td>", {
                            "append" : [
                                $("<button>", {
                                    "text" : "Elimina",
                                    "addClass" : "btn btn-danger",
                                    "on" : {
                                        "click" : function () {
                                            let index = parseInt($(this).prop("id"));
                                            Elimina(index);
                                            if(personsNames.length == 1)
                                                EliminaNazione();
                                            else
                                                VisualizzaPersone(true);
                                        }
                                    },
                                    "prop" : {
                                        "id" : i
                                    }
                                })
                            ]
                        })
                    ]
                });
                personsNames.push(pers.name);
                i++;
            }
        });
        request.fail(errore);
    }

    function Dettagli (index) {
        let request = inviaRichiesta("post", "/api/dettagli", {"name" : personsNames[index]});
        request.done(function (dettagli) {
            console.log(dettagli);

            _divDettagli.children("img").prop("src", dettagli.img);
            _divDettagli.children(".card-body").children(".card-title").text(personsNames[index]);
            _divDettagli.children(".card-body").children(".card-text").html(`<b>gender</b>: ${dettagli.gender}<br/>
                                                                 <b>adress</b>: ${JSON.stringify(dettagli.adress)}<br/>
                                                                 <b>e-mail</b>: ${dettagli.email}<br/>
                                                                 <b>dob</b>: ${JSON.stringify(dettagli.dob)}`);
            _divDettagli.show();
        });
        request.fail(errore);
    }

    function Elimina (index) {
        let request = inviaRichiesta("delete", "/api/elimina", {"name" : personsNames[index]});
        request.done(function (info) {
            console.log(info);
            _divDettagli.hide();
        });
        request.fail(errore);
    }

    function btnSet () {
        if(personsNames.length == 1)
        {
            _btnFirst.prop('disabled', true);
            _btnPrev.prop('disabled', true);
            _btnLast.prop('disabled', true);
            _btnNext.prop('disabled', true);
        }
        else
        {
            if(idDett <= 0)
            {
                _btnFirst.prop('disabled', true);
                _btnPrev.prop('disabled', true);
                _btnLast.prop('disabled', false);
                _btnNext.prop('disabled', false);
            }
            else if(idDett >= personsNames.length - 1)
            {
                _btnLast.prop('disabled', true);
                _btnNext.prop('disabled', true);
                _btnFirst.prop('disabled', false);
                _btnPrev.prop('disabled', false);
            }
            else
            {
                _btnFirst.prop('disabled', false);
                _btnPrev.prop('disabled', false);
                _btnLast.prop('disabled', false);
                _btnNext.prop('disabled', false);
            }
        }
    }

    function EliminaNazione () {
        let _options = _lstNazioni.children();
        for(let option of _options)
        {
            let _att = $(option);
            if(_att.text() == naz)
            {
                _att.remove();

                _divDettagli.hide();
                _tabStudenti.html("");
                personsNames = [];
                break;
            }
        }
    }
})