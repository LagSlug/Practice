import { encode, decode} from "../src/huffman-compression";
var text = process.env.TEXT || 'Goodbye Emptyness!';

const [binary, encoding] = encode(text);

console.log(binary.length, encoding);

const decoded = decode(binary, encoding);
console.log(decoded);
