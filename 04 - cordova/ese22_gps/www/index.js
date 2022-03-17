
"use strict"
// cordova plugin add cordova-plugin-dialogs, cordova-plugin-geolocation

const URL = "https://maps.googleapis.com/maps/api"

$(document).ready(function(){
	// creazione dinamica del CDN di accesso alle google maps
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = URL + '/js?v=3&key='+ MAP_KEY +'&callback=documentReady';
	document.body.appendChild(script);
})	


function documentReady () {	
  document.addEventListener('deviceready', function() {
 
	let watchID = null;
	let wrapper = $("#wrapper")[0]  // js
	let results =  $("#results")
	
    $("#btnAvvia").on("click", startWatch)
    $("#btnArresta").on("click", stopWatch);

    function startWatch() {
        results.html("");
		var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        watchID = navigator.geolocation.watchPosition(success, error, options);
		if (watchID != null)	
            notifica("Lettura Avviata");	       
    }
	
	function stopWatch(){
        if (watchID != null){	
			navigator.geolocation.clearWatch(watchID);
			watchID=null;
			mapID=null;
			notifica("Lettura Arrestata");	       
		}		
	}


	var mapID = null;
	var markerID = null;
    function success(position) {
        let currentPoint = new google.maps.LatLng(position.coords.latitude,
		                                       position.coords.longitude)
		results.html(`${position.coords.latitude.toFixed(5)}, 
						  ${position.coords.longitude.toFixed(5)}  
						  &plusmn;${position.coords.accuracy.toFixed(0)}m 
						  - altitudine:${position.coords.altitude.toFixed(0)}m`)
		
		if(mapID == null){		
			var mapOptions = {
				center:currentPoint,
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.HYBRID	
			};
		
			mapID = new google.maps.Map(wrapper, mapOptions);
		
			markerID = new google.maps.Marker({
				position: currentPoint,
				title: "Questa è la tua posizione!",
				map: mapID
			});	
		}
		markerID.setPosition(currentPoint);		
    }
	

    function error(err) {
		notifica("Errore: " + err.code + " - " + err.message);
    }
	

   function notifica(msg){		 
        navigator.notification.alert(
		    msg,    
		    function() {},       
		    "Info",       // Titolo finestra
		    "Ok"          // pulsante di chiusura
	    );			 
	}
  })
}