/// <reference path="./definitions.d.ts" />

interface PathFindingState {
  paths: string[][];
  limit: number;
  stop: boolean;
  goal: string[];
  dDirection: Direction;
  otherDirections: Direction[];
}

interface Wall {
  x: number;
  y: number;
  d: WallDirection;
}

let walls: Wall[];

function flipAction(dir: Direction) {
  if (dir === Direction.LEFT) return Direction.RIGHT;
  if (dir === Direction.RIGHT) return Direction.LEFT;
  if (dir === Direction.UP) return Direction.DOWN;
  if (dir === Direction.DOWN) return Direction.UP;
}

function getPaths(p: Player): PathFindingState {
  const directions = [
    Direction.UP,
    Direction.DOWN,
    Direction.LEFT,
    Direction.RIGHT
  ];
  // const index = directions.findIndex(d => d === p.defaultDirection);
  // directions.splice(index, 1);
  const state: PathFindingState = {
    stop: false,
    paths: [],
    limit: 10,
    goal: p.goalSquares.map(g => g.id),
    dDirection: p.defaultDirection,
    otherDirections: directions
  };

  const otherDirections = state.otherDirections.reduce(
    (acc: GridSquare[], o) => {
      const next = grid.getNextMovableSquare(p.square, o);
      if (next) {
        acc.push(next);
      }
      return acc;
    },
    []
  );
  state.paths.push(...otherDirections.map(d => [p.square.id, d.id]));
  findPaths(state);
  return state;
}

function calculateMoves(p: Player): GridSquare {
  const state = getPaths(p);
  state.paths.forEach(p => Actions.debug(p.toString()));
  const nextId = state.paths
    .filter(p => state.goal.indexOf(p[p.length - 1]) > -1)
    .sort((a, b) => a.length - b.length)[0][1];

  return grid.getSquareById(nextId);
}

function calculateDistance(p: Player) {
  const state = getPaths(p);
  return state.paths
    .filter(p => state.goal.indexOf(p[p.length - 1]) > -1)
    .sort((a, b) => a.length - b.length)[0].length;
}

function isLastItemInPath(path: string[], goal: string[]): boolean {
  const lastItemInPath = path[path.length - 1];
  const isLastItemInGoal = goal.indexOf(lastItemInPath) > -1;
  return isLastItemInGoal;
}

function findPaths(state: PathFindingState) {
  state.paths.forEach(path => {
    findOptimalPath(path, state, path.length - 1);
  });
}

function canWallBePlaced(
  x: number,
  y: number,
  wd: WallDirection,
  walls: Wall[]
): boolean {
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
    if (
      wall.d === WallDirection.Vertical &&
      wd === WallDirection.Vertical &&
      wall.x === x
    ) {
      if (wall.y + 1 === y || wall.y - 1 === y) {
        canBePlaced = false;
        return;
      }
    }
    if (wall.d === WallDirection.Vertical && wd === WallDirection.Horizontal) {
      if (
        (wall.x === x && wall.y + 1 === y) ||
        (wall.x - 1 === x && wall.y + 1 === y)
      ) {
        canBePlaced = false;
        return;
      }
    }
    if (
      wall.d === WallDirection.Horizontal &&
      wd === WallDirection.Horizontal &&
      wall.y === y
    ) {
      if (wall.x - 1 === x || wall.x + 1 === x) {
        canBePlaced = false;
        return;
      }
    }
    if (wall.d === WallDirection.Horizontal && wd === WallDirection.Vertical) {
      if (
        (wall.x + 1 === x && wall.y - 1 === y) ||
        (wall.x + 1 === x && wall.y === y)
      ) {
        canBePlaced = false;
        return;
      }
    }
  }
  return canBePlaced;
}

function findOptimalPath(
  currentPath: string[],
  state: PathFindingState,
  index: number
) {
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

  const otherDirections = state.otherDirections.reduce(
    (acc: GridSquare[], o) => {
      const next = grid.getNextMovableSquare(currentItem, o);
      if (next) {
        acc.push(next);
      }
      return acc;
    },
    []
  );
  const filtered = otherDirections.filter(o => currentPath.indexOf(o.id) == -1);

  filtered.forEach((o, i) => {
    if (isLastItemInPath(currentPath, state.goal)) {
      return;
    }
    if (i === 0) {
      currentPath.push(o.id);
      findOptimalPath(currentPath, state, index + 1);
    } else if (state.limit >= state.paths.length) {
      const newPath = currentPath.slice(0);
      newPath.push(o.id);
      state.paths.push(newPath);
      findOptimalPath(currentPath, state, index + 1);
    }
  });
}

function crossWallPayer(p: Player): Wall {
  if (p.lastAction === Direction.UP) {
    if (
      canWallBePlaced(p.square.x, p.square.y, WallDirection.Horizontal, walls)
    ) {
      return {
        x: p.square.x,
        y: p.square.y,
        d: WallDirection.Horizontal
      };
    }
  }

  if (p.lastAction === Direction.DOWN) {
    if (
      canWallBePlaced(
        p.square.x,
        p.square.y + 1,
        WallDirection.Horizontal,
        walls
      )
    ) {
      return {
        x: p.square.x,
        y: p.square.y + 1,
        d: WallDirection.Horizontal
      };
    }
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
    if (square.y - 1 === next.y) {
      return Direction.UP;
    }
    if (square.y + 1 === next.y) {
      return Direction.DOWN;
    }
  }

  getNextMovableSquare(square: GridSquare, d: Direction) {
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
  initialSquare: GridSquare;

  goals: string[][] = [
    ["80", "81", "82", "83", "84", "85", "86", "87", "88"],
    ["00", "01", "02", "03", "04", "05", "06", "07", "08"],
    ["08", "18", "28", "38", "48", "58", "68", "78", "88"],
    ["00", "10", "20", "30", "40", "50", "60", "70", "88"]
  ];

  constructor(id: number, square: GridSquare, grid: Grid) {
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

    this.goalSquares = this.goals[id].map(i =>
      grid.getSquare(i.split("")[0], i.split("")[1])
    );
  }

  move() {
    const nextSquare = calculateMoves(this);
    const d = grid.getDirection(this.square, nextSquare);
    Actions.move(d);
  }

  canMoveDefaultDirection() {
    return this.square.availableMoves.find(a => a === this.defaultDirection);
  }

  makeWall(p: Player): Wall {
    const direction = p.defaultDirection;
    const currentSquare = p.square;
    let wd = null;
    let sq = null;
    let sq2 = null;
    let sq3 = null;

    if (direction === Direction.RIGHT) {
      Actions.debug("place wall - right");
      wd = WallDirection.Vertical;
      Actions.debug(currentSquare);
      sq = grid.getSquare(currentSquare.x + 1, currentSquare.y);
      sq2 = grid.getSquare(currentSquare.x + 1, currentSquare.y + 1);
      sq3 = grid.getSquare(currentSquare.x + 1, currentSquare.y - 1);
    }
    if (direction === Direction.LEFT) {
      Actions.debug("place wall - left");
      wd = WallDirection.Vertical;
      sq = grid.getSquare(currentSquare.x, currentSquare.y);
      sq2 = grid.getSquare(currentSquare.x, currentSquare.y + 1);
      sq3 = grid.getSquare(currentSquare.x, currentSquare.y - 1);
    }
    if (direction === Direction.UP) {
      Actions.debug("place wall - up");
      wd = WallDirection.Horizontal;
      sq = grid.getSquare(currentSquare.x, currentSquare.y);
      sq2 = grid.getSquare(currentSquare.x - 1, currentSquare.y);
      sq3 = grid.getSquare(currentSquare.x + 1, currentSquare.y);
    }
    if (direction === Direction.DOWN) {
      Actions.debug("place wall - down");
      wd = WallDirection.Horizontal;
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
    // Actions.debug(`wall - ${sq.x} ${sq.y} ${wd} - ${canBePlaced}`);
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
  static move(direction: Direction) {
    console.log(`${direction} ${direction}`);
  }
  static placeWall(x: number, y: number, d: WallDirection) {
    console.log(`${x} ${y} ${d}`);
  }
  static debug(message: any) {
    if (typeof message !== "string") {
      console.error(JSON.stringify(message));
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
let wallsPlaced = 0;
let otherAboutToWin = null;
let lastWall = null;

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
      d: wallOrientation as WallDirection
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

  const other = game.others[0];

  if (game.me.wallsLeft === 0 || !other.isAboutToWin()) {
    game.me.move();
  } else {
    const wall = game.me.makeWall(other);
    if (wall) {
      Actions.placeWall(wall.x, wall.y, wall.d);
    } else {
      game.me.move();
    }
  }
}
