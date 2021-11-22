import * as _http from "http";
import * as _mongodb from "mongodb";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";
import { isBuffer } from "util";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

/*const PORT :number = 1337;
let dispatcher :Dispatcher = new Dispatcher();

const server = _http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
});

server.listen(PORT);
console.log(`Il server è in ascolto sulla porta ${PORT}`);*/

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 2
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.aggregate([
            { $project : { "classe" : 1, "italiano" : { $avg : "Sitaliano" }, "matematica" : { $avg : "$matematica" }, "informatica" : { $avg : "$informatica" }, "sistemi" : { $avg : "$sistemi" } } },
            { $project : { "classe" : 1, "mediaStudente" : { $avg : [ "$italiano", "$matematica", "$informatica", "$sistemi" ] } } },
            { $group : { "_id" : { "classe" : "$classe" }, "mediaClasse" : { $avg : "$mediaStudente" } } },
            { $sort : { "mediaClasse" : -1 } }
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
    {
        console.log("Query 2", err);
    }
});


/*mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 3
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.updateMany({ "genere" : "f", "classe" : "4A" }, { $push : { "informatica" : 7 } });
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
    {
        console.log("Query 3", err);
    }
}); */

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 4
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.deleteMany({ "classe" : "3B", "sistemi" : 3 });
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
    {
        console.log("Query 4", err);
    }
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 5
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.aggregate([
            { $group : { "_id" : { "classe" : "$classe" }, "totaleAssenze" : { $sum : "$assenze" } } },
            { $sort : { "totaleAssenze" : -1 } }
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
    {
        console.log("Query 5", err);
    }
});