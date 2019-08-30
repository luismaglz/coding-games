/// <reference path="./definitions.d.ts" />
let walls;
function updateGridWithWalls(walls, squares) {
    walls.forEach(wall => {
        // Update possible moves in square
        if (wall.d === WallDirection.Vertical) {
            const square1 = grid.getSquare(wall.x, wall.y);
            const square2 = grid.getSquare(wall.x, wall.y + 1);
            const square3 = grid.getSquare(wall.x - 1, wall.y);
            const square4 = grid.getSquare(wall.x - 1, wall.y + 1);
            if (square1) {
                square1.remove(Direction.LEFT);
            }
            if (square2) {
                square2.remove(Direction.LEFT);
            }
            if (square3) {
                square3.remove(Direction.RIGHT);
            }
            if (square4) {
                square4.remove(Direction.RIGHT);
            }
        }
        if (wall.d === WallDirection.Horizontal) {
            const square1 = grid.getSquare(wall.x, wall.y);
            const square2 = grid.getSquare(wall.x + 1, wall.y);
            const square3 = grid.getSquare(wall.x, wall.y - 1);
            const square4 = grid.getSquare(wall.x + 1, wall.y - 1);
            if (square1) {
                square1.remove(Direction.UP);
            }
            if (square2) {
                square2.remove(Direction.UP);
            }
            if (square3) {
                square3.remove(Direction.DOWN);
            }
            if (square4) {
                square4.remove(Direction.DOWN);
            }
        }
    });
}
function isPathStillAvailable(squares, walls, players) {
    // update nodes with new wall
    updateGridWithWalls(walls, squares);
    const nodes = squaresToNodes(squares);
    Actions.debug("isPathStillAvailable");
    let canEveryoneFinish = true;
    for (let pI = 0; pI < players.length; pI++) {
        const predicted = getMovesToClosestGoal(players[pI], nodes);
        if (predicted.next === null) {
            canEveryoneFinish = false;
            break;
        }
        Actions.debug(predicted);
    }
    return canEveryoneFinish;
}
function getMovesToClosestGoal(p, nodes) {
    const closestGoal = getClosestGoal(p, nodes);
    const startNode = nodes[p.square.id];
    navigateNodes(startNode, closestGoal, nodes);
    // if (!closestGoal) {
    let next = closestGoal;
    const path = [grid.getSquareById(`${next.x}${next.y}`)];
    while (next.origin !== null) {
        next = next.origin !== null ? next.origin : null;
        const item = grid.getSquareById(`${next.x}${next.y}`);
        path.unshift(item);
    }
    const nextSquare = path[1];
    if (nextSquare) {
        const nextDirection = grid.getDirection(p.square, nextSquare);
        return {
            moves: path.length,
            next: nextSquare.id,
            nextDirection
        };
    }
    else {
        // }
        // Actions.debug(path.map(g => g.id).join("|"));
        return {
            moves: null,
            next: null,
            nextDirection: null
        };
    }
}
function calculateHManhattan(start, goal) {
    return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
}
function getClosestGoal(p, nodes) {
    const current = p.square;
    const goals = p.goalSquares;
    const closest = goals
        .filter(g => g.availableMoves.indexOf(flipAction(p.defaultDirection)) !== -1)
        .reduce((closest, a) => {
        if (!closest) {
            return a;
        }
        const previousDistance = calculateHManhattan(current, closest);
        const newDistance = calculateHManhattan(current, a);
        return previousDistance > newDistance ? a : closest;
    }, null);
    return nodes[closest.id];
}
function navigateNodes(start, goal, nodes) {
    const closedList = [];
    const openList = [];
    closedList.push(start);
    let done = false;
    while (!done) {
        const nextNode = traverse(closedList[closedList.length - 1], goal, openList, closedList, nodes);
        if (!nextNode) {
            goal = null;
            break;
        }
        closedList.push(nextNode);
        done = nextNode === goal;
    }
    return goal;
}
function traverse(current, goal, openList, closedList, nodes) {
    if (!current || !current.siblings) {
        return null;
    }
    const directSiblings = current.siblings
        .filter(s => {
        const currentNode = nodes[s];
        return closedList.findIndex(cI => cI === currentNode) === -1;
    })
        .map(s => {
        const sibling = nodes[s];
        sibling.gCost = current.gCost + 1;
        sibling.hCost = calculateHManhattan(sibling, goal);
        sibling.fScore = sibling.hCost + sibling.gCost;
        sibling.origin = current;
        return sibling;
    });
    openList.push(...directSiblings);
    const goalNode = openList.find(n => n === goal);
    if (goalNode) {
        return goalNode;
    }
    // Actions.debug("------------------------------------");
    // Actions.debug(current.siblings);
    // Actions.debug(`current ${current.x}${current.y} - fScore ${current.fScore}`);
    // Actions.debug(`goal ${goal.x}${goal.y} - fScore ${goal.fScore}`);
    // Actions.debug(directSiblings.map(ds => "" + ds.x + ds.y).join("|"));
    const lowest = openList.reduce((lowest, current) => {
        if (!lowest) {
            return current;
        }
        return lowest.fScore < current.fScore ? lowest : current;
    }, null);
    // Actions.debug(`lowest ${lowest.x}${lowest.y} - fScore ${lowest.fScore}`);
    openList.splice(openList.indexOf(lowest), 1);
    return lowest;
}
function squareToNode(square) {
    const sibs = square.availableMoves.reduce((acc, am) => {
        const s = grid.getNextSquare(square, am);
        if (s) {
            acc.push(s.id);
        }
        return acc;
    }, []);
    const node = {
        x: square.x,
        y: square.y,
        siblings: sibs,
        fScore: null,
        gCost: null,
        hCost: null,
        origin: null
    };
    return node;
}
function squaresToNodes(squares) {
    const nodes = {};
    squares.forEach(s => (nodes[s.id] = squareToNode(s)));
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
}
function canWallBePlaced(x, y, wd, walls) {
    let canBePlaced = true;
    if (x > 8) {
        return false;
    }
    if (y > 8) {
        return false;
    }
    if (wd === WallDirection.Vertical && (x === 0 || y === 8)) {
        return false;
    }
    if (wd === WallDirection.Horizontal && (y === 0 || x === 8)) {
        return false;
    }
    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        if (wall.x === x && wall.y === y && wall.d === wd) {
            canBePlaced = false;
            return;
        }
        if (wall.d === WallDirection.Vertical &&
            wd === WallDirection.Vertical &&
            wall.x === x) {
            if (wall.y + 1 === y || wall.y - 1 === y) {
                canBePlaced = false;
                return;
            }
        }
        if (wall.d === WallDirection.Vertical && wd === WallDirection.Horizontal) {
            if ((wall.x === x && wall.y + 1 === y) ||
                (wall.x - 1 === x && wall.y + 1 === y)) {
                canBePlaced = false;
                return;
            }
        }
        if (wall.d === WallDirection.Horizontal &&
            wd === WallDirection.Horizontal &&
            wall.y === y) {
            if (wall.x - 1 === x || wall.x + 1 === x) {
                canBePlaced = false;
                return;
            }
        }
        if (wall.d === WallDirection.Horizontal && wd === WallDirection.Vertical) {
            if ((wall.x + 1 === x && wall.y - 1 === y) ||
                (wall.x + 1 === x && wall.y === y)) {
                canBePlaced = false;
                return;
            }
        }
    }
    return canBePlaced;
}
function crossWallPayer(p) {
    if (p.lastAction === Direction.UP) {
        if (canWallBePlaced(p.square.x, p.square.y, WallDirection.Horizontal, walls)) {
            return {
                x: p.square.x,
                y: p.square.y,
                d: WallDirection.Horizontal
            };
        }
    }
    if (p.lastAction === Direction.DOWN) {
        if (canWallBePlaced(p.square.x, p.square.y + 1, WallDirection.Horizontal, walls)) {
            return {
                x: p.square.x,
                y: p.square.y + 1,
                d: WallDirection.Horizontal
            };
        }
    }
}
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
class Game {
    constructor(h, w, pc, myId) {
        this.height = 9;
        this.width = 9;
        this.me = null;
        this.others = [];
        this.height = h;
        this.width = w;
        this.playerCount = pc;
        this.myId = myId;
    }
}
class GridSquare {
    constructor(x, y) {
        this.availableMoves = [
            Direction.UP,
            Direction.DOWN,
            Direction.LEFT,
            Direction.RIGHT
        ];
        this.x = x;
        this.y = y;
        this.id = `${x}${y}`;
        // Remove edge impossible moves
        if (x === 0)
            this.remove(Direction.LEFT);
        if (x === 8)
            this.remove(Direction.RIGHT);
        if (y === 0)
            this.remove(Direction.UP);
        if (y === 8)
            this.remove(Direction.DOWN);
    }
    remove(dir) {
        const index = this.availableMoves.findIndex(d => d === dir);
        if (index !== -1) {
            this.availableMoves.splice(index, 1);
        }
    }
}
class Grid {
    constructor(h, w) {
        // Initialize gamesquares
        this.squares = [];
        for (let width = 0; width < w; width++) {
            for (let height = 0; height < h; height++) {
                this.squares.push(new GridSquare(width, height));
            }
        }
    }
    getSquare(x, y) {
        return this.squares.find(s => s.id === `${x}${y}`);
    }
    getSquareById(id) {
        return this.squares.find(s => s.id === id);
    }
    getNextSquare(square, d) {
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
        return this.getSquare(x, y);
    }
    getDirection(square, next) {
        if (square.x + 1 === next.x) {
            return Direction.RIGHT;
        }
        if (square.x - 1 === next.x) {
            return Direction.LEFT;
        }
        if (square.y - 1 === next.y) {
            return Direction.UP;
        }
        if (square.y + 1 === next.y) {
            return Direction.DOWN;
        }
    }
    getNextMovableSquare(square, d) {
        if (!this.canMove(square, d)) {
            return null;
        }
        const nextSquare = this.getNextSquare(square, d);
        if (nextSquare.availableMoves.length === 1) {
            //detect dead end
            return null;
        }
        return this.getNextSquare(square, d);
    }
    canMove(square, d) {
        return square.availableMoves.findIndex(a => a === d) > -1;
    }
}
class Player {
    constructor(id, square, grid) {
        this.previousSquares = [];
        this.goalSquares = [];
        this.wallsLeft = 0;
        this.goals = [
            ["80", "81", "82", "83", "84", "85", "86", "87", "88"],
            ["00", "01", "02", "03", "04", "05", "06", "07", "08"],
            ["08", "18", "28", "38", "48", "58", "68", "78", "88"],
            ["00", "10", "20", "30", "40", "50", "60", "70", "88"]
        ];
        this.square = square;
        this.initialSquare = square;
        this.id = id;
        if (id == 0) {
            this.defaultDirection = Direction.RIGHT;
        }
        if (id === 1) {
            this.defaultDirection = Direction.LEFT;
        }
        if (id === 2) {
            this.defaultDirection = Direction.DOWN;
        }
        if (id === 3) {
            this.defaultDirection = Direction.UP;
        }
        this.goalSquares = this.goals[id].map(i => grid.getSquare(i.split("")[0], i.split("")[1]));
    }
    move(direction) {
        Actions.move(direction);
    }
    canMoveDefaultDirection() {
        return this.square.availableMoves.find(a => a === this.defaultDirection);
    }
    makeWall(p, predicted) {
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
            sq = grid.getSquare(currentSquare.x + 1, currentSquare.y);
            sq2 = grid.getSquare(currentSquare.x + 1, currentSquare.y + 1);
            sq3 = grid.getSquare(currentSquare.x + 1, currentSquare.y - 1);
        }
        if (predicted.nextDirection === Direction.LEFT) {
            sq = grid.getSquare(currentSquare.x, currentSquare.y);
            sq2 = grid.getSquare(currentSquare.x, currentSquare.y + 1);
            sq3 = grid.getSquare(currentSquare.x, currentSquare.y - 1);
        }
        if (predicted.nextDirection === Direction.UP) {
            sq = grid.getSquare(currentSquare.x, currentSquare.y);
            sq2 = grid.getSquare(currentSquare.x - 1, currentSquare.y);
            sq3 = grid.getSquare(currentSquare.x + 1, currentSquare.y);
        }
        if (predicted.nextDirection === Direction.DOWN) {
            sq = grid.getSquare(currentSquare.x, currentSquare.y + 1);
            sq2 = grid.getSquare(currentSquare.x + 1, currentSquare.y + 1);
            sq3 = grid.getSquare(currentSquare.x - 1, currentSquare.y + 1);
        }
        if (sq3 && canWallBePlaced(sq3.x, sq3.y, wd, walls)) {
            return {
                x: sq3.x,
                y: sq3.y,
                d: wd
            };
        }
        if (sq && canWallBePlaced(sq.x, sq.y, wd, walls)) {
            return {
                x: sq.x,
                y: sq.y,
                d: wd
            };
        }
        if (sq2 && canWallBePlaced(sq2.x, sq2.y, wd, walls)) {
            return {
                x: sq2.x,
                y: sq2.y,
                d: wd
            };
        }
        return;
    }
    isAboutToWin() {
        if (this.defaultDirection === Direction.RIGHT && this.square.x === 7) {
            return this.canMoveDefaultDirection() !== undefined;
        }
        if (this.defaultDirection === Direction.LEFT && this.square.x === 1) {
            return this.canMoveDefaultDirection() !== undefined;
        }
        if (this.defaultDirection === Direction.DOWN && this.square.y === 7) {
            return this.canMoveDefaultDirection() !== undefined;
        }
        if (this.defaultDirection === Direction.UP && this.square.y === 1) {
            return this.canMoveDefaultDirection() !== undefined;
        }
        return false;
    }
}
class Actions {
    static move(direction) {
        console.log(`${direction} ${direction}`);
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
var inputs = readline().split(" ");
const w = parseInt(inputs[0]); // width of the board
const h = parseInt(inputs[1]); // height of the board
const playerCount = parseInt(inputs[2]); // number of players (2 or 3)
const myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)
const game = new Game(h, w, playerCount, myId);
const grid = new Grid(h, w);
let turns = 0;
let wallsPlaced = 0;
// game loop
while (true) {
    turns++;
    for (let i = 0; i < playerCount; i++) {
        var inputs = readline().split(" ");
        const x = parseInt(inputs[0]); // x-coordinate of the player
        const y = parseInt(inputs[1]); // y-coordinate of the player
        const wallsLeft = parseInt(inputs[2]); // number of walls available for the player
        //Initial Setup
        if (game.me === null && i === game.myId) {
            const square = grid.getSquare(x, y);
            game.me = new Player(i, square, grid);
        }
        if (game.others.length < playerCount - 1 && i !== game.myId) {
            const square = grid.getSquare(x, y);
            game.others.push(new Player(i, square, grid));
        }
        // End Initial Setup
        // Update walls left
        const player = i === game.myId ? game.me : game.others.find(o => o.id === i);
        // Update player
        player.wallsLeft = wallsLeft;
        player.previousSquares.push(player.square);
        const square = grid.getSquare(x, y);
        player.lastAction = grid.getDirection(player.square, square);
        player.square = square;
    }
    const wallCount = parseInt(readline()); // number of walls on the board
    walls = [];
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
        updateGridWithWalls(walls, grid.squares);
    }
    // Play the game
    const other = game.others[0];
    const nodes = squaresToNodes(grid.squares);
    const otherPredicted = getMovesToClosestGoal(other, nodes);
    const mePredicted = getMovesToClosestGoal(game.me, nodes);
    // Actions.debug(`other ${JSON.stringify(otherPredicted)}`);
    // Actions.debug(`me ${JSON.stringify(mePredicted)}`);
    if (mePredicted.moves < otherPredicted.moves || game.me.wallsLeft === 0) {
        game.me.move(mePredicted.nextDirection);
        wallsPlaced = 0;
    }
    else {
        const wall = game.me.makeWall(other, otherPredicted);
        if (wall &&
            wallsPlaced < 2 &&
            isPathStillAvailable(grid.squares, [...walls, wall], [game.me, ...game.others])) {
            Actions.placeWall(wall.x, wall.y, wall.d);
            wallsPlaced++;
        }
        else {
            game.me.move(mePredicted.nextDirection);
            wallsPlaced = 0;
        }
    }
}
