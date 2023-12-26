// seed=-3331652981769725401
// seed=seed=9218852014602741000

//https://www.desmos.com/calculator/2rnqgoa6a4
//https://www.convertcsv.com/json-to-csv.htm

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

type Box = {
  left: number;
  right: number;
  bottom: number;
  top: number;
};

type BoxPoints = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
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
    switch (type) {
      case 0:
        this.zone = new FishZones().zone1;
        break;
      case 1:
        this.zone = new FishZones().zone2;
        break;
      case 2:
        this.zone = new FishZones().zone3;
        break;
    }
    this.zone = new FishZone();
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
}

class VisibleMonster {
  detectedByDrone: number[] = [];
  dronesItCanSee: number[] = [];
  agressiveTowards: number | null = null;

  constructor(
    public monster: Monster,
    private drones: Drone[]
  ) {
    this.calculateDronesItCanSee();
    this.calculateVisibleBy();
  }

  read() {
    return {
      monster: this.monster,
      detectedByDrone: this.detectedByDrone,
      dronesItCanSee: this.dronesItCanSee,
      agressiveTowards: this.agressiveTowards,
    };
  }

  calculateVisibleBy() {
    // light on 2000 units
    // light off 800
    // we can see 300 units past the light
    const monsterPoint = monster_getStartPositon(this.monster);

    this.drones.forEach((d) => {
      const dronePoint = d.getPosition();
      const distance = distanceBetweenPoints(monsterPoint, dronePoint);

      if (d.isLightOn && distance <= 2000 + 300) {
        this.detectedByDrone.push(d.droneId);
      } else if (!d.isLightOn && distance <= 800 + 300) {
        this.detectedByDrone.push(d.droneId);
      }
    });

    const closestDrone = this.detectedByDrone.sort((a, b) => {
      // sort by distance to drone shortest first
      const distanceA = distanceBetweenPoints(
        monster_getStartPositon(this.monster),
        this.drones.find((d) => d.droneId === a)!.getPosition()
      );
      const distanceB = distanceBetweenPoints(
        monster_getStartPositon(this.monster),
        this.drones.find((d) => d.droneId === b)!.getPosition()
      );
      return distanceA - distanceB;
    });

    this.agressiveTowards = closestDrone[0];
  }

  calculateDronesItCanSee() {
    // this.drones.forEach((d) => {
    //   const dronePoint = d.getPosition();
    //   const distance = distanceBetweenPoints(
    //     monster_getStartPositon(this.monster),
    //     dronePoint
    //   );
    //   if (d.isLightOn && distance <= 2000) {
    //     this.dronesItCanSee.push(d.droneId);
    //   } else if (!d.isLightOn && distance <= 800) {
    //     this.dronesItCanSee.push(d.droneId);
    //   }
    // });
    // if (this.dronesItCanSee.length === 1) {
    //   this.agressiveTowards = this.dronesItCanSee[0];
    // } else if (this.dronesItCanSee.length > 1) {
    //   this.dronesItCanSee.sort((a, b) => {
    //     // sort by distance to drone shortest first
    //     const distanceA = distanceBetweenPoints(
    //       monster_getStartPositon(this.monster),
    //       this.drones.find((d) => d.droneId === a)!.getPosition()
    //     );
    //     const distanceB = distanceBetweenPoints(
    //       monster_getStartPositon(this.monster),
    //       this.drones.find((d) => d.droneId === b)!.getPosition()
    //     );
    //     return distanceA - distanceB;
    //   });
    //   this.agressiveTowards = this.dronesItCanSee[0];
    // } else {
    //   this.agressiveTowards = null;
    // }
  }

  canSeeDrone(droneId: number): boolean {
    return this.dronesItCanSee.includes(droneId);
  }

  seenByDrone(droneId: number): boolean {
    return this.detectedByDrone.includes(droneId);
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
  visibleMonsters: VisibleMonster[] = [];

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
    // debug(`visibleCreatures ${JSON.stringify(this.visibleCreatures.fill(c => c.type === -1))}`);
    // debug(`radarBlips ${JSON.stringify(this.radarBlips)}`);
    // debug(`monsters ${JSON.stringify(this.monsters)}`);
    // debug(`badGuys ${JSON.stringify(this.monsters)}`);
    // debug(`targetFish ${JSON.stringify(this.targetFish)}`);
    debug(
      `visibleMonsters ${JSON.stringify(
        this.visibleMonsters.map((m) => m.read())
      )}`
    );
  }

  getUnscannedCreatures(): number[] {
    const droneScans = this.myDrones.map((d) => d.scans).flat();
    debug(`droneScans ${JSON.stringify(droneScans)}`);

    return this.radarBlips
      .filter((r) => !this.myScannedCreatures.includes(r.creatureId))
      .filter((c) => !droneScans.includes(c.creatureId))
      .filter((c) => !this.targetFish.includes(c.creatureId))
      .filter((c) => this.creatureDic[c.creatureId].type !== -1)
      .map((c) => c.creatureId);
  }

  // getZ1UnscannedCreatures(): number[] {
  //   const droneScans = this.myDrones.map((d) => d.scans).flat();
  //   return this.creatures
  //     .filter((c) => c.type !== -1)
  //     .filter((c) => c.zone.id === 1)
  //     .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
  //     .filter((c) => !droneScans.includes(c.creatureId))
  //     .filter((c) => !this.targetFish.includes(c.creatureId))
  //     .map((c) => c.creatureId);
  // }

  // getZ2UnscannedCreatures(): number[] {
  //   const droneScans = this.myDrones.map((d) => d.scans).flat();
  //   return this.creatures
  //     .filter((c) => c.type !== -1)
  //     .filter((c) => c.zone.id === 2)
  //     .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
  //     .filter((c) => !droneScans.includes(c.creatureId))
  //     .filter((c) => !this.targetFish.includes(c.creatureId))
  //     .map((c) => c.creatureId);
  // }

  // getZ3UnscannedCreatures(): number[] {
  //   const droneScans = this.myDrones.map((d) => d.scans).flat();
  //   return this.creatures
  //     .filter((c) => c.type !== -1)
  //     .filter((c) => c.zone.id === 3)
  //     .filter((c) => !this.myScannedCreatures.includes(c.creatureId))
  //     .filter((c) => !droneScans.includes(c.creatureId))
  //     .filter((c) => !this.targetFish.includes(c.creatureId))
  //     .map((c) => c.creatureId);
  // }

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
    this.updateVisibleMonsters();

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

    this.myDrones.forEach((d) => {
      d.scans = [];
    });

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

  private updateVisibleMonsters() {
    this.visibleMonsters = this.visibleCreatures
      .filter((c) => this.creatureDic[c.creatureId].type === -1)
      .map((c) => {
        const m = this.monsters[c.creatureId];
        return new VisibleMonster(m, this.myDrones);
      });
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
  nextPosition():
    | { strat: string; point: Point; shouldTurnOnLight: boolean }
    | undefined;
}

class Wait implements DroneStrategy {
  constructor(private drone: Drone) {}

  completed: boolean = false;
  nextPosition() {
    debug(`${this.drone.droneId} Drone Wait`);
    return {
      strat: "Wait",
      point: { x: 0, y: 0 },
      shouldTurnOnLight: false,
    };
  }
}

interface YOLOPoint extends Point {
  distance: number;
}

class YOLO implements DroneStrategy {
  completed: boolean = false;
  points: YOLOPoint[] = [];

  monsterSpeed: number = 540;

  constructor(
    points: YOLOPoint[],
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

  nextPosition() {
    if (this.drone.emergency === 1) {
      this.completed = true;
      return undefined;
    }

    debug(`Drone ${this.drone.droneId} YOLO`);
    const dronePosition = this.drone.getPosition();
    let nextPoint = this.points[0];

    if (!nextPoint) return undefined;

    if (arePointsInRange(dronePosition, nextPoint, nextPoint.distance)) {
      this.points.shift();
      nextPoint = this.points[0];
    }

    if (!this.points.length) {
      this.completed = true;
      return undefined;
    }

    const monsters = monstersThatSeeMe(
      this.gameState.turns,
      this.gameState,
      this.drone
    );

    let shouldTurnOnLight =
      this.gameState.turns % 3 === 0 && this.drone.droneY > 2000;

    if (this.gameState.getUnscannedCreatures().length === 0) {
      nextPoint = {
        x: this.drone.droneX,
        y: 0,
        distance: 400,
      };
    }

    if (!monsters.length) {
      this.drone.avoidance = -1;
      return {
        strat: "YOLO",
        point: nextPoint,
        shouldTurnOnLight: shouldTurnOnLight,
      };
    }

    const newPoint = updateNextPointToAvoidMonsterCollisions(
      this.drone,
      nextPoint,
      monsters
    );
    this.drone.avoidance = this.gameState.turns;

    return {
      strat: "YOLO",
      point: newPoint,
      shouldTurnOnLight: shouldTurnOnLight,
    };
  }
}

class ScanFish implements DroneStrategy {
  completed: boolean = false;

  constructor(
    private drone: Drone,
    private gameState: GameState
  ) {}

  nextPosition() {
    debug(`Drone ${this.drone.droneId} ScanFish`);
    const unscanned = [
      ...this.gameState.getUnscannedCreatures(),
      // ...this.gameState.getZ2UnscannedCreatures(),
      // ...this.gameState.getZ1UnscannedCreatures(),
    ]
      .filter((c) => !this.gameState.targetFish.includes(c))
      .filter((c) => {
        // remove creatures not in radar
        const loc = this.gameState.radarBlips.find((r) => r.creatureId === c);
        return !!loc;
      })
      .sort((a, b) => {
        // sort by zone
        const zoneA = this.gameState.creatureDic[a].zone.id;
        const zoneB = this.gameState.creatureDic[b].zone.id;

        return zoneB - zoneA;
      });

    // sort unscanned by

    if (!unscanned.length) {
      this.completed = true;
      return undefined;
    }

    const creatureId = unscanned[0];
    this.gameState.targetFish.push(creatureId);

    var loc = this.gameState.radarBlips.find(
      (r) => r.creatureId === creatureId
    );
    var radarLoc = loc?.radar;

    let droneAction = {
      strat: "ScanFish",
      point: { x: 0, y: 0 },
      shouldTurnOnLight: false,
    };

    if (this.drone.scans.length > 3) {
      droneAction.point.x = this.drone.droneX;
      droneAction.point.y = 450;
    } else {
      if (radarLoc === "TL") {
        droneAction.point.x = this.drone.droneX - 600;
        droneAction.point.y = this.drone.droneY - 600;
      } else if (radarLoc === "TR") {
        droneAction.point.x = this.drone.droneX + 600;
        droneAction.point.y = this.drone.droneY - 600;
      } else if (radarLoc === "BL") {
        droneAction.point.x = this.drone.droneX - 600;
        droneAction.point.y = this.drone.droneY + 600;
      } else if (radarLoc === "BR") {
        droneAction.point.x = this.drone.droneX + 600;
        droneAction.point.y = this.drone.droneY + 600;
      }
    }

    const monsters = monstersThatSeeMe(
      this.gameState.turns,
      this.gameState,
      this.drone
    );

    droneAction.shouldTurnOnLight =
      this.gameState.turns % 2 === 0 && this.drone.droneY > 2000;

    if (!monsters.length) {
      this.drone.avoidance = -1;
      debug(
        `Drone Scan ${this.drone.droneId} target ${droneAction.point.x} ${droneAction.point.y}`
      );
      return droneAction;
    }

    const newPoint = updateNextPointToAvoidMonsterCollisions(
      this.drone,
      droneAction.point,
      monsters
    );
    this.drone.avoidance = this.gameState.turns;

    droneAction.point = newPoint;
    debug(
      `Drone Scan ${this.drone.droneId} target ${droneAction.point.x} ${droneAction.point.y}`
    );
    return droneAction;
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

function limitVectorLength(vector: Vector, length: number): Vector {
  const dx = vector.endX - vector.startX;
  const dy = vector.endY - vector.startY;
  const vectorLength = Math.sqrt(dx * dx + dy * dy);
  const ratio = length / vectorLength;
  return {
    startX: vector.startX,
    startY: vector.startY,
    endX: vector.startX + dx * ratio,
    endY: vector.startY + dy * ratio,
  };
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
  isLightOn: boolean;
  initialX: number;
  targetPoition: { x: number; y: number } = { x: 0, y: 0 };
  isLeft: boolean;
  avoidance: number = -1;

  strategy: DroneStrategy[];

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
    debug(`Drone ${this.droneId} initialX ${this.initialX}`);
  }

  getPosition(): Point {
    return {
      x: this.droneX,
      y: this.droneY,
    };
  }

  wait(light: boolean, message: string = "") {
    this.isLightOn = light;
    console.log(`WAIT ${light ? 1 : 0} ${message}`);
  }

  move(x: number, y: number, light: boolean, message: string = "") {
    this.isLightOn = light;
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

  execute(_debug: boolean, turn: number): void {
    let nextTarget = this.strategy[0].nextPosition();
    while (!nextTarget) {
      this.strategy.shift();
      nextTarget = this.strategy[0].nextPosition();
    }

    if (_debug) this.debugPosition();

    if (!nextTarget) {
      this.targetLocation = { x: -1, y: -1 };
      this.wait(false);
      return;
    }

    this.targetLocation = nextTarget.point;

    if (_debug) this.debugPosition();

    if (
      this.targetLocation?.x !== undefined &&
      this.targetLocation?.y !== undefined
    ) {
      this.move(
        Math.round(this.targetLocation.x),
        Math.round(this.targetLocation.y),
        nextTarget.shouldTurnOnLight
      );
    } else {
      this.wait(false);
    }
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
      const X1 = d.initialX < 5000 ? 2000 : 8000;
      const X2 = d.initialX < 5000 ? 2000 : 8000;
      const X3 = d.initialX < 5000 ? 2000 : 8000;
      const X4 = d.initialX < 5000 ? 3000 : 6000;
      d.strategy = [
        new YOLO(
          [
            { x: X1, y: 3500, distance: 800 },
            { x: X2, y: 6500, distance: 800 },
            { x: X3, y: 8500, distance: 800 },
            { x: X4, y: 8500, distance: 800 },
            { x: d.droneX, y: 450, distance: 100 },
          ],
          d,
          gameState
        ),
        new ScanFish(d, gameState),
        new Wait(d),
      ];
    });
  }

  myDrones.forEach((d) => {
    d.execute(true, gameState.turns);
  });
}

function debug(message: string) {
  printErr(message);
}

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

function createVectorBox(vector: Vector, D: number): Box {
  const box = {
    left: Math.min(vector.startX, vector.endX) - D,
    right: Math.max(vector.startX, vector.endX) + D,
    bottom: Math.min(vector.startY, vector.endY) - D,
    top: Math.max(vector.startY, vector.endY) + D,
  };
  return box;
}

function createVectorBoxPoints(vector: Vector, D: number): Point[] {
  // Calculate the vector direction
  let dx: number = vector.endX - vector.startX;
  let dy: number = vector.endY - vector.startY;

  // Calculate the angle of the vector
  let angle: number = Math.atan2(dy, dx);

  // Define the rotation matrix
  let rotation_matrix: number[][] = [
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)],
  ];

  // Rotate the vector
  let rotated_vector: number[] = [
    rotation_matrix[0][0] * dx + rotation_matrix[0][1] * dy,
    rotation_matrix[1][0] * dx + rotation_matrix[1][1] * dy,
  ];

  // The bounding box in the rotated system has corners at (0, 0), (dx, 0), (dx, dy), and (0, dy)
  let bbox_rotated: number[][] = [
    [0, 0],
    [rotated_vector[0], 0],
    [rotated_vector[0], rotated_vector[1]],
    [0, rotated_vector[1]],
  ];

  debug(`bbox_rotated ${JSON.stringify(bbox_rotated)}`);

  // Rotate the bounding box back to the original coordinate system
  let bbox: number[][] = bbox_rotated.map((point) => [
    rotation_matrix[0][0] * point[0] + rotation_matrix[1][0] * point[1],
    rotation_matrix[0][1] * point[0] + rotation_matrix[1][1] * point[1],
  ]);

  // Translate the bounding box to the start of the vector
  bbox = bbox.map((point) => [
    point[0] + vector.startX,
    point[1] + vector.startY,
  ]);

  // Convert the bounding box to an array of Points
  let points: Point[] = bbox.map((point) => ({
    x: Math.round(point[0]),
    y: Math.round(point[1]),
  }));

  return points;
}

function createVectorBoxPoints_v2(vector: Vector, D: number): Point[] {
  const box: Point[] = [
    rotateAndScale(vector, D, "counterclockwise"),
    rotateAndScale(vector, D, "clockwise"),
    rotateAndScale(revertVector(vector), D, "counterclockwise"),
    rotateAndScale(revertVector(vector), D, "clockwise"),
  ];

  return box;
}

function revertVector(vector: Vector): Vector {
  return {
    startX: vector.endX,
    startY: vector.endY,
    endX: vector.startX,
    endY: vector.startY,
  };
}

// returns  true if the point is within the box
function isPointWithinMontersBox(
  point: Point,
  monster: Monster,
  D: number
): boolean {
  if (distanceBetweenPoints(point, monster_getStartPositon(monster)) < D)
    return true;
  if (distanceBetweenPoints(point, monster_getEndPosition(monster)) < D)
    return true;

  const monsterbox = createVectorBoxPoints_v2(monster_getVector(monster), D);

  return isPointInBox(point, monsterbox);
}

function isPointInBox(point: Point, box: Point[]): boolean {
  let inside: boolean = false;
  for (let i = 0, j = box.length - 1; i < box.length; j = i++) {
    let xi: number = box[i].x,
      yi: number = box[i].y;
    let xj: number = box[j].x,
      yj: number = box[j].y;

    let intersect: boolean =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function rotateAndScale(
  vector: Vector,
  D: number,
  rotation: "clockwise" | "counterclockwise" = "clockwise"
): Point {
  // Calculate the direction vector of the original vector
  let dx: number = vector.endX - vector.startX;
  let dy: number = vector.endY - vector.startY;

  // Rotate the direction vector by 90 degrees (clockwise)
  let rotated_dx: number = dy;
  let rotated_dy: number = -dx;

  if (rotation === "counterclockwise") {
    // Rotate the direction vector by 90 degrees (counterclockwise)
    rotated_dx = -dy;
    rotated_dy = dx;
  }

  // Normalize the rotated direction vector
  let magnitude: number = Math.sqrt(
    rotated_dx * rotated_dx + rotated_dy * rotated_dy
  );
  let direction: { x: number; y: number } = {
    x: rotated_dx / magnitude,
    y: rotated_dy / magnitude,
  };

  // Scale the direction vector by the desired length D
  let scaled_direction: { x: number; y: number } = {
    x: direction.x * D,
    y: direction.y * D,
  };

  // Create the new vector
  let newVector: Vector = new Vector();
  newVector.startX = vector.startX;
  newVector.startY = vector.startY;
  newVector.endX = newVector.startX + scaled_direction.x;
  newVector.endY = newVector.startY + scaled_direction.y;

  return {
    x: Math.round(newVector.endX),
    y: Math.round(newVector.endY),
  };
}

function createBoxWithDimensions(width: number, height: number): Point[] {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

function isWithinExpandedBox(
  v1: Vector,
  monsterVector: Vector,
  D: number
): boolean {
  // Calculate the bounding boxes
  const box1 = {
    left: Math.min(v1.startX, v1.endX),
    right: Math.max(v1.startX, v1.endX),
    bottom: Math.min(v1.startY, v1.endY),
    top: Math.max(v1.startY, v1.endY),
  };
  const monsterBox = createVectorBox(monsterVector, D);

  // Check if v1 is within the expanded bounding box of v2
  if (
    box1.left >= monsterBox.left &&
    box1.right <= monsterBox.right &&
    box1.bottom >= monsterBox.bottom &&
    box1.top <= monsterBox.top
  ) {
    return true;
  }

  return false;
}

function estimateMonsterPosition(monster: Monster, turns: number = 1) {
  // update the monsters vector based on the last known position and velocity
  // if the monster reaches and edge the velocity is reversed

  // the boundaries are 0, 1000
  // monster moves at 270 units per turn max
  // monster minY = 2500
  // monster maxY = 10000
  // monster minX = 0
  // monster maxX = 10000

  for (let i = 0; i < turns; i++) {
    const mosterVector = monster_getVector(monster);
    const limitedVector = limitVectorLength(mosterVector, 270);

    monster.creatureX = limitedVector.endX;
    monster.creatureY = limitedVector.endY;

    // if monster is at an edge reverse the velocity
    if (monster.creatureX <= 0 || monster.creatureX >= 10000) {
      monster.creatureVx = monster.creatureVx * -1;
    }

    if (monster.creatureY <= 2500 || monster.creatureY >= 10000) {
      monster.creatureVy = monster.creatureVy * -1;
    }
  }
}

function monster_getVector(monster: Monster): Vector {
  return {
    startX: monster.creatureX,
    endX: monster.creatureX + monster.creatureVx,
    startY: monster.creatureY,
    endY: monster.creatureY + monster.creatureVy,
  };
}

function monster_getStartPositon(monster: Monster): { x: number; y: number } {
  return {
    x: monster.creatureX,
    y: monster.creatureY,
  };
}

function monster_getEndPosition(monster: Monster): { x: number; y: number } {
  return {
    x: monster.creatureX + monster.creatureVx,
    y: monster.creatureY + monster.creatureVy,
  };
}

function monster_getMonsterRectangle(monster: Monster) {
  const startPos = monster_getStartPositon(monster);
  const endPos = monster_getEndPosition(monster);

  return {
    minX: Math.min(startPos.x, endPos.x),
    maxX: Math.max(startPos.x, endPos.x),
    minY: Math.min(startPos.y, endPos.y),
    maxY: Math.max(startPos.y, endPos.y),
  };
}

function monstersThatSeeMe(
  turns: number = 3,
  gameState: GameState,
  drone: Drone
): Monster[] {
  const monstersAggresiveTowardsMe = gameState.visibleMonsters
    .filter((m) => m.agressiveTowards === drone.droneId)
    .map((m) => m.monster);

  debug(
    `monstersAggresiveTowardsMe ${drone.droneId} ${JSON.stringify(
      monstersAggresiveTowardsMe
    )}`
  );

  const monstersISawBefore = Object.values(gameState.monsters)
    .filter((m) => m.lastSeenTurn >= gameState.turns - turns)
    .map((m) => {
      const estimatedMonster = Object.assign({}, m);
      estimateMonsterPosition(estimatedMonster, turns);
      return estimatedMonster;
    })
    .filter((m) => {
      // remove monsters aggressive towards me
      return !monstersAggresiveTowardsMe.includes(m);
    });

  const monsters = monstersAggresiveTowardsMe.map((m) => {
    return gameState.monsters[m.creatureId];
  });

  monstersISawBefore.forEach((m) => {
    if (!monsters.some((m) => m.creatureId === m.creatureId)) {
      monsters.push(m);
    }
  });
  return monsters;
}

function updateNextPointToAvoidMonsterCollisions(
  drone: Drone,
  nextPoint: Point,
  monsters: Monster[]
): Point {
  // drone max speed is 600
  // monster speed is 540
  const _allPointsInRadius = [
    ...getPointsInCircle(drone.getPosition(), 600, 15),
    ...getPointsInCircle(drone.getPosition(), 400, 15),
    ...getPointsInCircle(drone.getPosition(), 200, 15),
  ];

  // remove points out of bounds 0, 10000
  const pointsInBounds = _allPointsInRadius.filter((p) => {
    return p.x >= 0 && p.x <= 10000 && p.y >= 0 && p.y <= 10000;
  });

  const safePoints = pointsInBounds.filter((safePoint) => {
    const safeDistance = 700;

    // check if path comes close to any monsterVectors
    const pathsComeCloseToMonster = monsters.some((monster) => {
      return isPointWithinMontersBox(safePoint, monster, safeDistance);
    });

    // if path comes close to monster we can't go there
    if (pathsComeCloseToMonster) return false;
    return true;
  });

  debug(`${drone.droneId} safePoints ${JSON.stringify(safePoints)}`);

  // sort safe points by distance to nextPoint closest first
  const sortedPoints = safePoints.sort((a, b) => {
    const distanceA = distanceBetweenPoints(a, nextPoint);
    const distanceB = distanceBetweenPoints(b, nextPoint);
    return distanceA - distanceB;
  });

  if (!sortedPoints[0]) {
    const newPoint = findPointAwayFromMonsters(drone, monsters);
    if (!newPoint) return nextPoint;
  }

  return sortedPoints[0];
}

function findPointAwayFromMonsters(drone: Drone, monsters: Monster[]): Point {
  const dist = 550;
  const _allPointsInRadius = [
    ...getPointsInCircle(drone.getPosition(), 600, 10),
    ...getPointsInCircle(drone.getPosition(), 550, 30),
    ...getPointsInCircle(drone.getPosition(), 500, 30),
    ...getPointsInCircle(drone.getPosition(), 450, 30),
    ...getPointsInCircle(drone.getPosition(), 400, 30),
    ...getPointsInCircle(drone.getPosition(), 350, 30),
    ...getPointsInCircle(drone.getPosition(), 300, 30),
  ];

  // remove points out of bounds 0, 10000
  const pointsInBounds = _allPointsInRadius
    .filter((p) => {
      return p.x >= 0 && p.x <= 10000 && p.y >= 0 && p.y <= 10000;
    })
    // .filter((p) => {
    //   // remove points within 600 of a monster
    //   return !monsters.some((m) => {
    //     return distanceBetweenPoints(p, monster_getStartPositon(m)) < dist;
    //   });
    // })
    .filter((p) => {
      // remove points within 600 of where a monster will be next turn
      return !monsters.some((m) => {
        return distanceBetweenPoints(p, monster_getEndPosition(m)) < dist;
      });
    });

  // sort points by furthest from monsters
  const sortedPoints = pointsInBounds.sort((a, b) => {
    const distanceA = monsters.reduce((acc, monster) => {
      const distance = distanceBetweenPoints(
        a,
        monster_getStartPositon(monster)
      );
      return acc + distance;
    }, 0);
    const distanceB = monsters.reduce((acc, monster) => {
      const distance = distanceBetweenPoints(
        b,
        monster_getStartPositon(monster)
      );
      return acc + distance;
    }, 0);
    return distanceB - distanceA;
  });

  debug(`safe monster ${JSON.stringify(monsters)}`);
  debug(`${drone.droneId} backup safePoints ${JSON.stringify(sortedPoints)}`);
  return sortedPoints[sortedPoints.length - 1];
}
