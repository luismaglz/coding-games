"use strict";
// interface Node {
//   x: number;
//   y: number;
//   siblings: Node[];
//   fScore: number;
//   gCost: number;
//   hCost: number;
//   origin: Node;
// }
// function calculateHManhattan(start: Node, goal: Node): number {
//   return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
// }
// function navigateNodes(start: Node, goal: Node) {
//   const closedList: Node[] = [];
//   const openList: Node[] = [];
//   while (closedList[closedList.length] !== goal) {
//     const nextNode = findPath(start, goal, openList);
//     closedList.push(nextNode);
//   }
// }
// function findPath(start: Node, goal: Node, openList: Node[]) {
//   const directSiblings: Node[] = start.siblings.map(s => {
//     s.gCost = start.gCost + 1;
//     s.hCost = calculateHManhattan(s, goal);
//     s.fScore = s.hCost + s.gCost;
//     s.origin = start;
//     return s;
//   });
//   // Add current position and all available siblings
//   openList.push(...directSiblings);
//   const goalNode = openList.find(n => n === goal);
//   if (goalNode) {
//     return goalNode;
//   }
//   const lowest = openList.reduce((lowest: Node, current: Node) => {
//     if (!lowest) {
//       return current;
//     }
//     return lowest.fScore < current.fScore ? lowest : current;
//   });
//   return lowest;
// }
