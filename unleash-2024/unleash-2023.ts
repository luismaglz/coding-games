declare function readline(): string;
declare function print(value: string): void;
declare function printErr(message: string): void;

class mNode {
  x: number;
  y: number;
  cost: number;
  heuristic: number;
  parent: mNode | null;

  constructor(
    x: number,
    y: number,
    cost = 0,
    heuristic = 0,
    parent: mNode | null = null
  ) {
    this.x = x;
    this.y = y;
    this.cost = cost;
    this.heuristic = heuristic;
    this.parent = parent;
  }
}

function aStar(
  start: mNode,
  goal: mNode,
  grid: number[][]
): (number[] | null)[] | null {
  const openList: [number, mNode][] = [];
  const closedList: Set<string> = new Set();
  openList.push([start.cost + start.heuristic, start]);

  while (openList.length > 0) {
    openList.sort((a, b) => a[0] - b[0]);
    const current = openList.shift()![1];

    if (current.x === goal.x && current.y === goal.y) {
      const path: (number[] | null)[] = [];
      let temp: mNode | null = current;
      while (temp) {
        path.push([temp.x, temp.y]);
        temp = temp.parent;
      }
      return path.reverse();
    }

    closedList.add(`${current.x},${current.y}`);

    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const x = current.x + dx;
      const y = current.y + dy;
      if (
        x >= 0 &&
        x < grid.length &&
        y >= 0 &&
        y < grid[0].length &&
        grid[x][y] === 0
      ) {
        const neighbor = new mNode(
          x,
          y,
          current.cost + 1,
          Math.abs(goal.x - x) + Math.abs(goal.y - y),
          current
        );
        if (closedList.has(`${x},${y}`)) continue;
        openList.push([neighbor.cost + neighbor.heuristic, neighbor]);
      }
    }
  }

  return null;
}

type EntityTypes =
  | "WALL"
  | "ROOT"
  | "BASIC"
  | "TENTACLE"
  | "HARVESTER"
  | "SPORER"
  | "A"
  | "B"
  | "C"
  | "D";

type EntityLetter = "A" | "B" | "C" | "D";

interface Coord {
  x: number;
  y: number;
}
class Entity {
  x: number;
  y: number;
  type: EntityTypes;
  owner: number;
  organId: number;
  organDir: string;
  organParentId: number;
  organRootId: number;
}

class GameState {
  direction: Coord = { x: 0, y: 0 };

  width: number;
  height: number;

  entities: Entity[] = [];

  grid: number[][];

  myA: number;
  myB: number;
  myC: number;
  myD: number;

  oppA: number;
  oppB: number;
  oppC: number;
  oppD: number;

  haveA: boolean = false;
  haveB: boolean = false;
  haveC: boolean = false;
  haveD: boolean = false;

  availableMoves: {
    entity: Entity;
    action: "GROW" | "HARVEST";
    letter: Entity | undefined;
    coords: Coord;
  }[] = [];

  harvestable: {
    entity: Entity;
    letter: Entity;
  };

  letterTarget: { [key: number]: EntityLetter };
  entityDictByCoords: { [key: string]: Entity } = {};

  requiredActionsCount: number;

  turns = 0;

  constructor(height: number, width: number) {
    this.width = width;
    this.height = height;
    this.createGrid(width, height);
  }

  createGrid(width: number, height: number): void {
    // create the grid
    this.grid = new Array(height).fill(0).map(() => new Array(width).fill(0));
  }

  createAvailableMoves(entities: Entity[]): {
    entity: Entity;
    action: "GROW" | "HARVEST";
    letter: Entity | undefined;
    coords: Coord;
  }[] {
    let availableMoves: {
      entity: Entity;
      action: "GROW" | "HARVEST";
      letter: Entity | undefined;
      coords: Coord;
    }[] = [];

    entities.forEach((e) => {
      const top = this.getEntity(e.x, e.y - 1);
      const bottom = this.getEntity(e.x, e.y + 1);
      const left = this.getEntity(e.x - 1, e.y);
      const right = this.getEntity(e.x + 1, e.y);

      if (!top) {
        availableMoves.push({
          entity: e,
          action: "GROW",
          letter: undefined,
          coords: { x: e.x, y: e.y - 1 },
        });
      }

      if (!bottom) {
        availableMoves.push({
          entity: e,
          action: "GROW",
          letter: undefined,
          coords: { x: e.x, y: e.y + 1 },
        });
      }

      if (!left) {
        availableMoves.push({
          entity: e,
          action: "GROW",
          letter: undefined,
          coords: { x: e.x - 1, y: e.y },
        });
      }

      if (!right) {
        availableMoves.push({
          entity: e,
          action: "GROW",
          letter: undefined,
          coords: { x: e.x + 1, y: e.y },
        });
      }
    });

    availableMoves = availableMoves.filter(
      (e) =>
        e.coords.x >= 0 &&
        e.coords.x <= this.width &&
        e.coords.y >= 0 &&
        e.coords.y <= this.height
    );

    return availableMoves;
  }

  createHarvestableMoves(): void {
    const allTheLetters = this.getTheLetters();
    const availableMoves = this.createAvailableMoves(allTheLetters);

    // find availableHarvesters that collied my moves
    availableMoves.forEach((harvestableMove) => {
      this.availableMoves.some((myAvailableMove) => {
        if (
          myAvailableMove.coords.x === harvestableMove.coords.x &&
          myAvailableMove.coords.y === harvestableMove.coords.y
        ) {
          myAvailableMove.action = "HARVEST";
          myAvailableMove.letter = harvestableMove.entity;
        }
      });
    });
  }

  updateGameState() {
    this.entities = [];
    this.letterTarget = {};
    this.availableMoves = [];

    const entityCount: number = parseInt(readline());
    for (let i = 0; i < entityCount; i++) {
      var inputs: string[] = readline().split(" ");
      const x: number = parseInt(inputs[0]);
      const y: number = parseInt(inputs[1]); // grid coordinate
      const type: string = inputs[2]; // WALL, ROOT, BASIC, TENTACLE, HARVESTER, SPORER, A, B, C, D
      const owner: number = parseInt(inputs[3]); // 1 if your organ, 0 if enemy organ, -1 if neither
      const organId: number = parseInt(inputs[4]); // id of this entity if it's an organ, 0 otherwise
      const organDir: string = inputs[5]; // N,E,S,W or X if not an organ
      const organParentId: number = parseInt(inputs[6]);
      const organRootId: number = parseInt(inputs[7]);

      const entity = new Entity();
      entity.x = x;
      entity.y = y;
      entity.type = type as EntityType;
      entity.owner = owner;
      entity.organId = organId;
      entity.organDir = organDir;
      entity.organParentId = organParentId;
      entity.organRootId = organRootId;

      this.entities.push(entity);
    }

    var inputs: string[] = readline().split(" ");
    this.myA = parseInt(inputs[0]);
    this.myB = parseInt(inputs[1]);
    this.myC = parseInt(inputs[2]);
    this.myD = parseInt(inputs[3]); // your protein stock

    var inputs: string[] = readline().split(" ");
    this.oppA = parseInt(inputs[0]);
    this.oppB = parseInt(inputs[1]);
    this.oppC = parseInt(inputs[2]);
    this.oppD = parseInt(inputs[3]); // opponent's protein stock

    this.requiredActionsCount = parseInt(readline()); // your number of organisms, output an action for each one in any order

    const myEntities = this.entities.filter((e) => e.owner === 1);
    this.availableMoves = this.createAvailableMoves(myEntities);
    this.createHarvestableMoves();
    this.availableMoves = this.availableMoves.filter((a) => {
      return !this.entities.some(
        (e) => e.x === a.coords.x && e.y === a.coords.y
      );
    });

    this.turns++;
  }

  findClosestLetter(organ: Entity): Entity {
    const letters = this.getTheLetters();

    // console.log(JSON.stringify(letters));

    const distanceArray = letters.map((l) => {
      return calculateDistance(organ.x, organ.y, l.x, l.y);
    });

    const minIndex = findIndexOfMin(distanceArray);

    return letters[minIndex];
  }

  findCLosestLetterAndOrgan(rootId: number): {
    organ: Entity;
    letter: Entity;
    distance: number;
  } {
    const organLetterCombo: {
      organ: Entity;
      letter: Entity;
      distance: number;
    }[] = [];
    const letters = this.getTheLetters();

    this.entities
      .filter((e) => e.organRootId === rootId)
      .forEach((e) => {
        letters.forEach((l) => {
          organLetterCombo.push({
            organ: e,
            letter: l,
            distance: calculateDistance(e.x, e.y, l.x, l.y),
          });
        });
      });

    let closest = organLetterCombo[0];

    organLetterCombo.forEach((o) => {
      if (o.distance <= closest.distance) {
        closest = o;
      }
    });

    return closest;
  }

  getTheLetters(): Entity[] {
    const letters = this.entities.filter((e) => {
      return (
        e.type === "A" || e.type === "B" || e.type === "C" || e.type === "D"
      );
    });

    return letters;
  }

  getEntitiesThatCanGrow(rootId: number): {
    entity: Entity;
    availableDirections: Direction[];
  }[] {
    const entitiesWithDirections: {
      entity: Entity;
      availableDirections: Direction[];
    }[] = [];
    const myEntities = this.entities.filter(
      (e) =>
        e.owner === 1 &&
        (e.type === "BASIC" || e.type === "ROOT") &&
        e.organRootId === rootId
    );

    myEntities.forEach((e) => {
      const top = this.getEntity(e.x, e.y + 1);
      const bottom = this.getEntity(e.x, e.y - 1);
      const left = this.getEntity(e.x - 1, e.y);
      const right = this.getEntity(e.x + 1, e.y);

      const directions: Direction[] = [
        top || "TOP",
        bottom || "BOTTOM",
        left || "LEFT",
        right || "RIGHT",
      ].filter((e) => typeof e === "string") as Direction[];

      if (directions.length > 0) {
        entitiesWithDirections.push({
          entity: e,
          availableDirections: [...directions],
        });
      }
    });

    return entitiesWithDirections;
  }

  getEntity(x: number, y: number): Entity | undefined {
    return this.entities.find((e) => e.x === x && e.y === y);
  }

  areThereLetters(): boolean {
    return this.getTheLetters().length > 0;
  }

  doWeHaveHarvester(): boolean {
    return this.entities.some((e) => e.owner === 1 && e.type === "HARVESTER");
  }

  getRoot(): Entity {
    return this.entities.find(
      (e) => e.type === "ROOT" && e.owner === 1
    ) as Entity;
  }

  getSpore(): Entity {
    return this.entities.find(
      (e) => e.type === "SPORER" && e.owner === 1
    ) as Entity;
  }

  getRoots(): Entity[] {
    return this.entities.filter((e) => e.type === "ROOT" && e.owner === 1);
  }

  can_Spore(): boolean {
    return gameState.myB > 1 && gameState.myD > 1;
  }

  bestInitialDirection(entity: Entity): {
    coord: Coord;
    direction: CardinalDirection;
  } {
    const entityX = entity.x;
    const entityY = entity.y;

    // i want to find the direction which has the most empty squares in a clear path
    // i will check the left, right, top and bottom of the entity

    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;

    // check left
    for (let x = entityX - 1; x >= 0; x--) {
      if (this.entityDictByCoords[`${x}-${entityY}`] === undefined) {
        left++;
      } else {
        break;
      }
    }

    // check right
    for (let x = entityX + 1; x < this.width; x++) {
      if (this.entityDictByCoords[`${x}-${entityY}`] === undefined) {
        right++;
      } else {
        break;
      }
    }

    // check top
    for (let y = entityY + 1; y < this.height; y++) {
      if (this.entityDictByCoords[`${entityX}-${y}`] === undefined) {
        top++;
      } else {
        break;
      }
    }

    // check bottom
    for (let y = entityY - 1; y >= 0; y--) {
      if (this.entityDictByCoords[`${entityX}-${y}`] === undefined) {
        bottom++;
      } else {
        break;
      }
    }

    // return the furthest square
    const max = Math.max(left, right, top, bottom);

    if (max === left) {
      return { coord: { x: entityX - left, y: entityY }, direction: "W" };
    } else if (max === right) {
      return { coord: { x: entityX + right, y: entityY }, direction: "E" };
    } else if (max === top) {
      return { coord: { x: entityX, y: entityY + top }, direction: "N" };
    } else if (max === bottom) {
      return {
        coord: { x: entityX, y: entityY - bottom },
        direction: "S",
      };
    }

    return { coord: { x: entityX, y: entityY }, direction: "E" };
  }

  createHarvester(organ: Entity, letter: Entity, coord: Coord) {
    const direction = getDirectionForHarvester(coord, letter);
    console.log(
      `GROW ${organ.organId} ${coord.x} ${coord.y} HARVESTER ${direction}`
    );
  }
}

type CardinalDirection = "N" | "E" | "S" | "W";

type Direction = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

type EntityType =
  | "WALL"
  | "ROOT"
  | "BASIC"
  | "TENTACLE"
  | "HARVESTER"
  | "SPORER"
  | "A"
  | "B"
  | "C"
  | "D";

function findIndexOfMin(arr: number[]): number {
  return arr.reduce(
    (minIndex, currentValue, currentIndex, array) =>
      currentValue < array[minIndex] ? currentIndex : minIndex,
    0
  );
}

function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function moveEntity(entity: Entity, direction: Direction, type: EntityType) {
  let x = entity.x;
  let y = entity.y;

  switch (direction) {
    case "LEFT": {
      x = x - 1;
      break;
    }
    case "BOTTOM": {
      y = y - 1;
      break;
    }
    case "RIGHT": {
      x = x + 1;
      break;
    }
    case "TOP": {
      y = y + 1;
      break;
    }
  }

  console.log(`GROW ${entity.organId} ${x} ${y} ${type} ${gameState.turns}`);
}

function grow_x_y(id: number, x: number, y: number) {
  console.log(`GROW ${id} ${x} ${y} BASIC`);
}

function createTentacle(entity: Entity, direction: Direction) {
  let x = entity.x;
  let y = entity.y;

  switch (direction) {
    case "LEFT": {
      x = x - 1;
      break;
    }
    case "BOTTOM": {
      y = y - 1;
      break;
    }
    case "RIGHT": {
      x = x + 1;
      break;
    }
    case "TOP": {
      y = y + 1;
      break;
    }
  }

  console.log(`GROW ${entity.organId} ${x} ${y} TENTACLE E ${gameState.turns}`);
}

function getDirectionForHarvester(
  entity: Coord,
  letter: Entity
): "W" | "N" | "E" | "S" {
  if (entity.x < letter.x) {
    return "E";
  }

  if (entity.x > letter.x) {
    return "W";
  }

  if (entity.y > letter.y) {
    return "N";
  }

  if (entity.y < letter.y) {
    return "S";
  }

  return "W";
}

function moveToLetter(organ: Entity, letter: Entity) {
  if (organ.x < letter.x) {
    return moveEntity(organ, "RIGHT", "BASIC");
  }

  if (organ.x > letter.x) {
    return moveEntity(organ, "LEFT", "BASIC");
  }

  if (organ.y < letter.y) {
    return moveEntity(organ, "TOP", "BASIC");
  }

  if (organ.x > letter.x) {
    return moveEntity(organ, "BOTTOM", "BASIC");
  }
}

function shootSporeCoord(organ: Entity, coord: Coord) {
  console.log(
    `SPORE ${organ.organId} ${coord.x} ${coord.y} ${gameState.turns}`
  );
}

function createSpore(entity: Entity, direction: CardinalDirection) {
  console.log(
    `GROW ${entity.organId} ${entity.x + 1} ${entity.y} SPORER ${direction} ${
      gameState.turns
    }`
  );
}

/**
 * Grow and multiply your organisms to end up larger than your opponent.
 **/

var inputs: string[] = readline().split(" ");
const width: number = parseInt(inputs[0]); // columns in the game grid
const height: number = parseInt(inputs[1]); // rows in the game grid

const gameState = new GameState(height, width);

// game loop
while (true) {
  gameState.updateGameState();

  const roots = gameState.getRoots();
  for (let i = 0; i < gameState.requiredActionsCount; i++) {
    // HARVEST
    if (gameState.availableMoves[i]) {
      const harvestable = gameState.availableMoves.find(
        (e) => e.action === "HARVEST" && e.letter !== undefined
      );
      if (harvestable) {
        gameState.createHarvester(
          harvestable.entity,
          harvestable.letter!,
          harvestable.coords
        );
      } else {
        const availableMove = gameState.availableMoves[i];
        grow_x_y(
          availableMove.entity.organId,
          availableMove.coords.x,
          availableMove.coords.y
        );
      }
    } else {
      console.log("WAIT");
    }
  }
}
