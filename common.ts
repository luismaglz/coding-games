export interface Point {
  X: number;
  Y: number;
}

export interface Grid {
  dictionary: Dictionary<GridPoint>;
  squares: GridPoint[];
}

export interface GridPoint extends Point {
  siblings: string[];
  fScore: number;
  gCost: number;
  hCost: number;
  origin: GridPoint | null;
  id: string;
}

export type Dictionary<T> = { [key: string]: T };

export function makePoint(X: number, Y: number): Point {
  return {
    X,
    Y
  };
}

export function radToDegrees(rad: number): number {
  return rad * (180 / Math.PI);
}

export function calculateEuclideanDistance(p1: Point, p2: Point): number {
  var a = p1.X - p2.X;
  var b = p1.Y - p2.Y;
  return Math.sqrt(a * a + b * b);
}

export function calculateHManhattanDistance(start: Point, goal: Point): number {
  return Math.abs(start.X - goal.X) + Math.abs(start.X - goal.X);
}

export function makeGrid(h: number, w: number): Grid {
  // Initialize gamesquares
  const grid: Grid = {
    dictionary: {},
    squares: []
  };
  for (let width = 0; width < w; width++) {
    for (let height = 0; height < h; height++) {
      const square = makeGridPoint(width, height);
      grid.dictionary[square.id] = square;
      grid.squares.push(square);
    }
  }
  return grid;
}

export function makeGridPoint(X: number, Y: number): GridPoint {
  const gridSquare: GridPoint = {
    X,
    Y,
    id: `${X}${Y}`,
    siblings: [],
    fScore: 9999,
    gCost: 9999,
    hCost: 9999,
    origin: null
  };
  // Remove edge impossible moves
  if (X !== 0) gridSquare.siblings.push(`${X - 1}${Y}`);
  if (X !== 8) gridSquare.siblings.push(`${X + 1}${Y}`);
  if (Y !== 0) gridSquare.siblings.push(`${X}${Y - 1}`);
  if (Y !== 8) gridSquare.siblings.push(`${X}${Y + 1}`);

  return gridSquare;
}
