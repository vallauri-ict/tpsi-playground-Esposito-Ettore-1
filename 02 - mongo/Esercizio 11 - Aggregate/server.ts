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
            { $group : { "_id" : "$cust_id", "amount" : { $sum : "$amount" } } }, //il nome usato senza "" è il nome che il campo prende nell'output, quello con $ sono come si chiama nell'input
            { $sort  : { "amount" : -1 }}
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
                { $group:  { "_id" : "$cust_id", "avgAmount": { $avg: "$amount" }, "avgTotal": { $avg: { $multiply: ["$qta", "$amount"] } } } }
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
                { $group:  { _id : "$gender", "total" : { $sum : 1 } } }
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

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 4
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
                { $group:  { _id : "$gender", "total" : { $avg : "$vampires" } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 4", data);
        });
        request.catch(function (err) {
            console.log("Query 4", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 4", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 5
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
            { $group : { _id : { "gender" : "$gender", "hair" : "$hair" }, "nEsemplari" : { $sum : 1 } } },
            { $sort : { "nEsemplari" : -1, "_id.gender" : -1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 5", data);
        });
        request.catch(function (err) {
            console.log("Query 5", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 5", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 6
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
            { $group : { "_id" : {}, "media" : { $avg : "$vampires" } } },
            { $project : { "_id" : 0, "ris" : { $round : "$media" } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 6", data);
        });
        request.catch(function (err) {
            console.log("Query 6", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 6", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 7
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Quizzes");
        let request = collection.aggregate([
            { $project : { "_id" : 0, "quizAvg" : { $avg : "$quizzes" }, "labAvg" : { $avg : "$labs" }, "examAvg" : { $avg : [ "$midterm", "$final" ] } } },
            { $project : { "quizAvg" : { $round : ["$quizAvg", 1] }, "labAvg" : { $round : ["$labAvg", 1] }, "examAvg" : { $round : ["$examAvg", 1] } } },
            { $group : { "_id" : {  }, "quizAvg" : { $avg : "$quizAvg" }, "labAvg" : { $avg : "$labAvg" }, "examAvg" : { $avg : "$examAvg" } } },
            { $project : { "quizAvg" : { $round : ["$quizAvg", 1] }, "labAvg" : { $round : ["$labAvg", 1] }, "examAvg" : { $round : ["$examAvg", 1] } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 7", data);
        });
        request.catch(function (err) {
            console.log("Query 7", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 7", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 8
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Stdents");
        let request = collection.aggregate([
            { $match : { "genere" : "f" } },
            { $project : { "nome" : 1, "classe" : 1, "media" : { $avg : "$voti" } } },
            { $sort : { "media" : -1 } },
            { $skip : 1 },
            { $limit : 1 }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 8", data);
        });
        request.catch(function (err) {
            console.log("Query 8", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 8", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 9
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Orders");
        let request = collection.aggregate([
            { $project : { status : 1, nDettagli : 1 } }, 
            { $unwind : "$nDettagli" }, 
            { $group : { _id : "$status",  sommaDettagli : { $sum : "$nDettagli" } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 9", data);
        });
        request.catch(function (err) {
            console.log("Query 9", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 9", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 10
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Students");
        let request = collection.aggregate([
            { $match : { "$expr" : { "$eq" : [ { "$year" : "$nato" } , 2000 ] } } },
            { $project : { "nome" : 1, "genere" : 1, "classe" : 1, "nato" : 1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 10", data);
        });
        request.catch(function (err) {
            console.log("Query 10", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 10", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 11
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
            { $group : { "_id" : { "gender" : "$gender" }, "avgWeight" : { $avg : "$weight" } } },
            { $sort : { avgWeight : -1 } },
            { $project : { "gender" : 1, "avgWeight" : { $round : [ "$avgWeight", 2 ] } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 11", data);
        });
        request.catch(function (err) {
            console.log("Query 11", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 11", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 12
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
            { $match : { "loves" : "apple" } },
            { $group : { "_id" : { "gender" : "$gender" }, "vampires" : { $sum : "$vampires" } } },
            { $sort : { "vampires" : -1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 12", data);
        });
        request.catch(function (err) {
            console.log("Query 12", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 12", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 13
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Unicorns");
        let request = collection.aggregate([
            { $project : { "_id" : 0, "loves" : 1 } },
            { $unwind : "$loves" },
            { $group : { "_id" : { "loves" : "$loves" }, "tot" : { $sum : 1 } } },
            { $sort : { "tot" : -1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 13", data);
        });
        request.catch(function (err) {
            console.log("Query 13", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 13", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 14
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Students");
        let request = collection.aggregate([
            { $project : { "_id" : 0, "classe" : 1, "media" : { $avg : "$voti" } } },
            { $group : { "_id" : { "classe" : "$classe" } , "media" : { $avg : "$media" } } },
            { $match : { "media" : { $gte : 6 } } },
            { $sort : { "media" : -1 } },
            { $project : { "classe" : 1, "media" : { $round : [ "$media", 2 ] } } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 14", data);
        });
        request.catch(function (err) {
            console.log("Query 14", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 14", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 15
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Students");
        let lastDate :Date = new Date();
        lastDate.setFullYear(new Date().getFullYear() - 18);
        let request = collection.aggregate([
            { $match : { "nato" : { $gt : lastDate } } },
            { $project : { "nome" : 1, "genere" : 1, "classe" : 1, "nato" : 1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 15", data);
        });
        request.catch(function (err) {
            console.log("Query 15", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 15", err.message);
})

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 16
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Students");
        let lastDate :Date = new Date();
        lastDate.setFullYear(new Date().getFullYear() - 18);
        let request = collection.aggregate([
            { $match : { "$expr" : { "$eq" : [ { "$year" : "$nato" } , 2000 ] } } },
            { $project : { "nome" : 1, "genere" : 1, "classe" : 1, "nato" : 1 } }
        ]).toArray();
        request.then(function (data) {
            console.log("Query 16", data);
        });
        request.catch(function (err) {
            console.log("Query 16", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 16", err.message);
});