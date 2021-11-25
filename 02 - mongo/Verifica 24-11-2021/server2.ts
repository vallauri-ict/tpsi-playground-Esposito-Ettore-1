import * as _mongodb from "mongodb";

const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", 
"K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", 
"Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", 
"m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 
"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"];

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 2
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Facts");
        let request = collection.find({  $or : [ { "categories" : "music" }, { "score" : { $gt : 620 } } ] })
                                .project({ "categories" : 1, "score" : 1 })
                                .toArray();
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
        let id :any = ""; //any per non usare un ObjectID
        for(let i = 0; i < 22; i++)
            id += base64Chars[Math.floor(base64Chars.length * Math.random())];

        let db = client.db(dbName);
        let collection = db.collection("Facts");
        let request = collection.insertOne({
            "value" : "I'm inserting a new chuck norris's fact",
            "created_at" : new Date(),
            "_id" : id,
            "icon_url" : "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
            "url" : `https://api.chucknorris.io/jokes/${id}`,
            "score" : 0 //Chuck Norris non accetterebbe
        });
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
        let limit = new Date("2021-11-15");

        let db = client.db(dbName);
        let collection = db.collection("Facts");
        let request = collection.deleteMany({ "created_at" : { $gt : limit }, "score" : 0 });
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
        let collection = db.collection("Facts");
        let request = collection.aggregate([
            { $project : { "_id" : 0, "categories" : 1, "score" : 1 } },
            { $unwind : "$categories" },
            { $group : { "_id" : { "category" : "$categories" }, "mediaScore" : { $avg : "$score" } } },
            { $sort : { "mediaScore" : -1, "_id" : 1 } },
            { $project : { "_id" : 1, "mediaScore" : { $round : [ "$mediaScore", 2 ] } } }
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

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 6a
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Facts");
        let request = collection.distinct("categories");
        request.then(function (data) { 
            console.log("Query 6a", data);
        });
        request.catch(function (err) {
            console.log("Query 6a", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        console.log("Query 6a", err);
    }
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //Query 6b
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("Facts");
        let request = collection.aggregate([
            { $project : { "_id" : 0, "categories" : 1 } },
            { $unwind : "$categories" },
            { $group : { "_id" : { "category" : "$categories" } } },
            { $sort : { "_id" : 1 } }
        ]).toArray();
        request.then(function (data) { 
            console.log("Query 6b", data);
        });
        request.catch(function (err) {
            console.log("Query 6b", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
    {
        console.log("Query 6b", err);
    }
});