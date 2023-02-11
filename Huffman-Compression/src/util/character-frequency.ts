
export interface CharacterFrequencyMap {
    [character: string]: number
}
export type CharacterFrequencyList = [string, number][];

export function getCharacterFrequencyMap(text: string) {
    const map: CharacterFrequencyMap = {};

    for(var i = 0; i < text.length; i++) {
        const char = text[i];
        if(map[char]) map[char]++;
        else map[char] = 1;
    }
    return map;
}

export default function getCharacterFrequencyList(text: string): CharacterFrequencyList {
  const map = getCharacterFrequencyMap(text);
  const chars = Object.keys(map);
  // create a tuple of each key/value pair [char, frequency], and sort by the frequency
  return chars.map(char=>[char, map[char]] as [string, number]).sort((a, b)=>(a[1] < b[1] ? 1 : -1))
}