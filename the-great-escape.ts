/// <reference path="./definitions.d.ts" />

interface PathFindingState {
  paths: string[][];
  limit: number;
  stop: boolean;
  goal: string[];
  dDirection: Direction;
  otherDirections: Direction[];
}
function calculateMoves(p: Player): GridSquare {
  const directions = [
    Direction.UP,
    Direction.DOWN,
    Direction.LEFT,
    Direction.RIGHT
  ];
  const index = directions.findIndex(d => d === p.defaultDirection);
  directions.splice(index, 1);
  const state: PathFindingState = {
    stop: false,
    paths: [[]],
    limit: 5,
    goal: p.goalSquares.map(g => g.id),
    dDirection: p.defaultDirection,
    otherDirections: directions
  };

  findOptimalPath(p.square, state, 0);

  try {
    const nextId = state.paths
      .filter(p => state.goal.indexOf(p[p.length - 1]) > -1)
      .sort((a, b) => a.length - b.length)[0][0];

    state.paths.forEach(p => Actions.debug(p.toString()));

    return grid.getSquareById(nextId);
  } catch (err) {
    Actions.debug(state);
  }
}

function findOptimalPath(
  starting: GridSquare,
  state: PathFindingState,
  pathIndex: number
) {
  const preferred = grid.getNextMovableSquare(starting, state.dDirection);
  const otherDirections = state.otherDirections.reduce((acc, o) => {
    const next = grid.getNextMovableSquare(starting, o);
    if (next) {
      acc.push(next);
    }
    return acc;
  }, []);

  if (preferred) {
    state.paths[pathIndex].push(preferred.id);
    if (state.goal.indexOf(preferred.id) > -1) {
      return;
    }

    findOptimalPath(preferred, state, pathIndex);
  }

  if (state.limit >= state.paths.length) {
    otherDirections.forEach(o => {
      if (
        state.paths[pathIndex].indexOf(o.id) > -1 ||
        state.goal.indexOf(o.id) > -1
      ) {
        return;
      }
      const newPath = state.paths[pathIndex].slice(0);
      const newIndex = state.paths.length;
      state.paths.push(newPath);
      newPath.push(o.id);
      findOptimalPath(o, state, newIndex);
    });
  }
}

enum Direction {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN"
}

enum WallDirection {
  Horizontal = "H",
  Vertical = "V"
}

class Game {
  height: number = 9;
  width: number = 9;
  playerCount: number;
  myId: number;

  me: Player = null;
  others: Player[] = [];

  constructor(h: number, w: number, pc: number, myId: number) {
    this.height = h;
    this.width = w;
    this.playerCount = pc;
    this.myId = myId;
  }
}

class GridSquare {
  id: string;
  x: number;
  y: number;
  availableMoves: Direction[] = [
    Direction.UP,
    Direction.DOWN,
    Direction.LEFT,
    Direction.RIGHT
  ];

  remove(dir: Direction) {
    const index = this.availableMoves.findIndex(d => d === dir);
    if (index !== -1) {
      this.availableMoves.splice(index, 1);
    }
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.id = `${x}${y}`;
    // Remove edge impossible moves
    if (x === 0) this.remove(Direction.LEFT);
    if (x === 8) this.remove(Direction.RIGHT);
    if (y === 0) this.remove(Direction.UP);
    if (y === 8) this.remove(Direction.DOWN);
  }
}

class Grid {
  squares: GridSquare[];

  constructor(h: number, w: number) {
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

  getSquareById(id: string) {
    return this.squares.find(s => s.id === id);
  }

  getNextSquare(square: GridSquare, d: Direction) {
    let x = square.x;
    let y = square.y;

    if (d === Direction.RIGHT) x++;
    if (d === Direction.LEFT) x--;
    if (d === Direction.UP) y--;
    if (d === Direction.DOWN) y++;

    return this.getSquare(x, y);
  }

  getDirection(square: GridSquare, next: GridSquare): Direction {
    if (square.x + 1 === next.x) {
      return Direction.RIGHT;
    }
    if (square.x - 1 === next.x) {
      return Direction.LEFT;
    }
    if (square.y - 1 === next.x) {
      return Direction.DOWN;
    }
    if (square.y + 1 === next.x) {
      return Direction.UP;
    }
  }

  getNextMovableSquare(square: GridSquare, d: Direction) {
    if (!this.canMove(square, d)) {
      return null;
    }

    return this.getNextSquare(square, d);
  }

  canMove(square: GridSquare, d: Direction): boolean {
    return square.availableMoves.findIndex(a => a === d) > -1;
  }
}

class Player {
  id: number;
  square: GridSquare;
  previousSquares: GridSquare[] = [];
  goalSquares: GridSquare[] = [];
  wallsLeft: number = 0;
  defaultDirection: Direction;
  lastAction: Direction;
  lastWall: {
    s: GridSquare;
    d: WallDirection;
  };

  goals: string[][] = [
    ["80", "81", "82", "83", "84", "85", "86", "87", "88"],
    ["00", "01", "02", "03", "04", "05", "06", "07", "08"],
    ["08", "18", "28", "38", "48", "58", "68", "78", "88"],
    ["00", "10", "20", "30", "40", "50", "60", "70", "88"]
  ];

  constructor(id: number, square: GridSquare, grid: Grid) {
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

    this.goalSquares = this.goals[id].map(i =>
      grid.getSquare(i.split("")[0], i.split("")[1])
    );
  }

  canMoveDefaultDirection() {
    return this.square.availableMoves.find(a => a === this.defaultDirection);
  }

  flipAction(dir: Direction) {
    if (dir === Direction.LEFT) return Direction.RIGHT;
    if (dir === Direction.RIGHT) return Direction.LEFT;
    if (dir === Direction.UP) return Direction.DOWN;
    if (dir === Direction.DOWN) return Direction.UP;
  }

  placeWall(p: Player) {
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
      Actions.placeWall(
        this.constrainX(sq.x, wd),
        this.constrainY(sq.y, wd),
        wd
      );
    }
    return;
  }

  constrainX(value: number, wd: WallDirection) {
    if (wd === WallDirection.Horizontal && value === 0) {
      return 1;
    }
    return value;
  }
  constrainY(value: number, wd: WallDirection) {
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
  static move(direction: Direction) {
    console.log(`${direction} ${direction}`);
  }
  static placeWall(x: number, y: number, d: WallDirection) {
    console.error(`wall ${x} ${y} ${d}`);
    console.log(`${x} ${y} ${d}`);
  }
  static debug(message: any) {
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
    const player =
      i === game.myId ? game.me : game.others.find(o => o.id === i);

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

  const nextSquare = calculateMoves(game.me);
  const d = grid.getDirection(game.me.square, nextSquare);
  Actions.debug(d);
  Actions.move(d);
}
