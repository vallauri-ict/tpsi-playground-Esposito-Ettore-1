import fs from "fs";
import http from "http";
import express from "express";
import body_parser from "body-parser";
import cors from "cors";
import {MongoClient, ObjectId}  from "mongodb";
import environment from "./environment.json"

// ***************************** Costanti *************************************
const app = express();
const CONNECTION_STRING = environment.connectionString.ATLAS
const DB_NAME = "5B"
const COLLECTION = "bigData"
const HTTP_PORT = 1337


let sensors = [
	{ "sensorId": 5578, "type": "temperature" },
	{ "sensorId": 5579, "type": "temperature" },
	{ "sensorId": 5581, "type": "humidity" },
	{ "sensorId": 5582, "type": "humidity" },
	{ "sensorId": 5590, "type": "ph" },
]
// sensor 5578 sensore temperature tra 18 e 22, set-point 20  ogni 20 sec
// sensor 5579 sensore temperature tra 37 e 43, set-point 40  ogni 20 sec
// sensor 5581 sensore umidità tra 55 e 65,     set-point 60  ogni minuto
// sensor 5582 sensore umidità tra 75 e 85,     set-point 80  ogni minuto
// sensor 5590 sensore ph tra 7 e 8,           set-point 7.5  ogni giorno




// ***************************** Avvio ****************************************
const httpsServer = http.createServer(app);
httpsServer.listen(HTTP_PORT, function() {
    console.log("Server HTTP in ascolto sulla porta " + HTTP_PORT);
    init();
});
let paginaErrore = "";
function init() {
    fs.readFile("./static/error.html", function(err, data) {
        if (!err)
            paginaErrore = data.toString();
        else
            paginaErrore = "<h1>Risorsa non trovata</h1>"
    });
}



/* *********************** (Sezione 1) Middleware ********************* */
// 1. Request log
/*app.use("/", function(req, res, next) {
    console.log("** " + req.method + " ** : " + req.originalUrl);
    next();
});*/


// 2 - route risorse statiche
app.use("/", express.static('./static'));


// 3 - routes di lettura dei parametri post
app.use("/", body_parser.json({ "limit": "10mb" }));
app.use("/", body_parser.urlencoded({"extended": true, "limit": "10mb"}));


// 4 - log dei parametri 
/*app.use("/", function(req, res, next) {
    if (Object.keys(req.query).length > 0)
        console.log("        Parametri GET: ", req.query)
    if (Object.keys(req.body).length != 0)
        console.log("        Parametri BODY: ", req.body)
    next();
});*/


// 5. cors accepting every call
const corsOptions = {
    origin: function(origin, callback) {
          return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));


/* ********************* (Sezione 3) USER ROUTES  ************************** */
app.get('/api/getData', function(req, res, next) {
    MongoClient.connect(CONNECTION_STRING,  function(err, client) {
        if (err) {
            res.status(503).send("Errore di connessione al database")
        } else {
            const DB = client.db(DB_NAME);
            const collection = DB.collection(COLLECTION);
            collection.find().sort({ "timeStamp" : -1 }).limit(200).toArray(function(err, data) {
                if (err)
                    res.status(500).send("Errore esecuzione query")
                else
                    res.send(data);
                client.close();
            });
        }
    });
});

app.get('/api/getSensorData', function(req, res, next) {
    MongoClient.connect(CONNECTION_STRING,  function(err, client) {
        if (err) {
            res.status(503).send("Errore di connessione al database")
        } else {
            const DB = client.db(DB_NAME);
            const collection = DB.collection(COLLECTION);
			let sensorId = parseInt(req.query.sensor)
            collection.find({"sensor.sensorId":sensorId}).sort({ "timeStamp" : -1 }).limit(200).toArray(function(err, data) {
                if (err)
                    res.status(500).send("Errore esecuzione query")
                else
                    res.send(data);
                client.close();
            });
        }
    });
});

/* ********************** (Sezione 4) DEFAULT ROUTE  ************************* */

// gestione degli errori
app.use(function(err, req, res, next) {
    console.log(err.stack); // stack completo    
});

// default route
app.use('/', function(req, res, next) {
    res.status(404)
    if (req.originalUrl.startsWith("/api/")) {
        res.send("Risorsa non trovata");
    }
	else res.send(paginaErrore);
});