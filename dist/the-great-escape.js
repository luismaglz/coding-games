/// <reference path="./definitions.d.ts" />
let walls;
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
function getPaths(p) {
    const directions = [
        Direction.UP,
        Direction.DOWN,
        Direction.LEFT,
        Direction.RIGHT
    ];
    // const index = directions.findIndex(d => d === p.defaultDirection);
    // directions.splice(index, 1);
    const state = {
        stop: false,
        paths: [],
        limit: 10,
        goal: p.goalSquares.map(g => g.id),
        dDirection: p.defaultDirection,
        otherDirections: directions
    };
    const otherDirections = state.otherDirections.reduce((acc, o) => {
        const next = grid.getNextMovableSquare(p.square, o);
        if (next) {
            acc.push(next);
        }
        return acc;
    }, []);
    state.paths.push(...otherDirections.map(d => [p.square.id, d.id]));
    findPaths(state);
    return state;
}
function calculateMoves(p) {
    const state = getPaths(p);
    Actions.debug("final paths");
    const nextId = state.paths
        .filter(p => state.goal.indexOf(p[p.length - 1]) > -1)
        .sort((a, b) => a.length - b.length)[0][1];
    state.paths.forEach(p => Actions.debug(p.toString()));
    return grid.getSquareById(nextId);
}
function calculateDistance(p) {
    const state = getPaths(p);
    Actions.debug("final paths");
    return state.paths
        .filter(p => state.goal.indexOf(p[p.length - 1]) > -1)
        .sort((a, b) => a.length - b.length)[0].length;
}
function isLastItemInPath(path, goal) {
    const lastItemInPath = path[path.length - 1];
    const isLastItemInGoal = goal.indexOf(lastItemInPath) > -1;
    return isLastItemInGoal;
}
function findPaths(state) {
    state.paths.forEach(path => {
        findOptimalPath(path, state, path.length - 1);
    });
}
function canWallBePlaced(x, y, wd, game) {
    let canBePlaced = true;
    return canBePlaced;
}
function findOptimalPath(currentPath, state, index) {
    if (isLastItemInPath(currentPath, state.goal)) {
        return;
    }
    const currentItem = grid.getSquareById(currentPath[index]);
    const preferred = grid.getNextMovableSquare(currentItem, state.dDirection);
    if (preferred && currentPath.indexOf(preferred.id) === -1) {
        currentPath.push(preferred.id);
        findOptimalPath(currentPath, state, index + 1);
    }
    if (isLastItemInPath(currentPath, state.goal)) {
        return;
    }
    const otherDirections = state.otherDirections.reduce((acc, o) => {
        const next = grid.getNextMovableSquare(currentItem, o);
        if (next) {
            acc.push(next);
        }
        return acc;
    }, []);
    const filtered = otherDirections.filter(o => currentPath.indexOf(o.id) == -1);
    filtered.forEach((o, i) => {
        if (isLastItemInPath(currentPath, state.goal)) {
            return;
        }
        if (i === 0) {
            currentPath.push(o.id);
            findOptimalPath(currentPath, state, index + 1);
        }
        else if (state.limit >= state.paths.length) {
            const newPath = currentPath.slice(0);
            newPath.push(o.id);
            state.paths.push(newPath);
            findOptimalPath(currentPath, state, index + 1);
        }
    });
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
    canMoveDefaultDirection() {
        return this.square.availableMoves.find(a => a === this.defaultDirection);
    }
    placeWall(p) {
        Actions.debug("place wall");
        const direction = p.defaultDirection;
        const currentSquare = p.square;
        let wd = null;
        let sq = null;
        if (direction === Direction.RIGHT) {
            Actions.debug("place wall - right");
            wd = WallDirection.Vertical;
            sq = grid.getSquare(currentSquare.x + 2, currentSquare.y);
        }
        if (direction === Direction.LEFT) {
            Actions.debug("place wall - left");
            wd = WallDirection.Vertical;
            sq = grid.getSquare(currentSquare.x - 2, currentSquare.y);
        }
        if (direction === Direction.UP) {
            Actions.debug("place wall - up");
            wd = WallDirection.Horizontal;
            sq = grid.getSquare(currentSquare.x, currentSquare.y - 2);
        }
        if (direction === Direction.DOWN) {
            Actions.debug("place wall - down");
            wd = WallDirection.Horizontal;
            sq = grid.getSquare(currentSquare.x, currentSquare.y + 2);
        }
        return `${this.constrainX(sq.x, wd)} ${this.constrainY(sq.y, wd)} ${wd}`;
    }
    constrainX(value, wd) {
        if (wd === WallDirection.Horizontal && value === 0) {
            return 1;
        }
        return value;
    }
    constrainY(value, wd) {
        4;
        if (wd === WallDirection.Vertical && value === 8) {
            return 7;
        }
        return value;
    }
    move() {
        if (this.canMoveDefaultDirection()) {
            this.lastAction = this.defaultDirection;
            Actions.move(this.defaultDirection);
            return;
        }
        // First move
        if (this.previousSquares.length === 1) {
            this.lastAction == this.square.availableMoves[0];
            Actions.move(this.square.availableMoves[0]);
            return;
        }
        // Other moves
        if (this.square.availableMoves.length === 1) {
            this.lastAction = this.square.availableMoves[0];
            Actions.move(this.square.availableMoves[0]);
            return;
        }
        const action = this.square.availableMoves.find(m => {
            const nextSquare = grid.getNextSquare(this.square, m);
            if (this.previousSquares.findIndex(s => s.id === nextSquare.id) > -1) {
                return false;
            }
            return true;
        });
        if (action) {
            this.lastAction = action;
            return;
        }
    }
}
class Actions {
    static move(direction) {
        console.log(`${direction} ${direction}`);
    }
    static placeWall(x, y, d) {
        console.error(`wall ${x} ${y} ${d}`);
        console.log(`${x} ${y} ${d}`);
    }
    static debug(message) {
        if (typeof message !== "string") {
            console.log(JSON.stringify(message));
        }
        console.error(message);
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
        if (wallOrientation === WallDirection.Vertical) {
            const square1 = grid.getSquare(wallX, wallY);
            const square2 = grid.getSquare(wallX, wallY + 1);
            const square3 = grid.getSquare(wallX - 1, wallY);
            const square4 = grid.getSquare(wallX - 1, wallY + 1);
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
        if (wallOrientation === WallDirection.Horizontal) {
            const square1 = grid.getSquare(wallX, wallY);
            const square2 = grid.getSquare(wallX + 1, wallY);
            const square3 = grid.getSquare(wallX, wallY - 1);
            const square4 = grid.getSquare(wallX + 1, wallY - 1);
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
    }
    if (game.playerCount === 2 && turns > 2) {
        const myDistance = calculateDistance(game.me);
        const otherDistance = calculateDistance(game.others[0]);
        if (myDistance >= otherDistance && game.me.wallsLeft > 0) {
            game.me.placeWall(game.others[0]);
        }
        else {
            const nextSquare = calculateMoves(game.me);
            const d = grid.getDirection(game.me.square, nextSquare);
            Actions.move(d);
        }
    }
    else {
        const nextSquare = calculateMoves(game.me);
        const d = grid.getDirection(game.me.square, nextSquare);
        Actions.move(d);
    }
}
