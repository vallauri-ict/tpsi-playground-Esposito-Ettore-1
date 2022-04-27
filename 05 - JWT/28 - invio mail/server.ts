import * as _http from "http";
import * as _https from "https";
import * as fs from "fs";
import express from "express";
import * as bp from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer"

import environment from "./enviroment.json";

//server
let app = express();
const PORT :number = parseInt(process.env.PORT) || 1337;
const PORTHTTPS :number = 1338;
let paginaErrore :string;

//chiavi
let privateKey = fs.readFileSync("keys/privateKey.pem", "utf-8");
let certificate = fs.readFileSync("keys/certificate.crt", "utf-8");
const CREDENTIALS = { "key" : privateKey, "cert" : certificate };

//mail
let message :string;
let transporter = nodemailer.createTransport({
    "service": "gmail",
    "auth": environment.mailServer
});

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

    fs.readFile("./message.html", function (err, data) {
        if(!err)
            message = data.toString();
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

// ***** ELENCO SERVIZI ***** //

app.post("/api/newMail", function (req, res, next) {
    let msg = message.replace("__user", "pippo");
    msg = msg.replace("__password", "vjkwjbvfewrkqwarjkbwkehlflb5555");
    let mailOptions = {
        "from" : environment.mailServer.user,
        "to" : req.body.to,
        "subject" : req.body.subject,
        //"text" : msg no formattazione html
        "html" : msg, //formattazione html
        "attachments" : [
            {
                "filename" : "qr.png", //nome da assegnare al file
                "path" : "./qrCode.png" //file da spedire
            }
        ]
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if(!err)
        {
            res.send({ "ris" : "ok" });
            console.log("mail inviata correttamente");
        }
        else
        {
            res.status(500).send("Errore invio mail: " + err.message);
            console.log("mail non inviata: " + err.message);
        }
    })
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