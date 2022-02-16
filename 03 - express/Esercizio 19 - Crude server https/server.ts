import * as _http from "http";
import * as _https from "https";
import * as fs from "fs";
import * as _mongodb from "mongodb";
import express from "express";
import * as bp from "body-parser";
import cors from "cors";

//mongo
//const CONNECTIONSTRING = "mongodb://127.0.0.1:27017"; // accesso in locale
const CONNECTIONSTRING = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.8bz8q.mongodb.net/5B?retryWrites=true&w=majority"; // accesso da heroku
const dbName = "RecipeBook";
const mongoClient = _mongodb.MongoClient;

//server
let app = express();
const PORT :number = parseInt(process.env.PORT) || 1337;
const PORTHTTPS :number = 1338;
let paginaErrore :string;

//chiavi
let privateKey = fs.readFileSync("keys/privateKey.pem", "utf-8");
let certificate = fs.readFileSync("keys/certificate.crt", "utf-8");
const CREDENTIALS = { "key" : privateKey, "cert" : certificate };

const serverHttp = _http.createServer(app);
serverHttp.listen(PORT, function () {
    init();
});

const serverHttps = _https.createServer(CREDENTIALS, app);
serverHttps.listen(PORTHTTPS, function () {
    console.log(`Il server http è in ascolto sulla porta ${PORT}`);
    console.log(`Il server https è in ascolto sulla porta ${PORTHTTPS}`);
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

//middleware cors, gestisce le richieste extra origine
const whitelist = ["https://esposito-ettore-crudserver.herokuapp.com",
                   "http://esposito-ettore-crudserver.herokuapp.com",
                   "http://localhost:4200", 
                   "http://localhost:1337",
                   "https://localhost:1338"];
const corsOptions = {
    origin: function(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (whitelist.indexOf(origin) === -1)
        {
            var msg = 'The CORS policy for this site does not ' + 'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        else
            return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));

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
        let filters = req.query;
        let request = collection.find(filters).toArray();
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