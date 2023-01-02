const imgConfigs = [
  "0000",
  "0011",
  "0101",
  "0110",
  "0111",
  "1001",
  "1010",
  "1011",
  "1100",
  "1101",
  "1110",
  "1111",
];

const dirs = [
  [0, -1, 0],
  [1, 0, 1],
  [0, 1, 2],
  [-1, 0, 3],
];

const match = {
  0: 2,
  1: 3,
  2: 0,
  3: 1,
};

var tiles = {};
const scaleFactor = 10;
const rowscols = 20;
const cellDim = 3 * scaleFactor;

var fi, fj;

function preload() {
  for (let config of imgConfigs) {
    img = loadImage("./pngs/" + config + ".png");
    tiles[config] = new Tile(config, img);
  }
}

var cells = [];
var queue = [];

function setup() {
  createCanvas(cellDim * rowscols, cellDim * rowscols);
  noSmooth();
  noStroke();
  background(220);

  // while (!mouseIsPressed) {}

  fi = floor(random(rowscols));
  fj = floor(random(rowscols));

  for (let i = 0; i < rowscols; i++) {
    cells.push([]);
    for (let j = 0; j < rowscols; j++) {
      cells[i].push(new Cell(i, j));
    }
  }

  var firstCell = cells[fi][fj];
  queue.unshift(firstCell);
}

function draw() {
  if (mouseIsPressed) {
    queue = [];
    fi = floor(mouseX / cellDim);
    fj = floor(mouseY / cellDim);

    for (let i = 0; i < rowscols; i++) {
      for (let j = 0; j < rowscols; j++) {
        cells[i][j].collapsed = false;
        cells[i][j].tile = null;
        cells[i][j].possible = structuredClone(imgConfigs);
      }
    }
    firstCell = cells[fi][fj];
    queue.unshift(firstCell);
  }

  if (queue.length > 0) {
    currentCell = queue.pop();
    if (!currentCell.collapsed) {
      currentCell.collapse();
      currentCell.reduceNeighbors();
    }
    currentCell.draw();
    if (currentCell.i == fi && currentCell.j == fj) currentCell.highlight(); // debug highlight
  }
}

isInBounds = (i, j) => {
  if (i < 0 || i >= rowscols || j < 0 || j >= rowscols) {
    return false;
  }
  return true;
};

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.x = cellDim * i;
    this.y = cellDim * j;

    this.collapsed = false;
    this.possible = structuredClone(imgConfigs);
    this.tile = null;
  }

  reduceNeighbors = () => {
    for (const [di, dj, side] of dirs) {
      let ni = this.i + di;
      let nj = this.j + dj;
      if (!isInBounds(ni, nj)) continue;

      let neighbor = cells[ni][nj];
      if (neighbor.collapsed) continue;

      let p = 0;
      while (p < neighbor.possible.length) {
        let poss = neighbor.possible[p];

        if (this.tile.config[side] != poss[match[side]]) {
          neighbor.possible.splice(p, 1);
        } else {
          p += 1;
        }
      }

      queue.unshift(neighbor);
    }
  };

  collapse = () => {
    let randomIndex = floor(random(this.possible.length));
    let randomConfig = this.possible[randomIndex];

    this.tile = tiles[randomConfig];
    this.collapsed = true;
  };

  draw = () => {
    image(this.tile.img, this.x, this.y, cellDim, cellDim);
  };

  highlight = () => {
    fill(255, 0, 0);
    circle(this.x + cellDim / 2, this.y + cellDim / 2, cellDim / 2);
  };
}

class Tile {
  constructor(config, img) {
    this.config = config;
    this.img = img;
  }
}
