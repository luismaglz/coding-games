"use strict";
// you can write to stdout for debugging purposes, e.g.
// console.log('this is a debug message');
const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
const aisles = {};
function makeSeat(row, columnLetter, taken) {
    const seat = {
        id: `${row}${columnLetter}`,
        taken
    };
    return seat;
}
function getAisle(columnLetter) {
    if (["A", "B", "C"].includes(columnLetter)) {
        return 1;
    }
    if (["D", "E", "F", "G"].includes(columnLetter)) {
        return 2;
    }
    if (["H", "J", "K"].includes(columnLetter)) {
        return 3;
    }
    throw new Error("bad column letter");
}
function makeRow(rowNumber) {
    return columns.map(c => makeSeat(rowNumber, c, false));
}
function canSeatFamily(row) {
    return row.map(r => r.taken).some(r => r === true);
}
function countFamiliesPerRowV2(row) {
    const _row = row.map(r => r);
    _row.pop();
    _row.shift();
    const canSeatTwo = !canSeatFamily(_row);
    const first4 = !canSeatFamily(_row.slice(0, 4));
    const last4 = !canSeatFamily(_row.slice(4));
    const middle = !canSeatFamily(_row.slice(2, 6));
    if (canSeatTwo) {
        return 2;
    }
    else if (first4 || last4 || middle) {
        return 1;
    }
    else {
        return 0;
    }
}
function solution(numberOfRows, taken) {
    //create rows
    const rows = [];
    for (let i = 1; i <= numberOfRows; i++) {
        rows.push(makeRow(i));
    }
    // figure out which seats are taken
    const seatsTaken = taken.split(" ");
    rows.forEach(row => {
        row.forEach(seat => {
            if (seatsTaken.includes(seat.id)) {
                seat.taken = true;
            }
        });
    });
    return rows.reduce((total, row) => {
        return total + countFamiliesPerRowV2(row);
    }, 0);
}
