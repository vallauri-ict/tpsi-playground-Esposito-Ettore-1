import * as _http from "http";
import * as fs from "fs";
import * as _mongodb from "mongodb";
import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import * as bp from "body-parser";
import cors from "cors";
import * as cluodinary from "cloudinary";

import ENVIROMENT from "./enviroment.json";

//mongo
//const CONNECTIONSTRING = "mongodb://127.0.0.1:27017"; // accesso in locale
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

//cloudinary
cluodinary.v2.config({
    cloud_name: ENVIROMENT.cloudinary.CLOUD_NAME,
    api_key: ENVIROMENT.cloudinary.API_KEY,
    api_secret: ENVIROMENT.cloudinary.API_SECRET,
});

//server
let app = express();
const PORT :number = parseInt(process.env.PORT) || 1337;
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

// route lettura parametri post con limite di dimesione
app.use("/", bp.json({ "limit" : "10mb" }));  //parametri json
app.use("/", bp.urlencoded({ "extended" : true, "limit" : "10mb" }));  //parametri urlencoded

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
                   "http://localhost:1337"];
const corsOptions = {
    origin: function(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (whitelist.indexOf(origin) === -1)
        {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        else
            return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));

//intercettazione dei files
app.use(fileUpload({ //file binary
    "limits " : { "fileSize ": (10 * 1024 * 1024) } // 10 MB
}));

//connessione a mongodb
app.use("/", function (req, res, next) {
    mongoClient.connect(process.env.MONGODB_URI || ENVIROMENT.atlas, function (err, client) {
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

app.get("/api/images", function (req, res, next) {
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let collection = db.collection("images");

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
});

app.post("/api/uploadBinary", function (req, res, next) {
    if (!req.files || Object.keys(req.files).length == 0)
        res.status(400).send('No files were uploaded');
    else if(!req.body.username)
        res.status(400).send('The username is missing');
    else
    {
        let username = req.body.username;
        let file :UploadedFile = req.files.img as UploadedFile;
        file.mv('./static/img/' + file.name, function(err) {
            if (err)
                res.status(500).json(err.message);
            else
            {
                let client :_mongodb.MongoClient = req["client"];
                let db = client.db(dbName);
                let collection = db.collection("images");
                let newUser = {
                    "username" : username, 
                    "img" : file.name
                };

                let request = collection.insertOne(newUser);
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
    }
});

app.post("/api/uploadBase64", function (req, res, next) {
    let newUser = req.body;
    if (!newUser.img || !newUser.img.toString().startsWith("data:image"))
        res.status(400).send('No files were uploaded or it\'s not in base64');
    else if(!req.body.username)
        res.status(400).send('The username is missing');
    else
    {
        let client :_mongodb.MongoClient = req["client"];
        let db = client.db(dbName);
        let collection = db.collection("images");

        let request = collection.insertOne(newUser);
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

app.post("/api/cloudinaryBase64", function (req, res, next) {
    let newUser = req.body;
    if (!newUser.img || !newUser.img.toString().startsWith("data:image"))
        res.status(400).send('No files were uploaded or it\'s not in base64');
    else if(!req.body.username)
        res.status(400).send('The username is missing');
    else
        cluodinary.v2.uploader.upload(newUser.img, { folder : "ese16" }).then(function (cloudRes :cluodinary.UploadApiResponse) {
            let client :_mongodb.MongoClient = req["client"];
            let db = client.db(dbName);
            let collection = db.collection("images");

            newUser.img = cloudRes.secure_url;
            let request = collection.insertOne(newUser);
            request.then(function (data) {
                res.send(data);
            });
            request.catch(function (err) {
                res.status(503).send("Error while executing query:\n" + err);
            });
            request.finally(function () {
                client.close();
            });
        }).catch(err => res.status(500).send("error uploading file"));
});

app.post("/api/cloudinaryBinary", function (req, res, next) {
    if (!req.files || Object.keys(req.files).length == 0)
        res.status(400).send('No files were uploaded');
    else if(!req.body.username)
        res.status(400).send('The username is missing');
    else
    {
        let file :UploadedFile = req.files.img as UploadedFile;
        let path = './static/tmp/' + file.name;
        file.mv(path, function(err) {
            if (err)
                res.status(500).json(err.message);
            else
            {
                cluodinary.v2.uploader.upload(path, { folder : "ese16", use_filename : true }).then(function (cloudRes :cluodinary.UploadApiResponse) {
                    let client :_mongodb.MongoClient = req["client"];
                    let db = client.db(dbName);
                    let collection = db.collection("images");
        
                    let newUser = {
                        "username" : req.body.username,
                        "img" : cloudRes.secure_url
                    };
        
                    let request = collection.insertOne(newUser);
                    request.then(function (data) {
                        res.send(data);
                    });
                    request.catch(function (err) {
                        res.status(503).send("Error while executing query:\n" + err);
                    });
                    request.finally(function () {
                        client.close();
                    });
                }).catch(err => res.status(500).send("error uploading file")).finally(function () {
                    fs.rm(path, function () {});
                });
            }
        });
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