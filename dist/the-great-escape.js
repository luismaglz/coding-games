"use strict";
/// <reference path="./definitions.d.ts" />
var Direction;
(function (Direction) {
    Direction["LEFT"] = "LEFT";
    Direction["RIGHT"] = "RIGHT";
    Direction["UP"] = "UP";
    Direction["DOWN"] = "DOWN";
})(Direction || (Direction = {}));
var WallDirection;
(function (WallDirection) {
    WallDirection["Horizontal"] = "H";
    WallDirection["Vertical"] = "V";
})(WallDirection || (WallDirection = {}));
class Actions {
    static move(direction) {
        console.log(`${direction}`);
    }
    static placeWall(x, y, d) {
        console.log(`${x} ${y} ${d}`);
    }
    static debug(message) {
        if (typeof message !== "string") {
            console.error(JSON.stringify(message));
        }
        else {
            console.error(message);
        }
    }
}
function makeGame(h, w, pc) {
    return {
        height: h,
        width: w,
        playerCount: pc,
        others: [],
        me: {
            id: -1,
            defaultDirection: Direction.DOWN,
            goalSquares: [],
            square: makeGridSquare(0, 0),
            wallsLeft: 0
        }
    };
}
function makePlayer(id, square) {
    if (!square) {
        throw new Error("make player failed");
    }
    const player = {
        square,
        id,
        defaultDirection: getDefaultDirection(id),
        goalSquares: getPlayerGoals(id),
        wallsLeft: 0
    };
    return player;
}
function getDefaultDirection(pId) {
    return [Direction.RIGHT, Direction.LEFT, Direction.DOWN, Direction.UP][pId];
}
function getPlayerGoals(pId) {
    const goals = [
        ["80", "81", "82", "83", "84", "85", "86", "87", "88"],
        ["00", "01", "02", "03", "04", "05", "06", "07", "08"],
        ["08", "18", "28", "38", "48", "58", "68", "78", "88"],
        ["00", "10", "20", "30", "40", "50", "60", "70", "88"]
    ];
    return goals[pId];
}
function makeGridSquare(x, y) {
    const gridSquare = {
        x,
        y,
        id: `${x}${y}`,
        siblings: [],
        fScore: 9999,
        gCost: 9999,
        hCost: 9999,
        origin: null
    };
    // Remove edge impossible moves
    if (x !== 0)
        gridSquare.siblings.push(`${x - 1}${y}`);
    if (x !== 8)
        gridSquare.siblings.push(`${x + 1}${y}`);
    if (y !== 0)
        gridSquare.siblings.push(`${x}${y - 1}`);
    if (y !== 8)
        gridSquare.siblings.push(`${x}${y + 1}`);
    return gridSquare;
}
function makeGrid(h, w) {
    // Initialize gamesquares
    const grid = {
        dictionary: {},
        squares: []
    };
    for (let width = 0; width < w; width++) {
        for (let height = 0; height < h; height++) {
            const square = makeGridSquare(width, height);
            grid.dictionary[square.id] = square;
            grid.squares.push(square);
        }
    }
    return grid;
}
function removeDirectionFromSquare(dir, grid, sq) {
    if (!sq) {
        return;
    }
    const sqFromDirection = getSquareFromDirection(sq, dir, grid);
    if (sqFromDirection) {
        sq.siblings.splice(sq.siblings.indexOf(sqFromDirection.id), 1);
    }
}
function updateGridWithWalls(walls, grid) {
    walls.forEach(wall => {
        // Update possible moves in square
        if (wall.d === WallDirection.Vertical) {
            const square1 = getSquare(wall.x, wall.y, grid);
            const square2 = getSquare(wall.x, wall.y + 1, grid);
            const square3 = getSquare(wall.x - 1, wall.y, grid);
            const square4 = getSquare(wall.x - 1, wall.y + 1, grid);
            removeDirectionFromSquare(Direction.LEFT, grid, square1);
            removeDirectionFromSquare(Direction.LEFT, grid, square2);
            removeDirectionFromSquare(Direction.RIGHT, grid, square3);
            removeDirectionFromSquare(Direction.RIGHT, grid, square4);
        }
        if (wall.d === WallDirection.Horizontal) {
            const square1 = getSquare(wall.x, wall.y, grid);
            const square2 = getSquare(wall.x + 1, wall.y, grid);
            const square3 = getSquare(wall.x, wall.y - 1, grid);
            const square4 = getSquare(wall.x + 1, wall.y - 1, grid);
            removeDirectionFromSquare(Direction.UP, grid, square1);
            removeDirectionFromSquare(Direction.UP, grid, square2);
            removeDirectionFromSquare(Direction.DOWN, grid, square3);
            removeDirectionFromSquare(Direction.DOWN, grid, square4);
        }
    });
}
function getWallDelta(walls, player, predicted) {
    const grid = makeGrid(9, 9);
    updateGridWithWalls(walls, grid);
    const newPredicted = getPathToClosestPossibleGoal(player, grid);
    if (!newPredicted) {
        return predicted.moves;
    }
    return newPredicted.moves - predicted.moves;
}
function filterOutBadWallsForMe(walls, players, me, mePredicted, other, otherPredicted) {
    if (!mePredicted) {
        return false;
    }
    const squares = makeGrid(9, 9);
    updateGridWithWalls(walls, squares);
    for (let pI = 0; pI < players.length; pI++) {
        const predicted = getPathToClosestPossibleGoal(players[pI], squares);
        if (!predicted) {
            return false;
        }
    }
    const newMePredicted = getPathToClosestPossibleGoal(me, squares);
    if (!newMePredicted) {
        return false;
    }
    const newOtherPredicted = getPathToClosestPossibleGoal(other, squares);
    if (!newOtherPredicted) {
        return false;
    }
    if (newOtherPredicted.moves - otherPredicted.moves >
        newMePredicted.moves - mePredicted.moves &&
        newOtherPredicted.moves > otherPredicted.moves) {
        return true;
    }
    return false;
}
function isPathStillAvailable(walls, players) {
    // update nodes with new wall
    const squares = makeGrid(9, 9);
    updateGridWithWalls(walls, squares);
    let canEveryoneFinish = true;
    for (let pI = 0; pI < players.length; pI++) {
        const predicted = getPathToClosestPossibleGoal(players[pI], squares);
        if (!predicted) {
            canEveryoneFinish = false;
            break;
        }
    }
    return canEveryoneFinish;
}
function getPathToClosestPossibleGoal(p, grid, useJPS = false) {
    const goalNodes = p.goalSquares.map(gs => grid.dictionary[gs]);
    const playerNode = grid.dictionary[p.square.id];
    // Actions.debug(goalNodes);
    const predictedPaths = goalNodes.reduce((paths, goalNode) => {
        let next = navigateNodes(playerNode, goalNode, grid.dictionary, useJPS);
        if (!next) {
            return paths;
        }
        const path = [next];
        while (next && next.origin !== null) {
            next = next.origin !== null ? next.origin : null;
            if (!next) {
                break;
            }
            const item = grid.dictionary[next.id];
            if (item) {
                path.unshift(item);
            }
        }
        const nextSquare = path[1];
        const nextDirection = getDirection(p.square, nextSquare);
        paths.push({
            moves: path.length,
            next: nextSquare.id,
            path: path.map(p => p.id),
            nextDirection
        });
        return paths;
    }, []);
    if (predictedPaths.length === 0) {
        return null;
    }
    return predictedPaths.sort((a, b) => a.moves - b.moves)[0];
}
function allWallsAddJustOneMove(predictedWalls) {
    return (predictedWalls.reduce((acc, w) => {
        acc = acc + w.value;
        return acc;
    }, 0) === predictedWalls.length);
}
function allWallsAddSameMoves(predictedWalls) {
    let same = true;
    predictedWalls.reduce((acc, w) => {
        same = acc.value === w.value && same;
        return acc;
    }, predictedWalls[0]);
    return same;
}
function isWallAdjacent(player, wall, distance) {
    if (wall.d === WallDirection.Vertical) {
        return Math.abs(wall.x - player.square.x) <= distance;
    }
    else {
        return Math.abs(wall.y - player.square.y) <= distance;
    }
}
function calculateDistanceToWall(player, wall) {
    if (wall.d === WallDirection.Vertical) {
        return Math.abs(wall.x - player.square.x);
    }
    else {
        return Math.abs(wall.y - player.square.y);
    }
}
function calculateHManhattan(start, goal) {
    return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
}
function getClosestGoal(p, nodes, grid) {
    const current = p.square;
    const goals = p.goalSquares.map(g => grid.dictionary[g]);
    const closest = goals.reduce((closest, nextGoal) => {
        if (!closest) {
            return nextGoal;
        }
        const previousDistance = calculateHManhattan(current, closest);
        const newDistance = calculateHManhattan(current, nextGoal);
        return previousDistance > newDistance ? nextGoal : closest;
    }, goals[0]);
    return nodes[closest.id];
}
function navigateNodes(start, goal, nodes, useJPS = false) {
    const closedList = [];
    const openList = [];
    closedList.push(start);
    let foundGoal;
    while (!foundGoal) {
        const nextNode = traverse(closedList[closedList.length - 1], goal, openList, closedList, nodes, useJPS);
        if (!nextNode) {
            return null;
        }
        closedList.push(nextNode);
        foundGoal = nextNode.id === goal.id ? nextNode : null;
    }
    return foundGoal;
}
function traverse(current, goal, openList, closedList, nodes, useJPS = false) {
    if (!current || !current.siblings) {
        return null;
    }
    let comingFromDirection = null;
    if (current.origin) {
        comingFromDirection = getDirection(current.origin, current);
    }
    current.siblings
        .filter(s => {
        const currentNode = nodes[s];
        return closedList.findIndex(cI => cI.id === currentNode.id) === -1;
    })
        .forEach(s => {
        const sibling = {
            ...nodes[s]
        };
        sibling.gCost = (current.gCost || 0) + 1;
        sibling.hCost = calculateHManhattan(sibling, goal);
        sibling.fScore = sibling.hCost + sibling.gCost;
        sibling.origin = current;
        if (useJPS &&
            comingFromDirection &&
            getDirection(current, sibling) !== comingFromDirection) {
            sibling.fScore++;
        }
        sibling.fScore = sibling.fScore + 4 - sibling.siblings.length;
        let openItem = openList.find(openItem => openItem.id === sibling.id);
        if (!openItem) {
            openList.push(sibling);
        }
        else if (openItem.fScore < sibling.fScore) {
            openItem = {
                ...sibling
            };
        }
    });
    const goalNode = openList.find(n => n.id === goal.id);
    if (goalNode) {
        return goalNode;
    }
    const lowest = openList.reduce((lowest, current) => {
        if (!lowest) {
            return current;
        }
        return lowest.fScore < current.fScore ? lowest : current;
    }, openList[0]);
    if (!lowest) {
        return;
    }
    openList.splice(openList.indexOf(lowest), 1);
    return lowest;
}
function toGridSquareDictionary(squares, clone = false) {
    const nodes = {};
    if (clone) {
        squares.forEach(s => (nodes[s.id] = s));
    }
    else {
        squares.forEach(s => {
            nodes[s.id] = {
                ...s
            };
        });
    }
    return nodes;
}
function flipAction(dir) {
    if (dir === Direction.LEFT)
        return Direction.RIGHT;
    if (dir === Direction.RIGHT)
        return Direction.LEFT;
    if (dir === Direction.UP)
        return Direction.DOWN;
    if (dir === Direction.DOWN)
        return Direction.UP;
    throw new Error("flip Action could not flip action");
}
function canWallBePlaced(wall, walls) {
    const x = wall.x;
    const y = wall.y;
    const wd = wall.d;
    let canBePlaced = true;
    if (x > 8 || x < 0) {
        return false;
    }
    if (y > 8 || y < 0) {
        return false;
    }
    if (wd === WallDirection.Vertical && (x === 0 || y === 8)) {
        return false;
    }
    if (wd === WallDirection.Horizontal && (y === 0 || x === 8)) {
        return false;
    }
    for (let i = 0; i < walls.length; i++) {
        const existingWall = walls[i];
        if (existingWall.x === x && existingWall.y === y && existingWall.d === wd) {
            return false;
        }
        if (existingWall.d === WallDirection.Horizontal) {
            if (wd === WallDirection.Horizontal &&
                existingWall.y === y &&
                Math.abs(existingWall.x - x) === 1) {
                return false;
            }
            if (wd === WallDirection.Vertical &&
                existingWall.x + 1 === x &&
                existingWall.y - 1 === y) {
                return false;
            }
        }
        if (existingWall.d === WallDirection.Vertical) {
            if (wd === WallDirection.Vertical &&
                existingWall.x === x &&
                Math.abs(existingWall.y - y) === 1) {
                return false;
            }
            if (wd === WallDirection.Horizontal &&
                existingWall.x - 1 === x &&
                existingWall.y + 1 === y) {
                return false;
            }
        }
    }
    return canBePlaced;
}
function getSquare(x, y, grid) {
    return grid.dictionary[`${x}${y}`];
}
function getSquareFromDirection(square, d, grid) {
    let x = square.x;
    let y = square.y;
    if (d === Direction.RIGHT)
        x++;
    if (d === Direction.LEFT)
        x--;
    if (d === Direction.UP)
        y--;
    if (d === Direction.DOWN)
        y++;
    return getSquare(x, y, grid);
}
function getDirection(square, next) {
    if (square.x + 1 === next.x) {
        return Direction.RIGHT;
    }
    if (square.x - 1 === next.x) {
        return Direction.LEFT;
    }
    if (square.y - 1 === next.y) {
        return Direction.UP;
    }
    return Direction.DOWN;
}
function makeWallsToBlockPath(predicted, walls) {
    return predicted.path
        .slice(0)
        .reduce((acc, id, index, array) => {
        if (!array[index + 1]) {
            return acc;
        }
        acc.push([id, array[index + 1]]);
        return acc;
    }, [])
        .reduce((acc, currentPair) => {
        Actions.debug(currentPair);
        acc.push(...createWallToSplit(currentPair[0], currentPair[1], walls));
        return acc;
    }, []);
}
function createWallToSplit(a, b, walls) {
    const createdWalls = [];
    const aX = parseInt(a[0], 10);
    const aY = parseInt(a[1], 10);
    const bX = parseInt(b[0], 10);
    const bY = parseInt(b[1], 10);
    if (aY === bY) {
        // Vertical wall
        createdWalls.push({
            x: bX > aX ? bX : aX,
            y: aY,
            d: WallDirection.Vertical
        }, {
            x: bX > aX ? bX : aX,
            y: aY - 1,
            d: WallDirection.Vertical
        });
    }
    else if (aX === bX) {
        // Horizontal wall
        createdWalls.push({
            x: aX,
            y: bY > aY ? bY : aY,
            d: WallDirection.Horizontal
        }, {
            x: aX - 1,
            y: bY > aY ? bY : aY,
            d: WallDirection.Horizontal
        });
    }
    else {
        throw new Error("createWallToSplit non sequencial squares provided ${a} ${b}");
    }
    return createdWalls.filter(w => canWallBePlaced(w, walls));
}
function makeWall(p, predicted, grid, walls) {
    const currentSquare = p.square;
    let wd = null;
    let sq = null;
    let sq2 = null;
    let sq3 = null;
    wd =
        predicted.nextDirection === Direction.UP ||
            predicted.nextDirection === Direction.DOWN
            ? WallDirection.Horizontal
            : WallDirection.Vertical;
    if (predicted.nextDirection === Direction.RIGHT) {
        sq = getSquare(currentSquare.x + 1, currentSquare.y, grid);
        sq2 = getSquare(currentSquare.x + 1, currentSquare.y + 1, grid);
        sq3 = getSquare(currentSquare.x + 1, currentSquare.y - 1, grid);
    }
    if (predicted.nextDirection === Direction.LEFT) {
        sq = getSquare(currentSquare.x, currentSquare.y, grid);
        sq2 = getSquare(currentSquare.x, currentSquare.y + 1, grid);
        sq3 = getSquare(currentSquare.x, currentSquare.y - 1, grid);
    }
    if (predicted.nextDirection === Direction.UP) {
        sq = getSquare(currentSquare.x, currentSquare.y, grid);
        sq2 = getSquare(currentSquare.x - 1, currentSquare.y, grid);
        sq3 = getSquare(currentSquare.x + 1, currentSquare.y, grid);
    }
    if (predicted.nextDirection === Direction.DOWN) {
        sq = getSquare(currentSquare.x, currentSquare.y + 1, grid);
        sq2 = getSquare(currentSquare.x + 1, currentSquare.y + 1, grid);
        sq3 = getSquare(currentSquare.x - 1, currentSquare.y + 1, grid);
    }
    if (sq3 && canWallBePlaced({ x: sq3.x, y: sq3.y, d: wd }, walls)) {
        return {
            x: sq3.x,
            y: sq3.y,
            d: wd
        };
    }
    if (sq && canWallBePlaced({ x: sq.x, y: sq.y, d: wd }, walls)) {
        return {
            x: sq.x,
            y: sq.y,
            d: wd
        };
    }
    if (sq2 && canWallBePlaced({ x: sq2.x, y: sq2.y, d: wd }, walls)) {
        return {
            x: sq2.x,
            y: sq2.y,
            d: wd
        };
    }
    return;
}
function gameLoop() {
    var inputs = readline().split(" ");
    const w = parseInt(inputs[0]); // width of the board
    const h = parseInt(inputs[1]); // height of the board
    const playerCount = parseInt(inputs[2]); // number of players (2 or 3)
    const myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)
    // let wallsPlaced: number = 0;
    const _game = makeGame(h, w, playerCount);
    // game loop
    while (true) {
        const _grid = makeGrid(h, w);
        // Actions.debug(getSquareById("00", _squares));
        const walls = [];
        for (let i = 0; i < playerCount; i++) {
            var inputs = readline().split(" ");
            const x = parseInt(inputs[0]); // x-coordinate of the player
            const y = parseInt(inputs[1]); // y-coordinate of the player
            const wallsLeft = parseInt(inputs[2]); // number of walls available for the player
            //Initial Setup
            if (_game.me.id === -1 && i === myId) {
                const square = getSquare(x, y, _grid);
                _game.me = makePlayer(i, square);
            }
            if (_game.others.length < playerCount - 1 && i !== myId) {
                const square = getSquare(x, y, _grid);
                _game.others.push(makePlayer(i, square));
            }
            // End Initial Setup
            // Update walls left
            const player = i === myId ? _game.me : _game.others.find(o => o.id === i);
            if (!player && x > -1) {
                throw new Error("Game loop could not find player");
            }
            // Update player
            if (x > -1 && player) {
                player.wallsLeft = wallsLeft;
                const square = getSquare(x, y, _grid);
                if (!square) {
                    throw new Error("Game loop could not find player square");
                }
                player.square = square;
            }
            else {
                _game.others.splice(_game.others.findIndex(o => o.id === i), 1);
            }
        }
        if (!_game.me) {
            throw new Error("game doesnt have me");
        }
        const wallCount = parseInt(readline()); // number of walls on the board
        for (let i = 0; i < wallCount; i++) {
            var inputs = readline().split(" ");
            const wallX = parseInt(inputs[0]); // x-coordinate of the wall
            const wallY = parseInt(inputs[1]); // y-coordinate of the wall
            const wallOrientation = inputs[2]; // wall orientation ('H' or 'V')
            walls.push({
                x: wallX,
                y: wallY,
                d: wallOrientation
            });
            // Update possible moves in square
        }
        // Actions.debug(walls);
        updateGridWithWalls(walls, _grid);
        Actions.debug(walls);
        // Actions.debug(getSquareById("00", _squares));
        const mePredicted = getPathToClosestPossibleGoal(_game.me, _grid);
        if (!mePredicted || !mePredicted.nextDirection) {
            throw new Error("Could not predict my next direction");
        }
        const other = _game.others.sort((a, b) => {
            const ap = getPathToClosestPossibleGoal(a, _grid);
            const bp = getPathToClosestPossibleGoal(b, _grid);
            if (ap && bp) {
                let apMoves = ap.moves - mePredicted.moves + _game.me.wallsLeft - a.wallsLeft;
                let bpMoves = bp.moves - mePredicted.moves + _game.me.wallsLeft - b.wallsLeft;
                b.id > a.id ? (bpMoves += 1) : (apMoves += 1);
                return bpMoves - apMoves;
            }
            return 0;
        })[0];
        // let other: Player | undefined;
        // if (_game.me.id === 0) {
        //   other = _game.others.find(o => o.id === 2);
        //   if (!other) {
        //     other = _game.others[0];
        //   }
        // } else {
        //   other = _game.others.find(o => o.id === 0);
        //   if (!other) {
        //     other = _game.others[0];
        //   }
        // }
        if (!other) {
            throw new Error("Could not find other");
        }
        // Play the game
        const otherPredicted = getPathToClosestPossibleGoal(other, _grid);
        if (!otherPredicted) {
            throw new Error("Could not predict my next direction");
        }
        if ((_game.me.id < other.id && mePredicted.moves <= otherPredicted.moves) ||
            (_game.me.id > other.id && mePredicted.moves < otherPredicted.moves) ||
            mePredicted.moves < otherPredicted.moves ||
            _game.me.wallsLeft === 0) {
            Actions.move(mePredicted.nextDirection);
            // wallsPlaced = 0;
        }
        else {
            // const wall = makeWall(other, otherPredicted, _squares, walls);
            const beforeFilter = makeWallsToBlockPath(otherPredicted, walls);
            Actions.debug(` beforeFilter -------------------------------`);
            Actions.debug(beforeFilter);
            Actions.debug(otherPredicted);
            Actions.debug(`-------------------------------`);
            const possibleWalls = makeWallsToBlockPath(otherPredicted, walls).filter(w => isPathStillAvailable([...walls, w], [_game.me, ..._game.others]));
            // Actions.debug(mePredicted);
            // Actions.debug(otherPredicted);
            Actions.debug(possibleWalls);
            const bestWalls = possibleWalls
                .filter(w => filterOutBadWallsForMe([w, ...walls], _game.others, _game.me, mePredicted, other, otherPredicted))
                // .reverse();
                .sort((aW, bW) => {
                const aWDelta = getWallDelta([aW, ...walls], other, otherPredicted);
                const bWDelta = getWallDelta([bW, ...walls], other, otherPredicted);
                return aWDelta - bWDelta;
            })
                .reverse();
            Actions.debug(` Best start -------------------------------`);
            Actions.debug(bestWalls);
            Actions.debug(` Best end   -------------------------------`);
            if (bestWalls[0] && calculateHManhattan(bestWalls[0], other.square) < 3) {
                Actions.placeWall(bestWalls[0].x, bestWalls[0].y, bestWalls[0].d);
                // wallsPlaced++;
            }
            else {
                Actions.move(mePredicted.nextDirection);
                // wallsPlaced = 0;
            }
        }
    }
}
gameLoop();
