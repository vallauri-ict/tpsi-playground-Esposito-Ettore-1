import * as _http from "http";
import * as _mongodb from "mongodb";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const mongoClient = _mongodb.MongoClient;

/* const PORT :number = 1337;
let dispatcher :Dispatcher = new Dispatcher();

const server = _http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
});

server.listen(PORT);
console.log(`Il server è in ascolto sulla porta ${PORT}`);

//creazione servizi

dispatcher.addListener("POST", "servizio1", function (req, res) {
    let nome = req["BODY"].nome;
    res.writeHead(200, HEADERS.json);
    res.write(`{ "nome" : "${nome}" }`);
    res.end();
});

dispatcher.addListener("GET", "servizio2", function (req, res) {
    let nome = req["GET"].nome;
    res.writeHead(200, HEADERS.json);
    res.write(`{ "nome" : "${nome}" }`);
    res.end();
}); */

//modello di accesso al database

mongoClient.connect(CONNECTIONSTRING, function(err, client){
    if(!err)
    {
        let db = client.db("5B_Studenti");
        let collection = db.collection("Studenti");
        collection.find().toArray(function (err, data) {
            if(!err)
                console.log("SELECT", data);
            else
                console.log(err.message);
            client.close();
        });
    }
    else
        console.log(err.message);
});

//inserimento di un record

mongoClient.connect(CONNECTIONSTRING,function(err, client){
    if(!err)
    {
        let db = client.db("5B_Studenti");
        let collection = db.collection("Studenti");

        let student = {"nome" : "Agostno", "cognome" : "Morello", "Eta" : 19};
        collection.insertOne(student, function (err, data) {
            if(!err)
                console.log("INSERT", data);
            else
                console.log(err.message);
            client.close();
        });
    }
    else
        console.log(err.message);
});

//modifica di record

mongoClient.connect(CONNECTIONSTRING,function(err, client){
    if(!err)
    {
        let db = client.db("5B_Studenti");
        let collection = db.collection("Studenti");

        collection.updateMany({ "nome" : "Agostino"}, { $set : { "eta" : 18 }}, function (err, data) {
            if(!err)
                console.log( "UPDATE", data);
            else
                console.log(err.message);
            client.close();
        });
    }
    else
        console.log(err.message);
});

//rimozione di record

mongoClient.connect(CONNECTIONSTRING,function(err, client){
    if(!err)
    {
        let db = client.db("5B_Studenti");
        let collection = db.collection("Studenti");

        collection.deleteMany({ "nome" : "Agostno" }, function (err, data) {
            if(!err)
                console.log("DELETE", data);
            else
                console.log(err.message);
            client.close();
        });
    }
    else
        console.log(err.message);
});