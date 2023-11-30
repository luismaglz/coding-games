// Game Protocol
// Initialization Input
// First line: creatureCount an integer for the number of creatures in the game zone. Will always be 12.
// Next creatureCount lines: 3 integers describing each creature:
// creatureId for this creature's unique id.
// color (0 to 3) and type (0 to 2).
// Input for One Game Turn
// Next line: myScore for you current score.
// Next line: foeScore for you opponent's score.

// Next line: myScanCount for your amount of saved scans.
// Next myScanCount lines: creatureId for each scan scored.

// Next line: foeScanCount for your opponent's amount of saved scans.
// Next foeScanCount lines: creatureId for each scan scored by your opponent.

// Next line: myDroneCount for the number of drones you control.
// Next myDroneCount lines:
// droneId: this drone's unique id.
// droneX and droneY: this drone's position.
// emergency: unused in this league.
// battery: this drone's current battery level.
// Next line: foeDroneCount for the number of drones your opponent controls.
// Next foeDroneCount lines:
// droneId: this drone's unique id.
// droneX and droneY: this drone's position.
// emergency: unused in this league.
// battery: this drone's current battery level.
// Next line: droneScanCount for the amount of scans currently within a drone.
// Next droneScanCount lines: droneId and creatureId describing which drone contains a scan of which fish.

// Next line: visibleCreatureCount the number of creatures within the light radius of your drones.
// Next visibleCreatureCount lines:
// creatureId: this creature's unique id.
// creatureX and creatureY: this creature's position.
// creatureVx and creatureVy: this creature's current speed.
// Next line: radarBlipCount.
// Next radarBlipCount lines: Two integers droneId, creatureId and a string radar indicating the relative position between each creature and each one of your drones. radar can be:
// TL: the creature is to the top-left of the drone.
// TR: the creature is to the top-right of the drone.
// BR: the creature is to the bottom-right of the drone.
// BL: the creature is to the bottom-left of the drone.

declare function readline(): string;
declare function print(value: string): void;
declare function printErr(message: string): void;

class GameState {
  creatureCount: number;
  creatures: Creature[] = [];
  myScore: number;
  foeScore: number;
  myScanCount: number;
  myScannedCreatures: number[];
  foeScabCount: number;
  foeScannedCreatures: number[];
  myDroneCount: number;
  foeDroneCount: number;
  myDrones: Drone[];
  foeDrones: Drone[];
  droneScans: { [key: number]: number[] };
  visibleCreatures: VisibleCreature[];
  radarBlips: RadarBlip[];
  constructor() {}

  readGameState() {
    // this.readCreatureCount();
    this.myScannedCreatures = [];
    this.foeScannedCreatures = [];
    this.myDrones = [];
    this.foeDrones = [];
    this.visibleCreatures = [];
    this.radarBlips = [];

    this.readMyScore();
    this.readFoeScore();
    this.readMyScanCount();
    this.readFoeScanCount();
    this.readMyDrones();
    this.readFoeDrones();
    this.readDroneScans();
    this.readVisibleCreatures();
    this.readRadarBlips();
  }
  readCreatureCount() {
    const creatureCount: number = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
      var inputs: string[] = readline().split(" ");
      const creatureId: number = parseInt(inputs[0]);
      const color: number = parseInt(inputs[1]);
      const type: number = parseInt(inputs[2]);
      this.creatures.push(new Creature(creatureId, color, type));
    }
  }

  private readMyScore() {
    this.myScore = parseInt(readline());
  }

  private readFoeScore() {
    this.foeScore = parseInt(readline());
  }

  private readMyScanCount() {
    const myScanCount: number = parseInt(readline());
    for (let i = 0; i < myScanCount; i++) {
      const creatureId: number = parseInt(readline());
      this.myScannedCreatures.push(creatureId);
    }
  }

  private readFoeScanCount() {
    const foeScanCount: number = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
      const creatureId: number = parseInt(readline());
      this.foeScannedCreatures.push(creatureId);
    }
  }

  private readMyDrones() {
    const myDroneCount: number = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
      var inputs: string[] = readline().split(" ");
      const droneId: number = parseInt(inputs[0]);
      const droneX: number = parseInt(inputs[1]);
      const droneY: number = parseInt(inputs[2]);
      const emergency: number = parseInt(inputs[3]);
      const battery: number = parseInt(inputs[4]);
      this.myDrones.push(
        new Drone(droneId, droneX, droneY, emergency, battery)
      );
    }
  }

  private readFoeDrones() {
    const foeDroneCount: number = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
      var inputs: string[] = readline().split(" ");
      const droneId: number = parseInt(inputs[0]);
      const droneX: number = parseInt(inputs[1]);
      const droneY: number = parseInt(inputs[2]);
      const emergency: number = parseInt(inputs[3]);
      const battery: number = parseInt(inputs[4]);
      this.foeDrones.push(
        new Drone(droneId, droneX, droneY, emergency, battery)
      );
    }
  }

  private readDroneScans() {
    const droneScanCount: number = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
      var inputs: string[] = readline().split(" ");
      const droneId: number = parseInt(inputs[0]);
      const creatureId: number = parseInt(inputs[1]);
      this.droneScans[droneId].push(creatureId);
    }
  }

  private readVisibleCreatures() {
    const visibleCreatureCount: number = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
      var inputs: string[] = readline().split(" ");
      const creatureId: number = parseInt(inputs[0]);
      const creatureX: number = parseInt(inputs[1]);
      const creatureY: number = parseInt(inputs[2]);
      const creatureVx: number = parseInt(inputs[3]);
      const creatureVy: number = parseInt(inputs[4]);
      this.visibleCreatures.push(
        new VisibleCreature(
          creatureId,
          creatureX,
          creatureY,
          creatureVx,
          creatureVy
        )
      );
    }
  }

  private readRadarBlips() {
    const radarBlipCount: number = parseInt(readline());
    for (let i = 0; i < radarBlipCount; i++) {
      var inputs: string[] = readline().split(" ");
      const droneId: number = parseInt(inputs[0]);
      const creatureId: number = parseInt(inputs[1]);
      const radar: string = inputs[2];
      this.radarBlips.push(new RadarBlip(droneId, creatureId, radar));
    }
  }
}

class Drone {
  droneId: number;
  droneX: number;
  droneY: number;
  emergency: number;
  battery: number;
  constructor(
    droneId: number,
    droneX: number,
    droneY: number,
    emergency: number,
    battery: number
  ) {
    this.droneId = droneId;
    this.droneX = droneX;
    this.droneY = droneY;
    this.emergency = emergency;
    this.battery = battery;
  }

  wait(light: boolean) {
    console.log(`WAIT ${light ? 1 : 0}`);
  }

  move(x: number, y: number, light: boolean) {
    console.log(`MOVE ${x} ${y} ${light ? 1 : 0}`);
  }
}

class VisibleCreature {
  creatureId: number;
  creatureX: number;
  creatureY: number;
  creatureVx: number;
  creatureVy: number;
  constructor(
    creatureId: number,
    creatureX: number,
    creatureY: number,
    creatureVx: number,
    creatureVy: number
  ) {
    this.creatureId = creatureId;
    this.creatureX = creatureX;
    this.creatureY = creatureY;
    this.creatureVx = creatureVx;
    this.creatureVy = creatureVy;
  }
}

class Creature {
  creatureId: number;
  color: number;
  type: number;
  constructor(creatureId: number, color: number, type: number) {
    this.creatureId = creatureId;
    this.color = color;
    this.type = type;
  }
}

class RadarBlip {
  droneId: number;
  creatureId: number;
  radar: string;
  constructor(droneId: number, creatureId: number, radar: string) {
    this.droneId = droneId;
    this.creatureId = creatureId;
    this.radar = radar;
  }
}

class FishZones {
  zone1: FishZone = { Ymin: 2500, Ymax: 500 };
  zone2: FishZone = { Ymin: 5000, Ymax: 7500 };
  zone3: FishZone = { Ymin: 7500, Ymax: 10000 };
}

class GameBoard {
  minX: number = 1;
  minY: number = 1;
  maxX: number = 9999;
  maxY: number = 9999;
}

interface FishZone {
  Ymin: number;
  Ymax: number;
}

const gameState = new GameState();
gameState.readCreatureCount();

// game loop
while (true) {
  gameState.readGameState();
  printErr(JSON.stringify(gameState));
  for (let i = 0; i < gameState.myDroneCount; i++) {
    var drone = gameState.myDrones[i];

    // if we're higher than

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    console.log("WAIT 1"); // MOVE <x> <y> <light (1|0)> | WAIT <light (1|0)>
  }
}
