"use strict";
/// <reference path="./definitions.d.ts" />
const NONE = -1;
const HOLE = 1;
const ORE = 4;
var EntityType;
(function (EntityType) {
    EntityType[EntityType["ROBOT_ALLY"] = 0] = "ROBOT_ALLY";
    EntityType[EntityType["ROBOT_ENEMY"] = 1] = "ROBOT_ENEMY";
    EntityType[EntityType["RADAR"] = 2] = "RADAR";
    EntityType[EntityType["TRAP"] = 3] = "TRAP";
})(EntityType || (EntityType = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["NONE"] = -1] = "NONE";
    ItemType[ItemType["RADAR"] = 2] = "RADAR";
    ItemType[ItemType["TRAP"] = 3] = "TRAP";
    ItemType[ItemType["ORE"] = 4] = "ORE";
})(ItemType || (ItemType = {}));
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    distance(pos) {
        return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
    }
}
class Entity extends Point {
    constructor(x, y, type, id) {
        super(x, y);
        this.id = id;
        this.type = type;
    }
}
class EnemyRobot extends Entity {
    constructor(x, y, type, id) {
        super(x, y, type, id);
        this.hasItem = false;
    }
}
class Robot extends Entity {
    constructor(x, y, type, id, item) {
        super(x, y, type, id);
        this.currentJob = "MINE";
        this.item = item;
    }
    isDead() {
        return this.x === -1 && this.y === -1;
    }
    move(x, y, message = "") {
        console.log(`MOVE ${x} ${y} ${message}`);
    }
    wait(message = "") {
        console.log(`WAIT ${message}`);
    }
    dig(x, y, message = "") {
        console.log(`DIG ${x} ${y} ${message}`);
    }
    go_to_base(message = "") {
        console.log(`MOVE ${0} ${this.y} ${message}`);
    }
    has_ore() {
        return this.item === ItemType.ORE;
    }
    has_trap() {
        return this.item === ItemType.TRAP;
    }
    has_radar() {
        return this.item === ItemType.RADAR;
    }
    request(item, message = "") {
        if (item === ItemType.RADAR) {
            console.log(`REQUEST RADAR ${message}`);
        }
        else if (item === ItemType.TRAP) {
            console.log(`REQUEST TRAP ${message}`);
        }
        else {
            throw Error(`unrecognized item: ${item}`);
        }
    }
}
class Cell extends Point {
    constructor(ore, hole, x, y) {
        super(x, y);
        this.hole = 0;
        this.ore = "?";
        this.previousOre = this.ore;
        this.previousHole = this.hole;
        this.isBad = false;
        this.update(ore, hole);
    }
    hasHole() {
        return this.hole === HOLE;
    }
    setIsBad(game) {
        if (this.hole === this.previousHole &&
            this.ore === this.previousOre &&
            this.isBad === false) {
            this.isBad = false;
        }
        else {
            this.isBad = true;
        }
        const cell = game.radarLocations.find(c => c.x === this.x && c.y === this.y);
        if (cell) {
            this.isBad = true;
        }
    }
    hasOre() {
        if (this.ore === "?" || this.ore === 0) {
            return false;
        }
        return true;
    }
    hasTrap() { }
    hasRadar() { }
    update(ore, hole) {
        if (this.x === 0 && this.y === 0) {
            console.error("update", ore);
        }
        this.previousHole = this.hole;
        if (ore !== "?") {
            this.previousOre = this.ore;
            this.ore = parseInt(ore.toString(), 10);
        }
        this.hole = hole;
    }
}
class Grid {
    constructor() {
        this.cells = [];
    }
    init() {
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                let index = x + MAP_WIDTH * y;
                this.cells[index] = new Cell("?", 0, x, y);
            }
        }
    }
    getCell(x, y) {
        if (x < MAP_WIDTH && y < MAP_HEIGHT && x >= 0 && y >= 0) {
            return this.cells[x + MAP_WIDTH * y];
        }
        return null;
    }
}
class Game {
    constructor() {
        this.turns = 0;
        this.radars = [];
        this.traps = [];
        this.myRobots = [];
        this.enemyRobots = [];
        this.start = 5;
        this.radarLocations = [];
        this.originalRadars = [];
        this.grid = new Grid();
        this.grid.init();
        this.myScore = 0;
        this.enemyScore = 0;
        this.radarCooldown = 0;
        this.trapCooldown = 0;
        this.start = this.getRandomInt(4, 7);
        this.radarLocations = [
            new Point(5, 3),
            new Point(9, 7),
            new Point(5, 11),
            new Point(12, 3),
            new Point(16, 7),
            new Point(12, 11),
            new Point(19, 3),
            new Point(21, 7),
            new Point(19, 11),
            new Point(26, 3),
            new Point(26, 11),
            new Point(9, 0),
            new Point(9, 14),
            new Point(16, 0),
            new Point(16, 14),
            new Point(23, 0),
            new Point(23, 14),
            new Point(29, 7),
            new Point(1, 7)
        ];
        this.originalRadars = this.radarLocations;
        this.reset();
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    reset() {
        this.radars = [];
        this.traps = [];
        this.myRobots = [];
        // this.enemyRobots = [];
    }
}
let inputs = readline().split(" ");
const MAP_WIDTH = parseInt(inputs[0]);
const MAP_HEIGHT = parseInt(inputs[1]); // size of the map
let game = new Game();
// game loop
while (true) {
    game.turns++;
    let inputsScore = readline().split(" ");
    game.myScore = parseInt(inputsScore[0]); // Players score
    game.enemyScore = parseInt(inputsScore[1]);
    for (let i = 0; i < MAP_HEIGHT; i++) {
        let inputs = readline().split(" ");
        for (let j = 0; j < MAP_WIDTH; j++) {
            const ore = inputs[2 * j]; // amount of ore or "?" if unknown
            const hole = parseInt(inputs[2 * j + 1]); // 1 if cell has a hole
            game.grid.getCell(j, i).update(ore, hole);
        }
    }
    let inputsStatus = readline().split(" ");
    const entityCount = parseInt(inputsStatus[0]); // number of visible entities
    game.radarCooldown = parseInt(inputsStatus[1]); // turns left until a new radar can be requested
    game.trapCooldown = parseInt(inputsStatus[2]); // turns left until a new trap can be requested
    game.reset();
    for (let i = 0; i < entityCount; i++) {
        let inputsEntities = readline().split(" ");
        const id = parseInt(inputsEntities[0]); // unique id of the entity
        const type = parseInt(inputsEntities[1]); // 0 for your robot, 1 for other robot, 2 for radar, 3 for trap
        const x = parseInt(inputsEntities[2]);
        const y = parseInt(inputsEntities[3]); // position of the entity
        const item = parseInt(inputsEntities[4]); // if this entity is a robot, the item it is carrying (-1 for NONE, 2 for RADAR, 3 for TRAP, 4 for ORE)
        if (type === EntityType.ROBOT_ALLY) {
            game.myRobots.push(new Robot(x, y, type, id, item));
        }
        else if (type === EntityType.ROBOT_ENEMY) {
            if (game.enemyRobots.length < 5) {
                game.enemyRobots.push(new EnemyRobot(x, y, type, id));
            }
            else {
                const enemy = game.enemyRobots.find(r => r.id === id);
                if (enemy.hasItem) {
                    if (enemy.x === x && enemy.y === y && enemy.x !== 0) {
                        enemy.hasItem = false;
                        const top = game.grid.getCell(enemy.x, enemy.y + 1);
                        const bottom = game.grid.getCell(enemy.x, enemy.y - 1);
                        const left = game.grid.getCell(enemy.x - 1, y);
                        const right = game.grid.getCell(enemy.x + 1, y);
                        const center = game.grid.getCell(enemy.x, y);
                        [center, top, bottom, left, right].forEach(c => {
                            if (c !== null) {
                                c.setIsBad(game);
                            }
                        });
                    }
                }
                else {
                    enemy.hasItem = enemy.x === 0 && x === 0 && enemy.y === y;
                }
                enemy.x = x;
                enemy.y = y;
            }
        }
        else if (type === EntityType.RADAR) {
            game.radars.push(new Entity(x, y, type, id));
        }
        else if (type === EntityType.TRAP) {
            game.traps.push(new Entity(x, y, type, id));
        }
    }
    for (let x = 0; x < game.originalRadars.length; x++) {
        const rad = game.originalRadars[0];
        const cell = game.grid.getCell(rad.x, rad.y);
        if (cell.isBad) {
            game.originalRadars.splice(x, 1);
            const ri = game.radars.findIndex(r => r.x === cell.x && r.y === cell.y);
            if (ri !== -1) {
                game.radarLocations.splice(ri, 1);
            }
        }
    }
    console.error(game.grid.getCell(5, 11));
    console.error(game.enemyRobots.find(r => r.id === 7));
    if (game.radars.length !== 19 - game.radarLocations.length) {
        // someone took out a radar
        game.radarLocations = game.originalRadars.filter(r => game.radars.findIndex(gr => gr.x === r.x && gr.y === r.y) === -1);
    }
    const availableCells = game.grid.cells
        .filter(c => c.hasOre() === true && c.isBad === false)
        .map(c => new Cell(c.ore, c.hole, c.x, c.y));
    const nextRadar = game.radarLocations[0];
    let availableUnknownCells = [];
    if (nextRadar) {
        availableUnknownCells = game.grid.cells
            .filter(c => c.isBad === false && c.ore === "?" && c.hasHole() === false)
            .sort((ra, rb) => {
            const raD = ra.distance(nextRadar);
            const rbD = rb.distance(nextRadar);
            return raD - rbD;
        });
    }
    game.myRobots.forEach(r => (r.currentJob = "MINE"));
    if (game.radarCooldown === 0 &&
        game.radarLocations[0] &&
        game.myRobots.filter(r => r.item === ItemType.RADAR).length === 0 &&
        availableCells.length < 3) {
        const robots = game.myRobots
            .map(r => r)
            .sort((ra, rb) => {
            const raD = ra.distance(new Point(0, game.radarLocations[0].y));
            const rbD = rb.distance(new Point(0, game.radarLocations[0].y));
            return raD - rbD;
        });
        robots[0].currentJob = "RADAR";
    }
    game.myRobots.forEach(robot => {
        if (robot.isDead()) {
            // Is dead
            robot.wait();
            return;
        }
        else if (robot.has_ore()) {
            robot.go_to_base();
            return;
        }
        else if (robot.has_radar() && game.radarLocations.length > 0) {
            // Has radar
            let location;
            if (game.grid.getCell(game.radarLocations[0].x, game.radarLocations[0].y)
                .isBad === true) {
                location = new Point(game.radarLocations[0].x - 1, game.radarLocations[0].y);
            }
            else {
                location = game.radarLocations[0];
            }
            robot.dig(location.x, location.y);
            if (robot.distance(location) <= 1) {
                game.radarLocations.shift();
            }
            return;
        }
        else if (robot.has_trap()) {
            robot.wait();
            return;
        }
        else if (robot.currentJob === "RADAR") {
            robot.request(ItemType.RADAR);
            return;
        }
        else if (availableCells.length > 0) {
            //dig !
            const cell = availableCells.sort((ca, cb) => {
                const raD = ca.distance(robot);
                const rbD = cb.distance(robot);
                return raD - rbD;
            })[0];
            robot.dig(cell.x, cell.y);
            cell.ore = cell.ore - 1;
            if (cell.ore === 0) {
                availableCells.shift();
            }
            return;
        }
        else if (availableCells &&
            availableCells.length === 0 &&
            availableUnknownCells &&
            availableUnknownCells.length > 0) {
            robot.dig(availableUnknownCells[0].x, availableUnknownCells[0].y, "random");
            availableUnknownCells.shift();
            return;
        }
        else {
            robot.wait();
        }
    });
    //   for (let i = 0; i < game.myRobots.length; i++) {
    //     game.myRobots[i].dig(game.myRobots[i].x + 2, game.myRobots[i].y);
    //   }
}
