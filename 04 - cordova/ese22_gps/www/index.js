"use strict"
// cordova plugin add cordova-plugin-dialogs, cordova-plugin-geolocation

const URL = "https://maps.googleapis.com/maps/api"
window.onload = async function(){
	//soluzione 1
	/*let promise = caricaGoogleMaps();
	promise.then(documentReady);
	promise.catch(function(err){
		alert('Errore caricamento google maps')	});*/

	//soluzione 2 devo mettere async alla funzione e usare l'onload di javascript
	await caricaGoogleMaps(); //await aspetta che la procedura asincrona finisca prima di continare, non è adatta però per gestire gli errori
	documentReady();
};

function documentReady () {	
	//aspetta che i sensori si attivino
	document.addEventListener('deviceready', function() {
		let mapContainer = $("#mapContainer")[0];  // js
		let results =  $("#results");
		
		$("#btnAvvia").on("click", startWatch);
		$("#btnArresta").on("click", stopWatch);

		mapHeight();

		let gpsOptions = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};
		
		let watchID = null;
		function startWatch() {
			results.html("");
			if (!watchID) {	
				watchID = navigator.geolocation.watchPosition(visualizzaPosizione, error, gpsOptions);
				notifica("Lettura Avviata");
			}	
		}	
		
		function stopWatch(){
			if (watchID){	
				navigator.geolocation.clearWatch(watchID);
				watchID=null;
				map=null;
				notifica("Lettura Arrestata");	       
			}		
		}

		/* ************************************************ */
		let map = null;
		let marker = null;
		function visualizzaPosizione(position) {
			results.html(`${position.coords.latitude.toFixed(5)}, 
							${position.coords.longitude.toFixed(5)}  
							&plusmn;${position.coords.accuracy.toFixed(0)}m 
							- altitudine:${position.coords.altitude}m`);
			let currentPos = new google.maps.LatLng(position.coords.latitude,
												position.coords.longitude);
			if(!map){		
				let mapOptions = {
					center:currentPos,
					zoom: 16,
				};		
				map = new google.maps.Map(mapContainer, mapOptions);
				marker = new google.maps.Marker({
					map: map,
					position: currentPos,
					title: "Questa è la tua posizione!",
					animation:google.maps.Animation.BOUNCE,
				});	
			}
			
			else{
				marker.setPosition(currentPos);
				// non consente di 'spostare' la mappa. Fastidioso
				// map.setCenter(currentPos)		
			}
		}
		
		function error(err) {
			// Gli errori di timeout sono abbastanza frequenti
			console.log("Errore: " + err.code + " - " + err.message);
		}

		//non senbrano funzionare
		mapContainer.addEventListener("touchstart", function (e) {
			if (e.cancelable)
				e.preventDefault();
		});

		mapContainer.addEventListener("touchend", function (e) {
			if (e.cancelable)
				e.preventDefault();
		});

		mapContainer.addEventListener("touchmove", function (e) {
			if (e.cancelable)
				e.preventDefault();
		});
	});
	
	function mapHeight () {
		let _wrapper = $("#wrapper");
		let wrapperHeight = parseFloat(_wrapper.css("height")) + 2 * parseFloat(_wrapper.css("margin")) + 2 * parseFloat(_wrapper.css("padding"));
		$(mapContainer).css("height", parseFloat($(window).height())) - wrapperHeight;
	}
}

function notifica(msg) {		 
	navigator.notification.alert(
		msg,    
		function() {},       
		"GPS",       // Titolo finestra
		"Ok"          // pulsante di chiusura
	);			
}

function caricaGoogleMaps() {
	return new Promise(function(resolve, reject){
		let script = document.createElement('script');
		script.type = 'application/javascript';
		script.src = URL + '/js?v=3&key=' + GOOGLEKEY;
		document.body.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
	});
}