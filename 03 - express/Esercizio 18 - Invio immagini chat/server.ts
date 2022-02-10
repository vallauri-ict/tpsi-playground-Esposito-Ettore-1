"use strict";
import http from "http";
import fs from "fs";
import colors from "colors";
import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import bp from "body-parser";
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

/* EXPRESS */
let users = [];

app.use(express.static('./static'));

// route lettura parametri con limite di dimesione
app.use("/", bp.json({ "limit" : "10mb" }));  //parametri json
app.use("/", bp.urlencoded({ "extended" : true, "limit" : "10mb" }));  //parametri urlencoded
app.use(fileUpload({ "limits " : { "fileSize ": (10 * 1024 * 1024) } })); //files

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

io.on('connection', function(clientSocket) {
	let user = {} as { username :string, room :string, socket :Socket };

	clientSocket.on('login', function(userData) {
		let item = users.find(item => item.username == userData.username);
		if (item != null || !userData.username)
			clientSocket.emit("loginAck", "NOK");
		else
		{
			user.username = userData.username;
			user.room = userData.room
			user.socket = clientSocket;
			users.push(user);
			clientSocket.emit("loginAck", "OK");
			log("User " + colors.yellow(user.username) + " (sockID=" + user.socket.id + ") connected!");

			this.join(user.room);
		}
	});

	clientSocket.on("message", function(msg) {
		log("User " + colors.yellow(user.username) + " (sockID=" + user.socket.id + ") sent " + colors.green(msg));

		mongoClient.connect(process.env.MONGODB_URI || ENVIROMENT.atlas, function (err, client) {
			let img = "";
			if(!err)
			{
				let db = client.db(dbName);
				let collection = db.collection("images");

				let request = collection.findOne({ "username" : user.username });
				request.then(function (data) {
					if(data)	
						img = data.img;
				});
				request.catch(function (err) {
					log("Error while executing query: " + colors.red(err));
				});
				request.finally(function () {
					client.close();
	
					let response = {
						"from" : user.username,
						"message" : msg,
						"date" : new Date(),
						"img" : img
					};
					io.to(user.room).emit("message_notify", response);
				});
			}
			else
			{
				let response = {
					"from" : user.username,
					"message" : msg,
					"date" : new Date(),
					"img" : img
				};
				io.to(user.room).emit("message_notify", response);
			}
		});
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