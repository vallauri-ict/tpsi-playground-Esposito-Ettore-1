$(document).ready(function() {
    let _sltState = $("#lstRegioni");
    let _table = $("#tbody");

    let request = inviaRichiesta("get", "/api/elenco");
    request.done(function (elenco) {
        console.log(elenco);

        for(let state of elenco)
        {
            $("<option>", {
                "appendTo" : _sltState,
                "text" : `${state.name} [${state.stationcount} emittenti]`,
                "val" : state.value
            });
        }
    });
    request.fail(errore);

    _sltState.on("change", RiempiTabella);

    //elenco funzioni
    function RiempiTabella() {
        let request = inviaRichiesta("post", "/api/radios", { "state": _sltState.val() });
        request.done(function (radios) {
            console.log(radios);

            _table.html("");
            for (let radio of radios) {
                $("<tr>", {
                    "appendTo": _table,
                    "append": [
                        $("<td>", {
                            "append": [
                                $("<img>", { "prop": { "src": radio.favicon }, "css": { "width": "40px" } })
                            ]
                        }),
                        $("<td>", { "text": radio.name }),
                        $("<td>", { "text": radio.codec }),
                        $("<td>", { "text": radio.bitrate }),
                        $("<td>", { "text": radio.votes }),
                        $("<td>", {
                            "append": [
                                $("<img>", {
                                    "prop": { "src": "like.jpg" },
                                    "css": { "width": "40px" },
                                    "on": {
                                        "click": function () {
                                            MettiLike(radio.id);
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                });
            }
        });
        request.fail(errore);
    }

    function MettiLike(id) {
        let request = inviaRichiesta("POST", "/api/like", { "id": id });
        request.done(function (ris) {
            console.log(ris);

            RiempiTabella();
        });
        request.fail(errore);
    }
});
