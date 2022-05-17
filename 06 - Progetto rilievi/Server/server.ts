"use strict"

import * as _http from "http";
import * as fs from "fs";
import express from "express";
import body_parser from "body-parser";
import cors from "cors";
import fileUpload, { UploadedFile } from "express-fileupload";
import cloudinary, { UploadApiResponse } from "cloudinary";
import {MongoClient, ObjectId}  from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cluodinary from "cloudinary";
import nodemailer from "nodemailer"

const CONNECTION_STRING = process.env.MONGODB_URI;
const DBNAME = "Rilievi";

const DURATA_TOKEN = 60 * 60; // sec
const JWTKEY = process.env.JWT_KEY || fs.readFileSync("keys/jwtKey.pem");

cluodinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

let messageRegister :string = fs.readFileSync("./messageRegister.html", "utf-8");
let messageReset :string = fs.readFileSync("./messageReset.html", "utf-8");
let transporter = nodemailer.createTransport({
    "service": "gmail",
    "auth": {
        "user" : process.env.MAIL_USER,
        "pass" : process.env.MAIL_PASS
    }
});


const PORT = parseInt(process.env.PORT) || 1337;
const app = express();
const server = _http.createServer(app);
server.listen(PORT, function () {
    console.log(`Il server è in ascolto sulla porta ${PORT}`);
});
app.response["log"] = function (err) { console.log(`*** Error *** ${err.message}`) }

/* *********************** (Sezione 1) Middleware ********************* */
// 1. Request log
app.use("/", function (req, res, next) {
    console.log("** " + req.method + " ** : " + req.originalUrl);
    next();
});

// cerca la pagina e se esiste la spedisce altrimenti fa next()
app.use("/", express.static("./static"));

// 2 - routes di lettura dei parametri post
app.use("/", body_parser.json({ "limit": "10mb" }));
app.use("/", body_parser.urlencoded({"extended": true, "limit": "10mb"}));

// 3 - binary upload
app.use("/", fileUpload ({
    "limits": { "fileSize": (10 * 1024 * 1024) } // 10*1024*1024 // 10 M
}));

// 4 - log dei parametri 
app.use("/", function (req, res, next) {
    if (Object.keys(req.query).length > 0)
        console.log("        Parametri GET: ", req.query);
    if (Object.keys(req.body).length != 0)
        console.log("        Parametri BODY: ", req.body);
    next();
});

// 5 - cors accepting every call
const corsOptions = {
    origin: function(origin, callback) {
          return callback(null, true);
    },
    credentials: true,
    allowedHeaders: [ 'Content-Type', "authorization" ],
    exposedHeaders: [ "authorization" ]
};
app.use("/", cors(corsOptions));

// 6 - mongodb connection
app.use("/", function (req, res, next) {
    MongoClient.connect(CONNECTION_STRING, function (err, client) {
        if(!err)
        {
            req["client"] = client;
            next();
        }  
        else
            res.status(503).send("Unable to connect to database")["log"](err);
    });
});

/* ***************** (Sezione 2) middleware relativi a JWT ****************** */
// 1 - Login
app.post("/api/login", function (req, res, next) {
    const client :MongoClient = req["client"];
    const db = client.db(DBNAME);
    const collection = db.collection("Operatori");
    let mail = req.body.mail;
    collection.findOne({ "eMail" : mail }, function (err, dbUser) {
        if(err)
            res.status(500).send("Errore esecuzione query")["log"](err);
        else if(!req.body.password)
            res.status(401).send("Password non valida");
        else if(!dbUser)
            res.status(401).send("Mail non valida");
        else if(!bcrypt.compareSync(req.body.password, dbUser.Password))
            res.status(401).send("Password non valida");
        else
        {
            if(!dbUser.cambioPassword)
            {
                let token = CreateToken(dbUser);
                res.setHeader("authorization", token);
                res.send({ "ris" : "ok" });
            }
            else
                res.send({ "ris" : "change" });
        }
        client.close();
    });
});

app.post("/api/register", function (req, res, next) {
    const client :MongoClient = req["client"];
    const db = client.db(DBNAME);
    const collection = db.collection("Operatori");

    let mail = req.body.mail;
    collection.findOne({ "eMail" : mail }, function (err, dbUser) {
        if(err)
            res.status(500).send("Errore esecuzione query")["log"](err);
        else if(dbUser)
            res.status(409).send("Mail già usata per un altro account"); //409 = conflict
        else
        {
            let tempPassword = "";
            const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", 
                                 "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", 
                                 "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", 
                                 "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 
                                 "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"];
            for(let i = 0; i < 16; i++)
                tempPassword += base64Chars[Math.floor(base64Chars.length * Math.random())];

            let msg = messageRegister.replace("__password", tempPassword).replace("__user", req.body.user);
            let mailOptions = {
                "from" : process.env.MAIL_USER,
                "to" : req.body.mail,
                "subject" : "Registrazione",
                "html" : msg,
            };
            transporter.sendMail(mailOptions, function (err, data) {
                if(err)
                    res.status(500).send("Errore invio mail: " + err.message)["log"](err);
                else
                {
                    let request = collection.insertOne({ 
                        "User" : req.body.user, 
                        "isAdmin" : false,
                        "Password" : bcrypt.hashSync(tempPassword, 10),
                        "cambioPassword" : true,
                        "eMail" : mail
                    });
                    request
                    .then(data => res.send({ "ris" : "ok" }))
                    .catch(err => res.status(500).send("Errore esecuzione query. Registrazione fallita")["log"](err))
                    .finally(() => client.close());
                }
            });
        }
    });
});

app.post("/api/changePsw", function (req, res, next) {
    const client :MongoClient = req["client"];
    const db = client.db(DBNAME);
    const collection = db.collection("Operatori");
    let mail = req.body.mail;
    collection.findOne({ "eMail" : mail }, function (err, dbUser) {
        if(err)
            res.status(500).send("Errore esecuzione query")["log"](err);
        else if(!req.body.oldPassword)
            res.status(401).send("Password non valida");
        else if(!dbUser)
            res.status(401).send("Mail non valida");
        else if(!bcrypt.compareSync(req.body.oldPassword, dbUser.Password))
            res.status(401).send("Password non valida");
        else
        {
            let request = collection.updateOne({ "_id" : dbUser._id }, { "$set" : { "cambioPassword" : false, "Password" : bcrypt.hashSync(req.body.newPassword, 10) } });
            request.then(data => {
                let token = CreateToken(dbUser);
                res.setHeader("authorization", token);
                res.send({ "ris" : "ok" });
            })
            .catch(err => res.status(500).send("Errore esecuzione query")["log"](err))
            .finally(() => client.close());
        }
    });
});

app.post("/api/resetPsw", function (req, res, next) {
    const client :MongoClient = req["client"];
    const db = client.db(DBNAME);
    const collection = db.collection("Operatori");
    let mail = req.body.mail;

    collection.findOne({ "eMail" : mail }, function (err, dbUser) {
        if(err)
            res.status(500).send("Errore esecuzione query")["log"](err);
        else if(!dbUser)
            res.status(401).send("Mail non valida");
        else
        {
            let tempPassword = "";
            const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", 
                                 "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", 
                                 "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", 
                                 "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 
                                 "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"];
            for(let i = 0; i < 16; i++)
                tempPassword += base64Chars[Math.floor(base64Chars.length * Math.random())];
            let msg = messageReset.replace("__password", tempPassword);
            let mailOptions = {
                "from" : process.env.MAIL_USER,
                "to" : req.body.mail,
                "subject" : "Reset password",
                "html" : msg,
            };
            transporter.sendMail(mailOptions, function (err, data) {
                if(!err)
                {
                    let request = collection.updateOne({ "_id" : dbUser._id }, { "$set" : { "cambioPassword" : true, "Password" : bcrypt.hashSync(tempPassword, 10) } });
                    request.then(data => res.send({ "ris" : "ok" }))
                           .catch(err => res.status(500).send("Errore esecuzione query")["log"](err))
                           .finally(() => client.close());
                }
                else
                    res.status(500).send("Errore invio mail: " + err.message)["log"](err);
            });
        }
    });
});

app.use("/api/", function (req, res, next) {
    let token;
    if(req.headers.authorization)
    {
        token = req.headers.authorization;
        jwt.verify(token, JWTKEY, function (err, payload) {
            if(err)
                res.status(403).send("Token non valido");
            else
            {
                let newToken = CreateToken(payload);
                res.setHeader("authorization", newToken);
                req["payload"] = payload;
                next();
            }
        });      
    }
    else
        res.status(403).send("Token assente");
});

function CreateToken(dbUser :any) :any
{
    let date :number = Math.floor(new Date().getTime() / 1000);
    let PayLoad = {
        "_id" : dbUser._id,
        "User" : dbUser.eMail,
        "isAdmin" : dbUser.isAdmin,
        "iat" : dbUser.iat || date,
        "exp" : date + DURATA_TOKEN
    };
    return jwt.sign(PayLoad, JWTKEY);
}

/* ********************** (Sezione 3) USER ROUTES  ************************** */

app.get("/api/perizie", function (req, res, next) {
    let client :MongoClient = req["client"];
    let db = client.db(DBNAME);
    let collection = db.collection("Perizie");

    let filter = req["payload"].isAdmin ? {} : { "Operatore" : req["payload"]._id };
    let request = collection.find(filter).toArray();
    request.then(data => res.send(data))
           .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
           .finally(() => client.close());
});

app.get("/api/perizieOperatore/:id", function (req, res, next) {
    let client :MongoClient = req["client"];
    let db = client.db(DBNAME);
    let collection = db.collection("Perizie");

    let request = collection.find({ "Operatore" : req.params.id }).toArray();
    request.then(data => res.send(data))
           .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
           .finally(() => client.close());
});

app.get("/api/dettagliOperatore/:id", function (req, res, next) {
    let client :MongoClient = req["client"];
    let db = client.db(DBNAME);
    let collection = db.collection("Operatori");

    let oid = new ObjectId(req.params.id);
    let request = collection.findOne({ "_id" : oid });
    request.then(data => res.send(data))
    .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
    .finally(() => client.close());
});

app.get("/api/dettagliPerizia/:id", function (req, res, next) {
    let client :MongoClient = req["client"];
    let db = client.db(DBNAME);
    let collection = db.collection("Perizie");

    let oid = new ObjectId(req.params.id);
    let request = collection.findOne({ "_id" : oid });
    request.then(data => {
        let collectionOp = db.collection("Operatori");
        let oidOp = new ObjectId(data.Operatore);
        let requestOp = collectionOp.findOne({ "_id" : oidOp });
        requestOp.then(dataOp => {
            data.Operatore = dataOp.User;
            res.send(data);
        })
        .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
        .finally(() => client.close());
    })
    .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
});

app.post("/api/newPerizia", function (req, res, next) {
    if(!req.body.Operatore)
        res.status(400).send("The operator is missing");
    if(!req.body.Coordinate)
        res.status(400).send("The coordinates are missing");
    if(!req.body.Desc)
        res.status(400).send("The description is missing");
    else
    {
        let client :MongoClient = req["client"];
        let db = client.db(DBNAME);
        let collection = db.collection("Perizie");

        let newPerizia :any = {
            "Operatore" : req.body.Operatore,
            "Data" : new Date(),
            "Coordinate" : req.body.Coordinate,
            "Descrizione" : req.body.Desc,
            "Foto" : []
        };

        let request = collection.insertOne(newPerizia);
        request.then(data => res.send(data))
               .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
               .finally(() => client.close());
    }
});

app.post("/api/updateDesc", function (req, res, next) {
    if(!req.body.id)
        res.status(400).send('The id is missing');
    else
    {
        let client :MongoClient = req["client"];
        let db = client.db(DBNAME);
        let collection = db.collection("Perizie");
        let oid = new ObjectId(req.body.id);

        let reqest = collection.updateOne({ "_id" : oid }, { "$set" : { "Descrizione" : req.body.desc } });
        reqest.then(data => res.send(data))
              .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
              .finally(() => client.close());
    }
});

app.post("/api/newImage", function (req, res, next) {
    if (!req.files || Object.keys(req.files).length == 0)
        res.status(400).send('No file was uploaded');
    else if(!req.body.id)
        res.status(400).send('The id is missing');
    else
    {
        let file :UploadedFile = req.files.photo as UploadedFile;
        let path = './tmp/' + file.name;
        file.mv(path, function(err) {
            if (err)
                res.status(500).json(err.message)["log"](err);
            else
            {
                cluodinary.v2.uploader.upload(path, { folder : "Perizie", use_filename : true })
                .then(function (cloudRes :cluodinary.UploadApiResponse) {
                    let client :MongoClient = req["client"];
                    let db = client.db(DBNAME);
                    let collection = db.collection("Perizie");
                    let oid = new ObjectId(req.body.id);

                    let newImage :any = {
                        "url" : cloudRes.secure_url
                    };
                    if(req.body.comment)
                        newImage.Commento = req.body.comment;
        
                    let request = collection.updateOne({ _id : oid }, { $push : { "Foto" : newImage } });
                    request.then(data => res.send(data))
                           .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
                           .finally(() => client.close());
                })
                .catch(err => res.status(500).send("error while uploading file")["log"](err))
                .finally(() => fs.rm(path, function () {}));
            }
        });
    }
});

app.post("/api/newImageBase64", function (req, res, next) {
    if (!req.body.img)
        res.status(400).send('No file was uploaded');
    else if(!req.body.img.toString().startsWith("data:image"))
        res.status(400).send('Not correct file tipe');
    else if(!req.body.id)
        res.status(400).send('The id is missing');
    else
    {
        cluodinary.v2.uploader.upload(req.body.img, { folder : "Perizie" })
        .then(function (cloudRes :cluodinary.UploadApiResponse) {
            let client :MongoClient = req["client"];
            let db = client.db(DBNAME);
            let collection = db.collection("Perizie");
            let oid = new ObjectId(req.body.id);

            let newImage :any = {
                "url" : cloudRes.secure_url
            };
            if(req.body.comment)
                newImage.Commento = req.body.comment;
        
            let request = collection.updateOne({ _id : oid }, { $push : { "Foto" : newImage } });
            request
            .then(data => res.send(data))
            .catch(err => res.status(503).send("Error while executing query:\n" + err)["log"](err))
            .finally(() => client.close());
        })
        .catch(err => res.status(500).send("error while uploading file")["log"](err));
    }
});

/* ***************** (Sezione 4) DEFAULT ROUTE and ERRORS ******************* */
app.use(function(err, req, res, next) {
    console.log(err.stack);   
});

app.use('/', function(req, res, next) {
    res.status(404).send("Risorsa non trovata");
});