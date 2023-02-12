
import Canvas from 'drawille';
import addOnKeypressListener from './util/on-keypress';

type Scene = {
  canvas: Canvas;
  origin: {
    x: number;
    y: number;
  }
}

type UniverseMap = {
  [x: number]: {
    [y: number]: boolean;
  }
}
type UniverseFlat = [x: number, y: number][];
interface Universe {
  map: UniverseMap;  
  flat: UniverseFlat;
}

type LifeMatrix = (1|0)[][];

interface Options {
  tickRate: number;
  originStep: number;
}

function buildEmptyUniverse() {
  const universe: Universe = {
    map: {},
    flat: [] 
  }
  return universe;
}

function addKeypressHandler(scene: Scene, options: Options) {

  addOnKeypressListener((ch, key)=>{
    // move canvas
    if(key.name === 'down') scene.origin.y += options.originStep;
    else if(key.name === 'up') scene.origin.y -= options.originStep;
    else if(key.name === 'left') scene.origin.x -= options.originStep;
    else if(key.name === 'right') scene.origin.x += options.originStep;

    // exit game of life
    else if(key.name === 'escape') process.exit();

  });
}

const DEFAULT_OPTIONS: Options = {
  tickRate: 1000/24,
  originStep: 3
}

const PREBUILT_SEEDS: { [name: string]: LifeMatrix } = {
  stickfigure: [
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0],
    [0,1,0,0,0,0,0,1,0,0]
  ],
  gunGlider: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1]
  ]
}

function drawScene(scene: Scene, universe: Universe) {
  scene.canvas.clear();
  for(var i = 0; i < universe.flat.length; i++) {
    const [x, y] = universe.flat[i];
    scene.canvas.set(x + scene.origin.x, y + scene.origin.y)
  }
  process.stdout.write(scene.canvas.frame());
}

function run() {
  const scene: Scene = {
    canvas: new Canvas(160, 160),
    origin: { x: 40, y: 40 }
  }

  const universe = buildEmptyUniverse();
  addLifeMatrix(universe, PREBUILT_SEEDS.gunGlider);

  // console.log(universe.flat);
  // watch the keyboard for events
  addKeypressHandler(scene, DEFAULT_OPTIONS);
  
  setInterval(()=>{
    updateUniverse(universe);
    drawScene(scene, universe);
  }, DEFAULT_OPTIONS.tickRate);
}

/**
 *  1. Any live cell with two or three live neighbours survives.
    2. Any dead cell with three live neighbours becomes a live cell.
    3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
 * @param universe 
 */
function updateUniverse(universe: Universe) {
  const killset: ScannedCell[] = [];
  const bornset: ScannedCell[] = [];
  scanUniverse(universe, (cell)=>{
    const aliveNeighbors = cell.neighbors.filter(neighbor=>neighbor.life);

    // rule 1
    if(cell.life && (aliveNeighbors.length === 2 || aliveNeighbors.length === 3)) {
      return; // lives
    }

    // rule 2
    if(cell.life === false && aliveNeighbors.length ===3) {
      bornset.push(cell);
      return;
    }
    // rule 3
    if(cell.life) {
      killset.push(cell)
      return;
    }


  })
  console.log('pop.:', universe.flat.length);
  console.log('kill:', killset.length);
  console.log('born:', bornset.length);

  killset.forEach(cell=>removeLife(universe, cell))
  bornset.forEach(cell=>addLife(universe, cell))

}

type NeighborCell = {
  x: number;
  y: number;
  life: boolean;
}
type ScannedCell = NeighborCell & {
  neighbors: [
    NeighborCell, NeighborCell, NeighborCell, NeighborCell,
    NeighborCell, NeighborCell, NeighborCell, NeighborCell
  ]
}
function scanUniverse(universe: Universe, callback: (cell: ScannedCell)=>void) {
  const deadMap: UniverseMap = {}
  for(var flatIndex = 0; flatIndex < universe.flat.length;flatIndex ++) {
    const aliveCell = universe.flat[flatIndex];
    const [x, y] = aliveCell;

    // scan dead neighbors after we scan alive cells, so build a map of which neighbors we'll have to scan later
    const neighbors = getNeighbors(universe, { x, y })
    neighbors.forEach(neighbor=>{
      if(neighbor.life) return;
      const xPlane = deadMap[neighbor.x] = deadMap[neighbor.x] || {};
      xPlane[neighbor.y] = true;      
    });

    callback({ life: true, x, y, neighbors });
  }

  // scan dead neighboring cells
  const xPlane = Object.keys(deadMap).map(Number);  
  for(var i = 0; i < xPlane.length; i++) {
    let x = xPlane[i];
    const yPlane = Object.keys(deadMap[x]).map(Number);
    for(var j = 0; j < yPlane.length; j++) {
      let y = yPlane[j];
      const neighbors = getNeighbors(universe, { x, y })
      callback({ life: false, x, y, neighbors });
    }
  }


}

function getNeighbors(universe: Universe, point: { x: number, y: number }): ScannedCell['neighbors'] {
  const neighbors: ScannedCell['neighbors'] = new Array(0) as ScannedCell['neighbors']
  for(var x = point.x - 1; x <= point.x + 1; x++) {
    for(var y = point.y - 1; y <= point.y + 1; y++) {
      if(x === point.x && y === point.y) continue;
      neighbors.push({
        x, 
        y, 
        life: checkForLife(universe, { x, y })
      })
    }
  }
  return neighbors;
}

function checkForLife(universe: Universe, point: { x: number, y: number }): boolean {
  const xPlane = universe.map[point.x];
  return xPlane ? (xPlane[point.y] || false) : false;
}

function addLifeMatrix(universe: Universe, lifeMatrix: LifeMatrix, origin?: { x: number, y: number }) {
  origin = origin || { x: 0, y: 0 };
  for(var y = 0; y < lifeMatrix.length; y++) {
    let columns = lifeMatrix[y];
    for(var x = 0; x < columns.length; x++) {
      if(columns[x]) addLife(universe, { x, y });
    }
  }
}


/**
 * Mutates the universe by adding life at a selected x,y coordinate.
 * @param {Universe} universe the universe
 * @param {x: number, y: number} coordinates x and y coordinates
 */
function addLife(universe: Universe, coordinates: { x: number, y: number }) {
  const { map, flat } = universe;
  const { x, y } = coordinates;
  const xPlane = map[x] = map[x] || {};

  // if life already exists, then return immediately without mutation
  if(xPlane[y]) return;

  xPlane[y] = true;
  flat.push([x, y])
  
  return universe;
}

/**
 * Mutates the universe by removing life at a selected x,y coordinate.
 * @param {Universe} universe the universe
 * @param {x: number, y: number} coordinates x and y coordinates
 * @returns {Universe}
 */
function removeLife(universe: Universe, coordinates: { x: number, y: number }) {
  const { map, flat } = universe;
  const { x, y } = coordinates;
  const xPlane = map[x] = map[x] || {};

  // if no life exists, then return immediately without mutation
  if(!xPlane[y]) return;

  xPlane[y] = false;
  const index = flat.findIndex(pair=>pair[0] === x && pair[1] === y);
  flat.splice(index, 1);
  
  return;  
}

function cloneUniverse(universe: Universe): Universe {
  return {
    map: cloneUniverseMap(universe.map),
    flat: cloneUniverseFlat(universe.flat)
  }
}

function cloneUniverseMap(map: UniverseMap): UniverseMap {
  let clonedMap: UniverseMap = {};
  for (let x in map) {
    clonedMap[x] = {};
    for (let y in map[x]) {
      clonedMap[x][y] = map[x][y];
    }
  }
  return clonedMap;
}
function cloneUniverseFlat(flat: UniverseFlat): UniverseFlat {
  return flat.map(row => row.slice()) as UniverseFlat;
}

function flattenUniverseMap(map: UniverseMap) {
  const xPlane = Object.keys(map).map(Number);
  const flat: UniverseFlat = [];
  for(var x = 0; x < xPlane.length; x++) {
    const yPlane = Object.keys(map[x]).map(Number);
    for(var y = 0; y < yPlane.length; y++) {
      flat.push([x, y]);
    }
  }
  return flat;
}

run();


