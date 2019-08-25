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
    getNextSquare(square, d) {
        if (d === Direction.RIGHT) {
            return this.getSquare(square.x + 1, square.y);
        }
        if (d === Direction.LEFT) {
            return this.getSquare(square.x - 1, square.y);
        }
        if (d === Direction.UP) {
            return this.getSquare(square.x, square.y - 1);
        }
        if (d === Direction.DOWN) {
            return this.getSquare(square.x, square.y + 1);
        }
    }
}
class Player {
    constructor(id, square) {
        this.previousSquares = [];
        this.wallsLeft = 0;
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
    }
    canMoveDefaultDirection() {
        return this.square.availableMoves.find(a => a === this.defaultDirection);
    }
    flipAction(dir) {
        if (dir === Direction.LEFT)
            return Direction.RIGHT;
        if (dir === Direction.RIGHT)
            return Direction.LEFT;
        if (dir === Direction.UP)
            return Direction.DOWN;
        if (dir === Direction.DOWN)
            return Direction.UP;
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
        if (sq) {
            Actions.placeWall(this.constrainX(sq.x, wd), this.constrainY(sq.y, wd), wd);
        }
        return;
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
            Actions.debug(JSON.stringify("other move"));
            this.lastAction = this.square.availableMoves[0];
            Actions.move(this.square.availableMoves[0]);
            return;
        }
        Actions.debug(JSON.stringify(this));
        const action = this.square.availableMoves.find(m => {
            Actions.debug(JSON.stringify(m));
            Actions.debug(JSON.stringify(grid.getNextSquare(this.square, m).id));
            const nextSquare = grid.getNextSquare(this.square, m);
            if (this.previousSquares.findIndex(s => s.id === nextSquare.id) > -1) {
                return false;
            }
            return true;
        });
        if (action) {
            this.lastAction = action;
            Actions.move(action);
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
            game.me = new Player(i, square);
        }
        if (game.others.length < playerCount - 1 && i !== game.myId) {
            const square = grid.getSquare(x, y);
            game.others.push(new Player(i, square));
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
    for (let i = 0; i < wallCount; i++) {
        var inputs = readline().split(" ");
        const wallX = parseInt(inputs[0]); // x-coordinate of the wall
        const wallY = parseInt(inputs[1]); // y-coordinate of the wall
        const wallOrientation = inputs[2]; // wall orientation ('H' or 'V')
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
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    // action: LEFT, RIGHT, UP, DOWN or "putX putY putOrientation" to place a wall
    if (game.playerCount == 2) {
        if (turns === 3) {
            game.me.placeWall(game.others[0]);
        }
        else {
            game.me.move();
        }
    }
    else {
        game.me.move();
    }
}
