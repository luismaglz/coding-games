declare function readline(): string;
declare function print(value: string): void;
declare function printErr(message: string): void;

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
  width: number;
  height: number;

  entities: Entity[] = [];

  myA: number;
  myB: number;
  myC: number;
  myD: number;

  oppA: number;
  oppB: number;
  oppC: number;
  oppD: number;

  requiredActionsCount: number;

  turns = 0;

  constructor(height: number, width: number) {
    this.width = width;
    this.height = height;
  }

  updateGameState() {
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
      entity.type = type;
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
  }

  findClosestLetter(organ: Entity): Entity {
    const letters = this.entities.filter((e) => {
      e.type === "A" || e.type === "B" || e.type === "C" || e.type === "D";
    });

    const distanceArray = letters.map((l) => {
      return distanceArray(organ.x, organ.y, l.x, l.y);
    });

    const min = Math.min(distanceArray);

    const index = distanceArray.findIndex(min);

    return letters[index];
  }

  goToClosestLetterAndOrgan(): { organ: Entity; letter: Entity } {
    const organ = this.getRightMostEntity();
    const letter = this.findClosestLetter(organ);

    return {
      organ,
      letter,
    };
  }

  getRightMostEntity(): Entity {
    // get the entity with the rightmost position

    const myEnts = this.entities.filter((e) => {
      return e.owner === 1;
    });

    let entity: Entity | null = null;

    myEnts.forEach((e) => {
      if (entity === null) {
        entity = e;
      }

      if (entity.x <= e.x) {
        entity = e;
      }
    });

    return entity!;
  }
}

type Direction = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";
type EntityType = "BASIC" | "ROOT";

function distance(x1: number, y1: number, x2: number, y2: number): number {
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

  console.log(`GROW ${entity.organId} ${x} ${y} ${type}`);
}

function moveToLetter(organ: Entity, letter: Entity) {
  if (organ.x < letter.x) {
    return moveEntity(organ, "RIGHT", "BASIC");
  }

  if (organ.x > letter.x) {
    return moveEntity(organ, "LEFT", "BASIC");
  }

  if (organ.y < letter.y) {
    return moveEntity(organ, "BOTTOM", "BASIC");
  }

  if (organ.x > letter.x) {
    return moveEntity(organ, "TOP", "BASIC");
  }
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
  // Read all the game inputs
  gameState.updateGameState();

  for (let i = 0; i < gameState.requiredActionsCount; i++) {
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    const { organ, letter } = gameState.goToClosestLetterAndOrgan();

    moveToLetter(organ, letter);

    // console.log("WAIT" + gameState.requiredActionsCount);
  }
}
