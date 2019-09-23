/// <reference path="./definitions.d.ts" />

type Dictionary<T> = { [key: string]: T };

type StructureType = 'NO_STRUCTURE' | 'BARRACKS' | 'TOWER';
type Owner = 'NO_OWNER' | 'FRIENDLY' | 'ENEMY';
type UnitType = 'QUEEN' | 'KNIGHT' | 'ARCHER';
type SiteType = 'NONE' | 'ARCHER' | 'KNIGHT' | 'GIANT';

type TrackingObject<T> = {
  dictionary: Dictionary<T>;
  array: Array<T>;
};

export interface Point {
  X: number;
  Y: number;
}

type Pre_Sites = TrackingObject<Pre_Site>;
type Sites = TrackingObject<Site>;
type Units = {
  queen?: Unit;
  archers: TrackingObject<Unit>;
  knights: TrackingObject<Unit>;
};

interface Pre_Site extends Point {
  id: number;
  radius: number;
}

interface Site extends Pre_Site {
  ignore1: any;
  ignore2: any;
  structureType: StructureType;
  owner: Owner;
  turnsTillNextTraining: number;
  siteType?: SiteType;
  areaOfEffect?: number;
}

interface GameState {
  gold: number;
  touchedSite: number;
  sites: Sites;
  my_units: Units;
  enemy_units: Units;
}

interface Unit extends Point {
  owner: Owner;
  unitType: UnitType; // -1 = QUEEN, 0 = KNIGHT, 1 = ARCHER
  health: number;
}

export interface Grid {
  dictionary: Dictionary<GridPoint>;
  squares: GridPoint[];
}

export interface GridPoint extends Point {
  siblings: string[];
  fScore: number;
  gCost: number;
  hCost: number;
  origin: GridPoint | null;
  id: string;
}

function makeGrid(h: number, w: number, sites: Pre_Sites): Grid {
  const pointsToRemove: Dictionary<boolean> = {};
  const site = sites.array[0];
  const center = `${site.X},${site.Y}`;
  const radSquared = site.radius * site.radius;
  pointsToRemove[center] = true;
  for (let x = 0; x < site.radius; x++) {
    for (let y = 0; y < site.radius; y++) {
      if (x * x + y * y <= radSquared) {
        pointsToRemove[`${x},${site.Y + y}`] = true;
        pointsToRemove[`${x},${site.Y - y}`] = true;
        pointsToRemove[`${site.X + x},${y}`] = true;
        pointsToRemove[`${site.X - x},${y}`] = true;
      }
    }
  }

  // Initialize gamesquares
  const grid: Grid = {
    dictionary: {},
    squares: []
  };

  for (let width = 0; width <= w; width++) {
    for (let height = 0; height <= h; height++) {
      if (!pointsToRemove[`${width},${height}`]) {
        const square = makeGridPoint(width, height, pointsToRemove);
        grid.dictionary[square.id] = square;
        grid.squares.push(square);
      }
    }
  }

  return grid;
}

function makeGridPoint(
  X: number,
  Y: number,
  pointsToRemove: Dictionary<boolean>
): GridPoint {
  const gridSquare: GridPoint = {
    X,
    Y,
    id: `${X},${Y}`,
    siblings: [],
    fScore: 9999,
    gCost: 9999,
    hCost: 9999,
    origin: null
  };
  // Remove edge impossible moves

  const possibleSiblings = [];
  if (Y === 0 && X === 0) {
    possibleSiblings.push(
      `${X},${Y + 1}`,
      `${X + 1},${Y + 1}`,
      `${X + 1},${Y}`
    );
  } else if (Y === 32 && X === 64) {
    possibleSiblings.push(
      `${X},${Y - 1}`,
      `${X - 1},${Y - 1}`,
      `${X - 1},${Y}`
    );
  } else if (X === 0) {
    possibleSiblings.push(
      `${X},${Y + 1}`,
      `${X + 1},${Y + 1}`,
      `${X + 1},${Y}`,
      `${X + 1},${Y - 1}`,
      `${X},${Y - 1}`
    );
  } else if (Y === 0) {
    possibleSiblings.push(
      `${X},${Y + 1}`,
      `${X + 1},${Y + 1}`,
      `${X + 1},${Y}`,
      `${X - 1},${Y}`,
      `${X - 1},${Y + 1}`
    );
  } else if (X === 64) {
    possibleSiblings.push(
      `${X},${Y + 1}`,
      `${X},${Y - 1}`,
      `${X - 1},${Y - 1}`,
      `${X - 1},${Y}`,
      `${X - 1},${Y + 1}`
    );
  } else if (Y === 32) {
    possibleSiblings.push(
      `${X + 1},${Y}`,
      `${X + 1},${Y - 1}`,
      `${X},${Y - 1}`,
      `${X - 1},${Y - 1}`,
      `${X - 1},${Y}`
    );
  } else {
    possibleSiblings.push(
      `${X},${Y + 1}`,
      `${X + 1},${Y + 1}`,
      `${X + 1},${Y}`,
      `${X + 1},${Y - 1}`,
      `${X},${Y - 1}`,
      `${X - 1},${Y - 1}`,
      `${X - 1},${Y}`,
      `${X - 1},${Y + 1}`
    );
  }
  for (let psI = 0; psI < possibleSiblings.length; psI++) {
    if (!pointsToRemove[possibleSiblings[psI]]) {
      gridSquare.siblings.push(possibleSiblings[psI]);
    }
  }
  return gridSquare;
}

export function makePoint(X: number, Y: number): Point {
  return {
    X,
    Y
  };
}

function calculateEuclideanDistance(p1: Point, p2: Point): number {
  var a = p1.X - p2.X;
  var b = p1.Y - p2.Y;
  return Math.sqrt(a * a + b * b);
}

function makePreSite(
  X: number,
  Y: number,
  id: number,
  radius: number
): Pre_Site {
  return {
    X,
    Y,
    id,
    radius
  };
}

function getOwner(o: number): Owner {
  if (o === -1) {
    return 'NO_OWNER';
  }

  if (o === 0) {
    return 'FRIENDLY';
  }

  if (o === 1) {
    return 'ENEMY';
  }

  throw new Error('Failed to parse owner type');
}

function getUnitType(u: number): UnitType {
  // -1 = QUEEN, 0 = KNIGHT, 1 = ARCHER
  if (u === -1) {
    return 'QUEEN';
  }

  if (u === 0) {
    return 'KNIGHT';
  }

  if (u === 1) {
    return 'ARCHER';
  }

  throw new Error('Failed to parse unit type');
}

function getSiteType(s: number): SiteType {
  // -1 = QUEEN, 0 = KNIGHT, 1 = ARCHER
  if (s === -1) {
    return 'NONE';
  }

  if (s === 0) {
    return 'KNIGHT';
  }

  if (s === 1) {
    return 'ARCHER';
  }

  if (s === 2) {
    return 'GIANT';
  }
  throw new Error('Failed to parse SITE TTYPE type');
}

function getStructureType(s: number): StructureType {
  if (s === -1) {
    return 'NO_STRUCTURE';
  }
  if (s === 1) {
    return 'TOWER';
  }
  if (s === 2) {
    return 'BARRACKS';
  }
  throw new Error('Failed to parse STRUCTURE TYPE');
}

function makeSite(
  preSite: Pre_Site,
  ignore1: any,
  ignore2: any,
  structureType: number,
  owner: number,
  param1: any,
  param2: number
): Site {
  // const structureType = parseInt(inputs[3]); // -1 = No structure, 2 = Barracks
  // const owner = parseInt(inputs[4]); // -1 = No structure, 0 = Friendly, 1 = Enemy

  const _structureType = getStructureType(structureType);
  if (_structureType === 'NO_STRUCTURE' || _structureType === 'BARRACKS') {
    return {
      id: preSite.id,
      X: preSite.X,
      Y: preSite.Y,
      radius: preSite.radius,
      ignore1,
      ignore2,
      structureType: _structureType,
      owner: getOwner(owner),
      turnsTillNextTraining: param1,
      siteType: getSiteType(param2)
    };
  } else {
    return {
      id: preSite.id,
      X: preSite.X,
      Y: preSite.Y,
      radius: preSite.radius,
      ignore1,
      ignore2,
      structureType: _structureType,
      owner: getOwner(owner),
      turnsTillNextTraining: param1,
      areaOfEffect: param2
    };
  }
}

function makeUnit(
  X: number,
  Y: number,
  owner: Owner,
  unitType: UnitType,
  health: number
): Unit {
  return {
    X,
    Y,
    owner,
    unitType,
    health
  };
}

function traverse_points(
  current: GridPoint,
  goal: GridPoint,
  openList: GridPoint[],
  closedList: GridPoint[],
  nodes: Dictionary<GridPoint>
) {
  const filteredSiblings = current.siblings.filter(s => {
    const currentNode = nodes[s];
    return closedList.findIndex(cI => cI.id === currentNode.id) === -1;
  });

  for (let fi = 0; fi < filteredSiblings.length; fi++) {
    const s = filteredSiblings[fi];
    const sibling: GridPoint = {
      ...nodes[s]
    };

    sibling.gCost = (current.gCost || 0) + 1;
    sibling.hCost = calculateEuclideanDistance(sibling, goal);
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

  openList.splice(openList.indexOf(lowest), 1);

  return lowest;
}

function navigate_points(
  start: GridPoint,
  goal: GridPoint,
  nodes: Dictionary<GridPoint>
): GridPoint {
  const closedList: GridPoint[] = [];
  const openList: GridPoint[] = [];
  closedList.push(start);
  let foundGoal;

  while (!foundGoal) {
    if (closedList.length === 0) {
      throw new Error('bad closed list');
    }
    const nextNode = traverse_points(
      closedList[closedList.length - 1],
      goal,
      openList,
      closedList,
      nodes
    );

    closedList.push(nextNode);
    foundGoal = nextNode.id === goal.id ? nextNode : null;
  }

  return foundGoal;
}

function navigate_to_target(goal: GridPoint, origin: GridPoint) {
  let next: GridPoint | null = navigate_points(origin, goal, grid.dictionary);

  const path: GridPoint[] = [next];

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

  debug(path.map(p => p.id));
  const nextSquare = path[1];
  return nextSquare.id;
}

function game_state_read_sites(): Pre_Sites {
  const sites: Pre_Sites = {
    dictionary: {},
    array: []
  };

  const numSites = parseInt(readline());
  for (let i = 0; i < numSites; i++) {
    var inputs = readline().split(' ');
    const siteId = parseInt(inputs[0]);
    const x = parseInt(inputs[1]);
    const y = parseInt(inputs[2]);
    const radius = parseInt(inputs[3]);

    sites.dictionary[siteId] = makePreSite(x, y, siteId, radius);
    sites.array.push(sites.dictionary[siteId]);
  }
  return sites;
}

function game_state_get_state(preSites: Pre_Sites): GameState {
  const sites: Sites = {
    dictionary: {},
    array: []
  };

  const my_units: Units = {
    queen: undefined,
    archers: {
      dictionary: {},
      array: []
    },
    knights: {
      dictionary: {},
      array: []
    }
  };

  const enemy_units: Units = {
    queen: undefined,
    archers: {
      dictionary: {},
      array: []
    },
    knights: {
      dictionary: {},
      array: []
    }
  };

  var inputs = readline().split(' ');
  const gold = parseInt(inputs[0]);
  const touchedSite = parseInt(inputs[1]); // -1 if none
  for (let i = 0; i < preSites.array.length; i++) {
    var inputs = readline().split(' ');
    const siteId = parseInt(inputs[0]);
    const ignore1 = parseInt(inputs[1]); // used in future leagues
    const ignore2 = parseInt(inputs[2]); // used in future leagues
    const structureType = parseInt(inputs[3]); // -1 = No structure, 2 = Barracks
    const owner = parseInt(inputs[4]); // -1 = No structure, 0 = Friendly, 1 = Enemy
    const param1 = parseInt(inputs[5]);
    const param2 = parseInt(inputs[6]);

    const site = makeSite(
      preSites.dictionary[siteId],
      ignore1,
      ignore2,
      structureType,
      owner,
      param1,
      param2
    );
    sites.dictionary[siteId] = site;
    sites.array.push(site);
  }
  const numUnits = parseInt(readline());
  for (let i = 0; i < numUnits; i++) {
    var inputs = readline().split(' ');
    const x = parseInt(inputs[0]);
    const y = parseInt(inputs[1]);
    const owner = getOwner(parseInt(inputs[2]));
    const unitType = getUnitType(parseInt(inputs[3])); // -1 = QUEEN, 0 = KNIGHT, 1 = ARCHER
    const health = parseInt(inputs[4]);

    const unit = makeUnit(x, y, owner, unitType, health);
    if (owner === 'ENEMY') {
      if (unitType === 'ARCHER') {
        enemy_units.archers.dictionary[i] = unit;
        enemy_units.archers.array.push(unit);
      } else if (unitType === 'KNIGHT') {
        enemy_units.knights.dictionary[i] = unit;
        enemy_units.knights.array.push(unit);
      } else {
        enemy_units.queen = unit;
      }
    } else {
      if (unitType === 'ARCHER') {
        my_units.archers.dictionary[i] = unit;
        my_units.archers.array.push(unit);
      } else if (unitType === 'KNIGHT') {
        my_units.knights.dictionary[i] = unit;
        my_units.knights.array.push(unit);
      } else {
        my_units.queen = unit;
      }
    }
  }

  return {
    gold,
    touchedSite,
    sites,
    my_units,
    enemy_units
  };
}

function action_wait(): void {
  console.log('WAIT');
}
function action_move(x: number, y: number): void {
  console.log(`MOVE ${x} ${y}`);
}
function action_build(id: number, type: 'KNIGHT' | 'ARCHER'): void {
  console.log(`BUILD ${id} BARRACKS-${type}`);
}
function action_train(ids: number[]): void {
  console.log(['TRAIN', ...ids].join(' '));
}

function debug(d: any) {
  if (typeof d === 'string') {
    console.error(d);
  } else {
    console.error(JSON.stringify(d));
  }
}

const preSites = game_state_read_sites();
const game_board = {
  width: 1920,
  height: 1000
};
debug(new Date().getTime());
const grid = makeGrid(32, 64, preSites);
debug(new Date().getTime());

// game loop
while (true) {
  const game_state = game_state_get_state(preSites);
  const myQueen = game_state.my_units.queen!;
  const x = Math.round(myQueen.X / 64).toFixed(0);
  const y = Math.round(myQueen.Y / 32).toFixed(0);

  const targetPoint = grid.dictionary['60,4'];
  const queen = grid.dictionary[`${x},${y}`];

  debug(`target ${JSON.stringify(targetPoint)}`);
  debug(`queen ${JSON.stringify(queen)}`);

  const result = navigate_to_target(targetPoint, queen);
  debug(result);
  const resultArray = result.split(',');
  const rX = parseInt(resultArray[0], 10) * 64;
  const rY = parseInt(resultArray[1], 10) * 32;
  action_move(rX, rY);
  action_train([]);
  //   const enemyQueen = game_state.my_units.queen!;
  //   const neutralSites = game_state.sites.array
  //     .filter(s => s.owner === 'NO_OWNER')
  //     .sort((s1, s2) => {
  //       const s1dist = calculateEuclideanDistance(enemyQueen, s1);
  //       const s2dist = calculateEuclideanDistance(myQueen, s2);
  //       return s1dist - s2dist;
  //     });
  //   //   game_state.sites.array.forEach(s => debug(s));
  //   const mySites = game_state.sites.array.filter(s => s.owner === 'FRIENDLY');
  //   const myKights = mySites.filter(s => s.siteType === 'KNIGHT');
  //   const myArchers = mySites.filter(s => s.siteType === 'ARCHER');

  //   const knightCount = game_state.my_units.knights.array.length;
  //   const archerCount = game_state.my_units.archers.array.length;

  //   let target: Site = neutralSites[0];

  //   if (mySites.length >= 4) {
  //     if (knightCount > 0) {
  //       action_move(
  //         game_state.my_units.knights.array[0].X,
  //         game_state.my_units.knights.array[0].Y
  //       );
  //     } else {
  //       const secondClosest = mySites.sort((s1, s2) => {
  //         const s1dist = calculateEuclideanDistance(enemyQueen, s1);
  //         const s2dist = calculateEuclideanDistance(myQueen, s2);
  //         return s1dist - s2dist;
  //       })[0];
  //       action_move(secondClosest.X, secondClosest.Y);
  //     }
  //   } else if (game_state.touchedSite === target.id) {
  //     action_build(
  //       target.id,
  //       myKights.length < myArchers.length ? 'KNIGHT' : 'ARCHER'
  //     );
  //   } else {
  //     action_move(target.X, target.Y);
  //   }

  //   // Write an action using console.log()
  //   // To debug: console.error('Debug messages...');

  //   // First line: A valid queen action
  //   // Second line: A set of training instructions
  //   //   debug(mySites);
  //   const trainableKights: Site[] = myKights.filter(
  //     s => s.turnsTillNextTraining === 0
  //   );
  // //   debug(myArchers);
  //   const trainableArchers: Site[] = myArchers.filter(
  //     s => s.turnsTillNextTraining === 0
  //   );

  //   const sitesToTrain: Site[] = [];

  //   let moneyInitial = game_state.gold;
  //   let moneyLeft = game_state.gold;
  //   while (moneyLeft >= 80) {
  //     if (moneyLeft >= 80 && trainableKights.length > 0 && knightCount < 8) {
  //       sitesToTrain.push(trainableKights.pop() as Site);
  //       moneyLeft -= 80;
  //     }

  //     if (moneyLeft >= 100 && trainableArchers.length > 0 && archerCount < 8) {
  //       debug('should train archer');
  //       sitesToTrain.push(trainableArchers.pop() as Site);
  //       moneyLeft -= 100;
  //     }
  //     if (moneyLeft === moneyInitial) {
  //       break;
  //     }
  //   }

  //   action_train([...sitesToTrain.map(s => s.id)]);
}
