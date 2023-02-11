
export type Output = string[];

export type Encoding = {
    [index:number]: string;
}
export const DEFAULT_ENCODING: Encoding = {
    3: 'Fizz',
    5: 'Buzz'
}
/**
 * Iterates from start to end (inclusive), and constructs an array of strings based on an encoding. 
 * 
 * The encoding is a map of numbers to strings, when the current index of the interation is divisible by a mapped number, 
 * the string it maps to will be appended to the output, and that output will be pushed to an array. If there is no encoding for
 * the current index, then the current index will be used as the output, and will be pushed.
 * 
 * @example
 * const encoding: Encoding = { 3: 'Fizz', 5: 'Buzz' }
 * const output = fizzbuzz(9, 16);
 * 
 * // ouput = ['Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz', 16]
 * 
 * 
 * @param {Number} start starting index (will be included)
 * @param {Number} end end index (will be included)
 * @param {Encoding} encoding a map of numbers to strings
 * 
 * @returns {Array.<String>}
 */
export default function fizzbuz(start: number, end: number, encoding: Encoding = DEFAULT_ENCODING): Output {

    const output: Output = [];

    // iterate through all numbers, and check if the encoding map has an key that can be divided evenly into i
    const indices = Object.keys(encoding).map(Number);

    for(var currIndex = start; currIndex <= end; currIndex++) {
        // check if currIndex divided by mapIndex has a remainder equal to zero,
        // if so, then it is divisible by a mapped index
        const matches = indices.filter(mapIndex=>(currIndex % mapIndex === 0));

        if(matches.length) {
            output.push(matches.map(mapIndex=>encoding[mapIndex]).join(''));
        } else {
            output.push(currIndex.toString());
        }

    }

    return output;
}