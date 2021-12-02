$(document).ready(function() {
    $("#btnInvia").on("click", function() {
        let request = inviaRichiesta("post", "/api/servizio1", { "name" : "Horny" });
        request.fail(errore);
        request.done(function(data) {
            alert(data.length != 0 ? JSON.stringify(data, null, 8) : "Unicorn not found");
        });
    });

    $("#btnInvia2").on("click", function() {
        let request = inviaRichiesta("patch", "/api/servizio2", { "name" : "Horny", "inc" : 3 });
        request.fail(errore);
        request.done(function(data) {
            alert(data.modifiedCount != 0 ? "Data updated correctly" : "Unicorn not found");
        });
    });

    $("#btnInvia3").on("click", function() {
        let request = inviaRichiesta("get", "/api/servizio3/m/brown");
        request.fail(errore);
        request.done(function(data) {
            alert(data.length != 0 ? JSON.stringify(data, null, 8): "No unicorn found");
        });
    });
});
