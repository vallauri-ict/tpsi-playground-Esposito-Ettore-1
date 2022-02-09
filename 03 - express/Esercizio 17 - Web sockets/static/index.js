$(document).ready(function() {
    let user = {
        "username" : "",
        "room" : ""
    };
    
	// mi connetto al server che mi ha inviato la pagina,
	// il quale mi restituisce il suo serverSocket
	// io.connect é SINCRONO, bloccante
	let serverSocket = io({transports:['websocket'], upgrade: false}).connect();

    /* 1a) lo username viene inviato SOLO a connessione avvenuta
	       in questo modo si evita di connetere/disconnettere + volte */
	serverSocket.on('connect', function() {
		console.log("connessione ok");

        user.username = prompt("Inserisci lo username:");
        if(user.username == "pippo" || user.username == "pluto")
            user.room = "room1";
        else
            user.room = "defaultRoom";

        serverSocket.emit("login", user);
    });

    // 1b) utente valido / non valido
    serverSocket.on('loginAck', function(data) {
		if (data == "NOK")
        {
			alert("Nome già esistente o mancante. Scegliere un altro nome");

			user.username = prompt("Inserisci un nuovo username:");
            if(user.username == "pippo" || user.username == "pluto")
                user.room = "room1";
            else
                user.room = "defaultRoom";

			serverSocket.emit("login", user);
		}
		else
			document.title = user.username;
    });  

	// 2a) invio messaggio
    $("#btnInvia").click(function() {
        let msg = $("#txtMessage").val();
        serverSocket.emit("message", msg);
    });
	
    // 2b) ricezione della risposta
    serverSocket.on('message_notify', function(data) {
        // ricezione di un messaggio dal server			
        data = JSON.parse(data);
        visualizza(data);
    });  

	// 3) disconnessione
    $("#btnDisconnetti").click(function() {
        serverSocket.disconnect();
    });

    serverSocket.on('disconnect', function() {
        alert("Sei stato disconnesso!");
    });


    function visualizza(msg) {
        let wrapper = $("#wrapper");
        let container = $("<div class='message-container'></div>");
        container.appendTo(wrapper);

        // username e date
        date = new Date(msg.date);
        let mittente = $("<small class='message-from'>" + msg.from + " @" + date.toLocaleTimeString() + "</small>");
        mittente.appendTo(container);

        // messaggio
        message = $("<p class='message-data'>" + msg.message + "</p>");
        message.appendTo(container);

        // auto-scroll dei messaggi
        /* la proprietà html scrollHeight rappresenta l'altezza di wrapper oppure
           l'altezza del testo interno qualora questo ecceda l'altezza di wrapper
		*/
        let h = wrapper.prop("scrollHeight");
        // fa scorrere il testo verso l'alto in 500ms
        wrapper.animate({ "scrollTop": h }, 500);
    }
});