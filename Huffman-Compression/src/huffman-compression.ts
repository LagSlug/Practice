
import { encodeText, BinaryPath, HuffmanTreeEncoding} from "./util/huffman-tree";
export function encode(text: string) {
  return encodeText(text);
}

export function decode(binary: BinaryPath, characterEncoding: HuffmanTreeEncoding) {
  var text = '';
  let path: BinaryPath = [];
  const characterEncodingList = Object.keys(characterEncoding).map(char=>([characterEncoding[char], char] as [BinaryPath, string]))
  while(binary.length) {
    path.push(binary.shift() as (1|0));

    // try to match the path with a character encoding
    let characterEncodingTuple = characterEncodingList.find(tuple=>equalBinaryPaths(tuple[0], path));
    if(!characterEncodingTuple) continue;
    text+=characterEncodingTuple[1];
    path = [];
  }
  
  return text;
} 

function equalBinaryPaths(a: BinaryPath, b: BinaryPath) {
  if(a.length !== b.length) return false;
  for(var i = 0; i < a.length; i++) {
    if(a[i] !== b[i]) return false;
  }
  return true;
}