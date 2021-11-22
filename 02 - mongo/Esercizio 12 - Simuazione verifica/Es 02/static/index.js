$(document).ready(function() {
    let _dateStart = $("#dataStart");
    let _dateEnd = $("#dataEnd");
    let _table = $("#table");

    $("#btmInvia").on("click", function () {
        let DataDa = _dateStart.val();
        let DataA = _dateEnd.val();

        let request = inviaRichiesta("post", "/api/servizio1", { "dataStart" : DataDa, "dataEnd" : DataA });
        request.done(function (data) {
            console.log(data);

            _table.html("");
            for(let student of data)
            {
                $("<tr>", {
                    "appendTo" : _table,
                    "append" : [
                        $("<td>", { "text" : student.nome }),
                        $("<td>", { "text" : student.classe }),
                        $("<td>", { "text" : new Date(student.dob).toDateString() })
                    ]
                });
            }
        });
        request.fail(errore);
    });
});
