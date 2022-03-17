"use strict";
import http from "http";
import fs from "fs";
import colors from "colors";
import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import bp, { json } from "body-parser";
import {Server, Socket} from "socket.io"; // import solo l‟oggetto Server
import * as _mongodb from "mongodb";

import ENVIROMENT from "./enviroment.json";

//server
const app = express();
const PORT = 1337;
const httpServer = http.createServer(app);
const io = new Server(httpServer);
let paginaErrore :string;

httpServer.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);

	fs.readFile("./static/error.html", function (err, data) {
        if(!err)
            paginaErrore = data.toString();
        else
            paginaErrore ="<h1> Risorsa non trovata </h1>";
    });
});

//mongo
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;
let currentCollection = "images";

/* EXPRESS */
app.use(express.static('./static'));

// route lettura parametri con limite di dimesione
app.use("/", bp.json({ "limit" : "10mb" }));  //parametri json
app.use("/", bp.urlencoded({ "extended" : true, "limit" : "10mb" }));  //parametri urlencoded
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

//* INIZIO SERVIZI *//

app.post("/api/registrazione", function (req, res, next) {
	let username = req.body.username;
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let collection = db.collection(currentCollection);

	let requestGet = collection.find({ "username" : username }).toArray();
	requestGet.then(function (data) {
		if(data.length == 0)
		{
			let img :UploadedFile = req.files.img as UploadedFile;
			img.mv('./static/img/' + img.name, function (err) {
				if(err)
					res.status(500).json(err.message);
				else
				{
					let newRecord = {
						"username" : username,
						"img" : img.name
					};

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
				}
			})
		}
		else
			res.status(422).send("User already exists");	
	});
	requestGet.catch(function (err) {
		res.status(503).send("Error while executing query:\n" + err);
	});   
});

app.get("/api/login", function (req, res, next) {
	let username = req.query.username;
    let client :_mongodb.MongoClient = req["client"];
    let db = client.db(dbName);
    let collection = db.collection(currentCollection);

	let request = collection.find({ "username" : username }).toArray();
	request.then(function (data) {
		if(data.length != 0)
			res.send({ "img" : data[0].img });
		else
			res.status(401).send("This user does not exists");
	});
	request.catch(function (err) {
		res.status(503).send("Error while executing query:\n" + err);
	});
	request.finally(function () {
		client.close();
	})
});

//* FINE SERVIZI *//

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
    console.log("***Error on server's code: ", err.message); // ultimo messaggio in cima allo stack 
});

/* WEB SOCKETS */
let users = [];

io.on('connection', function(clientSocket) {
	let user = {} as { username :string, room :string, img :string, socket :Socket };

	clientSocket.on('login', function(userData) {
		let item = users.find(item => item.username == userData.username);
		if (item != null || !userData.username)
			clientSocket.emit("loginAck", "NOK");
		else
		{
			user.username = userData.username;
			user.room = userData.room;
			user.img = userData.img;
			user.socket = clientSocket;
			users.push(user);

			let res = [];
			for(let item of users)
				if(item.room == user.room)
					res.push({ "username" : item.username, "img" : item.img });

			clientSocket.emit("loginAck", JSON.stringify(res));
			log("User " + colors.yellow(user.username) + " (sockID=" + user.socket.id + ") connected!");

			this.join(user.room);
		}
	});

	clientSocket.on("message", function(msg) {
		log("User " + colors.yellow(user.username) + " (sockID=" + user.socket.id + ") sent " + colors.green(msg));
		let response = {
			"from" : user.username,
			"message" : msg,
			"date" : new Date()
		};
		io.to(user.room).emit("message_notify", JSON.stringify(response));
	});

    clientSocket.on("disconnect", function() {
		let index = users.findIndex(item => item.username == user.username);
		users.splice(index, 1);
		log(" User " + user.username + " disconnected!");
    });

	function log(msg) {
		console.log(colors.cyan("[" + new Date().toLocaleTimeString() + "]") + ": " + msg);
	}
});