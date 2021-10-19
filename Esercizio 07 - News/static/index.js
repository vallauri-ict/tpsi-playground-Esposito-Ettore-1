$(document).ready(function() {
    let _wrapper = $("#wrapper");
    let _news = $("#news");

    let request = inviaRichiesta("get", "/api/elenco");
    request.done(function(elenco) {
        console.log(elenco);

        for(let news of elenco)
        {
            $("<span>", {
                "appendTo" : _wrapper,
                "addClass" : "titolo",
                "text" : news.titolo
            });
            $("<a>", {
                "appendTo" : _wrapper,
                "text" : "Leggi",
                "prop" : {
                    "href" : "#"
                },
                "on" : {
                    "click" : function () {
                        LeggiArticolo(news.file, $(this));
                    }
                }
            });
            $("<span>", {
                "appendTo" : _wrapper,
                "addClass" : "nVis",
                "text" : `Visualizzato ${news.visualizzazioni} volte`
            });
            $("<br>", {
                "appendTo" : _wrapper
            });
        }
    });
    request.fail(errore);


    //elenco funzioni

    function LeggiArticolo (file, _sender) {
        let request = inviaRichiesta("post", "/api/dettagli", {"file" : file});
        request.done(function (testo) {
            console.log(testo);

            _news.html(testo.testo);

            let vis = _sender.next();
            vis.text(`Visualizzato ${testo.vis} volte`);
        });
        request.fail(errore);
    }
});
