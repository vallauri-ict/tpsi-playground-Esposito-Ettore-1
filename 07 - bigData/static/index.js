"use strict"

$(document).ready(function() {
    let _wrapper = $("#Wrapper");
    let timer;

    let _navigation = $("#navBar").find(".nav-link").on("click", function () {
        let sender = $(this);
        let target = sender.attr("to");

        _navigation.removeClass("active");
        sender.addClass("active");

        _wrapper.children().hide();
        $("#" + target).show();

        if(timer)
            clearInterval(timer);
    });

    // *** TUTTE MISURE *** //

    let _canvasTemp = $("#graphTemp")[0],
        _canvasHum = $("#graphHum")[0],
        _canvasPh = $("#graphPh")[0];
    let chartTemp, chartHum, chartPh;
    let _tempDetails = $(_canvasTemp).next().find("span"),
        _humDetails = $(_canvasHum).next().find("span"),
        _phDetails = $(_canvasPh).next().find("span");

    _navigation.eq(0).on("click", function () { //tutti sensori
        AllGraph();
        timer = setInterval(AllGraph, 5000);
    }).trigger("click");

    function AllGraph () { 
        let request = inviaRichiesta("get", "/api/getData");
        request.done(function (data) {
            let forGraph = {
                "temperature" : { "values" : [], "times" : [] },
                "humidity" : { "values" : [], "times" : [] },
                "ph" : { "values" : [], "times" : [] }
            };
            for(let sensorScan of data)
            {
                forGraph[sensorScan.sensor.type].values.push(sensorScan.value);
                forGraph[sensorScan.sensor.type].times.push(sensorScan.timeStamp.substring(11, 19));
            }

            if (chartTemp)
                chartTemp.destroy();
            forGraph.temperature.values = forGraph.temperature.values.reverse();
            chartTemp = new Chart(_canvasTemp, {
                type : "line",
                data : {
                    labels : forGraph.temperature.times.reverse(),
                    datasets : [
                        {
                            label : "temperature",
                            data : forGraph.temperature.values,
                            backgroundColor : 'rgb(255, 0, 0)',
                            borderColor : 'rgb(255, 0, 0)'
                        }
                    ]
                }
            });
            fillData(forGraph.temperature.values, _tempDetails);

            if (chartHum)
                chartHum.destroy();
            forGraph.humidity.values = forGraph.humidity.values.reverse();
            chartHum = new Chart(_canvasHum, {
                type : "line",
                data : {
                    labels : forGraph.humidity.times.reverse(),
                    datasets : [
                        {
                            label : "humidity",
                            data : forGraph.humidity.values,
                            backgroundColor : 'rgb(0, 0, 255)',
                            borderColor : 'rgb(0, 0, 255)'
                        }
                    ]
                }
            });
            fillData(forGraph.humidity.values, _humDetails);

            if (chartPh)
                chartPh.destroy();
            forGraph.ph.values = forGraph.ph.values.reverse();
            chartPh = new Chart(_canvasPh, {
                type : "line",
                data : {
                    labels : forGraph.ph.times.reverse(),
                    datasets : [
                        {
                            label : "ph",
                            data : forGraph.ph.values,
                            backgroundColor : 'rgb(255, 0, 255)',
                            borderColor : 'rgb(255, 0, 255)'
                        }
                    ]
                }
            });
            fillData(forGraph.ph.values, _phDetails);
        });
        request.fail(errore);
    }

    // *** SINGOLO SENSORE *** //

    let _sltSensor = $("#sltSensor").on("change", function () {
        SensorGraph();
        if(timer)
            clearInterval(timer);
        timer = setInterval(SensorGraph, 5000);
    });
    let _canvasSensor = $("#graphSensor")[0];
    let chartSensor;
    let _sensorDetails = $(_canvasSensor).next().find("span");

    _navigation.eq(1).on("click", function () { //singolo sensore
        SensorGraph();
        timer = setInterval(SensorGraph, 5000);
    });

    function SensorGraph () { 
        let request = inviaRichiesta("get", "/api/getSensorData", { "sensor" : _sltSensor.val() });
        request.done(function (data) {
            let values = [], times = [];
            for(let sensorScan of data)
            {
                values.push(sensorScan.value);
                times.push(sensorScan.timeStamp.substring(11, 19));
            }

            let color = data[0].sensor.type == "temperature" ? "rgb(255, 0, 0)" : (data[0].sensor.type == "humidity" ? "rgb(0, 0, 255)" : "rgb(255, 0, 255)");

            if(chartSensor)
                chartSensor.destroy();
            values = values.reverse();
            chartSensor = new Chart(_canvasSensor, {
                type : "line",
                data : {
                    labels : times.reverse(),
                    datasets : [
                        {
                            label : data[0].sensor.sensorId,
                            data : values,
                            backgroundColor : color,
                            borderColor : color,
                        }
                    ]
                }
            });
            fillData(values, _sensorDetails);
        });
        request.fail(errore);
    }

    // *** ELENCO FUNZIONI *** //

    function fillData (data, spans) {
        //media
        let somma = 0, media;
        for(let value of data)
            somma += value;
        media = somma / data.length;

        //deviazione standard
        let deviazione;
        somma = 0;
        for(let value of data)
            somma += Math.pow(value - media, 2);
        deviazione = Math.sqrt(somma / data.length);

        //visualizzazione
        spans.eq(0).html(media.toFixed(3));
        spans.eq(1).html(deviazione.toFixed(3));
    }
});