import * as _http from "http";
import * as fs from "fs";
import * as _mongodb from "mongodb";
import express from "express";
import * as bp from "body-parser";

//mongo
//const CONNECTIONSTRING = "mongodb://127.0.0.1:27017"; // accesso in locale
const CONNECTIONSTRING = "mongodb+srv://admin:admin@cluster0.8bz8q.mongodb.net/5B?retryWrites=true&w=majority"; // accesso su atlas
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

//server
let app = express();
const PORT :number = 1337;
let paginaErrore :string;

const server = _http.createServer(app);
server.listen(PORT, function () {
    init();
    console.log(`Il server è in ascolto sulla porta ${PORT}`);
});

function init () {
    fs.readFile("./static/error.html", function (err, data) {
        if(!err)
            paginaErrore = data.toString();
        else
            paginaErrore ="<h1> Risorsa non trovata </h1>";
    });
}

// log
app.use("*", function (req, res, next) {
    console.log("-----> " + req.method + ": " + req.originalUrl);
    next(); 
});

// cerca la pagina e se esiste la spedisce altrimenti fa next()
app.use("/", express.static("./static"));

// route lettura parametri post
app.use("/", bp.json());  //parametri json
app.use("/", bp.urlencoded({ "extended" : true }));  //parametri urlencoded

// log dei parametri
app.use("/", function (req, res, next) {
    if(Object.keys(req.query).length > 0)
        console.log("Parametri GET", req.query);
    if(Object.keys(req.body).length > 0)
        console.log("Parametri BODY", req.body);
    next();
});

//connessione a mongodb
app.use("/", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, function (err, client) {
        if(!err)
        {
            req["client"] = client;
            next();
        }  
        else
            res.status(503).send("Unable to connect to database");
    });
});

// ***** ELENCO SERVIZI ***** //

app.post("/api/servizio1", function(req, res, next){
    let unicorn = req.body.name;
    let client :_mongodb.MongoClient = req["client"];

    if (unicorn)
    {
        let db :_mongodb.Db = client.db(dbName);
        let collection = db.collection("unicorns");
        let request = collection.find({ "name" : unicorn }).toArray();
        request.then(function (data) {
            res.send(data);
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query");
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        res.status(400).send("Parameter 'name' is missing");
        client.close();
    }
});

app.patch("/api/servizio2", function(req, res, next){
    let unicorn = req.body.name, inc = req.body.inc;
    let client :_mongodb.MongoClient = req["client"];

    if (unicorn && inc)
    {
        let db :_mongodb.Db = client.db(dbName);
        let collection = db.collection("unicorns");
        let request = collection.updateOne({ "name" : unicorn }, { $inc : { "vampires" : inc } });
        request.then(function (data) {
            res.send(data);
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query");
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        res.status(400).send(!unicorn ? (!inc ? "Parameters 'name' and 'inc' are missing" : "Parameter 'name' is missing") : "Parameter 'inc' is missing");
        client.close();
    }
});

app.get("/api/servizio3/:gender/:hair", function(req, res, next){
    let gender = req.params.gender, hair = req.params.hair; //non serve controllare che siano stati passati i parametri perchè, se assenti, non entra nella rute
    
    let client :_mongodb.MongoClient = req["client"];
    let db :_mongodb.Db = client.db(dbName);
    let collection = db.collection("unicorns");

    let request = collection.find({ "gender" : gender, "hair" : hair }).toArray();
    request.then(function (data) {
        res.send(data);
    });
    request.catch(function (err) {
        res.status(503).send("Error while executing query");
    });
    request.finally(function () {
        client.close();
    });
});

// ***** FINE ELENCO SERVIZI ***** //

// route di gestione errori di risorsa non trovata
app.use("/", function(req, res, next){
    res.status(404);
    if(req.originalUrl.startsWith("/api/"))
        res.send("Risorsa non trovata");
    else
        res.send(paginaErrore);
});

//gestione errori generici
app.use(function(err, req, res, next) { 
    //console.log(err.stack); // stack complete dell‟errore // default 
    console.log("Error on server's code: ", err.message); // ultimo messaggio in cima allo stack 
});