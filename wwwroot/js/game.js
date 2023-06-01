"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/gameHub").build();
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

let player = "";
let opponent = "";
let gameStarted = false;
let yourTurn = false;
let gameEnded = false;
let receivedAttacks = 0;

let matrix = Array.from(Array(10), () => Array(10).fill(0));
connection.on("ReceiveAttack", function (playerId, x, y) {
    console.log("entré a receive attack")
    if (matrix[x][y] === 1) {
        console.log("Player " + playerId + " received an attack at position " + x + ", " + y + " and it was a hit");
        receivedAttacks++;
        connection.invoke("Notification", opponent, "Acertaste el ataque, puedes atacar otra vez").catch(function (err) { console.error(err.toString()); });
        if (receivedAttacks === 17) {
            connection.invoke("EndGame", player , opponent).catch(function (err) { console.error(err.toString()); });        }
    } else {
        yourTurn = true;
        window.alert("El oponente fallo el ataque, tu turno");
        connection.invoke("RemoveTurn", opponent).catch(function (err) { console.error(err.toString()); });
        connection.invoke("Notification", opponent, "Fallaste, turno del enemigo").catch(function (err) { console.error(err.toString()); });
    }
});
connection.on("RemoveTurn", function () {
    console.log("removeturn")
    yourTurn = false;
});
connection.on("FirstTurn", function () {
    yourTurn = true;
    window.alert("Es tu turno, ataca al oponente");
});
connection.on("Notification", function (message) {
    window.alert(message);
});
connection.on("PlayerConnected", function (playerId) {
    console.log("Player connected: " + playerId);
    player = playerId;  
    if (!gameStarted) {
        window.alert("Esperando otro jugador, posiciona tus barcos.");
    }
});

connection.on("PlayerConnectedToLobby", function (playerId) {
    console.log("Player connected to a new lobby: " + playerId);
});

connection.on("PlayerDisconnected", function (playerId) {
    console.log("Player disconnected: " + playerId);
});

connection.on("StartGame", function (playerId, opponentId) {
    console.log("Game started for player " + playerId + " against " + opponentId);
    opponent = opponentId;
    gameStarted = true;
    window.alert("El juego ha comenzado");

});


connection.start().then(function () {
    console.log("Connection with endpoint established");
}).catch(function (err) {
    return console.error(err.toString());
});

document.addEventListener("DOMContentLoaded", function () {
    // Obtener todas las celdas del segundo jugador
    const secondPlayerCells = document.querySelectorAll('.second-player-cell');
    

   
    // Agregar un evento de clic a cada celda
    Array.from(secondPlayerCells).forEach(function (cell) {
        cell.addEventListener("click", function () {
            // Verificar si es el turno del jugador
            console.log("Clikeao")
            if (yourTurn) {
                // Obtener las coordenadas de la celda
                const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
                const row = Math.floor(cellIndex / 10);
                const col = cellIndex % 10;
                cell.classList.add("clicked-cell");
                console.log("Clikeao")
                // Enviar las coordenadas al servidor
                connection.invoke("Attack", opponent, row, col).catch(function (err) {
                    console.error(err.toString());
                });

            } else if (gameEnded) {
                // Mostrar una alerta de "partida ha finalizado"
                window.alert("La partida ha finalizado");
            } else {
                // Mostrar una alerta de "no es tu turno"
                window.alert("No es tu turno");
            }
        });
    });
});






// Add event listeners for ship dragging
document.querySelectorAll('.ship').forEach(ship => {
    ship.addEventListener('dragstart', dragStart);
    ship.addEventListener('dragend', dragEnd);
});

// Add event listeners for cell dropping
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('dragover', dragOver);
    cell.addEventListener('dragenter', dragEnter);
    cell.addEventListener('dragleave', dragLeave);
    cell.addEventListener('drop', drop);
});

let draggedShip = null;
const shipSizes = [5, 4, 3, 3, 2]; // Sizes of the ships

function dragStart() {
    draggedShip = this;
    setTimeout(() => this.classList.add('hide'), 0);
}

function dragEnd() {
    this.classList.remove('hide');
    draggedShip = null;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave() {
    this.classList.remove('hovered');
}

function drop() {
    this.classList.remove('hovered');

    const shipIndex = Array.from(document.querySelectorAll('.ship')).indexOf(draggedShip);
    const size = shipSizes[shipIndex];

    const cellIndex = Array.from(this.parentElement.children).indexOf(this);
    
    const row = Math.floor(cellIndex / 10);
    const col = cellIndex % 10;
   
   
    // Check if the ship fits within the boundaries and doesn't overlap with other ships
    let isValid = true;

    if (shipIndex === 1 || shipIndex === 2) {
        // For horizontal ships (second and third ships)
        if (col + size <= 10) {
            for (let i = col; i < col + size; i++) {
                if (matrix[row][i] === 1) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                for (let i = col; i < col + size; i++) {
                     matrix[row][i] = 1;
                }
                this.append(draggedShip);
                console.log("Matrix:", matrix);
             

              
            
            }
        }
    } else {
        // For vertical ships (rest of the ships)
        if (row + size <= 10) {
            for (let i = row; i < row + size; i++) {
                if (matrix[i][col] === 1) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                for (let i = row; i < row + size; i++) {
                    matrix[i][col] = 1;
                }
                this.append(draggedShip);
                console.log("Matrix:", matrix);
               
            }
        }

    }

   
}
