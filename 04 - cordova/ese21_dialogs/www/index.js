"use strict"
// cordova plugin add cordova-plugin-dialogs, vibrate, splashscreen

console.log("Caricamento... " + new Date().toISOString());
$(document).ready(function() {
  document.addEventListener('deviceready', function() {
	//cose da fare al caricamento dell'app e all'agganciamento dei sensori
	console.log("Tutto pronto " + new Date().toISOString());
 });
});

function showAlert(){
	navigator.notification.alert(
		"Game Over !",     // Messaggio da visualizzare
		function(){},      // callback anonima
		"Alert",           // Titolo finestra
		"Done"             // pulsante di chiusura (singolo)
	);
}


function showConfirm(){    // Scelta multipla
	navigator.notification.confirm(
		"Vuoi salvare ?",      // Messaggio da visualizzare
		onConfirm,             // callback 
		"Confirm",             // Titolo finestra
		["Si", "No", "Forse"]  // Pulsanti da visualizz (0=SI, 1=NO, 2=FORSE)
	);
}
// indice del pulsante premuto  
function onConfirm(buttonIndex){  
	if(buttonIndex==1) // SI
	   alert("Dati salvati correttamente");
	else
	   alert("Operazione annullata");
}


function showPrompt(){       // Input Box
	navigator.notification.prompt(
		"Enter your name ",  // Messaggio da visualizzare
		onPrompt,			 // callback 
		"Registration",      // Titolo finestra
		["Ok", "Exit"],      // Pulsanti da visualizz (Vettore di stringhe)
		"Joe Doe"            // Default Text
	);
}
function onPrompt (results){
	if(results.buttonIndex == 1)
		alert("Your name is : " + results.input1);
}


function playBeep(){
	navigator.notification.beep(2); // Numero di beep
}


function vibrate(){  // Eseguito SOLO su telefono, non sul simulatore
	navigator.vibrate([500, 500, 500]); // beep, pausa, beep, ......
}