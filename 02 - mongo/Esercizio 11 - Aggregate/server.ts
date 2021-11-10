import * as _http from "http";
import * as _mongodb from "mongodb";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";
import { isBuffer } from "util";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const dbName = "5B";
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

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 1
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Orders");
        let request = collection.aggregate([
            { $match : { "status" : "A" } },
            { $group : { _id : "$cust_id", amount : { $sum : "$amount" } } }, //il nome usato senza "" è il nome che il campo prende nell'output, quello con $ sono come si chiama nell'input
            { $sort  : { amount : -1 }}
        ]).toArray();
        request.then(function (data) {
            console.log("Query 1", data);
        });
        request.catch(function (err) {
            console.log("Query 1", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 1", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 2
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Orders");
        let request = collection.aggregate([
                { $group:  { _id: "$cust_id", avgAmount: { $avg: "$amount" }, avgTotal: { $avg: { $multiply: ["$qta", "$amount"] } } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 2", data);
        });
        request.catch(function (err) {
            console.log("Query 2", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 2", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 3
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
                { $group:  { _id : "$gender", total : { $sum : 1 } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 3", data);
        });
        request.catch(function (err) {
            console.log("Query 3", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 3", err.message);
});