"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/gameHub").build();

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMovement", function (user, x, y) {
    console.log("ataque del jugador ", user ,"en la posición",x, " ,",  y );
});


connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    console.log("Connection with endpoint stablished")
}).catch(function (err) {
    return console.error(err.toString());
});


document.getElementById("sendButton").addEventListener("click", function (event) {
    let user = document.getElementById("userInput").value;
    let x = document.getElementById("x").value;
    let y = document.getElementById("y").value;
    console.log(user, x,y);
    connection.invoke("Movements", user, parseInt(x),parseInt(y)).catch(function (err) {
        return console.error("No username");
    });
    event.preventDefault();
});