import {MongoClient, ObjectId}  from "mongodb";
import moment from "moment"
import environment from "./environment.json"

const CONNECTION_STRING = environment.connectionString.ATLAS
const DB_NAME = "5B"
const COLLECTION = "bigData"

let sensors = [
	{ "sensorId": 5578, "type": "temperature" },
	{ "sensorId": 5579, "type": "temperature" },
	{ "sensorId": 5581, "type": "humidity" },
	{ "sensorId": 5582, "type": "humidity" },
	{ "sensorId": 5590, "type": "ph" },
]
// sensor 5578 sensore temperature tra 18 e 22, set-point 20  ogni 20 sec
// sensor 5579 sensore temperature tra 37 e 43, set-point 40  ogni 20 sec
// sensor 5581 sensore umidità tra 55 e 65,     set-point 60  ogni minuto
// sensor 5582 sensore umidità tra 75 e 85,     set-point 80  ogni minuto
// sensor 5590 sensore ph tra 7 e 8,           set-point 7.5  ogni giorno


/* ******************** TEMPERATURE ********************* */
setInterval(writeTemperature, 2000);
function writeTemperature(){
	// moment() restituisce la data corrente sotto forma di oggetto moment
	// il metodo format() restituisce la versione ISO Date con un timezone locale
	// che però senza la Z finale non è considerato da mongo un valore UTC valido
	let format="YYYY-MM-DDT:hh:mm.ss.SSSZ";
	let t = (moment()).format(format)
	
	// Greenwich time
	let currentTime = new Date() 
	
	// 5578
	let value1; 
	let n1 = generaNumero (1, 10)
	if(n1<=7)
		value1= generaNumeroDecimale (19, 21)
    else
		value1= generaNumeroDecimale (18, 22) 
    let rec1 = {
      "sensor": sensors[0],
      "timeStamp": currentTime,
      "value": value1
    }

	// 5579
	let value2; 
	let n2 = generaNumero (1, 10)
	if(n2<=7)
		value2= generaNumeroDecimale (38.5, 41.5)
    else
		value2= generaNumeroDecimale (37, 43)
    let rec2 = {
      "sensor": sensors[1],
      "timeStamp": currentTime,
      "value": value2
    }
	salvaInDb(rec1, rec2)
}

/* ******************** HUMIDITY ********************* */
setInterval(writeHumidity, 5000);
function writeHumidity(){	
	// Greenwich time
	let currentTime = new Date() 
	
	// 5581
	let value1; 
	let n1 = generaNumero (1, 10)
	if(n1<=7)
		value1= generaNumeroDecimale (57.5, 62.5)
    else
		value1= generaNumeroDecimale (55, 65)
    let rec1 = {
      "sensor": sensors[2],
      "timeStamp": currentTime,
      "value": value1
    }

	// 5582
	let value2; 
	let n2 = generaNumero (1, 10)
	if(n2<=7)
		value2= generaNumeroDecimale (77.5, 82.5)
    else
		value2= generaNumeroDecimale (75, 85) 
    let rec2 = {
      "sensor": sensors[3],
      "timeStamp": currentTime,
      "value": value2
    }
	salvaInDb(rec1, rec2)
}

/* ******************** PH ********************* */
setInterval(writePH, 7000);
function writePH(){	
	// Greenwich time
	let currentTime = new Date() 
	
	// 5590
	let value1; 
	let n1 = generaNumero (1, 10)
	if(n1<=7)
		value1= generaNumeroDecimale (7.3, 7.7)
    else
		value1= generaNumeroDecimale (7, 8) 
    let rec1 = {
      "sensor": sensors[4],
      "timeStamp": currentTime,
      "value": value1
    }
	salvaInDb(rec1)
}


function salvaInDb(rec1, rec2=null){
	MongoClient.connect(CONNECTION_STRING, (err, client) => {
		if (err) {
			console.log("Db connection error");
		} 
		else {		
			let db = client.db(DB_NAME) // as mongodb.Db;
			let collection = db.collection(COLLECTION);
			let request1 = collection.insertOne(rec1);
			request1.then((data) => {
				console.log(rec1.sensor.sensorId, rec1.value)
				if (rec2){
					let request2 = collection.insertOne(rec2);
					request2.then((data) => {
						console.log(rec2.sensor.sensorId, rec2.value)
					});
					request2.catch((err) => {
						console.log("Sintax error in the query");
					});				
					request2.finally(() => {
						client.close();
					});	
				}
			});
			request1.catch((err) => {
				console.log("Sintax error in the query");
			});
			request1.finally(() => {
				if(!rec2)
					client.close();
			});	
		}	
	})
}

/* ********************* */

function generaNumero(a, b){
	let n = Math.floor((b-a+1)*Math.random()) + a
	return n
}

function generaNumeroDecimale(a, b){
	a=a*10
	b=b*10;
	let n = Math.floor((b-a+1)*Math.random()) + a
	return n/10
}