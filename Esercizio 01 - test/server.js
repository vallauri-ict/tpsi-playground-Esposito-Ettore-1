
const _http = require("http");
const _url = require("url");
const _colors = require("colors"); //non necessario
const HEADERS = require("./headers.json")

const port = 1337;

const server=_http.createServer(function (req, res) {
    /*  PRIMA PROVA
    //metto intestazione
    res.writeHead(200, HEADERS.text);
    //scrivo la ristposta
    res.write("Richiesta eseguita correttamente");
    //invio la risposta
    res.end();
    */

    //prendo il metodo e i parametri
    let metodo = req.method;
    let url = _url.parse(req.url, true);
    let risorsa = url.pathname;
    let parametri = url.query;
    let dominio = req.headers.host;

    res.writeHead(200, HEADERS.html);

    res.write("<h1> Informazioni relative alla richiesta ricevuta </h1>");
    res.write("<br/>");
    res.write(`<p><b> Risorsa richiesta: </b> ${risorsa} </p>`);
    res.write(`<p><b> Metodo: </b> ${metodo} </p>`);
    res.write(`<p><b> Parametri: </b> ${JSON.stringify(parametri)} </p>`);
    res.write(`<p><b> Dominio: </b> ${dominio} </p>`);
    res.end();
    
    console.log("Richiesta ricevuta: " + req.url.yellow);
});

// se non si specifica l'indirizzo IP di ascolto il server viene avviato su tutte le interfacce
server.listen(port);
console.log("server in ascolto sulla porta " + port);