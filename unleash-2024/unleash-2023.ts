declare function readline(): string;
declare function print(value: string): void;
declare function printErr(message: string): void;

class GameState {
  turns: number = 0;

  constructor() {}

  log(): void {
    // debug(`radarBlips ${JSON.stringify(this.radarBlips)}`);
  }

  checkCustomGameState() {

  }


  readGameState() {
    // read and update gamestate


    this.turns++;
  }
}

class Player {

  droneActions: Action[] = [
    // new BailIfMonster(),
   
  ];

  constructor(
    droneId: number,
    droneX: number,
    droneY: number,
    emergency: number,
    battery: number
  ) {
  
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



abstract class Action {
  completed: boolean;

  constructor() {
    this.completed = false;
  }

  abstract runAction(
    drone: Player,
    gameState: GameState,
    action: Action1
  ): boolean;
}



class Action1 extends Action {
  constructor() {
    super();
  }

  runAction(
    drone: Player,
    gameState: GameState,
    droneAction: DroneActionLol
  ): boolean {
    return true;
  }
}

class DoZone3Action extends Action {
  constructor() {
    super();
  }

  runAction(
    drone: Player,
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

class GameBoard {
  minX: number = 1;
  minY: number = 1;
  maxX: number = 9999;
  maxY: number = 9999;
}


class TurnOffLightIfLowBattery extends Action {
  constructor() {
    super();
  }

  runAction(
    drone: Player,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    if (drone.battery < 10) {
      action.light = false;
    }

    return false;
  }
}

class MoveTo extends Action {
  constructor(
    public x: number,
    public y: number
  ) {
    super();
  }

  runAction(
    drone: Player,
    gameState: GameState,
    action: DroneActionLol
  ): boolean {
    if (
      Math.abs(drone.droneX - this.x) < 300 &&
      Math.abs(drone.droneY - this.y) < 300
    ) {
      this.completed = true;
      return false;
    }

    action.targetLocation.x = this.x;
    action.targetLocation.y = this.y;
    return true;
  }
}

const gameState = new GameState();

// game loop
while (true) {
  gameState.readGameState();
  gameState.log();
  for (let i = 0; i < gameState.myDrones.length; i++) {

  }
}

function debug(message: string) {
  printErr(message);
}
