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
    // get the rectangle of the monster
    // minX: Math.min(vectorFinalPosition.x, vectorStart.x),
    // maxX: Math.max(vectorFinalPosition.x, vectorStart.x),
    // minY: Math.min(vectorFinalPosition.y, vectorStart.y),
    // maxY: Math.max(vectorFinalPosition.y, vectorStart.y),

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

class Drone {
  droneId: number;
  droneX: number;
  droneY: number;
  emergency: number;
  battery: number;
  status: "GOING UP" | "SCANNING" = "SCANNING";
  scans: number[] = [];

  initialX: number;
  targetPoition: { x: number; y: number } = { x: 0, y: 0 };
  isLeft: boolean;

  resetTank() {
    this.scans = [];
  }

  droneActions: DroneAction[] = [];

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
    if (this.initialX < 5000) {
      this.isLeft = true;

      this.droneActions = [
        new FlashLightEvery3Ticks(),
        new TurnOffLightIfLowBattery(0),
        new MoveTo(2900, 8000),
        new InitialGoToTop(),
        new MoveTo(900, 8000),
        new InitialGoToTop(),
        new MoveTo(2900, 8000),
        new InitialGoToTop(),
        new MoveTo(900, 8000),
        new InitialGoToTop(),
        new MoveTo(2900, 8000),
        new InitialGoToTop(),
        new MoveTo(900, 8000),
        new InitialGoToTop(),
        new MoveTo(2900, 8000),
        new InitialGoToTop(),
        // new ScanCreatures(() => gameState.getZ2UnscannedCreatures()),
        // new ScanCreatures(() => gameState.getZ3UnscannedCreatures()),
        new GoToTop(true, 2),
      ];
    } else {
      this.isLeft = false;

      this.droneActions = [
        new FlashLightEvery3Ticks(),
        new TurnOffLightIfLowBattery(0),
        new MoveTo(6900, 8000),
        new InitialGoToTop(),
        new MoveTo(9500, 8000),
        new InitialGoToTop(),
        new MoveTo(6900, 8000),
        new InitialGoToTop(),
        new MoveTo(9500, 8000),
        new InitialGoToTop(),
        new MoveTo(6900, 8000),
        new InitialGoToTop(),
        new MoveTo(9500, 8000),
        new InitialGoToTop(),
        new MoveTo(6900, 8000),
        new InitialGoToTop(),
        // new ScanCreatures(() => gameState.getZ2UnscannedCreatures()),
        // new ScanCreatures(() => gameState.getZ3UnscannedCreatures()),
        new GoToTop(true, 2),
      ];
    }
  }

  wait(light: boolean, message: string = "") {
    console.log(`WAIT ${light ? 1 : 0} ${message}`);
  }

  move(x: number, y: number, light: boolean, message: string = "") {
    console.log(`MOVE ${x} ${y} ${light ? 1 : 0} ${message}`);
  }

  debugPosition() {
    debug(`Drone ${this.droneId} is at ${this.droneX}, ${this.droneY}`);
  }
}

abstract class DroneAction {
  completed: boolean;

  constructor() {
    this.completed = false;
  }

  abstract runAction(
    drone: Drone,
    gameState: GameState,
    action: DroneActionLol
  ): boolean;
}

class InitialGoToTop extends DroneAction {
  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug(`InitialGoToTop`);

    if (drone.droneY < 500) {
      this.completed = true;
      return false;
    }

    droneAction.targetLocation.x = drone.droneX;
    droneAction.targetLocation.y = 0;
    return true;
  }
}

class GoToTop extends DroneAction {
  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug(`GoToTops force: ${this.force}`);
    if (this.force) {
      droneAction.targetLocation.x = drone.droneX;
      droneAction.targetLocation.y = 0;
      return true;
    }

    if (drone.scans.length >= this.max) {
      droneAction.targetLocation.x = drone.droneX;
      droneAction.targetLocation.y = 0;
      return true;
    }

    return false;
  }
  constructor(
    private force: boolean = false,
    private max = 2
  ) {
    super();
  }
}

class ScanCreatures extends DroneAction {
  constructor(private fishGetter: () => number[]) {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug("DoZone2Action");

    const fish = this.fishGetter();
    if (fish.length === 0) {
      this.completed = true;
      return false;
    }

    var firstFish = fish[0];
    gameState.targetFish.push(firstFish);

    var loc = gameState.radarBlips.find((r) => r.creatureId === firstFish);

    var radarLoc = loc?.radar;

    if (radarLoc === "TL") {
      droneAction.targetLocation.x = drone.droneX - 600;
      droneAction.targetLocation.y = drone.droneY - 600;

      return true;
    } else if (radarLoc === "TR") {
      droneAction.targetLocation.x = drone.droneX + 600;
      droneAction.targetLocation.y = drone.droneY - 600;

      return true;
    } else if (radarLoc === "BL") {
      droneAction.targetLocation.x = drone.droneX - 600;
      droneAction.targetLocation.y = drone.droneY + 600;

      return true;
    } else if (radarLoc === "BR") {
      droneAction.targetLocation.x = drone.droneX + 600;
      droneAction.targetLocation.y = drone.droneY + 600;

      return true;
    }

    droneAction.wait = true;
    return true;
  }
}

// class DoZone2Action extends DroneAction {
//   constructor() {
//     super();
//   }

//   runAction(
//     drone: Drone,
//     gameState: GameState,
//     droneAction: DroneActionLol
//   ): boolean {
//     debug("DoZone2Action");

//     var unscannedZone2Fish = gameState.getZ2UnscannedCreatures();

//     if (unscannedZone2Fish.length === 0) {
//       this.completed = true;
//       return false;
//     }

//     var firstFish = unscannedZone2Fish[0];
//     gameState.targetFish.push(firstFish);

//     var loc = gameState.radarBlips.find((r) => r.creatureId === firstFish);

//     var radarLoc = loc?.radar;

//     if (radarLoc === "TL") {
//       droneAction.targetLocation.x = drone.droneX - 600;
//       droneAction.targetLocation.y = drone.droneY - 600;

//       return true;
//     } else if (radarLoc === "TR") {
//       droneAction.targetLocation.x = drone.droneX + 600;
//       droneAction.targetLocation.y = drone.droneY - 600;

//       return true;
//     } else if (radarLoc === "BL") {
//       droneAction.targetLocation.x = drone.droneX - 600;
//       droneAction.targetLocation.y = drone.droneY + 600;

//       return true;
//     } else if (radarLoc === "BR") {
//       droneAction.targetLocation.x = drone.droneX + 600;
//       droneAction.targetLocation.y = drone.droneY + 600;

//       return true;
//     }

//     droneAction.wait = true;
//     return true;
//   }
// }

class DoZone1Action extends DroneAction {
  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug("DoZone1Action");

    var unscannedZone1Fish = gameState.getZ1UnscannedCreatures();

    if (unscannedZone1Fish.length === 0) {
      this.completed = true;
      return false;
    }

    var firstFish = unscannedZone1Fish[0];
    gameState.targetFish.push(firstFish);

    var loc = gameState.radarBlips.find((r) => r.creatureId === firstFish);

    var radarLoc = loc?.radar;

    if (radarLoc) {
      setDroneTargetLocationTowardsCreature(droneAction, radarLoc);
      return true;
    }

    droneAction.wait = true;
    return true;
  }
}

class DoZone2Action extends DroneAction {
  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug("DoZone2Action");

    var unscannedZone2Fish = gameState.getZ2UnscannedCreatures();

    if (unscannedZone2Fish.length === 0) {
      this.completed = true;
      return false;
    }

    var firstFish = unscannedZone2Fish[0];
    gameState.targetFish.push(firstFish);

    var loc = gameState.radarBlips.find((r) => r.creatureId === firstFish);

    var radarLoc = loc?.radar;

    if (radarLoc) {
      setDroneTargetLocationTowardsCreature(droneAction, radarLoc);
      return true;
    }

    droneAction.wait = true;
    return true;
  }
}

class DoZone3Action extends DroneAction {
  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    debug("DoZone3Action");

    var unscannedZone3Fish = gameState.getZ3UnscannedCreatures();

    if (unscannedZone3Fish.length === 0) {
      this.completed = true;
      return false;
    }

    var firstFish = unscannedZone3Fish[0];
    gameState.targetFish.push(firstFish);

    var loc = gameState.radarBlips.find((r) => r.creatureId === firstFish);

    var radarLoc = loc?.radar;

    if (radarLoc) {
      setDroneTargetLocationTowardsCreature(droneAction, radarLoc);
      return true;
    }

    droneAction.wait = true;

    return true;
  }
}

class GameBoard {
  minX: number = 1;
  minY: number = 1;
  maxX: number = 9999;
  maxY: number = 9999;
}

interface FishZone {
  id: number;
  Ymin: number;
  Ymax: number;
  fishType?: FishTypes;
  fishes?: Creature[];
}

class DroneActionLol {
  light: boolean = false;
  targetLocation: { x: number; y: number } = { x: 0, y: 0 };
  wait: boolean = false;
  message: string = "";
}

class SlowDownOnLight extends DroneAction {
  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    if (action.light) {
      action.message = "Slow down on light";

      const vector = createDroneVector(drone, action);

      reduceVectorToMaxUnits(vector, 200);
      action.targetLocation.x = vector.endX;
      action.targetLocation.y = vector.endY;
      return true;
    }

    return false;
  }
}

class FlashLightEvery3Ticks extends DroneAction {
  ticks: number = 0;

  constructor() {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    this.ticks++;

    if (this.ticks % 3 === 0) {
      action.light = true;
    }

    return false;
  }
}

class TurnOffLightIfLowBattery extends DroneAction {
  constructor(private battery: number = 10) {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    if (drone.battery < this.battery) {
      action.light = false;
    }

    return false;
  }
}

class MoveTo extends DroneAction {
  constructor(
    public x: number,
    public y: number
  ) {
    super();
  }

  runAction(
    drone: Drone,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    if (
      Math.abs(drone.droneX - this.x) < 1000 &&
      Math.abs(drone.droneY - this.y) < 1000
    ) {
      this.completed = true;
      return false;
    }

    action.targetLocation.x = this.x;
    action.targetLocation.y = this.y;
    return true;
  }
}

interface Vector {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
}

function setDroneTargetLocationTowardsCreature(
  droneAction: DroneActionLol,
  radarLoc: "TL" | "TR" | "BL" | "BR"
) {
  if (radarLoc === "TL") {
    droneAction.targetLocation.x = drone.droneX - 600;
    droneAction.targetLocation.y = drone.droneY - 600;
  } else if (radarLoc === "TR") {
    droneAction.targetLocation.x = drone.droneX + 600;
    droneAction.targetLocation.y = drone.droneY - 600;
  } else if (radarLoc === "BL") {
    droneAction.targetLocation.x = drone.droneX - 600;
    droneAction.targetLocation.y = drone.droneY + 600;
  } else if (radarLoc === "BR") {
    droneAction.targetLocation.x = drone.droneX + 600;
    droneAction.targetLocation.y = drone.droneY + 600;
  }
}

function reduceVectorToMaxUnits(vector: Vector, maxUnits: number): Vector {
  const vectorLength = Math.sqrt(
    Math.pow(vector.endX - vector.startX, 2) +
      Math.pow(vector.endY - vector.startY, 2)
  );

  const vectorUnitX = (vector.endX - vector.startX) / vectorLength;
  const vectorUnitY = (vector.endY - vector.startY) / vectorLength;

  vector.endX = vector.startX + vectorUnitX * maxUnits;
  vector.endY = vector.startY + vectorUnitY * maxUnits;

  return vector;
}

function createDroneVector(
  drone: Drone,
  droneAction: DroneActionLol,
  maxDroneMoveUnits: number = 600
): Vector {
  const vector = {
    startX: drone.droneX,
    endX: droneAction.targetLocation.x,
    startY: drone.droneY,
    endY: droneAction.targetLocation.y,
  };

  // reduce drone vector to max move units
  return reduceVectorToMaxUnits(vector, maxDroneMoveUnits);
}

function adjustForSingleVectorCollision(
  droneTarget: DroneActionLol,
  droneVector: Vector,
  monsterVector: Vector
) {
  // add drone vector and monster vector

  const vector: Vector = {
    startX: droneVector.startX,
    startY: droneVector.startY,
    endX: droneVector.endX + monsterVector.endX,
    endY: droneVector.endY + monsterVector.endY,
  };

  droneTarget.targetLocation.x = vector.endX;
  droneTarget.targetLocation.y = vector.endY;
}

function adjustForMultipleVectorCollision(
  droneTarget: DroneActionLol,
  droneVector: Vector,
  monsterVectors: Vector[]
) {
  // add drone vector and monster vector

  const monsterVector: Vector = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  // add up all monster vectors to monster vector
  monsterVectors.forEach((m) => {
    monsterVector.endX += m.endX;
    monsterVector.endY += m.endY;
  });

  // subtract monster vector from drone vector

  const vector: Vector = {
    startX: droneVector.startX,
    startY: droneVector.startY,
    endX: droneVector.endX - monsterVector.endX,
    endY: droneVector.endY - monsterVector.endY,
  };

  droneTarget.targetLocation.x = vector.endX;
  droneTarget.targetLocation.y = vector.endY;
}

function avoidMonsterLastDitchEffort(
  drone: Drone,
  droneTarget: DroneActionLol,
  monsters: Monster[]
) {
  const monstersLastPositions = monsters.map((m) => m.getEndPosition());

  // if any end positions are within 500 units of our drone target, steer away from them

  const droneTargetLocation = {
    x: droneTarget.targetLocation.x,
    y: droneTarget.targetLocation.y,
  };

  const monstersWithin500Units = monstersLastPositions.filter((m) => {
    const distance = Math.sqrt(
      Math.pow(m.x - droneTargetLocation.x, 2) +
        Math.pow(m.y - droneTargetLocation.y, 2)
    );

    return distance < 500;
  });

  // WE GOOD
  if (monstersWithin500Units.length === 0) {
    return;
  }

  // WE BAD

  // pick a new target within 600 units that is not within 500 units of a monster last position
  const avoidanceVectors = createDroneVectors(drone, 15);
  const avoidanceVectorsThatWontKillUs = avoidanceVectors.filter((v) => {
    const vectorLastPosition = getVectorLastPosition(v);
    // if vector las position is within 500 units of a monster last position, don't use it
    const monstersWithin500Units = monstersLastPositions.filter((m) => {
      const distance = Math.sqrt(
        Math.pow(m.x - vectorLastPosition.x, 2) +
          Math.pow(m.y - vectorLastPosition.y, 2)
      );

      return distance < 500;
    });
  });

  // if there are no avoidance vectors, we're screwed
  if (avoidanceVectorsThatWontKillUs.length === 0) {
    return;
  }

  // pick the first one
  const avoidanceVector = avoidanceVectorsThatWontKillUs[0];
  droneTarget.targetLocation.x = avoidanceVector.endX;
  droneTarget.targetLocation.y = avoidanceVector.endY;
}

function getVectorLastPosition(vector: Vector): { x: number; y: number } {
  const vectorLength = Math.sqrt(
    Math.pow(vector.endX - vector.startX, 2) +
      Math.pow(vector.endY - vector.startY, 2)
  );

  const vectorUnitX = (vector.endX - vector.startX) / vectorLength;
  const vectorUnitY = (vector.endY - vector.startY) / vectorLength;

  return {
    x: vector.startX + vectorUnitX * vectorLength,
    y: vector.startY + vectorUnitY * vectorLength,
  };
}

function createDroneVectors(drone: Drone, deg: number): Vector[] {
  const maxDroneMoveUnits = 600;

  // create a vector for n directions deg appart
  const degs: number[] = [];
  for (let x = 0; x < 360; x += deg) {
    degs.push(x);
  }

  const vectors = degs.map((d) => {
    const vector = {
      startX: drone.droneX,
      endX: Math.floor(drone.droneX + maxDroneMoveUnits * Math.cos(d)),
      startY: drone.droneY,
      endY: Math.floor(drone.droneY + maxDroneMoveUnits * Math.sin(d)),
    };

    return ensureVectorIsWithinBounds(vector);
  });

  return vectors;
}

function ensureVectorIsWithinBounds(vector: Vector): Vector {
  if (vector.endX < 0) {
    vector.endX = 0;
  }

  if (vector.endX > 10000) {
    vector.endX = 10000;
  }

  if (vector.endY < 0) {
    vector.endY = 0;
  }

  if (vector.endY > 10000) {
    vector.endY = 10000;
  }

  return vector;
}

function ensureDroneActionIsWithinBounds(droneAction: DroneActionLol) {
  if (
    isNaN(droneAction.targetLocation.x) ||
    isNaN(droneAction.targetLocation.y)
  ) {
    droneAction.targetLocation.x = 0;
    droneAction.targetLocation.y = 0;
  }

  if (droneAction.targetLocation.x < 0) {
    droneAction.targetLocation.x = 0;
  }

  if (droneAction.targetLocation.x > 10000) {
    droneAction.targetLocation.x = 10000;
  }

  if (droneAction.targetLocation.y < 0) {
    droneAction.targetLocation.y = 0;
  }

  if (droneAction.targetLocation.y > 10000) {
    droneAction.targetLocation.y = 10000;
  }
}

// find out if any bad guy locations are going to insect with our drone's location
// find out if two vectors are going to intersect
function updateDroneTargetAvoidingMonsters(
  _drone: Drone,
  droneTarget: DroneActionLol,
  monsters: Monster[]
) {
  const maxDroneMoveUnits = 600;
  const areaAroundMonsterToAvoid = 500;

  // initial drone vector
  let droneVector = createDroneVector(_drone, droneTarget, maxDroneMoveUnits);

  const monsterVectors = monsters.map((m) => m.getVector());
  const vectorsWithCollisions = monsterVectors.filter((m) => {
    const intersection = getIntersection(droneVector, m);
    return !!intersection;
  });

  // check that we will not end up within 500 units of a monster
  const monstersFinalPositions = monsters.map((m) => m.getEndPosition());
  const myFinalPosition = {
    x: droneVector.endX,
    y: droneVector.endY,
  };

  // if there are no collisions, we're good

  if (vectorsWithCollisions.length === 0) {
    return;
  }

  // there are collisions, so we need to steer away from them

  // Handle single collision
  if (vectorsWithCollisions.length === 1) {
    adjustForSingleVectorCollision(
      droneTarget,
      droneVector,
      vectorsWithCollisions[0]
    );
    return;
  }

  // Handle multiple collisions
  adjustForMultipleVectorCollision(
    droneTarget,
    droneVector,
    vectorsWithCollisions
  );
  return;
}

function ensureWeStayInBounds(drone: Drone, droneTarget: DroneActionLol) {
  // if the target is out of bounds steer within bounds

  if (droneTarget.targetLocation.x < 0) {
    droneTarget.targetLocation.x = 0;
  }

  if (droneTarget.targetLocation.x > 10000) {
    droneTarget.targetLocation.x = 10000;
  }

  if (droneTarget.targetLocation.y < 0) {
    droneTarget.targetLocation.y = 0;
  }

  if (droneTarget.targetLocation.y > 10000) {
    droneTarget.targetLocation.y = 10000;
  }
}

// find out if any bad guy locations are going to insect with our drone's location
// find out if two vectors are going to intersect
function willDroneInterceptCreature(
  Drone: Drone,
  droneTarget: DroneActionLol,
  creature: VisibleCreature
) {
  const maxDroneMoveUnits = 600;

  const droneVector = {
    startX: Drone.droneX,
    endX: droneTarget.targetLocation.x,
    startY: Drone.droneY,
    endY: droneTarget.targetLocation.y,
  };

  // reduce drone vector to max move units
  const droneVectorLength = Math.sqrt(
    Math.pow(droneVector.endX - droneVector.startX, 2) +
      Math.pow(droneVector.endY - droneVector.startY, 2)
  );
  const droneVectorUnitX =
    (droneVector.endX - droneVector.startX) / droneVectorLength;
  const droneVectorUnitY =
    (droneVector.endY - droneVector.startY) / droneVectorLength;
  droneVector.endX = droneVector.startX + droneVectorUnitX * maxDroneMoveUnits;
  droneVector.endY = droneVector.startY + droneVectorUnitY * maxDroneMoveUnits;

  const creatureVector = {
    startX: creature.creatureX,
    endX: creature.creatureX + creature.creatureVx,
    startY: creature.creatureY,
    endY: creature.creatureY + creature.creatureVy,
  };

  const intersection = getIntersection(droneVector, creatureVector);
  return !!intersection;
}

function getIntersection(
  droneVector: Vector,
  creatureVector: Vector
): { x: number; y: number } | null {
  const x1 = droneVector.startX;
  const y1 = droneVector.startY;
  const x2 = droneVector.endX;
  const y2 = droneVector.endY;

  const x3 = creatureVector.startX;
  const y3 = creatureVector.startY;
  const x4 = creatureVector.endX;
  const y4 = creatureVector.endY;

  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denominator === 0) {
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  if (t > 0 && t < 1 && u > 0) {
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    return { x, y };
  }

  return null;
}

function ensureCoordinatesAreIntegers(droneTarget: DroneActionLol) {
  droneTarget.targetLocation.x = Math.floor(droneTarget.targetLocation.x);
  droneTarget.targetLocation.y = Math.floor(droneTarget.targetLocation.y);
}

function tylarsCollisionAvoidance(
  drone: Drone,
  droneAction: DroneActionLol,
  monsters: Monster[]
) {
  var startx = drone.droneX;
  var endx = droneAction.targetLocation.x;
  var starty = drone.droneY;
  var endy = droneAction.targetLocation.y;

  var angle = (Math.atan2(endy - starty, endx - startx) * 180) / Math.PI;

  debug(
    `Drone ${drone.droneId} is at ${drone.droneX}, ${drone.droneY} and is going to ${droneAction.targetLocation.x}, ${droneAction.targetLocation.y} at angle ${angle}`
  );

  var distance = 600;

  var distX = startx + distance * Math.cos((angle * Math.PI) / 180);
  var distY = starty + distance * Math.sin((angle * Math.PI) / 180);

  debug(
    `Drone ${drone.droneId} is at ${drone.droneX}, ${drone.droneY} and is going to ${distX}, ${distY} at angle ${angle}`
  );

  for (const monst of Object.values(gameState.monsters)) {
    // if monster is within 1000 units of our drone
    if (
      Math.abs(monst.creatureX - drone.droneX) < 1000 &&
      Math.abs(monst.creatureY - drone.droneY) < 1000
    ) {
      debug(
        `fish in our range! ${drone.droneId} is at ${drone.droneX}, ${drone.droneY} and is going to ${monst.creatureX}, ${monst.creatureY} at angle ${angle}`
      );

      // if monster is coming our direction
      if (
        (drone.droneX < monst.creatureX && monst.creatureVx < 0) ||
        (drone.droneY < monst.creatureY && monst.creatureVy < 0) ||
        (drone.droneX > monst.creatureX && monst.creatureVx > 0) ||
        (drone.droneY > monst.creatureY && monst.creatureVy > 0)
      ) {
        distX += monst.creatureVx;
        distY += monst.creatureVy;
        debug(`Diverting x: ${distX} y: ${distY}`);
      }
    }
  }

  droneAction.targetLocation.x = distX;
  droneAction.targetLocation.y = distY;
  ensureCoordinatesAreIntegers(droneAction);
  return;
}

type CalculatedVector = [number, number];

function areVectorsWithinNUnits(
  A: CalculatedVector,
  B: CalculatedVector,
  N: number
): boolean {
  let C: CalculatedVector = [A[0] - B[0], A[1] - B[1]]; // Subtract B from A
  let magnitude_C: number = Math.sqrt(C[0] ** 2 + C[1] ** 2); // Calculate the magnitude of C
  return magnitude_C <= N; // Check if the magnitude of C is less than or equal to N
}

// Convert vectors from (startX, endX, startY, endY) to (x, y)
function convertVector(vector: Vector): CalculatedVector {
  return [vector.endX - vector.startX, vector.endY - vector.startY];
}

function newCollisionAvoidance(
  _drone: Drone,
  droneAction: DroneActionLol,
  monsters: Monster[],
  deg: number,
  runAway: boolean = false,
  dangerZone: number = 800
): void {
  debug(`drone ${drone.droneId}`);
  const maxDroneMoveUnits = 600;
  const areaAroundMonsterToAvoid = 900;

  // initial drone vector
  let droneVector = createDroneVector(_drone, droneAction, maxDroneMoveUnits);

  const monsterVectors = monsters.map((m) => m.getVector());

  // check that we will not end up within 500 units of a monster
  const monstersFinalPositions = monsters.map((m) => m.getEndPosition());
  const myFinalPosition = {
    x: droneVector.endX,
    y: droneVector.endY,
  };

  // check if we have any final positions within 500 units of a monster
  const monstersWithin500Units = monstersFinalPositions.filter((m) => {
    const distance = Math.sqrt(
      Math.pow(m.x - myFinalPosition.x, 2) +
        Math.pow(m.y - myFinalPosition.y, 2)
    );

    return distance < areaAroundMonsterToAvoid;
  });

  const vectorsWithCollisions = monsterVectors.filter((m) => {
    const intersection = getIntersection(droneVector, m);
    return !!intersection;
  });

  debug(`vectorsWithCollisions: ${vectorsWithCollisions.length}`);
  debug(`monstersWithin500Units: ${monstersWithin500Units.length}`);

  if (
    vectorsWithCollisions.length === 0 &&
    monstersWithin500Units.length === 0
  ) {
    return;
  }

  const newVectors = createDroneVectors(_drone, deg).filter((myNewVector) => {
    // remove vectors that will collide with monsters
    const vectorsWithCollisions = monsterVectors.filter((monstersVector) => {
      return !areVectorsWithinNUnits(
        convertVector(myNewVector),
        convertVector(monstersVector),
        dangerZone
      );
    });

    return vectorsWithCollisions.length === 0;
  });

  // we screwed
  if (newVectors.length === 0) {
    return;
  }

  debug(`newVectors: ${newVectors.length}`);

  let bestVector: Vector;

  if (!runAway) {
    // find new vector closest to our drone vector
    bestVector = newVectors.reduce((prev, curr) => {
      const prevDistance = Math.sqrt(
        Math.pow(prev.endX - droneVector.endX, 2) +
          Math.pow(prev.endY - droneVector.endY, 2)
      );
      const currDistance = Math.sqrt(
        Math.pow(curr.endX - droneVector.endX, 2) +
          Math.pow(curr.endY - droneVector.endY, 2)
      );

      return prevDistance < currDistance ? prev : curr;
    });
  } else {
    // find new vectors furthest from monsters
    bestVector = newVectors.reduce((prev, curr) => {
      const prevDistance = Math.sqrt(
        Math.pow(prev.endX - droneVector.endX, 2) +
          Math.pow(prev.endY - droneVector.endY, 2)
      );
      const currDistance = Math.sqrt(
        Math.pow(curr.endX - droneVector.endX, 2) +
          Math.pow(curr.endY - droneVector.endY, 2)
      );

      return prevDistance > currDistance ? prev : curr;
    });
  }

  debug(`closestVector: ${JSON.stringify(bestVector)}`);

  droneAction.targetLocation.x = bestVector.endX;
  droneAction.targetLocation.y = bestVector.endY;
}

function slowDownWhenLight(
  drone: Drone,
  droneAction: DroneActionLol,
  value: number = 300
) {
  if (droneAction.light) {
    const vector = createDroneVector(drone, droneAction);

    reduceVectorToMaxUnits(vector, value);
    droneAction.targetLocation.x = vector.endX;
    droneAction.targetLocation.y = vector.endY;
  }
}

function getVectorFinalPosition(vector: Vector): { x: number; y: number } {
  const vectorLength = Math.sqrt(
    Math.pow(vector.endX - vector.startX, 2) +
      Math.pow(vector.endY - vector.startY, 2)
  );

  const vectorUnitX = (vector.endX - vector.startX) / vectorLength;
  const vectorUnitY = (vector.endY - vector.startY) / vectorLength;

  return {
    x: vector.startX + vectorUnitX * vectorLength,
    y: vector.startY + vectorUnitY * vectorLength,
  };
}

const gameState = new GameState();
gameState.readCreatureCount();

// game loop
while (true) {
  gameState.readGameState();
  gameState.log();
  for (let i = 0; i < gameState.myDrones.length; i++) {
    var drone = gameState.myDrones[i];

    // if we're higher than

    const droneAction = new DroneActionLol();

    // run rules
    for (const action of drone.droneActions) {
      if (action.completed) {
        continue;
      }

      var response = action.runAction(drone, gameState, droneAction);

      if (response) {
        break;
      }
    }

    // updateDroneTargetAvoidingMonsters(
    //   drone,
    //   droneAction,
    //   Object.values(gameState.monsters).filter((m) => m.encountered)
    // );

    // ensureWeStayInBounds(drone, droneAction);
    // ensureCoordinatesAreIntegers(droneAction);
    // avoidMonsterLastDitchEffort(
    //   drone,
    //   droneAction,
    //   Object.values(gameState.monsters).filter((m) => m.encountered)
    // );

    // get angle
    // tylarsCollisionAvoidance(
    //   drone,
    //   droneAction,
    //   Object.values(gameState.monsters).filter((m) => m.encountered)
    // );

    newCollisionAvoidance(
      drone,
      droneAction,
      Object.values(gameState.monsters).filter((m) => m.encountered),
      45,
      false
    );

    // slowDownWhenLight(drone, droneAction, 450);
    ensureDroneActionIsWithinBounds(droneAction);
    ensureCoordinatesAreIntegers(droneAction);

    if (droneAction.wait) {
      drone.wait(droneAction.light, droneAction.message);
    } else {
      drone.move(
        droneAction.targetLocation.x,
        droneAction.targetLocation.y,
        droneAction.light,
        droneAction.message
      );
    }
  }
}

function debug(message: string) {
  printErr(message);
}
