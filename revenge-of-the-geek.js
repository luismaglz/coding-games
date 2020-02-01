/// <reference path="./definitions.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var NONE = -1;
var HOLE = 1;
var ORE = 4;
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
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.distance = function (pos) {
        return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
    };
    return Point;
}());
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    function Entity(x, y, type, id) {
        var _this = _super.call(this, x, y) || this;
        _this.id = id;
        _this.type = type;
        return _this;
    }
    return Entity;
}(Point));
var EnemyRobot = /** @class */ (function (_super) {
    __extends(EnemyRobot, _super);
    function EnemyRobot(x, y, type, id) {
        var _this = _super.call(this, x, y, type, id) || this;
        _this.hasItem = false;
        return _this;
    }
    return EnemyRobot;
}(Entity));
var Robot = /** @class */ (function (_super) {
    __extends(Robot, _super);
    function Robot(x, y, type, id, item) {
        var _this = _super.call(this, x, y, type, id) || this;
        _this.currentJob = "MINE";
        _this.item = item;
        return _this;
    }
    Robot.prototype.isDead = function () {
        return this.x === -1 && this.y === -1;
    };
    Robot.prototype.move = function (x, y, message) {
        if (message === void 0) { message = ""; }
        console.log("MOVE " + x + " " + y + " " + message);
    };
    Robot.prototype.wait = function (message) {
        if (message === void 0) { message = ""; }
        console.log("WAIT " + message);
    };
    Robot.prototype.dig = function (x, y, message) {
        if (message === void 0) { message = ""; }
        console.log("DIG " + x + " " + y + " " + message);
    };
    Robot.prototype.go_to_base = function (message) {
        if (message === void 0) { message = ""; }
        console.log("MOVE " + 0 + " " + this.y + " " + message);
    };
    Robot.prototype.has_ore = function () {
        return this.item === ItemType.ORE;
    };
    Robot.prototype.has_trap = function () {
        return this.item === ItemType.TRAP;
    };
    Robot.prototype.has_radar = function () {
        return this.item === ItemType.RADAR;
    };
    Robot.prototype.request = function (item, message) {
        if (message === void 0) { message = ""; }
        if (item === ItemType.RADAR) {
            console.log("REQUEST RADAR " + message);
        }
        else if (item === ItemType.TRAP) {
            console.log("REQUEST TRAP " + message);
        }
        else {
            throw Error("unrecognized item: " + item);
        }
    };
    return Robot;
}(Entity));
var Cell = /** @class */ (function (_super) {
    __extends(Cell, _super);
    function Cell(ore, hole, x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.hole = 0;
        _this.ore = "?";
        _this.previousOre = _this.ore;
        _this.previousHole = _this.hole;
        _this.isBad = false;
        _this.update(ore, hole);
        return _this;
    }
    Cell.prototype.hasHole = function () {
        return this.hole === HOLE;
    };
    Cell.prototype.setIsBad = function (game) {
        var _this = this;
        if (this.hole === this.previousHole &&
            this.ore === this.previousOre &&
            this.isBad === false) {
            this.isBad = false;
        }
        else {
            this.isBad = true;
        }
        var cell = game.radarLocations.find(function (c) { return c.x === _this.x && c.y === _this.y; });
        if (cell) {
            this.isBad = true;
        }
    };
    Cell.prototype.hasOre = function () {
        if (this.ore === "?" || this.ore === 0) {
            return false;
        }
        return true;
    };
    Cell.prototype.hasTrap = function () { };
    Cell.prototype.hasRadar = function () { };
    Cell.prototype.update = function (ore, hole) {
        if (this.x === 0 && this.y === 0) {
            console.error("update", ore);
        }
        this.previousHole = this.hole;
        if (ore !== "?") {
            this.previousOre = this.ore;
            this.ore = parseInt(ore.toString(), 10);
        }
        this.hole = hole;
    };
    return Cell;
}(Point));
var Grid = /** @class */ (function () {
    function Grid() {
        this.cells = [];
    }
    Grid.prototype.init = function () {
        for (var y = 0; y < MAP_HEIGHT; y++) {
            for (var x = 0; x < MAP_WIDTH; x++) {
                var index = x + MAP_WIDTH * y;
                this.cells[index] = new Cell("?", 0, x, y);
            }
        }
    };
    Grid.prototype.getCell = function (x, y) {
        if (x < MAP_WIDTH && y < MAP_HEIGHT && x >= 0 && y >= 0) {
            return this.cells[x + MAP_WIDTH * y];
        }
        return null;
    };
    return Grid;
}());
var Game = /** @class */ (function () {
    function Game() {
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
    Game.prototype.getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    };
    Game.prototype.reset = function () {
        this.radars = [];
        this.traps = [];
        this.myRobots = [];
        // this.enemyRobots = [];
    };
    return Game;
}());
var inputs = readline().split(" ");
var MAP_WIDTH = parseInt(inputs[0]);
var MAP_HEIGHT = parseInt(inputs[1]); // size of the map
var game = new Game();
var _loop_1 = function () {
    game.turns++;
    var inputsScore = readline().split(" ");
    game.myScore = parseInt(inputsScore[0]); // Players score
    game.enemyScore = parseInt(inputsScore[1]);
    for (var i = 0; i < MAP_HEIGHT; i++) {
        var inputs_1 = readline().split(" ");
        for (var j = 0; j < MAP_WIDTH; j++) {
            var ore = inputs_1[2 * j]; // amount of ore or "?" if unknown
            var hole = parseInt(inputs_1[2 * j + 1]); // 1 if cell has a hole
            game.grid.getCell(j, i).update(ore, hole);
        }
    }
    var inputsStatus = readline().split(" ");
    var entityCount = parseInt(inputsStatus[0]); // number of visible entities
    game.radarCooldown = parseInt(inputsStatus[1]); // turns left until a new radar can be requested
    game.trapCooldown = parseInt(inputsStatus[2]); // turns left until a new trap can be requested
    game.reset();
    var _loop_2 = function (i) {
        var inputsEntities = readline().split(" ");
        var id = parseInt(inputsEntities[0]); // unique id of the entity
        var type = parseInt(inputsEntities[1]); // 0 for your robot, 1 for other robot, 2 for radar, 3 for trap
        var x = parseInt(inputsEntities[2]);
        var y = parseInt(inputsEntities[3]); // position of the entity
        var item = parseInt(inputsEntities[4]); // if this entity is a robot, the item it is carrying (-1 for NONE, 2 for RADAR, 3 for TRAP, 4 for ORE)
        if (type === EntityType.ROBOT_ALLY) {
            game.myRobots.push(new Robot(x, y, type, id, item));
        }
        else if (type === EntityType.ROBOT_ENEMY) {
            if (game.enemyRobots.length < 5) {
                game.enemyRobots.push(new EnemyRobot(x, y, type, id));
            }
            else {
                var enemy = game.enemyRobots.find(function (r) { return r.id === id; });
                if (enemy.hasItem) {
                    if (enemy.x === x && enemy.y === y && enemy.x !== 0) {
                        enemy.hasItem = false;
                        var top_1 = game.grid.getCell(enemy.x, enemy.y + 1);
                        var bottom = game.grid.getCell(enemy.x, enemy.y - 1);
                        var left = game.grid.getCell(enemy.x - 1, y);
                        var right = game.grid.getCell(enemy.x + 1, y);
                        var center = game.grid.getCell(enemy.x, y);
                        [center, top_1, bottom, left, right].forEach(function (c) {
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
    };
    for (var i = 0; i < entityCount; i++) {
        _loop_2(i);
    }
    var _loop_3 = function (x) {
        var rad = game.originalRadars[0];
        var cell = game.grid.getCell(rad.x, rad.y);
        if (cell.isBad) {
            game.originalRadars.splice(x, 1);
            var ri = game.radars.findIndex(function (r) { return r.x === cell.x && r.y === cell.y; });
            if (ri !== -1) {
                game.radarLocations.splice(ri, 1);
            }
        }
    };
    for (var x = 0; x < game.originalRadars.length; x++) {
        _loop_3(x);
    }
    console.error(game.grid.getCell(5, 11));
    console.error(game.enemyRobots.find(function (r) { return r.id === 7; }));
    if (game.radars.length !== 19 - game.radarLocations.length) {
        // someone took out a radar
        game.radarLocations = game.originalRadars.filter(function (r) { return game.radars.findIndex(function (gr) { return gr.x === r.x && gr.y === r.y; }) === -1; });
    }
    var availableCells = game.grid.cells
        .filter(function (c) { return c.hasOre() === true && c.isBad === false; })
        .map(function (c) { return new Cell(c.ore, c.hole, c.x, c.y); });
    var nextRadar = game.radarLocations[0];
    var availableUnknownCells = [];
    if (nextRadar) {
        availableUnknownCells = game.grid.cells
            .filter(function (c) { return c.isBad === false && c.ore === "?" && c.hasHole() === false; })
            .sort(function (ra, rb) {
            var raD = ra.distance(nextRadar);
            var rbD = rb.distance(nextRadar);
            return raD - rbD;
        });
    }
    game.myRobots.forEach(function (r) { return (r.currentJob = "MINE"); });
    if (game.radarCooldown === 0 &&
        game.radarLocations[0] &&
        game.myRobots.filter(function (r) { return r.item === ItemType.RADAR; }).length === 0 &&
        availableCells.length < 3) {
        var robots = game.myRobots
            .map(function (r) { return r; })
            .sort(function (ra, rb) {
            var raD = ra.distance(new Point(0, game.radarLocations[0].y));
            var rbD = rb.distance(new Point(0, game.radarLocations[0].y));
            return raD - rbD;
        });
        robots[0].currentJob = "RADAR";
    }
    game.myRobots.forEach(function (robot) {
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
            var location_1;
            if (game.grid.getCell(game.radarLocations[0].x, game.radarLocations[0].y)
                .isBad === true) {
                location_1 = new Point(game.radarLocations[0].x - 1, game.radarLocations[0].y);
            }
            else {
                location_1 = game.radarLocations[0];
            }
            robot.dig(location_1.x, location_1.y);
            if (robot.distance(location_1) <= 1) {
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
            var cell = availableCells.sort(function (ca, cb) {
                var raD = ca.distance(robot);
                var rbD = cb.distance(robot);
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
};
// game loop
while (true) {
    _loop_1();
}
