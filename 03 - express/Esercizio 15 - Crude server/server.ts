import * as _http from "http";
import * as fs from "fs";
import * as _mongodb from "mongodb";
import express from "express";
import * as bp from "body-parser";

//mongo
//const CONNECTIONSTRING = "mongodb://127.0.0.1:27017"; // accesso in locale
const CONNECTIONSTRING = "mongodb+srv://admin:admin@cluster0.8bz8q.mongodb.net/5B?retryWrites=true&w=majority"; // accesso su atlas
const dbName = "unicorns";
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

app.get("/api/getCollections", function (req, res, next) {
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let request = db.listCollections().toArray();
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

//intercettazione parametri
let currentCollection, id;
app.use("/api/:collection/:id?", function (req, res, next) {
    currentCollection = req.params.collection;
    id = req.params.id;
    next();
});

app.get("/api/*", function (req, res, next) {
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let collection = db.collection(currentCollection);

    if (!id)
    {
        let request = collection.find().toArray();
        request.then(function (data) {
            res.send(data);
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query:\n" + err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        let oid :_mongodb.ObjectId = new _mongodb.ObjectId(id);
        let request = collection.findOne({ "_id" : oid });
        request.then(function (data) {
            res.send(data);
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query:\n" + err);
        });
        request.finally(function () {
            client.close();
        });
    }
});

app.post("/api/*", function (req, res, next) {
    let newRecord = req.body;
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let collection = db.collection(currentCollection);

    let request = collection.insertOne(newRecord);
    request.then(function (data) {
        res.send({ "ris" : "ok" });
    });
    request.catch(function (err) {
        res.status(503).send("Error while executing query:\n" + err);
    });
    request.finally(function () {
        client.close();
    });
});

app.delete("/api/*", function (req, res, next) {
    if(id)
    {
        let client :_mongodb.MongoClient = req["client"];
        let db = client.db(dbName);
        let collection = db.collection(currentCollection);

        let oid :_mongodb.ObjectId = new _mongodb.ObjectId(id);
        let request = collection.deleteOne({ "_id" : oid });
        request.then(function (data) {
            res.send({ "ris" : "ok" });
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query:\n" + err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        res.status(400).send("Parametro id non inviato");
    }
});

app.patch("/api/*", function (req, res, next) {
    if(id)
    {
        let client :_mongodb.MongoClient = req["client"];
        let db = client.db(dbName);
        let collection = db.collection(currentCollection);

        let record = req.body;
        let oid :_mongodb.ObjectId = new _mongodb.ObjectId(id);
        let request = collection.updateOne({ "_id" : oid }, { $set : record });
        request.then(function (data) {
            res.send({ "ris" : "ok" });
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query:\n" + err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        res.status(400).send("Parametro id non inviato");
    }
});

app.put("/api/*", function (req, res, next) {
    if(id)
    {
        let client :_mongodb.MongoClient = req["client"];
        let db = client.db(dbName);
        let collection = db.collection(currentCollection);    

        let record = req.body;
        let oid :_mongodb.ObjectId = new _mongodb.ObjectId(id);
        let request = collection.replaceOne({ "_id" : oid }, record);
        request.then(function (data) {
            res.send({ "ris" : "ok" });
        });
        request.catch(function (err) {
            res.status(503).send("Error while executing query:\n" + err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        res.status(400).send("Parametro id non inviato");
    }
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
    console.log("***Error on server's code: ", err.message); // ultimo messaggio in cima allo stack 
});