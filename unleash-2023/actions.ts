// class GoToTopForce extends DroneAction {
//   runAction(drone: Drone, gameState: GameState): boolean {
//     debug("GoToTops");
//     drone.move(drone.droneX, 0, false);
//     return true;
//   }
// }

// class TurnOnLightAction extends DroneAction {
//   constructor() {
//     super();
//   }

//   runAction(drone: Drone, gameState: GameState): boolean {
//     debug("TurnOnLightAction");

//     if (drone.battery < 10) {
//       drone.wait(true, "Waiting cause battery is low");
//       return true;
//     }

//     return false;
//   }
// }

// class BailIfMonster extends DroneAction {
//   constructor() {
//     super();
//   }

//   runAction(drone: Drone, gameState: GameState): boolean {
//     debug("BailIfMonster");

//     if (gameState.isMonsterWithinDroneRange(drone)) {
//       drone.move(drone.droneX, 0, false);
//       return false;
//     }

//     return false;
//   }
// }

// class TurnOnLightActionAt extends DroneAction {
//   constructor(
//     public y: number,
//     public xoffset: number = 0
//   ) {
//     super();
//   }

//   runAction(drone: Drone, gameState: GameState): boolean {
//     debug(`TurnOnLightActionAt ${this.y}`);

//     const shouldTurnOnLight = !gameState.isMonsterWithinDroneRange(drone);

//     if (Math.abs(drone.droneY - this.y) < 100) {
//       drone.wait(shouldTurnOnLight, "Hit marker, light on baby");
//       this.completed = true;
//       return true;
//     }

//     // move each drone to the center of it's lane.
//     drone.move(
//       (drone.isLeft ? 2500 : 6500) - this.xoffset,
//       this.y,
//       false,
//       "moving to light on"
//     );
//     return true;
//   }
// }

// class InitialSinkAction extends DroneAction {
//   constructor() {
//     super();
//   }

//   runAction(drone: Drone): boolean {
//     debug("InitialSinkAction");

//     if (drone.droneY >= 2500) {
//       this.completed = true;
//       // action complete. do not stop processing other actions
//       return false;
//     }

//     if (drone.droneY < 2500) {
//       drone.move(drone.droneX, 10000, false);
//       return true;
//     }

//     return false;
//   }
// }
// class DoNothingAction extends DroneAction {
//   constructor() {
//     super();
//   }

//   runAction(drone: Drone): boolean {
//     debug("DoNothingAction");

//     drone.wait(false, "Waiting cause nothing else was provided");
//     return true;
//   }
// }

// //sadas
