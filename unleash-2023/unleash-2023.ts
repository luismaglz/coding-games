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
    // debug(`monsters ${JSON.stringify(this.monsters)}`);
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

    // this.estimateMonsterPosition(nonVisibleMonsters);
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

  createVector(start: Point, end: Point): Vector {
    return {
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
    };
  }

  limitVectorLength(vector: Vector, maxLength: number): Vector {
    const length = distanceBetweenPoints(
      { x: vector.startX, y: vector.startY },
      { x: vector.endX, y: vector.endY }
    );

    if (length <= maxLength) return vector;

    const ratio = maxLength / length;

    return {
      startX: vector.startX,
      startY: vector.startY,
      endX: vector.startX + (vector.endX - vector.startX) * ratio,
      endY: vector.startY + (vector.endY - vector.startY) * ratio,
    };
  }

  pointFromCreature(creature: VisibleCreature): Point {
    return {
      x: creature.creatureX,
      y: creature.creatureY,
    };
  }

  monstersThatSeeMe(): Monster[] {
    const monstersThatSeeMe = gameState.visibleCreatures.filter((c) => {
      const monster = gameState.creatureDic[c.creatureId];
      return monster.type === -1;
    });

    const monsters = monstersThatSeeMe.map((m) => {
      return gameState.monsters[m.creatureId];
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

  getAllPointsInRadius(point: Point, radius: number): Point[] {
    const points: Point[] = [];

    for (let x = point.x - radius; x <= point.x + radius; x++) {
      for (let y = point.y - radius; y <= point.y + radius; y++) {
        points.push({ x, y });
      }
    }

    return points;
  }

  getAllPointInRadiusWithStep(point: Point, radius: number, step: number) {
    const points: Point[] = [];

    for (let x = point.x - radius; x <= point.x + radius; x += step) {
      for (let y = point.y - radius; y <= point.y + radius; y += step) {
        points.push({ x, y });
      }
    }

    return points;
  }

  getVectorFromVisibleCreature(creature: VisibleCreature): Vector {
    return {
      startX: creature.creatureX,
      endX: creature.creatureX + creature.creatureVx,
      startY: creature.creatureY,
      endY: creature.creatureY + creature.creatureVy,
    };
  }

  getAllIntegerPointsForVector(vector: Vector, n: number): Point[] {
    let points: Point[] = [];

    // Calculate the slope of the line
    let dx = vector.endX - vector.startX;
    let dy = vector.endY - vector.startY;

    // Normalize the slope
    let stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    let stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    // Start from the start point
    let x = vector.startX;
    let y = vector.startY;

    let counter = 0;

    // While we haven't reached the end point
    while (
      (stepX > 0 ? x <= vector.endX : x >= vector.endX) &&
      (stepY > 0 ? y <= vector.endY : y >= vector.endY)
    ) {
      // If both x and y are integers, add the point to the list
      if (Math.floor(x) === x && Math.floor(y) === y && counter % n === 0) {
        points.push({ x: x, y: y });
      }

      // Move to the next point
      x += stepX;
      y += stepY;
    }

    return points;
  }

  pathsComeCloseTo(v1: Vector, v2: Vector, distance: number): boolean {
    // If  any point of v1 comes within distance of v2 return true
    const pointsV1 = this.getAllIntegerPointsForVector(v1, 50);
    const pointsV2 = this.getAllIntegerPointsForVector(v2, 50);

    const pointsV1InV2 = pointsV1.filter((p) => {
      return pointsV2.some((p2) => {
        return distanceBetweenPoints(p, p2) <= distance;
      });
    });

    return pointsV1InV2.length > 0;
  }

  updateNextPointToAvoidMonsterCollisions(
    nextPoint: Point,
    monsters: VisibleCreature[]
  ): Point {
    // drone max speed is 600
    // monster speed is 540
    const allPointsInRadius = this.getAllPointInRadiusWithStep(
      this.drone.getPosition(),
      600,
      300
    );

    // safe points are at least 540 away from the monster

    const futureMonsterLocations = monsters.map((m) => {
      const vector = this.getVectorFromVisibleCreature(m);
      const limitedVector = this.limitVectorLength(vector, this.monsterSpeed);
      return {
        x: limitedVector.endX,
        y: limitedVector.endY,
      };
    });

    const monsterVectors = monsters.map((m) => {
      return this.getVectorFromVisibleCreature(m);
    });

    debug(`futureMonsterLocations ${JSON.stringify(futureMonsterLocations)}`);

    const safePoints = allPointsInRadius.filter((safePoint) => {
      const safeDistance = 550;
      const path = this.createVector(this.drone.getPosition(), safePoint);

      // check if path comes close to any monsterVectors
      const pathsComeCloseToMonster = monsterVectors.some((v) => {
        return this.pathsComeCloseTo(path, v, safeDistance);
      });

      // if path comes close to monster we can't go there
      if (pathsComeCloseToMonster) return false;
      return true;
    });

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
      if (index === 0) {
        d.strategy = new DiveAndRise(
          [
            { x: 1300, y: 3000 },
            { x: 8500, y: 3000 },
            { x: 8500, y: 500 },
          ],
          d
        );
      } else {
        d.strategy = new YOLO(
          [
            { x: 1745, y: 8694 },
            { x: 7629, y: 8694 },
            { x: 400, y: 8694 },
          ],
          d,
          gameState
        );
      }
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

// function closestPointOnLineSegment(point: Point, vector: Vector): Point {
//   const dx = vector.endX - vector.startX;
//   const dy = vector.endY - vector.startY;
//   const t = ((point.x - vector.startX) * dx + (point.y - vector.startY) * dy) / (dx * dx + dy * dy);
//   return {
//       x: vector.startX + t * dx,
//       y: vector.startY + t * dy
//   };
// }

// function vectorsWithinRange(vector1: Vector, vector2: Vector, range: number): boolean {
//   // Bounding box check
//   if (Math.max(vector1.startX, vector1.endX) + range < Math.min(vector2.startX, vector2.endX) ||
//       Math.min(vector1.startX, vector1.endX) - range > Math.max(vector2.startX, vector2.endX) ||
//       Math.max(vector1.startY, vector1.endY) + range < Math.min(vector2.startY, vector2.endY) ||
//       Math.min(vector1.startY, vector1.endY) - range > Math.max(vector2.startY, vector2.endY)) {
//       return false;
//   }

//   // Closest point check
//   const closestPoint1 = closestPointOnLineSegment({x: vector2.startX, y: vector2.startY}, vector1);
//   const closestPoint2 = closestPointOnLineSegment({x: vector1.startX, y: vector1.startY}, vector2);
//   return distanceBetweenPoints(closestPoint1, {x: vector2.startX, y: vector2.startY}) <= range && distanceBetweenPoints(closestPoint2, {x: vector1.startX, y: vector1.startY}) <= range;
// }
