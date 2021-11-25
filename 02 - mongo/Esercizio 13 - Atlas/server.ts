import * as _http from "http";
import * as _mongodb from "mongodb";

//const CONNECTIONSTRING = "mongodb://127.0.0.1:27017"; // accesso in locale
const CONNECTIONSTRING = "mongodb+srv://admin:admin@cluster0.8bz8q.mongodb.net/5B?retryWrites=true&w=majority"; // accesso su atlas
const dbName = "5B";
const mongoClient = _mongodb.MongoClient;

//modello di accesso al database

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 1a
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({weight : { $gte : 700, $lte : 800 }}).toArray(function (err, data) {
            if(!err)
                console.log("Query 1a", data);
            else
                console.log("Query 1a", err.message);
            client.close();
        });
    }
    else
        console.log("Query 1a", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 1b
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        let request = collection.find({weight : { $gte : 700, $lte : 800 }}).toArray();
        request.then(function (data) {
            console.log("Query 1b", data);
        });
        request.catch(function (err) {
            console.log("Query 1b", err);
        });
        request.finally(function () {
            client.close();
        });
    }
    else
        console.log("Query 1b", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 2
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({ $and : [ { "gender" : "m" }, { "loves" : "grape" }, { "vampires" : { $gte : 60 } } ] }).toArray(function (err, data) {
            if(!err)
                console.log("Query 2", data);
            else
                console.log("Query 2", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ $or : [ { "gender" : "f" }, { "weight" : { "lte" : 700 } } ] }).toArray(function (err, data) {
            if(!err)
                console.log("Query 3", data);
            else
                console.log("Query 3", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ "loves" : { $in : ["grape", "apple"] }, "vampires" : { $gte : 60} }).toArray(function (err, data) {
            if(!err)
                console.log("Query 4", data);
            else
                console.log("Query 4", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ "loves" : { $all : ["watermelon", "apple"] }, "vampires" : { $gte : 60} }).toArray(function (err, data) {
            if(!err)
                console.log("Query 5", data);
            else
                console.log("Query 5", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ "hair" : { $in : ["grey", "brown"] } }).toArray(function (err, data) {
            if(!err)
                console.log("Query 6", data);
            else
                console.log("Query 6", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ "vaccinated" : { $exists : true } }).toArray(function (err, data) {
            if(!err)
                console.log("Query 7", data);
            else
                console.log("Query 7", err.message);
            client.close();
        });
    }
    else
        console.log("Query 7", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 9
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({ "name" : { $regex : "^[Aa]" } }).toArray(function (err, data) {
            if(!err)
                console.log("Query 9", data);
            else
                console.log("Query 9", err.message);
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
        let collection = db.collection("unicorns");
        collection.find({ "_id" : new _mongodb.ObjectId("618248bacbf3081e5941fd0a") }).toArray(function (err, data) {
            if(!err)
                console.log("Query 10", data);
            else
                console.log("Query 10", err.message);
            client.close();
        });
    }
    else
        console.log("Query 10", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 11abc
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({ "gender" : "m"})
                  .project({ "name" : 1, "vampires" : 1, "_id" : 0 })
                  .sort({ "vampires" : -1, "name" : 1 })
                  // .skip(1) //elementi da saltare
                  .limit(3) //elementi da visualuzzare
                  .toArray(function (err, data) {
            if(!err)
                console.log("Query 11abc", data);
            else
                console.log("Query 11abc", err.message);
            client.close();
        });
    }
    else
        console.log("Query 11abc", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 12
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({"weight" : { $gte : 500 } }).count(function (err, data) {
            if(!err)
                console.log("Query 12", data);
            else
                console.log("Query 12", err.message);
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
        let collection = db.collection("unicorns");
        collection.findOne({ "name" : "Aurora" }, { "projection" : {  "weight" : 1, "hair" : 1 }}, function (err, data) {
            if(!err)
                console.log("query 13", data);
            else
                console.log("query 13", err.message);
            client.close();
        });
    }
    else
        console.log("query 13", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 14
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.distinct("loves", { "gender" : "f" }, function (err, data) {
            if(!err)
                console.log("query 14", data);
            else
                console.log("query 14", err.message);
            client.close();
        });
    }
    else
        console.log("query 14", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 15
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.insertOne({"name":"Oblivion",
                              "dob":"1979-07-18",
                              "loves":["apple"],
                              "weight":666,
                              "gender":"m",
                              "vampires":0,
                              "hair":"black"}, 
                              function (err, data) {
            if(!err)
            {
                console.log("query 15a", data);
                collection.deleteMany({ "name" : "Oblivion" }, function (err, data) {
                    if(!err)
                        console.log("query 15b", data);
                    else
                        console.log("query 15b", err.message);
                    client.close();
                });
            }  
            else
                console.log("query 15a", err.message);
        });
    }
    else
        console.log("query 15", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 16
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        //upsert come opzione aggiunge il record se esso non è trovato
        collection.updateOne({ "name" : "Pilot" }, { $inc : { "vampires" : 1 } }, { upsert : true } , function (err, data) {
            if(!err)
                console.log("query 16", data);
            else
                console.log("query 16", err.message);
            client.close();
        });
    }
    else
        console.log("query 16", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 17
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.updateOne({ "name" : "Aurora" }, { $addToSet : { "loves" : "carrot" }, $inc : { "weight" : 10 } }, function (err, data) {
            if(!err)
                console.log("query 17", data);
            else
                console.log("query 17", err.message);
            client.close();
        });
    }
    else
        console.log("query 17", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 18
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        //upsert come opzione aggiunge il record se esso non è trovato
        collection.updateOne({ "name" : "Pluto" }, { $inc : { "vampires" : 1 } }, { upsert : true } , function (err, data) {
            if(!err)
                console.log("query 18", data);
            else
                console.log("query 18", err.message);
            client.close();
        });
    }
    else
        console.log("query 18", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 19
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.updateMany({ "vaccinated" : { $exists : false }}, { $set : { "vaccinated" : false } }, function (err, data) {
            if(!err)
                console.log("query 19", data);
            else
                console.log("query 19", err.message);
            client.close();
        });
    }
    else
        console.log("query 19", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 20
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.deleteMany({ "loves" : { $all : [ "grape", "carrot" ] } }, function (err, data) {
            if(!err)
                console.log("query 20", data);
            else
                console.log("query 20", err.message);
            client.close();
        });
    }
    else
        console.log("query 20", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 21
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.find({ "gender" : "f" }).sort({ "vampires" : -1 }).limit(1).project({ "name" : 1, "vampires" : 1, "_id" : 0 }).toArray(function (err, data) {
            if(!err)
                console.log("query 21", data);
            else
                console.log("query 21", err.message);
            client.close();
        });
    }
    else
        console.log("query 21", err.message);
});

mongoClient.connect(CONNECTIONSTRING, function(err, client){ //query 22
    if(!err)
    {
        let db = client.db(dbName);
        let collection = db.collection("unicorns");
        collection.replaceOne({ "name" : "Pluto" }, { "name" : "Pluto", "vampires" : 50, "loves" : [ "apple" ] }, { "upsert" : true }, function (err, data) {
            if(!err)
                console.log("query 22", data);
            else
                console.log("query 22", err.message);
            client.close();
        });
    }
    else
        console.log("query 22", err.message);
});