const WIDTH = 1000;
const HEIGHT = 500;
const DPI = 2;
const PADDING_BOTTOM = 100;
const PADDING_LEFT = 100;
const DPI_WIDTH = WIDTH * DPI;
const DPI_HEIGHT = HEIGHT * DPI;

const DATA = [
  [10, 200],
  [50, 0],
  [100, 200],
  [150, 50],
  [200, 600],
  [250, 50],
  [300, 200],
  [350, 50],
  [400, 200],
  [450, 20],
];

const DATA2 = [
  [5, 120],
  [20, 300],
  [100, 55],
  [170, 75],
  [210, 100],
  [250, 80],
  [320, 500],
  [400, 50],
  [410, 150],
  [450, 10],
];
const DATA3 = [
  [5, 100],
  [15, 25],
  [80, 30],
  [100, 75],
  [140, 40],
  [170, 50],
  [230, 75],
  [380, 70],
  [410, 90],
  [500, 120],
];

let prop = propertiesOfChartData(DATA, DATA2,DATA3);

context = styleChart(document.getElementById('chart'));
drawGrid(context, DATA.length, 10, 2, 'lightgrey');
drawChart(context, DATA, 3, 'red');
drawChart(context, DATA2, 5, 'green');
drawChart(context, DATA3, 8, 'blue');
// drawBars(context, DATA, 30, 'blue');

function propertiesOfChartData(...datas) {
  const max = { x: 0, y: 0 };
  const min = { x: 0, y: 0 };
  const scale = { x: 0, y: 0 };
  let allData = [];
  for (data of datas) {
    for (item of data) {
      allData.push(item);
    }
  }
  max.x = Math.max.apply(
    null,
    allData.map((i) => i[0])
  );
  min.x = Math.min.apply(
    null,
    allData.map((i) => i[0])
  );
  max.y = Math.max.apply(
    null,
    allData.map((i) => i[1])
  );
  min.y = Math.min.apply(
    null,
    allData.map((i) => i[1])
  );
  scale.x = (DPI_WIDTH - PADDING_LEFT) / (max.x - min.x);
  scale.y = (DPI_HEIGHT - PADDING_BOTTOM) / (max.y - min.y);
  console.log(max, min, scale);
  return { max, min, scale };
}

function toCoord([x, y], minX, minY, scaleX, scaleY) {
  x = (x-minX) * scaleX + PADDING_LEFT;
  y = DPI_HEIGHT - PADDING_BOTTOM - (y + minY)*scaleY;
  return { x, y };
}

function styleChart(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.style.width = WIDTH + 'px';
  canvas.style.height = HEIGHT + 'px';
  canvas.width = DPI_WIDTH;
  canvas.height = DPI_HEIGHT;
  return ctx;
}

function drawChart(ctx, data, lw, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  let firsPoint=toCoord(data[0],prop.min.x,prop.min.y,prop.scale.x,prop.scale.y)
  ctx.moveTo(firsPoint.x,firsPoint.y);

  for (let coords of data.slice(1)) {
    let dot = toCoord(
      coords,
      prop.min.x,
      prop.min.y,
      prop.scale.x,
      prop.scale.y
    );
    ctx.lineTo(dot.x, dot.y);
  }
  ctx.stroke();
}

function drawBars(ctx, data, lw, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  let xMax = Math.max.apply(
    null,
    data.map((i) => i[0])
  );
  let xMin = Math.min.apply(
    null,
    data.map((i) => i[0])
  );
  let xScale = (DPI_WIDTH - PADDING_LEFT) / (xMax - xMin);

  for (let coords of data) {
    ctx.beginPath();
    ctx.moveTo(toCoord(coords, xScale).x + lw / 2, DPI_HEIGHT - PADDING_BOTTOM);
    ctx.lineTo(toCoord(coords, xScale).x + lw / 2, toCoord(coords).y);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawGrid(ctx, countX, countY, lw, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  // draw X lines
  let step = (DPI_WIDTH - PADDING_LEFT) / (countX + 1);
  for (let i = 0; i < DPI_WIDTH - PADDING_LEFT; i += step) {
    ctx.beginPath();
    ctx.moveTo(i + PADDING_LEFT, DPI_HEIGHT - PADDING_BOTTOM);
    ctx.lineTo(i + PADDING_LEFT, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.font = 'bold 30px sans';
    ctx.fillText(
      DATA[Math.round(i / step)],
      i + PADDING_LEFT,
      DPI_HEIGHT - PADDING_BOTTOM / 2
    );
  }

  // draw Y lines
  step = (DPI_HEIGHT - PADDING_BOTTOM) / (countY + 1);
  for (let i = 0; i < DPI_HEIGHT - PADDING_BOTTOM; i += step) {
    ctx.beginPath();
    ctx.moveTo(DPI_WIDTH, i);
    ctx.lineTo(PADDING_LEFT, i);
    ctx.closePath();
    ctx.stroke();
  }
}
