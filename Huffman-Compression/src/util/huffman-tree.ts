import getCharacterFrequencyList, { CharacterFrequencyList } from "./character-frequency";

export type Node = HuffmanTreeLeaf | HuffmanTreeBranch;
export type NodeList = (Node)[]
export type LeafList = HuffmanTreeLeaf[];
export type BranchList = HuffmanTreeBranch[];

function isLeaf(node: HuffmanTreeBranch | HuffmanTreeLeaf): node is HuffmanTreeLeaf {
  return node.isLeaf === true;
}
function isBranch(node: HuffmanTreeBranch | HuffmanTreeLeaf): node is HuffmanTreeBranch {
  return node.isLeaf === false;
}

export class HuffmanTree extends Array<Node> {
  constructor(nodes: NodeList) {
    super(nodes.length);

    // copy over nodes
    for(var i = 0; i < nodes.length; i++) {
      this[i] = nodes[i];
    }

  }
  getRoot() {
    return this.find(node=>node.parent === undefined);
  }
  getLeaves(): LeafList {
    return this.filter(isLeaf);
  }
  getBranches(): BranchList {
    return this.filter(isBranch);
  }
}


class HuffmanTreeLeaf{
  readonly isLeaf: boolean = true;
  frequency: number;
  char: string | undefined;
  parent?: HuffmanTreeBranch;
  constructor(properties: { frequency: number, char: string | undefined}) {
    this.frequency = properties.frequency;
    this.char = properties.char;
  }

  setParent(parent?: HuffmanTreeBranch) {
    this.parent = parent;
  }
}

class HuffmanTreeBranch {
  readonly isLeaf: boolean = false;
  frequency: number;
  parent?: HuffmanTreeBranch;
  leaves: {
    left: Node;
    right: Node;
  };
  constructor(frequency: number, leaves: { left: Node, right: Node}, parent?: HuffmanTreeBranch) {
    this.frequency = frequency;
    this.parent = parent;
    this.leaves = leaves;
  }

  setParent(parent?: HuffmanTreeBranch) {
    this.parent = parent;
  }
}

function buildEmptyBranch(leftLeaf?: HuffmanTreeLeaf) {
  leftLeaf = leftLeaf || new HuffmanTreeLeaf({ frequency: 0, char: undefined });
  const rightLeaf = new HuffmanTreeLeaf({ frequency: 0, char: undefined });

  const emptyBranch = new HuffmanTreeBranch(0, { 
    left: leftLeaf, 
    right: rightLeaf
  });

  leftLeaf.setParent(emptyBranch);
  rightLeaf.setParent(emptyBranch);

  return emptyBranch;

}

/**
 * Note: 
 *    - For a CharacterFrequencyList of length 0, a NodeList with an empty branch is returned.
 *    - For a CharacterFrequencyList of length 1, a NodeList with an empty branch plus a single leaf is returned.
 *    - An empty branch will have empty leaves in place of any missing left or right leaf.
 * 
 * @param {CharacterFrequencyList} characterFrequencyList 
 * @returns {NodeList}
 */

export default function buildHuffmanTree(characterFrequencyList: CharacterFrequencyList): HuffmanTree {
  // return a NodeList that contains an empty branch
  if(characterFrequencyList.length === 0) {
    const emptyBranch = buildEmptyBranch();
    return new HuffmanTree([emptyBranch]);
  }

  const leaves: LeafList = characterFrequencyList.map(tuple=>new HuffmanTreeLeaf({ frequency: tuple[1], char: tuple[0]}));
  
  // if there is only one leaf, then construct an empty branch, and set the left leaf to the one provided,
  // then build a NodeList and return it.
  if(leaves.length === 1) {
    const solitaryLeaf = leaves[0]
    const emptyBranch = buildEmptyBranch(solitaryLeaf);
    return new HuffmanTree([solitaryLeaf, emptyBranch]);
  }

  const nodes: NodeList = leaves.concat([]);
  const branches: BranchList = [];

  while(true) {
    const soberLeaf = nodes.pop() as Node;
    const drunkLeaf = nodes.pop() as Node;
    
    if(!soberLeaf || !drunkLeaf) break;

    const frequencySum = soberLeaf.frequency + drunkLeaf.frequency;
    const [leftLeaf, rightLeaf] = soberLeaf.frequency < drunkLeaf.frequency ? [soberLeaf, drunkLeaf] : [drunkLeaf, soberLeaf]
    const branch = new HuffmanTreeBranch(frequencySum, { left: leftLeaf, right: rightLeaf});
    branches.push(branch);

    soberLeaf.parent = branch;
    drunkLeaf.parent = branch;
  
    const index = nodes.findIndex(node=>node.frequency < frequencySum);
    nodes.splice(index, 0, branch);
  }

  const treeNodes = (leaves as NodeList).concat(branches);
  return new HuffmanTree(treeNodes);
}

export type BinaryPath = (1|0)[];
export type HuffmanTreeEncoding = {
  [character: string]: BinaryPath;
}

export function buildCharacterEncoding(huffmanTree: HuffmanTree): HuffmanTreeEncoding {
  const leaves = huffmanTree.getLeaves();
  const encoding: HuffmanTreeEncoding = {};
  for(var i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    if(!leaf.char) continue;
    encoding[leaf.char] = getBinaryPathFromRoot(leaf);
  }
  return encoding;
}

export function getBinaryPathFromRoot(leaf: HuffmanTreeLeaf): BinaryPath {
  const binaryPath: BinaryPath = []
  var lastNode: Node = leaf;
  while(lastNode.parent) {
    // is this leaf on the left or the right?
    const isLeft = lastNode.parent.leaves.left === lastNode;
    binaryPath.unshift(isLeft ? 0 : 1);
    lastNode = lastNode.parent;
  }
  return binaryPath;
}

export function encodeText(text: string): [ BinaryPath, HuffmanTreeEncoding] {
  const binaryPaths: BinaryPath[] = [];
  const characterFrequencyList = getCharacterFrequencyList(text);
  const huffmanTree = buildHuffmanTree(characterFrequencyList);
  const characterEncoding = buildCharacterEncoding(huffmanTree);

  for(var i = 0; i < text.length; i++) {
    binaryPaths.push(characterEncoding[text[i]]);
  }

  const flattBinaryPath: BinaryPath = binaryPaths.reduce((acc, val) => acc.concat(val), []);
  return [flattBinaryPath, characterEncoding];

}