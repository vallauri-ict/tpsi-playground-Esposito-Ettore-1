"use strict"

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
        serverSocket = io({transports:['websocket'], upgrade: false}).connect();

        _btnConnetti.prop("disabled", true);
        _btnDisconnetti.prop("disabled", false);
        _btnInvia.prop("disabled", false);

        serverSocket.on('connect', function() {
            console.log("connessione ok");
            impotaUser();
            serverSocket.emit("login", user);
        });

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

        serverSocket.on('message_notify', function(data) {		
            visualizza(data);
        });  

        
        serverSocket.on('disconnect', function() {
            alert("Sei stato disconnesso!");
            
            _btnConnetti.prop("disabled", false);
            _btnDisconnetti.prop("disabled", true);
            _btnInvia.prop("disabled", true);
        });
    }); 

    _btnInvia.click(function() {
        let msg = $("#txtMessage").val();
        $("#txtMessage").val("");
        serverSocket.emit("message", msg);
    });

    _btnDisconnetti.click(function() {
        serverSocket.disconnect();
    });

    function visualizza(msg) {
        let container = $("<div class='message-container'></div>");
        container.appendTo(_wrapper);

        //img
        if(msg.img)
        {
            let imagePath = msg.img;
            if(!imagePath.includes("base64") && !imagePath.includes("http"))
                imagePath = "img/" + imagePath;
            $("<img>", {
                "appendTo" : container,
                "prop" : {
                    "src" : imagePath
                },
                "css" : {
                    "max-height" : "70px",
                    "max-width" : "70px"
                }
            });
        }

        // username e date
        let date = new Date(msg.date);
        let mittente = $("<small class='message-from'>" + msg.from + " @" + date.toLocaleTimeString() + "</small>");
        mittente.appendTo(container);

        // messaggio
        let message = $("<p class='message-data'>" + msg.message + "</p>");
        message.appendTo(container);

        // auto-scroll dei messaggi
        let h = _wrapper.prop("scrollHeight");
        _wrapper.animate({ "scrollTop" : h }, 500);
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