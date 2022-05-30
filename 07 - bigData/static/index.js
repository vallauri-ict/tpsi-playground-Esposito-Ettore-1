"use strict"

$(document).ready(function() {
    let _sltSensor = $("#sltSensor")
    let _canvasSensor = $("#graphSensor")[0];
    let chartSensor;
    let _sensorDetails = $(_canvasSensor).next().find("span");
    let timer;

    let request = inviaRichiesta("get", "/api/getSensors");
    request.done(function (data) {
        console.log(data);

        for(let sensor of data)
            $("<option>", {
                "appendTo" : _sltSensor,
                "html" : `${sensor.sensorId} - ${sensor.type}`,
                "val" : sensor.sensorId
            });
        
        _sltSensor.trigger("change");
    });
    request.fail(errore);

    _sltSensor.on("change", function () {
        SensorGraph();
        if(timer)
            clearInterval(timer);
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
                },
                options: {
                    animations : false
                }
            });
            fillData(values, _sensorDetails);
        });
        request.fail(errore);
    }

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