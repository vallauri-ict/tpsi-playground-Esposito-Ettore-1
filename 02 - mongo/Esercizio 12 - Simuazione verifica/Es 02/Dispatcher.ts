import * as _http from "http";
import * as _url from "url";
import * as _fs from "fs";
import * as _mime from "mime";
import * as _queryString from "query-string";
import HEADERS from "./headers.json";
let paginaErrore : string;

export class Dispatcher{
    prompt:string = ">>>";
    // ogni listener è costituto da un json del tipo:
    // {"risorsa":"callback"}
    // I listeners sono suddivisi in base al metodo di chiamata
    listeners:any = {// è una property quindi quando la uso devo usare this.listeners
        "GET":{},
        "DELETE":{},
        "PUT":{},
        "PATCH":{},       
        "POST":{}
    }
    constructor () {
        this.init();
    }

    init () {
        _fs.readFile("./static/error.html", function (err, data) {
            if(!err)
                paginaErrore = data.toString();
            else
                paginaErrore = "<h1>Pagina non trovata</h1>";
        });
    }

    dispatch (req, res) {
        let metodo = req.method.toUpperCase();
        if (metodo == 'GET')
        {
            this.innerDispatcher(req, res);
        }
        else
        {
            let parametriBody :string = "";
            let that = this;
            req.on("data", function (data) { //richiamato ogni volta che arrivano parametri
                parametriBody += data;
            });

            let parJson = {};
            req.on("end", function () { //richiamata quando non ci sono più parametri da ricevere
                try { //provo a convertire i parametri in json
                    parJson = JSON.parse(parametriBody);
                }
                catch { //se non sono json, i parametri sono in url encoded
                    parJson = _queryString.parse(parametriBody);
                }
                finally { //in entrambi i casi metto i parametri nella richiesta
                    req["BODY"] = parJson;
                    that.innerDispatcher(req, res);
                }
            });
        }
    }

    addListener(metodo:string, risorsa:string, callback:any) {
        metodo = metodo.toUpperCase();
        if(metodo in this.listeners)// se la chiave contiene listeners
        {
            // creo una nuova chiave "risorsa" e le assegno callback
            this.listeners[metodo][risorsa] = callback;
        }
        else 
        {
            // la chiamata non esiste quinid do un messaggio di errore
            throw new Error("Metodo non vallido ")
        }
    }

    innerDispatcher (req :any, res :any) {
        let metodo = req.method;
        let url = _url.parse(req.url, true);
        let risorsa = url.pathname;
        let parametri = url.query;
        req["GET"] = parametri;

        console.log(`${this.prompt}Richiesta ${metodo} alla risorsa ${risorsa} con parametri: ${JSON.stringify(metodo == "GET" ? parametri : req["BODY"])}`);

        if(risorsa.startsWith("/api/"))
        {
            risorsa = risorsa.substring(5);
            if(risorsa in this.listeners[metodo])
            {
                let callback = this.listeners[metodo][risorsa];
                callback(req, res);
            }
            else
            {
                res.writeHead(404, HEADERS.text);
                res.write("Risorsa non trovata");
                res.end();
            }
        }
        else
        {
            staticListener(req, res, risorsa);
        }
    }
}

function staticListener (req, res, risorsa) {
    if(risorsa == '/')
        risorsa = "/index.html";
    risorsa = "./static" + risorsa;

    _fs.readFile(risorsa, function (err, data) {
        if(!err)
        {
            res.writeHead(200, {"Content-Type" : _mime.getType(risorsa)});
            res.write(data);
            res.end();
        }
        else
        {
            res.writeHead(404, HEADERS.html);
            res.write(paginaErrore);
            res.end();

            console.log("\t\t\t" + err.code + " " + err.message);
        }
    });
}