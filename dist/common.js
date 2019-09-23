"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makePoint(X, Y) {
    return {
        X,
        Y
    };
}
exports.makePoint = makePoint;
function radToDegrees(rad) {
    return rad * (180 / Math.PI);
}
exports.radToDegrees = radToDegrees;
function calculateEuclideanDistance(p1, p2) {
    var a = p1.X - p2.X;
    var b = p1.Y - p2.Y;
    return Math.sqrt(a * a + b * b);
}
exports.calculateEuclideanDistance = calculateEuclideanDistance;
function calculateHManhattanDistance(start, goal) {
    return Math.abs(start.X - goal.X) + Math.abs(start.X - goal.X);
}
exports.calculateHManhattanDistance = calculateHManhattanDistance;
function makeGrid(h, w) {
    // Initialize gamesquares
    const grid = {
        dictionary: {},
        squares: []
    };
    for (let width = 0; width < w; width++) {
        for (let height = 0; height < h; height++) {
            const square = makeGridPoint(width, height);
            grid.dictionary[square.id] = square;
            grid.squares.push(square);
        }
    }
    return grid;
}
exports.makeGrid = makeGrid;
function makeGridPoint(X, Y) {
    const gridSquare = {
        X,
        Y,
        id: `${X}${Y}`,
        siblings: [],
        fScore: 9999,
        gCost: 9999,
        hCost: 9999,
        origin: null
    };
    // Remove edge impossible moves
    if (X !== 0)
        gridSquare.siblings.push(`${X - 1}${Y}`);
    if (X !== 8)
        gridSquare.siblings.push(`${X + 1}${Y}`);
    if (Y !== 0)
        gridSquare.siblings.push(`${X}${Y - 1}`);
    if (Y !== 8)
        gridSquare.siblings.push(`${X}${Y + 1}`);
    return gridSquare;
}
exports.makeGridPoint = makeGridPoint;
