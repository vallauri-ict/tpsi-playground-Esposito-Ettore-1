import * as _http from "http";
import * as _fs from "fs";

//lettura file json 
import radios from "./radios.json";

//lettura del file

_fs.readFile("./states.json", function (err, data) {
    if(err)
    {
        console.log(err.name + "\n" + err.message);
        return;
    }
    else
    {
        //data è in forma binaria, serve un toString() per visualizzarlo correttamente
        console.log(data.toString());
        elabora(JSON.parse(data.toString()));
    }
});

function elabora (states)
{
    for (const state of states) {
        let cont = 0;
        for (const radio of radios) {
            if(radio.state == state.name)
                cont++;
        } 
        state.stationcount = cont.toString();     
    }

    _fs.writeFile("./states.json", JSON.stringify(states), function (err) {
        if(err)
            console.log(err.name + "\n" + err.message);
        else
            console.log("File aggiornato correttamente");
    });
}