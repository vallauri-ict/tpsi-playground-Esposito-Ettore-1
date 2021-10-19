"use strict"

import * as _http from "http";
import * as _url from "url";
import * as _fs from "fs";
import * as _mime from "mime";
let HEADERS = require("./headers.json")

const PORT :number = 1337;
let paginaErrore :string;

const server = _http.createServer(function(req, res) {
    let metodo = req.method;
    let url = _url.parse(req.url, true);
    let risorsa = url.pathname;
    let parametri = url.query;
    let dominio = req.headers.host;

    if(risorsa == '/')
        risorsa = "/index.html";
    
    if(!risorsa.startsWith("/api/")) 
    {
        //se è una risorsa
        risorsa = "./static" + risorsa;
        _fs.readFile(risorsa, function (err, data) {
            if(!err)
            {
                let header = { "Content-Type" : _mime.getType(risorsa) };

                res.writeHead(200, header);
                res.write(data);
                res.end();
            }
            else
            {
                res.writeHead(404, HEADERS.html);
                res.write(paginaErrore);
                res.end();
            }
        });
    }
    else
    {
        //se è un servizio
        if(risorsa == "/api/servizio1")
        {
            console.log(JSON.stringify(parametri));
            let json = { "ris" : "ok" };

            res.writeHead(200, HEADERS.json);
            res.write(JSON.stringify(json));
            res.end();
        }
        else
        {
            res.writeHead(404, HEADERS.text);
            res.write("Il servizio richiesto non esiste");
            res.end();
        }
    }

    console.log(`${metodo}: ${risorsa}`);
});

server.listen(PORT, function () {
    _fs.readFile("./static/error.html", function (err, data) {
        if(!err)
            paginaErrore = data.toString();
        else
            paginaErrore = "<h1>Pagina non trovata<h1>";
    });
});
console.log(`Il server è in ascolto sulla porta ${PORT}`);