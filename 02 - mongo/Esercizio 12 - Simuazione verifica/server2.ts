import * as _mongodb from "mongodb";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 2
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.aggregate([
            { $project : { "classe" : 1, "mediaItaliano" : { $avg : "Sitaliano" }, "mediaMatematica" : { $avg : "$matematica" }, "mediaInformatica" : { $avg : "$informatica" }, "mediaSistemi" : { $avg : "$sistemi" } } },
            { $project : { "classe" : 1, "mediaStudente" : { $avg : [ "$mediaItaliano", "$mediaMatematica", "$mediaInformatica", "$mediaSistemi" ] } } },
            { $group : { "_id" : { "classe" : "$classe" }, "mediaClasse" : { $avg : "$mediaStudente" } } },
            { $sort : { "mediaClasse" : -1 } },
            { $project : { classe : 1, "mediaClasse" : { $round : [ "$mediaClasse", 2 ] } } }
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


mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 3
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Vallauri");
        let request = collection.updateMany({ "genere" : "f", "classe" : "4A" }, { $push : { "informatica" : (7 as never) } });
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
});

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