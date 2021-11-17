import * as _http from "http";
import * as _mongodb from "mongodb";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";
import { isBuffer } from "util";

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

dispatcher.addListener("POST", "servizio1", function (req, res) {
    let DataDa :Date = new Date(req["BODY"].dataStart);
    let DataA :Date = new Date(req["BODY"].dataEnd);

    mongoClient.connect(CONNECTIONSTRING, function(err, client){ //servizio 1
        if(!err)
        {
            let db = client.db(dbName);
            let collection = db.collection("Vallauri");
            let request = collection.find({ $and : [ { "dob" : { $gte : DataDa } }, { "dob" : { $lte : DataA } } ] }).toArray();
            request.then(function (data) { 
                res.writeHead(200, HEADERS.json);
                res.write(JSON.stringify(data));
                res.end();
            });
            request.catch(function (err) {
                res.writeHead(200, HEADERS.json);
                res.write(`{ "err" : ${err} }`);
                res.end();
            });
            request.finally(function () {
                client.close();
            });
        }
        else
        {
            res.writeHead(200, HEADERS.json);
            res.write(`{ "err" : ${err} }`);
            res.end();
        }
    });
});