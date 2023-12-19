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

// surface is y 0
// bottom is y 10000
// left is x 0
// right is x 10000

declare function readline(): string;
declare function print(value: string): void;
declare function printErr(message: string): void;

function distanceBetweenPoints(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function arePointsInRange(p1: Point, p2: Point, range: number): boolean {
  return distanceBetweenPoints(p1, p2) <= range;
}

type Point = {
  x: number;
  y: number;
};

type CalculatedVector = [number, number];
class Vector {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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

class FishZone {
  id: number;
  Ymin: number;
  Ymax: number;
}

class Creature {
  creatureId: number;
  color: number;
  type: number;
  mScan: boolean = false;
  fScan: boolean = false;
  zone: FishZone;
  weight: number = 0;
  inGame: boolean = true;
  constructor(creatureId: number, color: number, type: number) {
    this.creatureId = creatureId;
    this.color = color;
    this.type = type;
  }
}

class RadarBlip {
  droneId: number;
  creatureId: number;
  radar: "TL" | "TR" | "BL" | "BR";
  constructor(droneId: number, creatureId: number, radar: string) {
    this.droneId = droneId;
    this.creatureId = creatureId;
    this.radar = radar as "TL" | "TR" | "BL" | "BR";
  }
}

class FishZones {
  zone1: FishZone = { id: 1, Ymin: 2500, Ymax: 500 };
  zone2: FishZone = { id: 2, Ymin: 5000, Ymax: 7500 };
  zone3: FishZone = { id: 3, Ymin: 7500, Ymax: 10000 };
}

class FishTypes {
  Fish1 = 0;
  Fish2 = 1;
  Fish3 = 2;
}

class Monster {
  creatureId: number;
  creatureX: number;
  creatureY: number;
  creatureVx: number;
  creatureVy: number;
  encountered: boolean = false;

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

  getVector(): Vector {
    return {
      startX: this.creatureX,
      endX: this.creatureX + this.creatureVx,
      startY: this.creatureY,
      endY: this.creatureY + this.creatureVy,
    };
  }

  getStartPositon(): { x: number; y: number } {
    return {
      x: this.creatureX,
      y: this.creatureY,
    };
  }

  getEndPosition(): { x: number; y: number } {
    return {
      x: this.creatureX + this.creatureVx,
      y: this.creatureY + this.creatureVy,
    };
  }

  getMonsterRectangle() {
    const startPos = this.getStartPositon();
    const endPos = this.getEndPosition();

    return {
      minX: Math.min(startPos.x, endPos.x),
      maxX: Math.max(startPos.x, endPos.x),
      minY: Math.min(startPos.y, endPos.y),
      maxY: Math.max(startPos.y, endPos.y),
    };
  }
}

class GameState {
  creatureCount: number;
  creatures: Creature[] = [];
  creatureDic: { [key: string]: Creature } = {};
  myScore: number;
  foeScore: number;
  myScanCount: number;
  myScannedCreatures: number[];
  foeScabCount: number;
  foeScannedCreatures: number[];
  myDrones: Drone[] = [];
  myDroneCount: number = this.myDrones.length;
  foeDrones: Drone[] = [];
  foeDroneCount: number = this.foeDrones.length;
  droneScans: { [key: number]: number[] } = {};
  visibleCreatures: VisibleCreature[];
  visibleCreaturesDic: { [key: string]: VisibleCreature } = {};
  radarBlips: RadarBlip[];
  targetFish: number[];
  turns: number = 0;

  monsters: { [key: number]: Monster } = {};

  constructor() {}

  shouldTurnOnLightOnTicks(): boolean {
    return this.turns % 3 === 0;
  }

  log(): void {
    // debug(`creatureCount ${JSON.stringify(this.creatureCount)}`);
    // debug(`creatures ${JSON.stringify(this.creatures)}`);
    // debug(`myScore ${JSON.stringify(this.myScore)}`);
    // debug(`foeScore ${JSON.stringify(this.foeScore)}`);
    // debug(`myScanCount ${JSON.stringify(this.myScanCount)}`);
    // debug(`myScannedCreatures ${JSON.stringify(this.myScannedCreatures)}`);
    // debug(`foeScabCount ${JSON.stringify(this.foeScabCount)}`);
    // debug(`foeScannedCreatures ${JSON.stringify(this.foeScannedCreatures)}`);
    // debug(`myDrones ${JSON.stringify(this.myDrones)}`);
    // debug(`myDroneCount ${JSON.stringify(this.myDroneCount)}`);
    // debug(`foeDrones ${JSON.stringify(this.foeDrones)}`);
    // debug(`foeDroneCount ${JSON.stringify(this.foeDroneCount)}`);
    // debug(`droneScans ${JSON.stringify(this.droneScans)}`);
    debug(`visibleCreatures ${JSON.stringify(this.visibleCreatures)}`);
    // debug(`radarBlips ${JSON.stringify(this.radarBlips)}`);
    debug(`monsters ${JSON.stringify(this.monsters)}`);
    // debug(`badGuys ${JSON.stringify(this.monsters)}`);
  }

  isMonsterWithinDroneRange(drone: Drone) {
    const monsters = this.creatures
      .filter((c) => c.type === -1)
      .map((c) => c.creatureId);

    const monstersVisible = this.visibleCreatures.filter((c) =>
      monsters.includes(c.creatureId)
    );

    return monstersVisible.length > 0;
  }

  getUnscannedCreatures(): number[] {
    const droneScans = this.myDrones.map((d) => d.scans).flat();
    const unscanned = this.creatures
      .filter((c) => c.type !== -1)
      .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
      .filter((c) => !droneScans.includes(c.creatureId))
      .map((c) => c.creatureId);

    // sort by weight
    const sorted = unscanned.sort((a, b) => {
      const creatureA = this.creatureDic[a];
      const creatureB = this.creatureDic[b];

      return creatureB.weight - creatureA.weight;
    });

    return sorted;
  }

  getZ1UnscannedCreatures(): number[] {
    const droneScans = this.myDrones.map((d) => d.scans).flat();
    return this.creatures
      .filter((c) => c.type !== -1)
      .filter((c) => c.zone.id === 1)
      .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
      .filter((c) => !droneScans.includes(c.creatureId))
      .filter((c) => !this.targetFish.includes(c.creatureId))
      .map((c) => c.creatureId);
  }

  hasZone1UnscannedCreatures(): boolean {
    return this.getZ1UnscannedCreatures().length > 0;
  }

  getZ2UnscannedCreatures(): number[] {
    const droneScans = this.myDrones.map((d) => d.scans).flat();
    return this.creatures
      .filter((c) => c.type !== -1)
      .filter((c) => c.zone.id === 2)
      .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
      .filter((c) => !droneScans.includes(c.creatureId))
      .filter((c) => !this.targetFish.includes(c.creatureId))
      .map((c) => c.creatureId);
  }

  hasZone2UnscannedCreatures(): boolean {
    return this.getZ2UnscannedCreatures().length > 0;
  }

  getZ3UnscannedCreatures(): number[] {
    const droneScans = this.myDrones.map((d) => d.scans).flat();
    return this.creatures
      .filter((c) => c.type !== -1)
      .filter((c) => c.zone.id === 3)
      .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
      .filter((c) => !droneScans.includes(c.creatureId))
      .filter((c) => !this.targetFish.includes(c.creatureId))
      .map((c) => c.creatureId);
  }

  hasZone3UnscannedCreatures(): boolean {
    return this.getZ3UnscannedCreatures().length > 0;
  }

  readGameState() {
    this.myScannedCreatures = [];
    this.foeScannedCreatures = [];
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
    this.updateMonsterFromVisibleCreatures();

    // update fishs with zone and scans
    this.creatures.forEach((c) => {
      switch (c.type) {
        case 0:
          c.zone = new FishZones().zone1;
          break;
        case 1:
          c.zone = new FishZones().zone2;
          break;
        case 2:
          c.zone = new FishZones().zone3;
          break;
      }

      c.mScan = this.myScannedCreatures.includes(c.creatureId);
      c.fScan = this.foeScannedCreatures.includes(c.creatureId);
    });

    this.removeClaimedFromScans();
    this.updateCreatureWeights();
    this.targetFish = [];

    this.turns++;
  }

  private removeClaimedFromScans() {
    const meClaimed = this.creatures
      .filter((c) => c.mScan)
      .map((c) => c.creatureId);
    this.myDrones.forEach((d) => {
      d.scans = d.scans.filter((s) => !meClaimed.includes(s));
    });

    const foeClaimed = this.creatures
      .filter((c) => c.fScan)
      .map((c) => c.creatureId);
    this.foeDrones.forEach((d) => {
      d.scans = d.scans.filter((s) => !foeClaimed.includes(s));
    });
  }

  updateMonsterFromVisibleCreatures() {
    const visibleMonsters = this.visibleCreatures.filter(
      (c) => this.creatureDic[c.creatureId].type === -1
    );

    visibleMonsters.forEach((monster) => {
      this.monsters[monster.creatureId].creatureVx = monster.creatureVx;
      this.monsters[monster.creatureId].creatureVy = monster.creatureVy;
      this.monsters[monster.creatureId].creatureX = monster.creatureX;
      this.monsters[monster.creatureId].creatureY = monster.creatureY;
      this.monsters[monster.creatureId].encountered = true;
    });

    // Only estimate detected monsters
    const nonVisibleMonsters = Object.values(this.monsters).filter(
      (m) => !visibleMonsters.includes(m) && m.encountered
    );

    this.estimateMonsterPosition(nonVisibleMonsters);
  }

  estimateMonsterPosition(monsters: Monster[]) {
    // update the monsters vector based on the last known position and velocity
    // if the monster reaches and edge the velocity is reversed

    // the boundaries are 0, 1000

    monsters.forEach((m) => {
      if (m.creatureX === 0 || m.creatureX === 10000) {
        m.creatureVx = m.creatureVx * -1;
      }

      if (m.creatureY === 0 || m.creatureY === 10000) {
        m.creatureVy = m.creatureVy * -1;
      }

      m.creatureX = m.creatureX + m.creatureVx;
      m.creatureY = m.creatureY + m.creatureVy;
    });
  }

  readCreatureCount() {
    const creatureCount: number = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
      var inputs: string[] = readline().split(" ");
      const creatureId: number = parseInt(inputs[0]);
      const color: number = parseInt(inputs[1]);
      const type: number = parseInt(inputs[2]);
      this.creatures.push(new Creature(creatureId, color, type));
      this.creatureDic[creatureId] = new Creature(creatureId, color, type);
      if (type === -1) {
        this.monsters[creatureId] = new Monster(creatureId, 0, 0, 0, 0);
      }
    }
  }

  private updateCreatureWeights() {
    const scannedCreatures = this.myScannedCreatures;
    const creaturesInTank = this.myDrones.map((d) => d.scans).flat();

    const allScannedCreatureIds = [...scannedCreatures, ...creaturesInTank];
    const allScannedCreatures = allScannedCreatureIds.map(
      (c) => this.creatureDic[c]
    );

    this.creatures.forEach((c) => {
      // check if we have a scanned creature of the same type

      const scannedCreature = allScannedCreatures.find(
        (s) => s.type === c.type
      );

      // check if we have a scanned creature of the same color

      const scannedCreatureColor = allScannedCreatures.find(
        (s) => s.color === c.color
      );

      const hasSameTypeScanned = !!scannedCreature;
      const hasSameColorScanned = !!scannedCreatureColor;

      if (hasSameTypeScanned && hasSameColorScanned) {
        c.weight = 5;
      } else if (hasSameTypeScanned) {
        c.weight = 2;
      } else if (hasSameColorScanned) {
        c.weight = 1;
      }
    });
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
      // add new drones
      if (this.myDrones.length < myDroneCount) {
        this.myDrones.push(
          new Drone(droneId, droneX, droneY, emergency, battery)
        );
      } else {
        // update existing drones
        const d = this.myDrones.find((d) => d.droneId === droneId);
        if (!d) throw new Error("Drone not found");
        d.droneX = droneX;
        d.droneY = droneY;
        d.emergency = emergency;
        d.battery = battery;
      }
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

      // add new drones
      if (this.foeDrones.length < foeDroneCount) {
        this.foeDrones.push(
          new Drone(droneId, droneX, droneY, emergency, battery)
        );
      } else {
        // update existing drones
        const d = this.foeDrones.find((d) => d.droneId === droneId);
        if (!d) throw new Error("Drone not found");
        d.droneX = droneX;
        d.droneY = droneY;
        d.emergency = emergency;
        d.battery = battery;
      }
    }
  }

  private readDroneScans() {
    const droneScanCount: number = parseInt(readline());

    for (let i = 0; i < droneScanCount; i++) {
      var inputs: string[] = readline().split(" ");
      const droneId: number = parseInt(inputs[0]);
      const creatureId: number = parseInt(inputs[1]);
      if (!this.droneScans[droneId]) this.droneScans[droneId] = [];
      if (!this.droneScans[droneId].includes(creatureId)) {
        this.droneScans[droneId].push(creatureId);
      }

      let drone = this.myDrones.find((d) => d.droneId === droneId);
      if (!drone) {
        drone = this.foeDrones.find((d) => d.droneId === droneId);
      }
      if (!drone) throw new Error("Drone not found");
      if (!drone.scans.includes(creatureId)) {
        drone.scans.push(creatureId);
      }
    }
  }

  private readVisibleCreatures() {
    this.visibleCreaturesDic = {};
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
      this.visibleCreaturesDic[creatureId] = new VisibleCreature(
        creatureId,
        creatureX,
        creatureY,
        creatureVx,
        creatureVy
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

interface DroneStrategy {
  completed: boolean;
  nextPosition(): Point | undefined;
}

class DiveAndRise implements DroneStrategy {
  distanceToPoint: number = 650;
  completed: boolean = false;
  points: Point[] = [];

  constructor(
    points: Point[],
    private drone: Drone
  ) {
    this.points = points;
  }

  nextPosition(): Point | undefined {
    const dronePosition = this.drone.getPosition();
    const nextPoint = this.points[0];

    if (!nextPoint) return undefined;

    if (arePointsInRange(dronePosition, nextPoint, this.distanceToPoint)) {
      this.points.shift();
    }

    if (!this.points.length) {
      this.completed = true;
      return undefined;
    }

    return nextPoint;
  }
}

class Drone {
  droneId: number;
  droneX: number;
  droneY: number;
  emergency: number;
  battery: number;
  scans: number[] = [];

  initialX: number;
  targetPoition: { x: number; y: number } = { x: 0, y: 0 };
  isLeft: boolean;

  strategy: DroneStrategy;

  resetTank() {
    this.scans = [];
  }

  targetLocation: Point = { x: 0, y: 0 };
  shouldTurnOnLight: boolean = false;
  shouldWait: boolean = false;

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

    this.initialX = droneX;
  }

  getPosition(): Point {
    return {
      x: this.droneX,
      y: this.droneY,
    };
  }

  wait(light: boolean, message: string = "") {
    console.log(`WAIT ${light ? 1 : 0} ${message}`);
  }

  move(x: number, y: number, light: boolean, message: string = "") {
    console.log(`MOVE ${x} ${y} ${light ? 1 : 0} ${message}`);
  }

  debugPosition() {
    debug(
      `Drone ${this.droneId} target ${this.targetLocation.x} ${this.targetLocation.y}`
    );
    debug(
      `Drone ${this.droneId} currentPosition ${this.targetLocation.x} ${this.targetLocation.y}`
    );
  }

  execute(debug: boolean): void {
    const nextTarget = this.strategy.nextPosition();

    if (debug) this.debugPosition();

    if (!nextTarget) {
      this.targetLocation = { x: -1, y: -1 };
      this.wait(this.shouldTurnOnLight);
      return;
    }

    this.targetLocation = nextTarget;

    if (debug) this.debugPosition();

    this.move(
      this.targetLocation.x,
      this.targetLocation.y,
      this.shouldTurnOnLight
    );
  }
}

const gameState = new GameState();
gameState.readCreatureCount();

// game loop
while (true) {
  gameState.readGameState();
  gameState.log();

  const myDrones = gameState.myDrones;

  if (gameState.turns === 1) {
    // set drone strategies
    myDrones.forEach((d) => {
      d.strategy = new DiveAndRise(
        [
          { x: 1300, y: 3000 },
          // { x: 8500, y: 3000 },
          // { x: 8500, y: 500 },
        ],
        d
      );
    });
  }

  myDrones.forEach((d) => {
    d.shouldTurnOnLight = false;
    d.execute(true);
  });
}

function debug(message: string) {
  printErr(message);
}
