


/**
 * Score points by scanning valuable fish faster than your opponent.
 **/

const creatureCount: number = parseInt(readline());
for (let i = 0; i < creatureCount; i++) {
  var inputs: string[] = readline().split(" ");
  const creatureId: number = parseInt(inputs[0]);
  const color: number = parseInt(inputs[1]);
  const type: number = parseInt(inputs[2]);
}

// game loop
while (true) {
  const myScore: number = parseInt(readline());
  const foeScore: number = parseInt(readline());
  const myScanCount: number = parseInt(readline());
  for (let i = 0; i < myScanCount; i++) {
    const creatureId: number = parseInt(readline());
  }
  const foeScanCount: number = parseInt(readline());
  for (let i = 0; i < foeScanCount; i++) {
    const creatureId: number = parseInt(readline());
  }
  const myDroneCount: number = parseInt(readline());
  for (let i = 0; i < myDroneCount; i++) {
    var inputs: string[] = readline().split(" ");
    const droneId: number = parseInt(inputs[0]);
    const droneX: number = parseInt(inputs[1]);
    const droneY: number = parseInt(inputs[2]);
    const emergency: number = parseInt(inputs[3]);
    const battery: number = parseInt(inputs[4]);
  }
  const foeDroneCount: number = parseInt(readline());
  for (let i = 0; i < foeDroneCount; i++) {
    var inputs: string[] = readline().split(" ");
    const droneId: number = parseInt(inputs[0]);
    const droneX: number = parseInt(inputs[1]);
    const droneY: number = parseInt(inputs[2]);
    const emergency: number = parseInt(inputs[3]);
    const battery: number = parseInt(inputs[4]);
  }
  const droneScanCount: number = parseInt(readline());
  for (let i = 0; i < droneScanCount; i++) {
    var inputs: string[] = readline().split(" ");
    const droneId: number = parseInt(inputs[0]);
    const creatureId: number = parseInt(inputs[1]);
  }
  const visibleCreatureCount: number = parseInt(readline());
  for (let i = 0; i < visibleCreatureCount; i++) {
    var inputs: string[] = readline().split(" ");
    const creatureId: number = parseInt(inputs[0]);
    const creatureX: number = parseInt(inputs[1]);
    const creatureY: number = parseInt(inputs[2]);
    const creatureVx: number = parseInt(inputs[3]);
    const creatureVy: number = parseInt(inputs[4]);
  }
  const radarBlipCount: number = parseInt(readline());
  for (let i = 0; i < radarBlipCount; i++) {
    var inputs: string[] = readline().split(" ");
    const droneId: number = parseInt(inputs[0]);
    const creatureId: number = parseInt(inputs[1]);
    const radar: string = inputs[2];
  }
  for (let i = 0; i < myDroneCount; i++) {
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    console.log("WAIT 1"); // MOVE <x> <y> <light (1|0)> | WAIT <light (1|0)>
  }
}
