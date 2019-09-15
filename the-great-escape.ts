/// <reference path="./definitions.d.ts" />

type Dictionary<T> = { [key: string]: T };

interface Grid {
  dictionary: Dictionary<GridSquare>;
  squares: GridSquare[];
}

interface PredictedPath {
  next: string;
  moves: number;
  path: string[];
  nextDirection: Direction | null;
  numberOfPaths: number;
}

interface PredictedWall {
  wall: Wall;
  value: number;
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
  id: string;
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
  me: Player;
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

function makeAllPossibleWalls(width: number = 9, height: number = 9): Dictionary<boolean> {
  const walls: Dictionary<boolean> = {};
  for (let x = 0; x < width - 1; x++) {
    for (let y = 1; y < height; y++) {
      walls[`${x}${y}${WallDirection.Horizontal}`] = true;
    }
  }

  for (let x = 1; x < width; x++) {
    for (let y = 0; y < height - 1; y++) {
      walls[`${x}${y}${WallDirection.Vertical}`] = true;
    }
  }
  return walls;
}

function makeWall(x: number, y: number, d: WallDirection): Wall {
  return {
    id: `${x}${y}${d}`,
    x,
    y,
    d
  }
}

function makeGrid(h: number, w: number): Grid {
  // Initialize gamesquares
  const grid: Grid = {
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

function removeDirectionFromSquare(
  dir: Direction,
  grid: Grid,
  sq?: GridSquare
) {
  if (!sq) {
    return;
  }
  const sqFromDirection = getSquareFromDirection(sq, dir, grid);
  if (sqFromDirection) {
    sq.siblings.splice(sq.siblings.indexOf(sqFromDirection.id), 1);
  }
}

function updateAvailableWalls(wall: Wall, walls: Dictionary<boolean>) {
  walls[wall.id] = false;

  if (wall.d === WallDirection.Horizontal) {
    walls[`${wall.x - 1}${wall.y}H`] = false;
    walls[`${wall.x + 1}${wall.y}H`] = false;
    walls[`${wall.x + 1}${wall.y - 1}V`] = false;
  }
  if (wall.d === WallDirection.Vertical) {
    walls[`${wall.x}${wall.y - 1}V`] = false;
    walls[`${wall.x}${wall.y + 1}V`] = false;
    walls[`${wall.x - 1}${wall.y + 1}H`] = false;
  }
}
function updateGridWithWalls(walls: Wall[], grid: Grid) {
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

function getWallDelta(
  walls: Wall[],
  player: Player,
  predicted: PredictedPath
): number {
  const grid = makeGrid(9, 9);
  updateGridWithWalls(walls, grid);
  const newPredicted = getPathToClosestPossibleGoal(player, grid);
  if (!newPredicted) {
    return predicted.moves;
  }
  return newPredicted.moves - predicted.moves;
}

function filterOutBadWallsForMe(
  walls: Wall[],
  players: Player[],
  me: Player,
  mePredicted: PredictedPath,
  other: Player,
  otherPredicted: PredictedPath
): boolean {
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

  if (
    newOtherPredicted.moves - otherPredicted.moves >
    newMePredicted.moves - mePredicted.moves &&
    newOtherPredicted.moves > otherPredicted.moves
  ) {
    return true;
  }
  return false;
}

function isPathStillAvailable(walls: Wall[], players: Player[]): boolean {
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

function getPathToClosestPossibleGoal(p: Player, grid: Grid, useJPS: boolean = false): PredictedPath | null {
  const goalNodes = p.goalSquares.map(gs => grid.dictionary[gs]);
  const playerNode = grid.dictionary[p.square.id];
  const predictedPaths = goalNodes.reduce(
    (paths: PredictedPath[], goalNode) => {
      let next = navigateNodes(playerNode, goalNode, goalNodes, grid.dictionary, useJPS);

      if (!next) {
        return paths;
      }

      const path: GridSquare[] = [next];

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
        nextDirection,
        numberOfPaths: 0
      });

      return paths;
    },
    []
  );
  if (predictedPaths.length === 0) {
    return null;
  }
  // predictedPaths.forEach(p => (p.numberOfPaths = predictedPaths.length));
  return predictedPaths.sort((a, b) => a.moves - b.moves)[0];
}

function allWallsAddJustOneMove(predictedWalls: PredictedWall[]): boolean {
  return (predictedWalls.reduce((acc, w) => {
    acc = acc + w.value;
    return acc;
  }, 0) === predictedWalls.length);
}

function allWallsAddSameMoves(predictedWalls: PredictedWall[]): boolean {
  let same = true;
  predictedWalls.reduce((acc, w) => {
    same = acc.value === w.value && same;
    return acc;
  }, predictedWalls[0]);
  return same;
}

function isWallAdjacent(player: Player, wall: Wall, distance: number): boolean {
  if (wall.d === WallDirection.Vertical) {
    return Math.abs(wall.x - player.square.x) <= distance;
  }
  else {
    return Math.abs(wall.y - player.square.y) <= distance;
  }
}


function calculateDistanceToWall(player: Player, wall: Wall): number {
  if (wall.d === WallDirection.Vertical) {
    return Math.abs(wall.x - player.square.x);
  }
  else {
    return Math.abs(wall.y - player.square.y);
  }
}


function calculateHManhattan(
  start: GridSquare | Wall,
  goal: GridSquare | Wall
): number {
  return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
}

function getClosestGoal(
  p: Player,
  nodes: Dictionary<GridSquare>,
  grid: Grid
): GridSquare {
  const current = p.square;
  const goals = p.goalSquares.map(g => grid.dictionary[g]);

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
  otherGoals: GridSquare[],
  nodes: Dictionary<GridSquare>,
  useJPS = false
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
      nodes,
      useJPS
    );
    if (!nextNode) {
      return null;
    }
    closedList.push(nextNode);
    foundGoal = nextNode.id === goal.id ? nextNode : null;

    if (!foundGoal && otherGoals.findIndex(g => g.id === nextNode.id) > -1) {
      return null;
    }
  }

  return foundGoal;
}

function traverse(
  current: GridSquare,
  goal: GridSquare,
  openList: GridSquare[],
  closedList: GridSquare[],
  nodes: Dictionary<GridSquare>,
  useJPS = false
) {
  if (!current || !current.siblings) {
    return null;
  }

  let comingFromDirection: Direction | null = null;
  if (current.origin) {
    comingFromDirection = getDirection(current.origin, current);
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

      if (useJPS &&
        comingFromDirection &&
        getDirection(current, sibling) !== comingFromDirection) {
        sibling.fScore++;
      }
      sibling.fScore = sibling.fScore + 4 - sibling.siblings.length;

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

function canWallBePlaced(wall: Wall, walls: Dictionary<boolean>): boolean {
  return walls[wall.id];

  // const x = wall.x;
  // const y = wall.y;
  // const wd = wall.d;
  // let canBePlaced = true;
  // if (x > 8 || x < 0) {
  //   return false;
  // }
  // if (y > 8 || y < 0) {
  //   return false;
  // }
  // if (wd === WallDirection.Vertical && (x === 0 || y === 8)) {
  //   return false;
  // }
  // if (wd === WallDirection.Horizontal && (y === 0 || x === 8)) {
  //   return false;
  // }
  // for (let i = 0; i < walls.length; i++) {
  //   const existingWall = walls[i];
  //   if (existingWall.x === x && existingWall.y === y && existingWall.d === wd) {
  //     return false;
  //   }
  //   if (existingWall.d === WallDirection.Horizontal) {
  //     if (wd === WallDirection.Horizontal &&
  //       existingWall.y === y &&
  //       Math.abs(existingWall.x - x) === 1) {
  //       return false;
  //     }
  //     if (wd === WallDirection.Vertical &&
  //       existingWall.x + 1 === x &&
  //       existingWall.y - 1 === y) {
  //       return false;
  //     }
  //   }
  //   if (existingWall.d === WallDirection.Vertical) {
  //     if (wd === WallDirection.Vertical &&
  //       existingWall.x === x &&
  //       Math.abs(existingWall.y - y) === 1) {
  //       return false;
  //     }
  //     if (wd === WallDirection.Horizontal &&
  //       existingWall.x - 1 === x &&
  //       existingWall.y + 1 === y) {
  //       return false;
  //     }
  //   }
  // }
  // return canBePlaced;
}

function getSquare(x: number, y: number, grid: Grid) {
  return grid.dictionary[`${x}${y}`];
}

function getSquareFromDirection(
  square: GridSquare,
  d: Direction,
  grid: Grid
) {
  let x = square.x;
  let y = square.y;

  if (d === Direction.RIGHT) x++;
  if (d === Direction.LEFT) x--;
  if (d === Direction.UP) y--;
  if (d === Direction.DOWN) y++;

  return getSquare(x, y, grid);
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

function makeWallsToBlockPath(predicted: PredictedPath, walls: Dictionary<boolean>): Wall[] {
  return predicted.path
    .slice(0)
    .reduce((acc: string[][], id: string, index, array) => {
      if (!array[index + 1]) {
        return acc;
      }
      acc.push([id, array[index + 1]]);
      return acc;
    }, [])
    .reduce((acc: Wall[], currentPair: string[]) => {
      acc.push(...createWallToSplit(currentPair[0], currentPair[1], walls));
      return acc;
    }, []);
}

function createWallToSplit(a: string, b: string, walls: Dictionary<boolean>): Wall[] {
  const createdWalls: Wall[] = [];
  const aX = parseInt(a[0], 10);
  const aY = parseInt(a[1], 10);
  const bX = parseInt(b[0], 10);
  const bY = parseInt(b[1], 10);

  if (aY === bY) {
    // Vertical wall
    createdWalls.push(
      makeWall(
        bX > aX ? bX : aX,
        aY,
        WallDirection.Vertical
      ),
      makeWall(
        bX > aX ? bX : aX,
        aY - 1,
        WallDirection.Vertical
      )
    );
  } else if (aX === bX) {
    // Horizontal wall
    createdWalls.push(
      makeWall(
        aX,
        bY > aY ? bY : aY,
        WallDirection.Horizontal
      ),
      makeWall(
        aX - 1,
        bY > aY ? bY : aY,
        WallDirection.Horizontal
      )
    );
  } else {
    throw new Error(
      "createWallToSplit non sequencial squares provided ${a} ${b}"
    );
  }
  return createdWalls.filter(w => canWallBePlaced(w, walls));
}

function gameLoop() {
  var inputs = readline().split(" ");
  const w = parseInt(inputs[0]); // width of the board
  const h = parseInt(inputs[1]); // height of the board
  const playerCount = parseInt(inputs[2]); // number of players (2 or 3)
  const myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)
  const _walls = makeAllPossibleWalls();
  const _game = makeGame(h, w, playerCount);

  // game loop
  while (true) {
    const _grid = makeGrid(h, w);
    const walls: Wall[] = [];

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
      walls.push(makeWall(
        wallX,
        wallY,
        wallOrientation as WallDirection
      ));
    }
    walls.forEach(w => updateAvailableWalls(w, _walls));
    updateGridWithWalls(walls, _grid);
    const mePredicted = getPathToClosestPossibleGoal(_game.me, _grid, true);

    if (!mePredicted || !mePredicted.nextDirection) {
      throw new Error("Could not predict my next direction");
    }
    let other: Player | null = null;
    let other2: Player | null = null;
    let otherPredicted: PredictedPath | null = null;
    let otherPredicted2: PredictedPath | null = null;

    if (_game.others.length === 1) {
      other = _game.others[0];
      otherPredicted = getPathToClosestPossibleGoal(_game.others[0], _grid);
    } else {
      const ap = getPathToClosestPossibleGoal(_game.others[0], _grid);
      const bp = getPathToClosestPossibleGoal(_game.others[1], _grid);

      if (ap && bp) {
        let apMoves = ap.moves -
          mePredicted.moves +
          _game.me.wallsLeft -
          _game.others[0].wallsLeft;
        let bpMoves = bp.moves -
          mePredicted.moves +
          _game.me.wallsLeft -
          _game.others[1].wallsLeft;
        _game.others[0].id > _game.others[0].id
          ? (bpMoves += 1)
          : (apMoves += 1);
        if (bpMoves > apMoves) {
          other = _game.others[1];
          otherPredicted = bp;
          other2 = _game.others[0];
          otherPredicted2 = ap;
        }
        else {
          other = _game.others[0];
          otherPredicted = ap;
          other2 = _game.others[1];
          otherPredicted2 = bp;
        }
      }
    }
    if (!other || !otherPredicted) {
      throw new Error("Could not find other");
    }
    const otherMoves = otherPredicted.moves;
    let meMoves = mePredicted.moves;
    if (_game.me.id > other.id) {
      meMoves++;
    }

    if (_game.me.wallsLeft === 0 ||
      (meMoves < otherMoves && otherPredicted.numberOfPaths > 1)) {
      Actions.move(mePredicted.nextDirection);
    } else {
      const possibleWalls = makeWallsToBlockPath(otherPredicted, _walls).filter(w => isPathStillAvailable([...walls, w], [_game.me, ..._game.others]));
      const other2PossibleWalls: Wall[] = [];
      if (other2 !== null && otherPredicted2 !== null) {
        other2PossibleWalls.push(...makeWallsToBlockPath(otherPredicted2, _walls));
      }
      const bestWalls = possibleWalls
        .filter(w => filterOutBadWallsForMe([w, ...walls], _game.others, _game.me, mePredicted, other!, otherPredicted!))
        .map(w => {
          const predicted = {
            wall: w,
            value: getWallDelta([w, ...walls], other!, otherPredicted!)
          };
          return predicted;
        })
        .sort((aW, bW) => {
          return aW.value - bW.value;
        })
        .reverse();
      let wallToPlace = null;
      let wallToGet2 = null;

      if (bestWalls.length > 0) {
        if (allWallsAddSameMoves(bestWalls)) {
          wallToPlace = bestWalls[bestWalls.length - 1].wall;
        }
        else {
          wallToPlace = bestWalls[0].wall;
        }
      }

      if (other2PossibleWalls.length > 0 && bestWalls.length > 0) {
        const matchingWalls: Wall[] = [];
        bestWalls.forEach(bw => {
          const found = other2PossibleWalls.find(w => {
            return w.x === bw.wall.x && w.y === bw.wall.y && w.d === bw.wall.d;
          });
          if (found) {
            matchingWalls.push(found);
          }
        });
        if (matchingWalls.length > 0) {
          wallToGet2 = matchingWalls[0];
        }
      }

      if (wallToGet2 === null &&
        wallToPlace &&
        isWallAdjacent(other, bestWalls[0].wall, 1)) {

        Actions.placeWall(bestWalls[0].wall.x, bestWalls[0].wall.y, bestWalls[0].wall.d);
      }
      else if (wallToGet2 !== null) {
        Actions.placeWall(wallToGet2.x, wallToGet2.y, wallToGet2.d);
      }
      else {
        Actions.move(mePredicted.nextDirection);
      }
    }
  }
}
gameLoop();
