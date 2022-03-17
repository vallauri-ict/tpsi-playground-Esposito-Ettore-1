"use strict"
$(document).ready(function() {

    let divHome = $("#divHome");
    let divRegistrazione = $("#divRegistrazione");
    let divLogin = $("#divLogin");
    let divChat = $("#divChat");

    let txtNewUser = $("#txtNewUser");
    let txtFile = $("#txtFile");
    let txtUser = $("#txtUser");
    let lstRooms = $("#lstRooms");
	
    let serverSocket;
    let user = {
        "username": "",
        "room": "",
        "img": ""
    };
	
    nascondi();
    divHome.show();

    $("#btnHome").on("click", function () {
        nascondi();
        divHome.show();
    });

    $("#btnRegistrazione").on("click", function () {
        nascondi();
        divRegistrazione.show();
    });
    $("#btnInviaRegistrazione").on("click", function () {
        let username = txtNewUser.val();
        let img = txtFile.prop('files')[0];
        if (!img || !txtFile.val())
        {
            alert("Insert a username and a profile picture");
            return;
	    }

        let formData = new FormData();		
        formData.append('username', username);		
        formData.append('img', img);

        let request = inviaRichiestaMultipart("POST", "/api/registrazione", formData);
        request.done(function (data) {
            alert("Registation complete.\nYou may now login");
            nascondi();
            divHome.show();
        });
        request.fail(function (jqXHR, testStatus, strError) {
            if (jqXHR.status == 422)
                divRegistrazione.find(".col-md-11.col-sm-12").text("User already exists");
            else
                errore(jqXHR, testStatus, strError);
        });
    });

    $("#btnLogin").on("click", function () {
        nascondi();
        divLogin.show();
    });
    $("#btnInviaLogin").on("click", function () {
        let username = txtUser.val();
        if(username == "")
        {
            alert("Please insert your username");
            return;
        }

        let request = inviaRichiesta("GET", "/api/login", { "username" : username });
        request.then(function (data) {
            user.username = username;
            user.room = lstRooms.val();
            user.img = data.img;

            AvviaChat();
        });
        request.fail(errore);
    });
    $("#btnInvia").on("click", function () {
        let msg = $("#txtMessage").val();
        $("#txtMessage").val("");
        serverSocket.emit("message", msg);
    });
    $("#btnDisconnetti").on("click", function () {
        serverSocket.disconnect();
    });

    /* **************************************************************** */

	function nascondi() {
		divHome.hide();
		divRegistrazione.hide();
		divLogin.hide();
		divChat.hide();
	}

    function visualizza(msg) {
        let _wrapper = $("#wrapper");
        let container = $("<div class='message-container'></div>");
        container.appendTo(_wrapper);

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

    function AvviaChat() {
        serverSocket = io({transports:['websocket'], upgrade: false}).connect();

        serverSocket.on('connect', function() {
            serverSocket.emit("login", user);
        });

        serverSocket.on('loginAck', function(data) {
            if (data == "NOK")
            {
                alert("The user is already logged in");
            }
            else
            {
                $("#room").text(`Vallauri Chat ${user.room}`);
                nascondi();
                divChat.show();
                let banner = $("#banner");
                data = JSON.parse(data);


                for(let item of data)
                {
                    if(!item.img.includes("base64") && !item.img.includes("http"))
                        item.img = "img/" + item.img;
                    $("<div>", {
                        "appendTo" : banner,
                        "append" : [
                            $("<img>", { "prop" : { "src" : item.img, "alt" : item.username } }),
                            $("<p>", { "text" : item.username })
                        ]
                    });
                }
            }
        });

        serverSocket.on('message_notify', function(data) {		
            visualizza(JSON.parse(data));
        });  

        serverSocket.on('disconnect', function() {
            alert("You disconnected!");
            
            nascondi();
            divHome.show();
        });
    }
});