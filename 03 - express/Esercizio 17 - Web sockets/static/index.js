$(document).ready(function() {
    let serverSocket;
    let user = {
        "username" : "",
        "room" : ""
    };

    let _wrapper = $("#wrapper");
    let _btnConnetti = $("#btnConnetti").prop("disabled", false);
    let _btnDisconnetti = $("#btnDisconnetti").prop("disabled", true);
    let _btnInvia = $("#btnInvia").prop("disabled", true);

    _btnConnetti.on("click", function() {
        // mi connetto al server che mi ha inviato la pagina,
        // il quale mi restituisce il suo serverSocket
        // io.connect é SINCRONO, bloccante
        serverSocket = io({transports:['websocket'], upgrade: false}).connect();

        _btnConnetti.prop("disabled", true);
        _btnDisconnetti.prop("disabled", false);
        _btnInvia.prop("disabled", false);

        /* 1a) lo username viene inviato SOLO a connessione avvenuta
	       in questo modo si evita di connetere/disconnettere + volte */
        serverSocket.on('connect', function() {
            console.log("connessione ok");
            impotaUser();
            serverSocket.emit("login", user);
        });

        // 1b) utente valido / non valido
        serverSocket.on('loginAck', function(data) {
            if (data == "NOK")
            {
                alert("Nome già esistente o mancante. Scegliere un altro nome");
                impotaUser();
                serverSocket.emit("login", user);
            }
            else
                document.title = user.username;
        });

        // 2b) ricezione della risposta
        serverSocket.on('message_notify', function(data) {
            // ricezione di un messaggio dal server			
            data = JSON.parse(data);
            visualizza(data);
        });  

        
        serverSocket.on('disconnect', function() {
            alert("Sei stato disconnesso!");
            
            _btnConnetti.prop("disabled", false);
            _btnDisconnetti.prop("disabled", true);
            _btnInvia.prop("disabled", true);
        });
    }); 

	// 2a) invio messaggio
    _btnInvia.click(function() {
        let msg = $("#txtMessage").val();
        $("#txtMessage").val("");
        serverSocket.emit("message", msg);
    });

	// 3) disconnessione
    _btnDisconnetti.click(function() {
        serverSocket.disconnect();
    });

    function visualizza(msg) {
        let container = $("<div class='message-container'></div>");
        container.appendTo(_wrapper);

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
        let h = _wrapper.prop("scrollHeight");
        // fa scorrere il testo verso l'alto in 500ms
        _wrapper.animate({ "scrollTop": h }, 500);
    }

    function impotaUser()
    {
        user.username = prompt("Inserisci un nuovo username:");
        if(user.username == "pippo" || user.username == "pluto")
            user.room = "room1";
        else
            user.room = "defaultRoom";
    }
});