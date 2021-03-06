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
  playerId: number;
}

interface PredictedWall {
  wall: Wall;
  value: number;
  order: number;
  playerId?: number;
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
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN'
}

enum WallDirection {
  Horizontal = 'H',
  Vertical = 'V'
}

class Actions {
  static move(direction: Direction) {
    console.log(`${direction}`);
  }
  static placeWall(x: number, y: number, d: WallDirection) {
    console.log(`${x} ${y} ${d}`);
  }
  static placeWallV2(wall: Wall) {
    console.log(`${wall.x} ${wall.y} ${wall.d}`);
  }
  static debug(message: any) {
    if (typeof message !== 'string') {
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
    throw new Error('make player failed');
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
    ['80', '81', '82', '83', '84', '85', '86', '87', '88'],
    ['00', '01', '02', '03', '04', '05', '06', '07', '08'],
    ['08', '18', '28', '38', '48', '58', '68', '78', '88'],
    ['00', '10', '20', '30', '40', '50', '60', '70', '88']
  ];
  return goals[pId];
}

function makeGridSquare(x: number, y: number): GridSquare {
  const gridSquare: GridSquare = {
    x,
    y,
    id: `${x}${y}`,
    siblings: [],
    fScore: 0,
    gCost: 0,
    hCost: 0,
    origin: null
  };
  // Remove edge impossible moves
  if (x !== 0) gridSquare.siblings.push(`${x - 1}${y}`);
  if (x !== 8) gridSquare.siblings.push(`${x + 1}${y}`);
  if (y !== 0) gridSquare.siblings.push(`${x}${y - 1}`);
  if (y !== 8) gridSquare.siblings.push(`${x}${y + 1}`);

  return gridSquare;
}

function makeAllPossibleWalls(
  width: number = 9,
  height: number = 9
): Dictionary<boolean> {
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
  };
}

function makeGrid(): Grid {
  // prettier-ignore
  const grid = { "dictionary": { "10": { "x": 1, "y": 0, "id": "10", "siblings": ["00", "20", "11"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "11": { "x": 1, "y": 1, "id": "11", "siblings": ["01", "21", "10", "12"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "12": { "x": 1, "y": 2, "id": "12", "siblings": ["02", "22", "11", "13"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "13": { "x": 1, "y": 3, "id": "13", "siblings": ["03", "23", "12", "14"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "14": { "x": 1, "y": 4, "id": "14", "siblings": ["04", "24", "13", "15"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "15": { "x": 1, "y": 5, "id": "15", "siblings": ["05", "25", "14", "16"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "16": { "x": 1, "y": 6, "id": "16", "siblings": ["06", "26", "15", "17"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "17": { "x": 1, "y": 7, "id": "17", "siblings": ["07", "27", "16", "18"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "18": { "x": 1, "y": 8, "id": "18", "siblings": ["08", "28", "17"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "20": { "x": 2, "y": 0, "id": "20", "siblings": ["10", "30", "21"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "21": { "x": 2, "y": 1, "id": "21", "siblings": ["11", "31", "20", "22"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "22": { "x": 2, "y": 2, "id": "22", "siblings": ["12", "32", "21", "23"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "23": { "x": 2, "y": 3, "id": "23", "siblings": ["13", "33", "22", "24"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "24": { "x": 2, "y": 4, "id": "24", "siblings": ["14", "34", "23", "25"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "25": { "x": 2, "y": 5, "id": "25", "siblings": ["15", "35", "24", "26"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "26": { "x": 2, "y": 6, "id": "26", "siblings": ["16", "36", "25", "27"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "27": { "x": 2, "y": 7, "id": "27", "siblings": ["17", "37", "26", "28"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "28": { "x": 2, "y": 8, "id": "28", "siblings": ["18", "38", "27"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "30": { "x": 3, "y": 0, "id": "30", "siblings": ["20", "40", "31"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "31": { "x": 3, "y": 1, "id": "31", "siblings": ["21", "41", "30", "32"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "32": { "x": 3, "y": 2, "id": "32", "siblings": ["22", "42", "31", "33"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "33": { "x": 3, "y": 3, "id": "33", "siblings": ["23", "43", "32", "34"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "34": { "x": 3, "y": 4, "id": "34", "siblings": ["24", "44", "33", "35"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "35": { "x": 3, "y": 5, "id": "35", "siblings": ["25", "45", "34", "36"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "36": { "x": 3, "y": 6, "id": "36", "siblings": ["26", "46", "35", "37"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "37": { "x": 3, "y": 7, "id": "37", "siblings": ["27", "47", "36", "38"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "38": { "x": 3, "y": 8, "id": "38", "siblings": ["28", "48", "37"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "40": { "x": 4, "y": 0, "id": "40", "siblings": ["30", "50", "41"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "41": { "x": 4, "y": 1, "id": "41", "siblings": ["31", "51", "40", "42"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "42": { "x": 4, "y": 2, "id": "42", "siblings": ["32", "52", "41", "43"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "43": { "x": 4, "y": 3, "id": "43", "siblings": ["33", "53", "42", "44"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "44": { "x": 4, "y": 4, "id": "44", "siblings": ["34", "54", "43", "45"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "45": { "x": 4, "y": 5, "id": "45", "siblings": ["35", "55", "44", "46"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "46": { "x": 4, "y": 6, "id": "46", "siblings": ["36", "56", "45", "47"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "47": { "x": 4, "y": 7, "id": "47", "siblings": ["37", "57", "46", "48"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "48": { "x": 4, "y": 8, "id": "48", "siblings": ["38", "58", "47"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "50": { "x": 5, "y": 0, "id": "50", "siblings": ["40", "60", "51"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "51": { "x": 5, "y": 1, "id": "51", "siblings": ["41", "61", "50", "52"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "52": { "x": 5, "y": 2, "id": "52", "siblings": ["42", "62", "51", "53"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "53": { "x": 5, "y": 3, "id": "53", "siblings": ["43", "63", "52", "54"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "54": { "x": 5, "y": 4, "id": "54", "siblings": ["44", "64", "53", "55"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "55": { "x": 5, "y": 5, "id": "55", "siblings": ["45", "65", "54", "56"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "56": { "x": 5, "y": 6, "id": "56", "siblings": ["46", "66", "55", "57"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "57": { "x": 5, "y": 7, "id": "57", "siblings": ["47", "67", "56", "58"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "58": { "x": 5, "y": 8, "id": "58", "siblings": ["48", "68", "57"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "60": { "x": 6, "y": 0, "id": "60", "siblings": ["50", "70", "61"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "61": { "x": 6, "y": 1, "id": "61", "siblings": ["51", "71", "60", "62"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "62": { "x": 6, "y": 2, "id": "62", "siblings": ["52", "72", "61", "63"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "63": { "x": 6, "y": 3, "id": "63", "siblings": ["53", "73", "62", "64"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "64": { "x": 6, "y": 4, "id": "64", "siblings": ["54", "74", "63", "65"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "65": { "x": 6, "y": 5, "id": "65", "siblings": ["55", "75", "64", "66"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "66": { "x": 6, "y": 6, "id": "66", "siblings": ["56", "76", "65", "67"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "67": { "x": 6, "y": 7, "id": "67", "siblings": ["57", "77", "66", "68"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "68": { "x": 6, "y": 8, "id": "68", "siblings": ["58", "78", "67"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "70": { "x": 7, "y": 0, "id": "70", "siblings": ["60", "80", "71"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "71": { "x": 7, "y": 1, "id": "71", "siblings": ["61", "81", "70", "72"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "72": { "x": 7, "y": 2, "id": "72", "siblings": ["62", "82", "71", "73"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "73": { "x": 7, "y": 3, "id": "73", "siblings": ["63", "83", "72", "74"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "74": { "x": 7, "y": 4, "id": "74", "siblings": ["64", "84", "73", "75"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "75": { "x": 7, "y": 5, "id": "75", "siblings": ["65", "85", "74", "76"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "76": { "x": 7, "y": 6, "id": "76", "siblings": ["66", "86", "75", "77"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "77": { "x": 7, "y": 7, "id": "77", "siblings": ["67", "87", "76", "78"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "78": { "x": 7, "y": 8, "id": "78", "siblings": ["68", "88", "77"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "80": { "x": 8, "y": 0, "id": "80", "siblings": ["70", "81"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "81": { "x": 8, "y": 1, "id": "81", "siblings": ["71", "80", "82"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "82": { "x": 8, "y": 2, "id": "82", "siblings": ["72", "81", "83"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "83": { "x": 8, "y": 3, "id": "83", "siblings": ["73", "82", "84"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "84": { "x": 8, "y": 4, "id": "84", "siblings": ["74", "83", "85"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "85": { "x": 8, "y": 5, "id": "85", "siblings": ["75", "84", "86"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "86": { "x": 8, "y": 6, "id": "86", "siblings": ["76", "85", "87"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "87": { "x": 8, "y": 7, "id": "87", "siblings": ["77", "86", "88"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "88": { "x": 8, "y": 8, "id": "88", "siblings": ["78", "87"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "00": { "x": 0, "y": 0, "id": "00", "siblings": ["10", "01"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "01": { "x": 0, "y": 1, "id": "01", "siblings": ["11", "00", "02"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "02": { "x": 0, "y": 2, "id": "02", "siblings": ["12", "01", "03"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "03": { "x": 0, "y": 3, "id": "03", "siblings": ["13", "02", "04"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "04": { "x": 0, "y": 4, "id": "04", "siblings": ["14", "03", "05"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "05": { "x": 0, "y": 5, "id": "05", "siblings": ["15", "04", "06"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "06": { "x": 0, "y": 6, "id": "06", "siblings": ["16", "05", "07"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "07": { "x": 0, "y": 7, "id": "07", "siblings": ["17", "06", "08"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, "08": { "x": 0, "y": 8, "id": "08", "siblings": ["18", "07"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null } }, "squares": [{ "x": 0, "y": 0, "id": "00", "siblings": ["10", "01"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 1, "id": "01", "siblings": ["11", "00", "02"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 2, "id": "02", "siblings": ["12", "01", "03"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 3, "id": "03", "siblings": ["13", "02", "04"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 4, "id": "04", "siblings": ["14", "03", "05"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 5, "id": "05", "siblings": ["15", "04", "06"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 6, "id": "06", "siblings": ["16", "05", "07"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 7, "id": "07", "siblings": ["17", "06", "08"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 0, "y": 8, "id": "08", "siblings": ["18", "07"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 0, "id": "10", "siblings": ["00", "20", "11"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 1, "id": "11", "siblings": ["01", "21", "10", "12"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 2, "id": "12", "siblings": ["02", "22", "11", "13"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 3, "id": "13", "siblings": ["03", "23", "12", "14"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 4, "id": "14", "siblings": ["04", "24", "13", "15"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 5, "id": "15", "siblings": ["05", "25", "14", "16"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 6, "id": "16", "siblings": ["06", "26", "15", "17"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 7, "id": "17", "siblings": ["07", "27", "16", "18"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 1, "y": 8, "id": "18", "siblings": ["08", "28", "17"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 0, "id": "20", "siblings": ["10", "30", "21"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 1, "id": "21", "siblings": ["11", "31", "20", "22"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 2, "id": "22", "siblings": ["12", "32", "21", "23"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 3, "id": "23", "siblings": ["13", "33", "22", "24"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 4, "id": "24", "siblings": ["14", "34", "23", "25"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 5, "id": "25", "siblings": ["15", "35", "24", "26"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 6, "id": "26", "siblings": ["16", "36", "25", "27"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 7, "id": "27", "siblings": ["17", "37", "26", "28"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 2, "y": 8, "id": "28", "siblings": ["18", "38", "27"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 0, "id": "30", "siblings": ["20", "40", "31"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 1, "id": "31", "siblings": ["21", "41", "30", "32"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 2, "id": "32", "siblings": ["22", "42", "31", "33"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 3, "id": "33", "siblings": ["23", "43", "32", "34"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 4, "id": "34", "siblings": ["24", "44", "33", "35"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 5, "id": "35", "siblings": ["25", "45", "34", "36"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 6, "id": "36", "siblings": ["26", "46", "35", "37"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 7, "id": "37", "siblings": ["27", "47", "36", "38"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 3, "y": 8, "id": "38", "siblings": ["28", "48", "37"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 0, "id": "40", "siblings": ["30", "50", "41"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 1, "id": "41", "siblings": ["31", "51", "40", "42"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 2, "id": "42", "siblings": ["32", "52", "41", "43"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 3, "id": "43", "siblings": ["33", "53", "42", "44"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 4, "id": "44", "siblings": ["34", "54", "43", "45"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 5, "id": "45", "siblings": ["35", "55", "44", "46"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 6, "id": "46", "siblings": ["36", "56", "45", "47"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 7, "id": "47", "siblings": ["37", "57", "46", "48"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 4, "y": 8, "id": "48", "siblings": ["38", "58", "47"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 0, "id": "50", "siblings": ["40", "60", "51"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 1, "id": "51", "siblings": ["41", "61", "50", "52"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 2, "id": "52", "siblings": ["42", "62", "51", "53"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 3, "id": "53", "siblings": ["43", "63", "52", "54"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 4, "id": "54", "siblings": ["44", "64", "53", "55"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 5, "id": "55", "siblings": ["45", "65", "54", "56"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 6, "id": "56", "siblings": ["46", "66", "55", "57"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 7, "id": "57", "siblings": ["47", "67", "56", "58"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 5, "y": 8, "id": "58", "siblings": ["48", "68", "57"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 0, "id": "60", "siblings": ["50", "70", "61"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 1, "id": "61", "siblings": ["51", "71", "60", "62"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 2, "id": "62", "siblings": ["52", "72", "61", "63"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 3, "id": "63", "siblings": ["53", "73", "62", "64"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 4, "id": "64", "siblings": ["54", "74", "63", "65"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 5, "id": "65", "siblings": ["55", "75", "64", "66"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 6, "id": "66", "siblings": ["56", "76", "65", "67"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 7, "id": "67", "siblings": ["57", "77", "66", "68"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 6, "y": 8, "id": "68", "siblings": ["58", "78", "67"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 0, "id": "70", "siblings": ["60", "80", "71"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 1, "id": "71", "siblings": ["61", "81", "70", "72"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 2, "id": "72", "siblings": ["62", "82", "71", "73"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 3, "id": "73", "siblings": ["63", "83", "72", "74"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 4, "id": "74", "siblings": ["64", "84", "73", "75"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 5, "id": "75", "siblings": ["65", "85", "74", "76"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 6, "id": "76", "siblings": ["66", "86", "75", "77"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 7, "id": "77", "siblings": ["67", "87", "76", "78"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 7, "y": 8, "id": "78", "siblings": ["68", "88", "77"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 0, "id": "80", "siblings": ["70", "81"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 1, "id": "81", "siblings": ["71", "80", "82"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 2, "id": "82", "siblings": ["72", "81", "83"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 3, "id": "83", "siblings": ["73", "82", "84"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 4, "id": "84", "siblings": ["74", "83", "85"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 5, "id": "85", "siblings": ["75", "84", "86"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 6, "id": "86", "siblings": ["76", "85", "87"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 7, "id": "87", "siblings": ["77", "86", "88"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }, { "x": 8, "y": 8, "id": "88", "siblings": ["78", "87"], "fScore": 9999, "gCost": 9999, "hCost": 9999, "origin": null }] };
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
  wall: Wall,
  walls: Wall[],
  player: Player,
  predicted: PredictedPath
): number {
  const grid = makeGrid();
  updateGridWithWalls([wall, ...walls], grid);
  const newPredicted = getPathToClosestPossibleGoal(player, grid);
  if (!newPredicted) {
    return predicted.moves;
  }
  let wallDelta = newPredicted.moves - predicted.moves;
  // if (wall.d === WallDirection.Horizontal && (wall.x === 0 || wall.x === 7)) {
  //   wallDelta = wallDelta + 0.2;
  // }
  // if (wall.d === WallDirection.Vertical && (wall.y === 0 || wall.y === 7)) {
  //   wallDelta = wallDelta + 0.2;
  // }
  // const touchPoints = countTouchPoints(wallToPoints(wall), wallsToPoints(walls));
  // if (touchPoints) {
  //   wallDelta = wallDelta + touchPoints / 10;
  // }
  return wallDelta;
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
  const squares = makeGrid();
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

function filterOutBadWallsForMeV2(
  walls: Wall[],
  newWall: PredictedWall,
  players: Player[],
  playersPredicted: PredictedPath[],
  me: Player,
  mePredicted: PredictedPath
): boolean {
  if (!mePredicted) {
    return false;
  }
  const squares = makeGrid();
  updateGridWithWalls([...walls, newWall.wall], squares);
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
  const meMovesAfterWall = newMePredicted.moves;

  let totalPlayersMovesAfterWall: number = 0;
  for (let pi = 0; pi < players.length; pi++) {
    const path = getPathToClosestPossibleGoal(players[pi], squares);
    if (!path) {
      return false;
    }
    totalPlayersMovesAfterWall += path.moves;
  }

  const meMovesBeforeWall = mePredicted.moves;
  let totalPlayerMovesBeforeWall: number = 0;
  for (let pp = 0; pp < playersPredicted.length; pp++) {
    totalPlayerMovesBeforeWall += playersPredicted[pp].moves;
  }

  if (meMovesAfterWall > meMovesBeforeWall) {
    return false;
  }

  newWall.value = totalPlayersMovesAfterWall - totalPlayerMovesBeforeWall;
  return totalPlayersMovesAfterWall > totalPlayerMovesBeforeWall;
}

function isPathStillAvailable(
  walls: Wall[],
  newWall: Wall,
  players: Player[],
  knownBadWalls: Dictionary<boolean>
): boolean {
  // update nodes with new wall
  if (knownBadWalls[newWall.id]) {
    return false;
  }
  const squares = makeGrid();
  updateGridWithWalls([...walls, newWall], squares);
  let canEveryoneFinish = true;
  for (let pI = 0; pI < players.length; pI++) {
    const predicted = getPathToClosestPossibleGoal(players[pI], squares);
    if (!predicted) {
      canEveryoneFinish = false;
      break;
    }
  }

  if (!canEveryoneFinish) {
    knownBadWalls[newWall.id] = true;
  }
  return canEveryoneFinish;
}

function getPathToClosestPossibleGoal(
  p: Player,
  grid: Grid,
  useJPS: boolean = false
): PredictedPath | null {
  if (!p) {
    return null;
  }
  const goalNodes = p.goalSquares.map(gs => grid.dictionary[gs]);
  const playerNode = grid.dictionary[p.square.id];
  const predictedPaths = goalNodes.reduce(
    (paths: PredictedPath[], goalNode) => {
      let next = navigateNodes(
        playerNode,
        goalNode,
        goalNodes,
        grid.dictionary,
        useJPS
      );

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
        numberOfPaths: 0,
        playerId: p.id
      });

      return paths;
    },
    []
  );
  if (predictedPaths.length === 0) {
    return null;
  }
  predictedPaths.forEach(p => (p.numberOfPaths = predictedPaths.length));
  return predictedPaths.sort((a, b) => a.moves - b.moves)[0];
}

function isWallAdjacent(
  player: Player,
  wall: Wall,
  distance: number,
  direction: Direction
): boolean {
  if (wall.d === WallDirection.Vertical) {
    if (direction === Direction.LEFT) {
      return Math.abs(wall.x - player.square.x) <= distance - 1;
    } else {
      return Math.abs(wall.x - player.square.x) <= distance;
    }
  } else {
    if (direction === Direction.UP) {
      return Math.abs(wall.y - player.square.y) <= distance - 1;
    } else {
      return Math.abs(wall.y - player.square.y) <= distance;
    }
  }
}

// function calculateDistanceToWall(player: Player, wall: Wall): number {
//   if (wall.d === WallDirection.Vertical) {
//     return Math.abs(wall.x - player.square.x);
//   } else {
//     return Math.abs(wall.y - player.square.y);
//   }
// }

function calculateHManhattan(
  start: GridSquare | Wall,
  goal: GridSquare | Wall
): number {
  return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
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

  const filteredSiblings = current.siblings.filter(s => {
    const currentNode = nodes[s];
    return closedList.findIndex(cI => cI.id === currentNode.id) === -1;
  });

  for (let fi = 0; fi < filteredSiblings.length; fi++) {
    const s = filteredSiblings[fi];
    const sibling: GridSquare = {
      ...nodes[s]
    };

    sibling.gCost = (current.gCost || 0) + 1;
    sibling.hCost = calculateHManhattan(sibling, goal);
    sibling.fScore = sibling.hCost + sibling.gCost;
    sibling.origin = current;

    if (
      useJPS &&
      comingFromDirection &&
      getDirection(current, sibling) !== comingFromDirection
    ) {
      sibling.fScore++;
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
  }

  const goalNode = openList.find(n => n.id === goal.id);
  if (goalNode) {
    return goalNode;
  }

  let lowest = openList[0];
  for (let oi = 0; oi < openList.length; oi++) {
    const current = openList[oi];
    lowest = lowest.fScore < current.fScore ? lowest : current;
  }

  if (!lowest) {
    return;
  }

  openList.splice(openList.indexOf(lowest), 1);

  return lowest;
}

function canWallBePlaced(wall: Wall, walls: Dictionary<boolean>): boolean {
  return walls[wall.id];
}

function getSquare(x: number, y: number, grid: Grid) {
  return grid.dictionary[`${x}${y}`];
}

function getSquareFromDirection(square: GridSquare, d: Direction, grid: Grid) {
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

function makeWallsToBlockPath(
  predicted: PredictedPath,
  walls: Dictionary<boolean>
): Wall[] {
  return predicted.path.reduce((acc: Wall[], id, index, array) => {
    if (!array[index + 1]) {
      return acc;
    }
    acc.push(...createWallToSplit(id, array[index + 1], walls));
    return acc;
  }, []);
}

function createWallToSplit(
  a: string,
  b: string,
  walls: Dictionary<boolean>
): Wall[] {
  const createdWalls: Wall[] = [];
  const aX = parseInt(a[0], 10);
  const aY = parseInt(a[1], 10);
  const bX = parseInt(b[0], 10);
  const bY = parseInt(b[1], 10);

  if (aY === bY) {
    // Vertical wall
    createdWalls.push(
      makeWall(bX > aX ? bX : aX, aY, WallDirection.Vertical),
      makeWall(bX > aX ? bX : aX, aY - 1, WallDirection.Vertical)
    );
  } else if (aX === bX) {
    // Horizontal wall
    createdWalls.push(
      makeWall(aX, bY > aY ? bY : aY, WallDirection.Horizontal),
      makeWall(aX - 1, bY > aY ? bY : aY, WallDirection.Horizontal)
    );
  } else {
    throw new Error(
      'createWallToSplit non sequencial squares provided ${a} ${b}'
    );
  }
  return createdWalls.filter(w => canWallBePlaced(w, walls));
}

function filterBadWalls(
  _walls: Dictionary<boolean>,
  walls: Wall[],
  newWall: Wall,
  game: Game,
  mePredicted: PredictedPath,
  other: Player,
  otherPredicted: PredictedPath,
  knownBadWalls: Dictionary<boolean>,
  force: boolean = false
): boolean {
  if (knownBadWalls[newWall.id]) {
    return false;
  }

  const pathAvailable = isPathStillAvailable(
    walls,
    newWall,
    [game.me, ...game.others],
    knownBadWalls
  );
  if (!pathAvailable) {
    return false;
  }

  if (force) {
    return true;
  }
  return filterOutBadWallsForMe(
    [...walls, newWall],
    game.others,
    game.me,
    mePredicted,
    other!,
    otherPredicted!
  );
}

function filterBadWallsV2(
  _walls: Dictionary<boolean>,
  walls: Wall[],
  newWall: PredictedWall,
  game: Game,
  mePredicted: PredictedPath,
  playersPredicted: PredictedPath[],
  knownBadWalls: Dictionary<boolean>,
  force: boolean = false
): boolean {
  if (knownBadWalls[newWall.wall.id]) {
    return false;
  }

  const pathAvailable = isPathStillAvailable(
    walls,
    newWall.wall,
    [game.me, ...game.others],
    knownBadWalls
  );
  if (!pathAvailable) {
    return false;
  }

  if (force) {
    return true;
  }
  return filterOutBadWallsForMeV2(
    walls,
    newWall,
    game.others,
    playersPredicted,
    game.me,
    mePredicted
  );
}

function makeWallsToBlockPlayer(
  game: Game,
  _walls: Dictionary<boolean>,
  walls: Wall[],
  otherPredicted: PredictedPath,
  other: Player,
  mePredicted: PredictedPath,
  force: boolean = false
): PredictedWall[] {
  // const date = new Date().getTime();
  const knownBadWalls: Dictionary<boolean> = {};
  const createdWalls = makeWallsToBlockPath(otherPredicted!, _walls);
  const filteredWalls = createdWalls.filter(w =>
    filterBadWalls(
      _walls,
      walls,
      w,
      game,
      mePredicted,
      other,
      otherPredicted,
      knownBadWalls,
      force
    )
  );
  const mappedWalls = filteredWalls.map((w, order) => {
    const predicted: PredictedWall = {
      wall: w,
      value: getWallDelta(w, walls, other!, otherPredicted!),
      order
    };
    return predicted;
  });
  const sortedWalls = mappedWalls.sort((aW, bW) => {
    if (aW.value > bW.value) {
      return -1;
    } else if (aW.value < bW.value) {
      return 1;
    } else {
      return aW.order > bW.order ? -1 : 1;
    }
  });
  return sortedWalls;
}

function makeWallsToBlockPlayers(
  game: Game,
  _walls: Dictionary<boolean>,
  walls: Wall[],
  playersPredicted: PredictedPath[],
  mePredicted: PredictedPath,
  force: boolean = false
): PredictedWall[] {
  const knownBadWalls: Dictionary<boolean> = {};
  const createdWalls: PredictedWall[] = [];
  for (let plI = 0; plI < playersPredicted.length; plI++) {
    createdWalls.push(
      ...makeWallsToBlockPath(playersPredicted[plI], _walls).map((w, order) => {
        const predicted: PredictedWall = {
          wall: w,
          value: 0,
          order,
          playerId: playersPredicted[plI].playerId
        };
        return predicted;
      })
    );
  }

  const filteredWalls = createdWalls.filter(w =>
    filterBadWallsV2(
      _walls,
      walls,
      w,
      game,
      mePredicted,
      playersPredicted,
      knownBadWalls,
      force
    )
  );

  const sortedWalls = filteredWalls.sort((aW, bW) => {
    if (aW.value > bW.value) {
      return -1;
    } else if (aW.value < bW.value) {
      return 1;
    } else {
      if (aW.wall.d === bW.wall.d && aW.wall.d === WallDirection.Horizontal) {
        if (aW.wall.x === 1 && bW.wall.x === 0) {
          return 1;
        } else if (aW.wall.x === 0 && bW.wall.x === 1) {
          return -1;
        } else if (aW.wall.x === 6 && bW.wall.x === 7) {
          return 1;
        } else if (aW.wall.x === 7 && bW.wall.x === 6) {
          return -1;
        }
      } else if (
        aW.wall.d === bW.wall.d &&
        aW.wall.d === WallDirection.Vertical
      ) {
        if (aW.wall.y === 1 && bW.wall.y === 0) {
          return 1;
        } else if (aW.wall.y === 0 && bW.wall.y === 1) {
          return -1;
        } else if (aW.wall.y === 6 && bW.wall.y === 7) {
          return 1;
        } else if (aW.wall.y === 7 && bW.wall.y === 6) {
          return -1;
        }
      }
      return 0;
    }
  });
  return sortedWalls;
}

// function wallToPoints(wall: Wall): string[] {
//   if (wall.d === WallDirection.Horizontal) {
//     return [
//       `${wall.x}${wall.y}`,
//       `${wall.x + 1}${wall.y}`,
//       `${wall.x + 2}${wall.y}`
//     ];
//   }
//   return [
//     `${wall.x}${wall.y}`,
//     `${wall.x}${wall.y + 1}`,
//     `${wall.x}${wall.y + 2}`
//   ];
// }

// function wallsToPoints(walls: Wall[]): string[] {
//   return walls.reduce((acc: string[], wall) => {
//     acc.push(...wallToPoints(wall));
//     return acc;
//   }, []);
// }

// function countTouchPoints(wallPoints: string[], wallsPoints: string[]): number {
//   return wallPoints.filter(wp => wallsPoints.indexOf(wp) > -1).length;
// }

function updateGameState(
  _game: Game,
  playerCount: number,
  myId: number,
  _grid: Grid,
  walls: Wall[]
) {
  for (let i = 0; i < playerCount; i++) {
    var inputs = readline().split(' ');

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
      throw new Error('Game loop could not find player');
    }

    // Update player
    if (x > -1 && player) {
      player.wallsLeft = wallsLeft;
      const square = getSquare(x, y, _grid);
      if (!square) {
        throw new Error('Game loop could not find player square');
      }
      player.square = square;
    } else {
      _game.others.splice(_game.others.findIndex(o => o.id === i), 1);
    }
  }

  if (!_game.me) {
    throw new Error('game doesnt have me');
  }
  const wallCount = parseInt(readline()); // number of walls on the board
  for (let i = 0; i < wallCount; i++) {
    var inputs = readline().split(' ');
    const wallX = parseInt(inputs[0]); // x-coordinate of the wall
    const wallY = parseInt(inputs[1]); // y-coordinate of the wall
    const wallOrientation = inputs[2]; // wall orientation ('H' or 'V')
    walls.push(makeWall(wallX, wallY, wallOrientation as WallDirection));
  }
}

function isAboutToWin(predictedPath: PredictedPath): boolean {
  return predictedPath.moves === 2;
}

function tryPlacingBestWallOrMove(
  game: Game,
  bestWalls: PredictedWall[],
  otherAPredicted: PredictedPath,
  otherBPredicted: PredictedPath,
  mePredicted: PredictedPath,
  buffer: number
) {
  const wallToPlace = bestWalls[0];
  const otherPredicted =
    game.others[0].id === wallToPlace.playerId
      ? otherAPredicted
      : otherBPredicted;
  const player =
    game.others[0].id === wallToPlace.playerId
      ? game.others[0]
      : game.others[1];
  if (
    isWallAdjacent(
      player,
      wallToPlace.wall,
      buffer,
      otherPredicted.nextDirection!
    )
  ) {
    Actions.placeWall(
      wallToPlace.wall.x,
      wallToPlace.wall.y,
      wallToPlace.wall.d
    );
  } else {
    Actions.move(mePredicted.nextDirection!);
  }
}

function shouldISecureMyPath(me: Player): boolean {
  if (me.id === 0) {
    return (
      me.square.id === '00' ||
      me.square.id === '01' ||
      me.square.id === '08' ||
      me.square.id === '07'
    );
  } else if (me.id === 1) {
    return (
      me.square.id === '80' ||
      me.square.id === '81' ||
      me.square.id === '88' ||
      me.square.id === '87'
    );
  } else {
    return (
      me.square.id === '00' ||
      me.square.id === '10' ||
      me.square.id === '70' ||
      me.square.id === '80'
    );
  }
}
function isAPlayerTryingToSecurePath(
  players: Player[],
  walls: Dictionary<boolean>
): Player | undefined {
  for (let pI = 0; pI < players.length; pI++) {
    const player = players[pI];
    if (player.id === 0) {
      if (
        (player.square.id === '00' || player.square.id === '01') &&
        (!walls['01H'] || !walls['02H'])
      ) {
        Actions.debug('here');
        return player;
      }
      if (
        (player.square.id === '08' || player.square.id === '07') &&
        (!walls['08H'] || !walls['07H'])
      ) {
        Actions.debug('here2');
        return player;
      }
    }
    if (player.id === 1) {
      if (
        (player.square.id === '80' || player.square.id === '81') &&
        (!walls['71H'] || !walls['72H'])
      ) {
        Actions.debug('here3');

        return player;
      }
      if (
        (player.square.id === '88' || player.square.id === '87') &&
        (!walls['78H'] || !walls['87H'])
      ) {
        Actions.debug('here4');

        return player;
      }
    }
    if (player.id === 2) {
      if (
        (player.square.id === '00' || player.square.id === '10') &&
        (!walls['10V'] || !walls['20V'])
      ) {
        return player;
      }
      if (
        (player.square.id === '70' || player.square.id === '80') &&
        (!walls['80V'] || !walls['70V'])
      ) {
        return player;
      }
    }
  }
  return;
}

function makeWallToSecureMyPath(turn: number, me: Player): Wall {
  if (me.id === 0) {
    if (me.square.id === '00') {
      return makeWall((turn - 1) * 2, 1, WallDirection.Horizontal);
    } else if (me.square.id === '01') {
      return makeWall((turn - 1) * 2, 2, WallDirection.Horizontal);
    } else if (me.square.id === '07') {
      return makeWall((turn - 1) * 2, 7, WallDirection.Horizontal);
    } else {
      return makeWall((turn - 1) * 2, 8, WallDirection.Horizontal);
    }
  } else if (me.id === 1) {
    if (me.square.id === '80') {
      return makeWall(7 - (turn - 1) * 2, 1, WallDirection.Horizontal);
    } else if (me.square.id === '81') {
      return makeWall(7 - (turn - 1) * 2, 2, WallDirection.Horizontal);
    } else if (me.square.id === '87') {
      return makeWall(7 - (turn - 1) * 2, 7, WallDirection.Horizontal);
    } else {
      return makeWall(7 - (turn - 1) * 2, 8, WallDirection.Horizontal);
    }
  } else {
    if (me.square.id === '00') {
      return makeWall(1, (turn - 1) * 2, WallDirection.Vertical);
    } else if (me.square.id === '10') {
      return makeWall(2, (turn - 1) * 2, WallDirection.Vertical);
    } else if (me.square.id === '70') {
      return makeWall(7, (turn - 1) * 2, WallDirection.Vertical);
    } else {
      return makeWall(8, (turn - 1) * 2, WallDirection.Vertical);
    }
  }
}

function gameLoop() {
  var inputs = readline().split(' ');
  const w = parseInt(inputs[0]); // width of the board
  const h = parseInt(inputs[1]); // height of the board
  const playerCount = parseInt(inputs[2]); // number of players (2 or 3)
  const myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)
  const _walls = makeAllPossibleWalls();
  const _game = makeGame(h, w, playerCount);
  let target: Player | null = null;
  let turns = 0;
  // game loop
  while (true) {
    turns++;

    const _grid = makeGrid();
    const walls: Wall[] = [];

    updateGameState(_game, playerCount, myId, _grid, walls);

    // Update walls and grid
    walls.forEach(w => updateAvailableWalls(w, _walls));
    updateGridWithWalls(walls, _grid);

    const mePredicted = getPathToClosestPossibleGoal(_game.me, _grid, true);

    if (!mePredicted || !mePredicted.nextDirection) {
      throw new Error('Could not predict my next direction');
    }
    const wall = makeWallToSecureMyPath(turns, _game.me);
    const isGooWall =
      canWallBePlaced(wall, _walls) &&
      isPathStillAvailable(walls, wall, [..._game.others, _game.me], {});

    let playerTryingToSecurePath: Player | undefined;

    if (_game.others[0].wallsLeft < 5 && _game.others[0].id === 2) {
      playerTryingToSecurePath = _game.others[0];
    }

    if (
      !playerTryingToSecurePath &&
      _game.others[1] &&
      _game.others[1].wallsLeft < 5 &&
      _game.others[0].id === 2
    ) {
      playerTryingToSecurePath = _game.others[1];
    }

    if (!playerTryingToSecurePath) {
      playerTryingToSecurePath = isAPlayerTryingToSecurePath(
        _game.others,
        _walls
      );
    }

    if (turns === 3 && playerTryingToSecurePath) {
      const predicted = getPathToClosestPossibleGoal(
        playerTryingToSecurePath,
        _grid
      );
      let bestWalls = makeWallsToBlockPlayer(
        _game,
        _walls,
        walls,
        predicted!,
        playerTryingToSecurePath,
        mePredicted
      );

      Actions.placeWallV2(bestWalls[0].wall);
    } else if (
      turns <= 4 &&
      shouldISecureMyPath(_game.me) &&
      isGooWall &&
      mePredicted.moves === 9
    ) {
      Actions.placeWallV2(wall);
      if (turns === 4) {
        const otherAPredicted = getPathToClosestPossibleGoal(
          _game.others[0],
          _grid
        )!;
        const otherBPredicted = getPathToClosestPossibleGoal(
          _game.others[1],
          _grid
        )!;
        if (otherBPredicted && otherBPredicted.moves > otherAPredicted.moves) {
          target = _game.others[1];
        } else {
          target = _game.others[0];
        }
      }
    } else if (_game.others.length === 1) {
      const other = _game.others[0];
      const otherPredicted = getPathToClosestPossibleGoal(other, _grid);
      const otherMoves = otherPredicted!.moves;
      let meMoves = mePredicted.moves;
      if (_game.me.id > other.id) {
        meMoves++;
      }

      if (
        _game.me.wallsLeft === 0 ||
        (meMoves < otherMoves && otherPredicted!.numberOfPaths > 1)
      ) {
        Actions.move(mePredicted.nextDirection);
      } else {
        let bestWalls = makeWallsToBlockPlayer(
          _game,
          _walls,
          walls,
          otherPredicted!,
          other,
          mePredicted
        );

        let wallToPlace: Wall | null | undefined = null;

        if (bestWalls.length > 0) {
          wallToPlace = bestWalls[0].wall;
        }

        const buffer = 1;
        if (
          wallToPlace &&
          isWallAdjacent(
            other,
            wallToPlace,
            buffer,
            otherPredicted!.nextDirection!
          )
        ) {
          Actions.placeWall(wallToPlace.x, wallToPlace.y, wallToPlace.d);
        } else if (isAboutToWin(otherPredicted!)) {
          const lastChanceWalls = makeWallsToBlockPlayer(
            _game,
            _walls,
            walls,
            otherPredicted!,
            other,
            mePredicted,
            true
          );
          if (lastChanceWalls.length > 0) {
            Actions.placeWall(
              lastChanceWalls[0].wall.x,
              lastChanceWalls[0].wall.y,
              lastChanceWalls[0].wall.d
            );
          } else {
            Actions.move(mePredicted.nextDirection);
          }
        } else {
          Actions.move(mePredicted.nextDirection);
        }
      }
    } else {
      const otherAPredicted = getPathToClosestPossibleGoal(
        _game.others[0],
        _grid
      )!;
      const otherBPredicted = getPathToClosestPossibleGoal(
        _game.others[1],
        _grid
      )!;

      // if (!target) {
      const isP1AboutToWin = isAboutToWin(otherAPredicted!);
      const isP2AboutToWin = isAboutToWin(otherBPredicted!);
      //   if (isP1AboutToWin) {
      //     target = _game.others[0];
      //   } else if (isP2AboutToWin) {
      //     target = _game.others[1];
      //   }
      // }

      const myMoves = mePredicted.moves;
      const p1Moves = otherAPredicted!.moves;
      const p2Moves = otherBPredicted!.moves;

      let amILast = false;

      if (_game.me.id === 0) {
        amILast = myMoves > p1Moves && myMoves > p2Moves;
      } else if (_game.me.id === 1) {
        amILast = myMoves >= p1Moves && myMoves > p2Moves;
      } else {
        amILast = myMoves >= p1Moves && myMoves >= p2Moves;
      }

      // Actions.debug(`p1 moves: ${p1Moves}`);
      // Actions.debug(`isP1AboutToWin: ${isP1AboutToWin}`);
      // Actions.debug(`p2 moves: ${p2Moves}`);
      // Actions.debug(`isP2AboutToWin: ${isP2AboutToWin}`);
      // Actions.debug(`my moves: ${myMoves}`);
      // Actions.debug(`Am I Last: ${amILast}`);

      const isSomeoneGoingToWin = isP1AboutToWin || isP2AboutToWin;
      // Should move
      if (
        _game.me.wallsLeft === 0 ||
        turns < 7 ||
        (!amILast && !isSomeoneGoingToWin)
      ) {
        Actions.debug('moving');
        Actions.move(mePredicted.nextDirection);
      } else {
        // Should place wall
        let bestWalls = makeWallsToBlockPlayers(
          _game,
          _walls,
          walls,
          [otherAPredicted!, otherBPredicted!],
          mePredicted
        );

        const buffer = target ? 1 : 3;
        if (!bestWalls || bestWalls.length === 0) {
          Actions.move(mePredicted.nextDirection);
        } else {
          if (isP2AboutToWin) {
            const wallToPlace = bestWalls.find(
              w => w.playerId === _game.others[0].id
            );
            if (wallToPlace) {
              Actions.placeWallV2(wallToPlace.wall);
            } else {
              tryPlacingBestWallOrMove(
                _game,
                bestWalls,
                otherAPredicted,
                otherBPredicted,
                mePredicted,
                buffer
              );
            }
          } else if (isP2AboutToWin) {
            const wallToPlace = bestWalls.find(
              w => w.playerId === _game.others[1].id
            );
            if (wallToPlace) {
              Actions.placeWallV2(wallToPlace.wall);
            } else {
              tryPlacingBestWallOrMove(
                _game,
                bestWalls,
                otherAPredicted,
                otherBPredicted,
                mePredicted,
                buffer
              );
            }
          } else {
            tryPlacingBestWallOrMove(
              _game,
              bestWalls,
              otherAPredicted,
              otherBPredicted,
              mePredicted,
              buffer
            );
          }
        }
      }
    }
  }
}
gameLoop();
