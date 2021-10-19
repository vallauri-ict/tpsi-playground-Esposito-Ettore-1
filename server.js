"use strict"

const _http = require("http");
const _url = require("url");
const _fs = require("fs");
let HEADERS = require("./headers.json")

const PORT = 1337;
let paginaErrore;

const server = _http.createServer(function(req, res) {
    let metodo = req.method;
    let url = _url.parse(req.url, true);
    let risorsa = url.pathname;
    let parametri = url.query;
    let dominio = req.headers.host;



    console.log("Richiesta ricevuta: " + req.url);
});

server.listen(PORT);
console.log("Il server è in ascolto sulla porta " + PORT);