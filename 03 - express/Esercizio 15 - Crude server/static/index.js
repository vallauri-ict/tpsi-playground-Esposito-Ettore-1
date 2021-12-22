"use strict"

$(document).ready(function() {
    let _divIntestazione = $("#divIntestazione");
    let _divCollections = $("#divCollections");
    let _table = $("#mainTable");
    let _divDettagli = $("#divDettagli");
    let _filters = $(".card").eq(0).hide();

    let currentCollection = "";

    $("#btnAdd").prop("disabled", true);

    let request = inviaRichiesta("get", "/api/getCollections");
    request.done(function(collections) {
        console.log(collections);

        let base = _divCollections.children("label").clone();
        _divCollections.empty();

        for(const collection of collections)
        {
            let newRadio = base.clone();

            newRadio.children("input").val(collection.name);
            newRadio.children("span").text(collection.name);

            newRadio.appendTo(_divCollections);
            _divCollections.append("<br/>");
        }
    });
    request.fail(errore);

    _divCollections.on("click", "input[type=radio]", function () {
        currentCollection = $(this).val();

        let request = inviaRichiesta("get", `/api/${currentCollection}`);
        request.done(function (data) {
            console.log(data);

            //tabella
            let _tbody = _table.children("tbody").empty();
            for(const item of data)
            {
                $("<tr>", {
                    "appendTo" : _tbody,
                    "prop" : { "_id" : item._id },
                    "append" : [
                        $("<td>", { "text" : item._id, "prop" : { "method" : "get" }, "on" : { "click" : Dettagli }}),
                        $("<td>", { "text" : item.name, "prop" : { "method" : "get" }, "on" : { "click" : Dettagli }}),
                        $("<td>", {
                            "append" :  [
                                $("<div>", { "prop" : { "method" : "patch" }, "on" : { "click" : Dettagli } }),
                                $("<div>", { "prop" : { "method" : "put" }, "on" : { "click" : Dettagli } }),
                                $("<div>", { "on" : { "click" : Elimina }})
                            ]
                        })
                    ]
                });
            }

            //label
            let _labels = _divIntestazione.find("strong");
            _labels.eq(0).text(currentCollection);
            _labels.eq(1).text(data.length);

            //filtri
            
            if(currentCollection == "unicorns")
                _filters.show();
            else
                _filters.hide();

            //add
            $("#btnAdd").prop("disabled", false);
        });
        request.fail(errore);

    });

    $("#btnAdd").on("click", function () {
        VisualizzaInvia({ }, "post");
    })

    //elenco funzioni

    function Dettagli () {
        let _sender = $(this);
        let method = _sender.prop("method");
        let id;
        if(method == "get")
            id = _sender.parent().prop("_id");
        else
            id = _sender.parent().parent().prop("_id");
        let request = inviaRichiesta("get", `/api/${currentCollection}/${id}`);
        request.fail(errore);

        switch (method) {
            case "get":
                request.done(function (details) {
                    console.log(details);
        
                    let content = "";
                    for(const key in details)
                        content += `<strong> ${key} - ${details[key]} </strong> <br/>`
                    _divDettagli.html(content);
                });
                break;
            case "patch":
            case "put":
                request.done(function (details) {
                    console.log(details);
        
                    VisualizzaInvia(details, method, id);
                });
                break;
        }     
    }

    function VisualizzaInvia(data, method, id = "")
    {
        delete data["_id"];
        _divDettagli.empty();
        $("<textarea>", { "appendTo" : _divDettagli, "val" : JSON.stringify(data, null, 4) });
        let textarea = _divDettagli.children("textarea");
        textarea.css("height", textarea.get(0).scrollHeight); 
        $("<button>", { "appendTo" : _divDettagli, "text" : "invia", "addClass" : "btn btn-success", "on" : { "click" : function () {
            let param;
            try
            {
                param = JSON.parse(_divDettagli.children("textarea").val());
            }
            catch
            {
                alert("Il json inserito non è valido");
                return;
            }
            delete param["_id"];

            let request = inviaRichiesta(method, `/api/${currentCollection}/${id}`, param);
            request.done(function (data) {
                console.log(data);

                _divDettagli.empty();
                _divCollections.find("input[type=radio]:checked").trigger("click");
            });
        } } });
    }

    function Elimina () {
        let _sender = $(this);
        let id = _sender.parent().parent().prop("_id");
        let request = inviaRichiesta("delete", `/api/${currentCollection}/${id}`);
        request.done(function (details) {
            console.log(details);

            _divCollections.find("input[type=radio]:checked").trigger("click");
        });
        request.fail(errore);
    }
});