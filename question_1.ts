// you can write to stdout for debugging purposes, e.g.
// console.log('this is a debug message');
const Cards = {
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  T: 9,
  J: 10,
  Q: 11,
  K: 12,
  A: 13
};

type cards =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

function solution(a: string, b: string) {
  // write your code in JavaScript (Node.js 8.9.4)
  const alecCards = a.split("") as cards[];
  const bobCards = b.split("") as cards[];

  return alecCards.reduce((alecWins, alecCard, cardIndex) => {
    const bobCard = bobCards[cardIndex];
    if (Cards[alecCard] > Cards[bobCard]) {
      alecWins = alecWins + 1;
    }
    return alecWins;
  }, 0);
}

// console.log(
//   "solution",
//   solution([-10000, -2, 5234, 7, -10000, 1000, 0, 1, 2, 3, 4, 7, 8, 10000])
// );

// console.log("AKQJT98765432".split("").reverse());
