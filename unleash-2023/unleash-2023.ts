// seed=-3331652981769725401

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
  lastSeenTurn: number;

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
    // debug(`monsters ${JSON.stringify(this.monsters)}`);
    // debug(`badGuys ${JSON.stringify(this.monsters)}`);
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
      this.monsters[monster.creatureId].lastSeenTurn = this.turns;
    });
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
      debug(`inputs ${JSON.stringify(inputs)}`);
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

class YOLO implements DroneStrategy {
  distanceToPoint: number = 500;
  completed: boolean = false;
  points: Point[] = [];

  monsterSpeed: number = 540;

  constructor(
    points: Point[],
    private drone: Drone,
    private gameState: GameState
  ) {
    this.points = points;
  }

  pointFromCreature(creature: VisibleCreature): Point {
    return {
      x: creature.creatureX,
      y: creature.creatureY,
    };
  }

  monstersThatSeeMe(turns: number = 3): Monster[] {
    const monstersThatSeeMe = gameState.visibleCreatures.filter((c) => {
      const monster = gameState.creatureDic[c.creatureId];
      return monster.type === -1;
    });

    const monstersISawBefore = Object.values(this.gameState.monsters).filter(
      (m) => m.lastSeenTurn >= this.gameState.turns - turns
    );

    const monsters = monstersThatSeeMe.map((m) => {
      return gameState.monsters[m.creatureId];
    });

    monstersISawBefore.forEach((m) => {
      if (!monsters.find((m2) => m2.creatureId === m.creatureId)) {
        // clone monster
        const cloneMonster = Object.assign({}, m);

        const turnsSinceIveSeenMonster =
          this.gameState.turns - cloneMonster.lastSeenTurn;
        cloneMonster.creatureX =
          cloneMonster.creatureX +
          cloneMonster.creatureVx * turnsSinceIveSeenMonster;
        cloneMonster.creatureY =
          cloneMonster.creatureY +
          cloneMonster.creatureVy * turnsSinceIveSeenMonster;
        monsters.push(cloneMonster);
      }
    });

    // clone Monsters
    const cloneMonsters = monsters.map((m) => Object.assign({}, m));

    const dronePosition = this.drone.getPosition();
    cloneMonsters.forEach((m) => {
      const monsterPoint = this.pointFromCreature(m);
      // const vector = this.createVector(monsterPoint, this.drone.getPosition());
      // const limitedVector = this.limitVectorLength(vector, this.monsterSpeed);
      m.creatureVx = Math.floor(dronePosition.x - monsterPoint.x);
      m.creatureVy = Math.floor(dronePosition.y - monsterPoint.y);
    });

    return cloneMonsters;
  }

  updateNextPointToAvoidMonsterCollisions(
    nextPoint: Point,
    monsters: VisibleCreature[]
  ): Point {
    // drone max speed is 600
    // monster speed is 540
    const _allPointsInRadius = [
      ...getPointsInCircle(this.drone.getPosition(), 600, 15),
      ...getPointsInCircle(this.drone.getPosition(), 400, 15),
      ...getPointsInCircle(this.drone.getPosition(), 200, 15),
    ];

    // remove points out of bounds 0, 10000
    const pointsInBounds = _allPointsInRadius.filter((p) => {
      return p.x >= 0 && p.x <= 10000 && p.y >= 0 && p.y <= 10000;
    });
    debug(`allPointsInRadius ${JSON.stringify(pointsInBounds)}`);

    // safe points are at least 540 away from the monster

    const monsterVectors = monsters.map((m) => {
      return getVectorFromVisibleCreature(m);
    });

    const podPosition = this.drone.getPosition();

    const safePoints = pointsInBounds.filter((safePoint) => {
      const safeDistance = 550;

      // check if path comes close to any monsterVectors
      const pathsComeCloseToMonster = monsterVectors.some((monsterVector) => {
        return isWithinExpandedBox(
          {
            startX: podPosition.x,
            startY: podPosition.y,
            endX: safePoint.x,
            endY: safePoint.y,
          },
          monsterVector,
          safeDistance
        );
        // return isPointNearVector(safePoint, monsterVector, safeDistance);
      });

      // if path comes close to monster we can't go there
      if (pathsComeCloseToMonster) return false;
      return true;
    });

    debug(`safePoints ${JSON.stringify(safePoints)}`);

    // sort safe points by distance to nextPoint closest first
    const sortedPoints = safePoints.sort((a, b) => {
      const distanceA = distanceBetweenPoints(a, nextPoint);
      const distanceB = distanceBetweenPoints(b, nextPoint);
      return distanceA - distanceB;
    });

    return sortedPoints[0];
  }

  nextPosition(): Point | undefined {
    debug(`turn ${this.gameState.turns}`);
    const dronePosition = this.drone.getPosition();
    let nextPoint = this.points[0];

    if (!nextPoint) return undefined;

    if (arePointsInRange(dronePosition, nextPoint, this.distanceToPoint)) {
      this.points.shift();
      nextPoint = this.points[0];
    }

    if (!this.points.length) {
      this.completed = true;
      return undefined;
    }

    debug(`nextPoint ${JSON.stringify(nextPoint)}`);

    debug(`dronePosition ${JSON.stringify(dronePosition)}`);
    const _monsters = this.monstersThatSeeMe();

    // remove duplicate monsters
    const monsters = _monsters.filter(
      (m, index) => _monsters.indexOf(m) === index
    );
    debug(`close monsters ${JSON.stringify(monsters)}`);

    if (!monsters.length) return nextPoint;

    const newPoint = this.updateNextPointToAvoidMonsterCollisions(
      nextPoint,
      monsters
    );

    debug(`newPoint ${JSON.stringify(newPoint)}`);
    return newPoint;
  }
}

function getPointsInCircle(
  center: { x: number; y: number },
  radius: number,
  degreeInterval: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const { x, y } = center;
  for (let i = 0; i < 360; i += degreeInterval) {
    const angleInRadians = (i * Math.PI) / 180;
    const pointX = Math.round(x + radius * Math.cos(angleInRadians));
    const pointY = Math.round(y + radius * Math.sin(angleInRadians));
    points.push({ x: pointX, y: pointY });
  }
  return points;
}

function getVectorFromVisibleCreature(creature: VisibleCreature): Vector {
  return {
    startX: creature.creatureX,
    endX: creature.creatureX + creature.creatureVx,
    startY: creature.creatureY,
    endY: creature.creatureY + creature.creatureVy,
  };
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
    // debug(
    //   `Drone ${this.droneId} target ${this.targetLocation.x} ${this.targetLocation.y}`
    // );
    // debug(
    //   `Drone ${this.droneId} currentPosition ${this.targetLocation.x} ${this.targetLocation.y}`
    // );
  }

  execute(debug: boolean, turn: number): void {
    const nextTarget = this.strategy.nextPosition();

    if (debug) this.debugPosition();

    if (!nextTarget) {
      this.targetLocation = { x: -1, y: -1 };
      this.wait(this.shouldTurnOnLight);
      return;
    }

    this.targetLocation = nextTarget;

    if (debug) this.debugPosition();

    // should turn light on every 3 turns
    this.shouldTurnOnLight = gameState.turns % 3 === 0;

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
    myDrones.forEach((d, index) => {
      // if (index === 0) {
      d.strategy = new YOLO(
        [
          { x: d.droneX, y: 8500 },
          { x: d.droneX, y: 400 },
          { x: d.droneX, y: 8500 },
          { x: d.droneX, y: 400 },
          { x: d.droneX, y: 8500 },
          { x: d.droneX, y: 400 },
          { x: d.droneX, y: 8500 },
          { x: d.droneX, y: 400 },
          { x: d.droneX, y: 8500 },
          { x: d.droneX, y: 400 },
        ],
        d,
        gameState
      );
      // } else {
      // d.strategy = new DiveAndRise(
      //   [
      //     { x: 1300, y: 3000 },
      //     { x: 8500, y: 3000 },
      //     { x: 8500, y: 500 },
      //   ],
      //   d
      // );
      // }
    });
  }

  myDrones.forEach((d) => {
    d.shouldTurnOnLight = gameState.turns % 3 === 0;
    d.execute(true, gameState.turns);
  });
}

function debug(message: string) {
  printErr(message);
}

// function distanceBetweenPoints(a: Point, b: Point): number {
//   return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
// }

function closestPointOnLineSegment(point: Point, vector: Vector): Point {
  const dx = vector.endX - vector.startX;
  const dy = vector.endY - vector.startY;
  const t =
    ((point.x - vector.startX) * dx + (point.y - vector.startY) * dy) /
    (dx * dx + dy * dy);
  return {
    x: vector.startX + t * dx,
    y: vector.startY + t * dy,
  };
}

function isPointNearVector(
  point: Point,
  vector: Vector,
  distance: number
): boolean {
  // Calculate the bounding box
  const minX = Math.min(vector.startX, vector.endX) - distance;
  const maxX = Math.max(vector.startX, vector.endX) + distance;
  const minY = Math.min(vector.startY, vector.endY) - distance;
  const maxY = Math.max(vector.startY, vector.endY) + distance;

  // Check if the point is within the bounding box
  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false;
  }

  // Calculate the distance from the point to the vector
  const dx = vector.endX - vector.startX;
  const dy = vector.endY - vector.startY;
  const lengthSquared = dx * dx + dy * dy;
  const dotProduct =
    ((point.x - vector.startX) * dx + (point.y - vector.startY) * dy) /
    lengthSquared;

  if (dotProduct < 0) {
    const distX = point.x - vector.startX;
    const distY = point.y - vector.startY;
    return distX * distX + distY * distY <= distance * distance;
  } else if (dotProduct > 1) {
    const distX = point.x - vector.endX;
    const distY = point.y - vector.endY;
    return distX * distX + distY * distY <= distance * distance;
  } else {
    const projX = vector.startX + dotProduct * dx;
    const projY = vector.startY + dotProduct * dy;
    const distX = point.x - projX;
    const distY = point.y - projY;
    return distX * distX + distY * distY <= distance * distance;
  }
}

function isWithinExpandedBox(
  v1: Vector,
  monsterrVector: Vector,
  D: number
): boolean {
  // Calculate the bounding boxes
  const box1 = {
    left: Math.min(v1.startX, v1.endX),
    right: Math.max(v1.startX, v1.endX),
    bottom: Math.min(v1.startY, v1.endY),
    top: Math.max(v1.startY, v1.endY),
  };
  const box2 = {
    left: Math.min(monsterrVector.startX, monsterrVector.endX) - D,
    right: Math.max(monsterrVector.startX, monsterrVector.endX) + D,
    bottom: Math.min(monsterrVector.startY, monsterrVector.endY) - D,
    top: Math.max(monsterrVector.startY, monsterrVector.endY) + D,
  };

  // Check if v1 is within the expanded bounding box of v2
  if (
    box1.left >= box2.left &&
    box1.right <= box2.right &&
    box1.bottom >= box2.bottom &&
    box1.top <= box2.top
  ) {
    return true;
  }

  return false;
}
