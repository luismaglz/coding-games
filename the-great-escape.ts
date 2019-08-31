/// <reference path="./definitions.d.ts" />

interface GridSquareDictionary {
  [key: string]: GridSquare;
}
interface PredictedPath {
  next: string;
  moves: number;
  nextDirection: Direction | null;
}
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

interface GridSquare {
  siblings: string[];
  fScore: number;
  gCost: number;
  hCost: number;
  origin: GridSquare | null;
  id: string;
  x: number;
  y: number;
}

interface Player {
  id: number;
  square: GridSquare;
  goalSquares: string[];
  defaultDirection: Direction;
  wallsLeft: number;
}

interface Game {
  height: number;
  width: number;
  playerCount: number;
  me?: Player;
  others: Player[];
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

class Actions {
  static move(direction: Direction) {
    console.log(`${direction}`);
  }
  static placeWall(x: number, y: number, d: WallDirection) {
    console.log(`${x} ${y} ${d}`);
  }
  static debug(message: any) {
    if (typeof message !== "string") {
      console.error(JSON.stringify(message));
    } else {
      console.error(message);
    }
  }
}

function makeGame(h: number, w: number, pc: number): Game {
  return {
    height: h,
    width: w,
    playerCount: pc,
    others: []
  };
}

function makePlayer(id: number, square?: GridSquare): Player {
  if (!square) {
    throw new Error("make player failed");
  }
  const player: Player = {
    square,
    id,
    defaultDirection: getDefaultDirection(id),
    goalSquares: getPlayerGoals(id),
    wallsLeft: 0
  };

  return player;
}

function getDefaultDirection(pId: number) {
  return [Direction.RIGHT, Direction.LEFT, Direction.DOWN, Direction.UP][pId];
}

function getPlayerGoals(pId: number) {
  const goals: string[][] = [
    ["80", "81", "82", "83", "84", "85", "86", "87", "88"],
    ["00", "01", "02", "03", "04", "05", "06", "07", "08"],
    ["08", "18", "28", "38", "48", "58", "68", "78", "88"],
    ["00", "10", "20", "30", "40", "50", "60", "70", "88"]
  ];
  return goals[pId];
}

function makeGridSquare(x: number, y: number): GridSquare {
  const gridSquare: GridSquare = {
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
  if (x !== 0) gridSquare.siblings.push(`${x - 1}${y}`);
  if (x !== 8) gridSquare.siblings.push(`${x + 1}${y}`);
  if (y !== 0) gridSquare.siblings.push(`${x}${y - 1}`);
  if (y !== 8) gridSquare.siblings.push(`${x}${y + 1}`);

  return gridSquare;
}

function makeGrid(h: number, w: number): GridSquare[] {
  // Initialize gamesquares
  const squares = [];
  for (let width = 0; width < w; width++) {
    for (let height = 0; height < h; height++) {
      squares.push(makeGridSquare(width, height));
    }
  }
  return squares;
}

function removeDirectionFromSquare(
  dir: Direction,
  squares: GridSquare[],
  sq?: GridSquare
) {
  if (!sq) {
    return;
  }
  const sqFromDirection = getSquareFromDirection(sq, dir, squares);
  if (sqFromDirection) {
    sq.siblings.splice(sq.siblings.indexOf(sqFromDirection.id), 1);
  }
}

function updateGridWithWalls(walls: Wall[], squares: GridSquare[]) {
  walls.forEach(wall => {
    // Update possible moves in square
    if (wall.d === WallDirection.Vertical) {
      const square1 = getSquare(wall.x, wall.y, squares);
      const square2 = getSquare(wall.x, wall.y + 1, squares);
      const square3 = getSquare(wall.x - 1, wall.y, squares);
      const square4 = getSquare(wall.x - 1, wall.y + 1, squares);

      removeDirectionFromSquare(Direction.LEFT, squares, square1);
      removeDirectionFromSquare(Direction.LEFT, squares, square2);
      removeDirectionFromSquare(Direction.RIGHT, squares, square3);
      removeDirectionFromSquare(Direction.RIGHT, squares, square4);
    }

    if (wall.d === WallDirection.Horizontal) {
      const square1 = getSquare(wall.x, wall.y, squares);
      const square2 = getSquare(wall.x + 1, wall.y, squares);
      const square3 = getSquare(wall.x, wall.y - 1, squares);
      const square4 = getSquare(wall.x + 1, wall.y - 1, squares);

      removeDirectionFromSquare(Direction.UP, squares, square1);
      removeDirectionFromSquare(Direction.UP, squares, square2);
      removeDirectionFromSquare(Direction.DOWN, squares, square3);
      removeDirectionFromSquare(Direction.DOWN, squares, square4);
    }
  });
}

function isPathStillAvailable(walls: Wall[], players: Player[]): boolean {
  Actions.debug("checking paths");
  // update nodes with new wall
  const squares = makeGrid(9, 9);
  updateGridWithWalls(walls, squares);
  let canEveryoneFinish = true;
  for (let pI = 0; pI < players.length; pI++) {
    const predicted = getMovesToClosestGoal(players[pI], squares);
    if (predicted.moves === -1) {
      canEveryoneFinish = false;
      break;
    }
  }
  return canEveryoneFinish;
}

function getMovesToClosestGoal(
  p: Player,
  squares: GridSquare[]
): PredictedPath {
  const squareDictionary = toGridSquareDictionary(squares, true);
  const closestGoal = getClosestGoal(p, squareDictionary, squares);
  const startNode = squareDictionary[p.square.id];

  // Actions.debug(`pId:${p.id}  cg:${closestGoal.id}`);
  let next = navigateNodes(startNode, closestGoal, squareDictionary);

  if (!next) {
    return {
      moves: -1,
      next: "nonext",
      nextDirection: null
    };
  }

  const path: GridSquare[] = [next];

  while (next && next.origin !== null) {
    next = next.origin !== null ? next.origin : null;

    if (!next) {
      break;
    }

    const item = getSquareById(next.id, squares);
    if (item) {
      path.unshift(item);
    }
  }

  // Actions.debug(path.map(p => p.id).join("|"));

  const nextSquare = path[1];
  const nextDirection = getDirection(p.square, nextSquare);

  return {
    moves: path.length,
    next: nextSquare.id,
    nextDirection
  };
}

function calculateHManhattan(start: GridSquare, goal: GridSquare): number {
  return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
}

function getClosestGoal(
  p: Player,
  nodes: GridSquareDictionary,
  squares: GridSquare[]
): GridSquare {
  const current = p.square;
  const goals = p.goalSquares.map(g => getSquareById(g, squares));

  const closest = goals.reduce((closest: GridSquare, nextGoal: GridSquare) => {
    if (!closest) {
      return nextGoal;
    }

    const previousDistance = calculateHManhattan(current, closest);
    const newDistance = calculateHManhattan(current, nextGoal);
    return previousDistance > newDistance ? nextGoal : closest;
  }, goals[0]);

  return nodes[closest.id];
}

function navigateNodes(
  start: GridSquare,
  goal: GridSquare,
  nodes: GridSquareDictionary
): GridSquare | null {
  const closedList: GridSquare[] = [];
  const openList: GridSquare[] = [];
  closedList.push(start);
  let foundGoal;

  while (!foundGoal) {
    const nextNode = traverse(
      closedList[closedList.length - 1],
      goal,
      openList,
      closedList,
      nodes
    );
    if (!nextNode) {
      return null;
    }
    closedList.push(nextNode);
    foundGoal = nextNode.id === goal.id ? nextNode : null;
  }

  return foundGoal;
}

function traverse(
  current: GridSquare,
  goal: GridSquare,
  openList: GridSquare[],
  closedList: GridSquare[],
  nodes: GridSquareDictionary
) {
  if (!current || !current.siblings) {
    return null;
  }
  current.siblings
    .filter(s => {
      const currentNode = nodes[s];
      return closedList.findIndex(cI => cI.id === currentNode.id) === -1;
    })
    .forEach(s => {
      const sibling: GridSquare = {
        ...nodes[s]
      };

      sibling.gCost = (current.gCost || 0) + 1;
      sibling.hCost = calculateHManhattan(sibling, goal);
      sibling.fScore = sibling.hCost + sibling.gCost;
      sibling.origin = current;

      let openItem = openList.find(openItem => openItem.id === sibling.id);

      if (!openItem) {
        openList.push(sibling);
      } else if (openItem.fScore < sibling.fScore) {
        openItem = {
          ...sibling
        };
      }
    });

  const goalNode = openList.find(n => n.id === goal.id);
  if (goalNode) {
    return goalNode;
  }

  const lowest = openList.reduce((lowest: GridSquare, current: GridSquare) => {
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

function toGridSquareDictionary(
  squares: GridSquare[],
  clone: boolean = false
): GridSquareDictionary {
  const nodes: GridSquareDictionary = {};
  if (clone) {
    squares.forEach(s => (nodes[s.id] = s));
  } else {
    squares.forEach(s => {
      nodes[s.id] = {
        ...s
      };
    });
  }
  return nodes;
}

function flipAction(dir: Direction): Direction {
  if (dir === Direction.LEFT) return Direction.RIGHT;
  if (dir === Direction.RIGHT) return Direction.LEFT;
  if (dir === Direction.UP) return Direction.DOWN;
  if (dir === Direction.DOWN) return Direction.UP;

  throw new Error("flip Action could not flip action");
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
      return canBePlaced;
    }
    if (
      wall.d === WallDirection.Vertical &&
      wd === WallDirection.Vertical &&
      wall.x === x
    ) {
      if (wall.y + 1 === y || wall.y - 1 === y) {
        canBePlaced = false;
        return canBePlaced;
      }
    }
    if (wall.d === WallDirection.Vertical && wd === WallDirection.Horizontal) {
      if (
        (wall.x === x && wall.y + 1 === y) ||
        (wall.x - 1 === x && wall.y + 1 === y)
      ) {
        canBePlaced = false;
        return canBePlaced;
      }
    }
    if (
      wall.d === WallDirection.Horizontal &&
      wd === WallDirection.Horizontal &&
      wall.y === y
    ) {
      if (wall.x - 1 === x || wall.x + 1 === x) {
        canBePlaced = false;
        return canBePlaced;
      }
    }
    if (wall.d === WallDirection.Horizontal && wd === WallDirection.Vertical) {
      if (
        (wall.x + 1 === x && wall.y - 1 === y) ||
        (wall.x + 1 === x && wall.y === y)
      ) {
        canBePlaced = false;
        return canBePlaced;
      }
    }
  }
  return canBePlaced;
}

function getSquare(x: number, y: number, squares: GridSquare[]) {
  return squares.find(s => s.id === `${x}${y}`);
}

function getSquareById(id: string, squares: GridSquare[]) {
  const sq = squares.find(s => s.id === id);
  if (!sq) {
    throw new Error("getSquareById could not find square ${id}");
  }
  return sq;
}

function getSquareFromDirection(
  square: GridSquare,
  d: Direction,
  squares: GridSquare[]
) {
  let x = square.x;
  let y = square.y;

  if (d === Direction.RIGHT) x++;
  if (d === Direction.LEFT) x--;
  if (d === Direction.UP) y--;
  if (d === Direction.DOWN) y++;

  return getSquare(x, y, squares);
}

function getDirection(square: GridSquare, next: GridSquare): Direction {
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

function makeWall(
  p: Player,
  predicted: PredictedPath,
  squares: GridSquare[],
  walls: Wall[]
): Wall | undefined {
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
    sq = getSquare(currentSquare.x + 1, currentSquare.y, squares);
    sq2 = getSquare(currentSquare.x + 1, currentSquare.y + 1, squares);
    sq3 = getSquare(currentSquare.x + 1, currentSquare.y - 1, squares);
  }
  if (predicted.nextDirection === Direction.LEFT) {
    sq = getSquare(currentSquare.x, currentSquare.y, squares);
    sq2 = getSquare(currentSquare.x, currentSquare.y + 1, squares);
    sq3 = getSquare(currentSquare.x, currentSquare.y - 1, squares);
  }
  if (predicted.nextDirection === Direction.UP) {
    sq = getSquare(currentSquare.x, currentSquare.y, squares);
    sq2 = getSquare(currentSquare.x - 1, currentSquare.y, squares);
    sq3 = getSquare(currentSquare.x + 1, currentSquare.y, squares);
  }
  if (predicted.nextDirection === Direction.DOWN) {
    sq = getSquare(currentSquare.x, currentSquare.y + 1, squares);
    sq2 = getSquare(currentSquare.x + 1, currentSquare.y + 1, squares);
    sq3 = getSquare(currentSquare.x - 1, currentSquare.y + 1, squares);
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

function gameLoop() {
  var inputs = readline().split(" ");
  const w = parseInt(inputs[0]); // width of the board
  const h = parseInt(inputs[1]); // height of the board
  const playerCount = parseInt(inputs[2]); // number of players (2 or 3)
  const myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)

  const _game = makeGame(h, w, playerCount);
  // game loop
  while (true) {
    const _squares = makeGrid(h, w);
    const walls = [];

    for (let i = 0; i < playerCount; i++) {
      var inputs = readline().split(" ");

      const x = parseInt(inputs[0]); // x-coordinate of the player
      const y = parseInt(inputs[1]); // y-coordinate of the player
      const wallsLeft = parseInt(inputs[2]); // number of walls available for the player

      //Initial Setup
      if (!_game.me && i === myId) {
        const square = getSquare(x, y, _squares);
        _game.me = makePlayer(i, square);
      }

      if (_game.others.length < playerCount - 1 && i !== myId) {
        const square = getSquare(x, y, _squares);
        _game.others.push(makePlayer(i, square));
      }
      // End Initial Setup

      // Update walls left
      const player = i === myId ? _game.me : _game.others.find(o => o.id === i);
      if (!player) {
        throw new Error("Game loop could not find player");
      }

      // Update player
      if (x > -1) {
        player.wallsLeft = wallsLeft;
        const square = getSquare(x, y, _squares);
        if (!square) {
          throw new Error("Game loop could not find player square");
        }
        player.square = square;
      } else {
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
        d: wallOrientation as WallDirection
      });

      // Update possible moves in square
    }

    updateGridWithWalls(walls, _squares);
    Actions.debug("After walls");
    Actions.debug(_squares.find(s => s.id === "15"));
    const other = _game.others[0];
    // Play the game
    const otherPredicted = getMovesToClosestGoal(other, _squares);
    const mePredicted = getMovesToClosestGoal(_game.me, _squares);

    if (!mePredicted.nextDirection) {
      // Actions.debug(mePredicted);
      throw new Error("Could not predict my next direction");
    }
    if (mePredicted.moves <= otherPredicted.moves || _game.me.wallsLeft === 0) {
      Actions.move(mePredicted.nextDirection);
    } else {
      const wall = makeWall(other, otherPredicted, _squares, walls);
      if (
        wall &&
        isPathStillAvailable([...walls, wall], [_game.me, ..._game.others])
      ) {
        Actions.placeWall(wall.x, wall.y, wall.d);
      } else {
        Actions.move(mePredicted.nextDirection);
      }
    }
  }
}
gameLoop();
