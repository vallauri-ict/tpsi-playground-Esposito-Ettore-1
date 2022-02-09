"use strict";
import http from "http";
import colors from "colors";
import express from "express";
import {Server, Socket} from "socket.io"; // import solo l‟oggetto Server

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const PORT = 1337;

httpServer.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});

app.use(express.static('./static'));


/************************* gestione web socket ********************** */
let users = [];

/* in corrispondenza della connessione di un client,
  per ogni utente viene generato un evento 'connection' a cui
  viene inettato il 'clientSocket' contenente IP e PORT del client.
  Per ogni utente la funzione di callback crea una variabile locale
  'user' contenente tutte le informazioni relative al singolo utente  */

io.on('connection', function(clientSocket) {
	let user = {} as { username :string, room :string, socket :Socket };

	// 1) ricezione username
	clientSocket.on('login', function(userData) {
		// controllo se user esiste già
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

			//inserisco l'user nella stanza richiesta
			this.join(user.room);
		}
	});

	// 2) ricezione di un messaggio	 
	clientSocket.on("message", function(msg) {
		log("User " + colors.yellow(user.username) + " (sockID=" + user.socket.id + ") sent " + colors.green(msg));
		// notifico a tutti i socket nella stanza (mittente compreso) il messaggio ricevuto 
		let response = {
			"from" : user.username,
			"message" : msg,
			"date" : new Date()
		};
		io.to(user.room).emit("message_notify", JSON.stringify(response));
	});

    // 3) disconnessione dell'utente
    clientSocket.on("disconnect", function() {
		// ritorna -1 se non lo trova
		let index = users.findIndex(item => item.username == user.username);
		users.splice(index, 1);
		log(" User " + user.username + " disconnected!");
    });
});

// stampa i log con data e ora
function log(msg) {
	console.log(colors.cyan("[" + new Date().toLocaleTimeString() + "]") + ": " +msg);
}