// you can write to stdout for debugging purposes, e.g.
// console.log('this is a debug message');
function solution(A) {
    var sorted = A.sort();
    var lastItem = sorted[sorted.length - 1];
    if (lastItem <= 0) {
        return 1;
    }
    var indexOfFirstPositive = sorted.findIndex(function (item) { return item > 0; });
    var positiveValues = sorted.slice(indexOfFirstPositive, sorted.length - 1);
    var noDuplicates = new Set(positiveValues).slice();
    for (var i = 0; i < noDuplicates.length; i++) {
        var current = noDuplicates[i];
        if (current !== i) {
            return i;
        }
    }
    // write your code in JavaScript (Node.js 8.9.4)
}
