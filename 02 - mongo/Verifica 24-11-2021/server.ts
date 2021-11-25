import * as _http from "http";
import * as _mongodb from "mongodb";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

const PORT :number = 1337;
let dispatcher :Dispatcher = new Dispatcher();

const server = _http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
});

server.listen(PORT);
console.log(`Il server è in ascolto sulla porta ${PORT}`);

//creazione servizi

dispatcher.addListener("GET", "getFacts", function (req, res) {
    mongoClient.connect(CONNECTIONSTRING, function(err, client){
        if(!err)
        {
            let db = client.db(dbName);
            let collection = db.collection("Facts");
            let request = collection.find().project({ "value" : 1 }).toArray();
            request.then(function (data) { 
                res.writeHead(200, HEADERS.json);
                res.write(JSON.stringify(data));
                res.end();
            });
            request.catch(function (err) {
                res.writeHead(500, HEADERS.json);
                res.write(JSON.stringify(err));
                res.end();
            });
            request.finally(function () {
                client.close();
            });
        }
        else
        {
            res.writeHead(500, HEADERS.json);
            res.write(JSON.stringify(err));
            res.end();
        }
    });
});

dispatcher.addListener("POST", "setFact", function (req, res) {
    let id = req["BODY"].id;
    let newValue = req["BODY"].value;

    mongoClient.connect(CONNECTIONSTRING, function(err, client){
        if(!err)
        {
            let db = client.db(dbName);
            let collection = db.collection("Facts");
            let request = collection.updateOne({ "_id" : id }, { $set : { "value" : newValue, "updated_at" : new Date() } });
            request.then(function (data) { 
                res.writeHead(200, HEADERS.json);
                res.write(JSON.stringify(data));
                res.end();
            });
            request.catch(function (err) {
                res.writeHead(500, HEADERS.json);
                res.write(JSON.stringify(err));
                res.end();
            });
            request.finally(function () {
                client.close();
            });
        }
        else
        {
            res.writeHead(500, HEADERS.json);
            res.write(JSON.stringify(err));
            res.end();
        }
    });
});