"use strict"

$(document).ready(function() {
    let _sltId = $("#sltId").prop("selectedIndex", 0);

    let myChart;

    _sltId.on("change", function () {
        if(_sltId.val() == "")
            return;

        let request = inviaRichiesta("get", "/api/getData", { "sensor" : _sltId.val() });
        request.done(function (data) {
            console.log(data);

            CreateChart(data);
        });
        request.fail(errore);
    });

    function CreateChart(data)
    {
        let _canvas = $("#Chart")[0];

        let chartData = [];
        for(let dato of data)
            chartData.push(dato.value);

        let chart = {
            type : 'line',
            data : {
                borderColor : data[0].sensor.type == "temperature" ? "red" : ( data[0].sensor.type == "humidity" ? "blue" : "purple"),
                label : data[0].sensor.type,
                data : chartData
            }
        };

        if (myChart)
            myChart.destroy();

        myChart = new Chart(_canvas, chart);
    }
});