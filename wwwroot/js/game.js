"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/gameHub").build();
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

connection.on("ReceiveMovement", function (user, x, y) {
    console.log("ataque del jugador ", user, "en la posición", x, ",", y);
});


connection.start().then(function () {
    console.log("Connection with endpoint established");
}).catch(function (err) {
    return console.error(err.toString());
});

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
const matrix = Array.from(Array(10), () => Array(10).fill(0)); // 10x10 matrix
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
