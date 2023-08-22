const WIDTH = 1000;
const HEIGHT = 500;
const DPI = 2;
const PADDING_BOTTOM = 100;
const PADDING_TOP = 50;
const PADDING_LEFT = 100;
const PADDING_RIGHT = 50;
const DPI_WIDTH = WIDTH * DPI;
const DPI_HEIGHT = HEIGHT * DPI;

import { DATA, DATA2, DATA3 } from "./data.js";

const graph1 = {
  text: "График 1",
  textHeight: 40,
  color: "green",
  lineWidth: 30,
};
const graph2 = {
  text: "График 2",
  textHeight: 40,
  color: "blue",
  lineWidth: 25,
};
const graph3 = {
  text: "График 3",
  textHeight: 40,
  color: "red",
  lineWidth: 20,
};
const graph4 = {
  text: "График 4",
  textHeight: 40,
  color: "grey",
  lineWidth: 10,
};

const chart = document.getElementById("chart");
let prop = propertiesOfChartData(DATA, DATA2, DATA3);

//=========================   MAIN   ======================================
styleChart(chart);
let context = chart.getContext("2d");
mousemove(0);
chart.addEventListener("mousemove", mousemove);

//=========================================================================

function mousemove({ offsetX, offsetY }) {
  context.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT);
  drawGrid(context, 10, 10, 2, "lightgrey", "grey");
  drawLegend(context, 0, -20, graph1, graph2, graph3, graph4);
  drawBars(context, DATA, graph1.lineWidth, graph1.color);
  drawBars(context, DATA2, graph2.lineWidth, graph2.color);
  drawBars(context, DATA3, graph3.lineWidth, graph3.color);
  drawChart(context, DATA2, graph4.lineWidth, graph4.color);
  chartTitle(context, "Графики чего-то там", "black");
  drawCursorX(context, offsetX * DPI);
  drawCursorY(context, offsetY * DPI);
  let realX = (offsetX * DPI - PADDING_LEFT) / prop.scale.x + prop.min.x;
  let realY = -(offsetY * DPI - DPI_HEIGHT + PADDING_BOTTOM) / prop.scale.y + prop.min.y;
  console.log(prop.scale.x);
  popTips(
    context,
    offsetX * DPI,
    offsetY * DPI,
    "X: " + Math.round(realX * 100) / 100 + "\nY: " + Math.round(realY * 100) / 100
  );
  return {
    destroy() {
      context.removeEventListener("mousemove", mousemove);
    },
  };
}

function popTips(ctx, x, y, text) {
  ctx.font = "bold 35px sans";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "lightgrey";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  let arrText = text.split("\n");
  let maxTextLen = 0;
  let maxTextHeight = 0;

  for (let item of arrText) {
    if (maxTextLen < ctx.measureText(item).actualBoundingBoxRight) {
      maxTextLen = ctx.measureText(item).actualBoundingBoxRight;
    }
    if (maxTextHeight < ctx.measureText(item).actualBoundingBoxDescent) {
      maxTextHeight = ctx.measureText(item).actualBoundingBoxDescent;
    }
  }
  let widthTooltip = maxTextLen + 15;
  let heightTooltip = maxTextHeight * arrText.length + 15;
  if (x > PADDING_LEFT && x < DPI_WIDTH - PADDING_RIGHT && y > PADDING_TOP && y < DPI_HEIGHT - PADDING_BOTTOM) {
    let i = 0;
    let textX = x;
    let textY = y;
    if (x + widthTooltip > DPI_WIDTH - PADDING_RIGHT) {
      widthTooltip = -widthTooltip;
      textX += widthTooltip;
    }
    if (y + heightTooltip > DPI_HEIGHT - PADDING_BOTTOM) {
      heightTooltip = -heightTooltip;
      textY += heightTooltip;
    }
    ctx.fillRect(x, y, widthTooltip, heightTooltip);
    ctx.strokeRect(x, y, widthTooltip, heightTooltip);
    for (let item of arrText) {
      ctx.fillStyle = "black";
      ctx.fillText(item, textX + 5, textY + 5 + maxTextHeight * i);
      i++;
    }
  }
}

function drawCursorX(ctx, mouseX) {
  if (mouseX > PADDING_LEFT && mouseX < DPI_WIDTH - PADDING_RIGHT) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouseX, 0 + PADDING_TOP);
    ctx.lineTo(mouseX, DPI_HEIGHT - PADDING_BOTTOM);
    ctx.closePath();
    ctx.stroke();
  }
}
function drawCursorY(ctx, mouseY) {
  if (mouseY > PADDING_TOP && mouseY < DPI_HEIGHT - PADDING_BOTTOM) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0 + PADDING_LEFT, mouseY);
    ctx.lineTo(DPI_WIDTH - PADDING_RIGHT, mouseY);
    ctx.closePath();
    ctx.stroke();
  }
}

function propertiesOfChartData(...datas) {
  const max = { x: 0, y: 0 };
  const min = { x: 0, y: 0 };
  const scale = { x: 0, y: 0 };
  let allData = [];
  for (let data of datas) {
    for (let item of data) {
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
  scale.x = (DPI_WIDTH - PADDING_LEFT - PADDING_RIGHT) / (max.x - min.x);
  scale.y = (DPI_HEIGHT - PADDING_BOTTOM - PADDING_TOP) / (max.y - min.y);
  return { max, min, scale };
}

function toCoord([x, y], minX, minY, scaleX, scaleY) {
  x = (x - minX) * scaleX + PADDING_LEFT;
  y = DPI_HEIGHT - PADDING_BOTTOM - (y + minY) * scaleY;
  return { x, y };
}

function styleChart(canvas) {
  canvas.style.width = WIDTH + "px";
  canvas.style.height = HEIGHT + "px";
  canvas.style.cursor = "none";
  canvas.width = DPI_WIDTH;
  canvas.height = DPI_HEIGHT;
}

function drawChart(ctx, data, lw, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  let firstPoint = toCoord(data[0], prop.min.x, prop.min.y, prop.scale.x, prop.scale.y);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let coords of data.slice(1)) {
    let dot = toCoord(coords, prop.min.x, prop.min.y, prop.scale.x, prop.scale.y);
    ctx.lineTo(dot.x, dot.y);
  }
  ctx.stroke();
}

function drawBars(ctx, data, lw, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;

  for (let coords of data) {
    let dot = toCoord(coords, prop.min.x, prop.min.y, prop.scale.x, prop.scale.y);
    ctx.beginPath();
    ctx.moveTo(dot.x, DPI_HEIGHT - PADDING_BOTTOM);
    ctx.lineTo(dot.x, dot.y);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawGrid(ctx, countX, countY, lw, color, textColor) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;

  // draw X lines
  let step = (DPI_WIDTH - PADDING_LEFT - PADDING_RIGHT) / (countX + 1);
  for (let i = 0; i < DPI_WIDTH - PADDING_LEFT; i += step) {
    ctx.beginPath();
    ctx.moveTo(i + PADDING_LEFT, DPI_HEIGHT - PADDING_BOTTOM);
    ctx.lineTo(i + PADDING_LEFT, PADDING_TOP);
    ctx.closePath();
    ctx.stroke();
    ctx.font = "bold 30px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    ctx.fillText(Math.floor(prop.min.x + i / prop.scale.x), i + PADDING_LEFT, DPI_HEIGHT - PADDING_BOTTOM + 10);
  }

  // draw Y lines
  step = (DPI_HEIGHT - PADDING_BOTTOM - PADDING_TOP) / (countY + 1);
  for (let i = 0; i < DPI_HEIGHT - PADDING_BOTTOM; i += step) {
    ctx.beginPath();
    ctx.moveTo(DPI_WIDTH - PADDING_RIGHT, i + PADDING_TOP);
    ctx.lineTo(PADDING_LEFT, i + PADDING_TOP);
    ctx.closePath();
    ctx.stroke();
    ctx.font = "bold 30px sans";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.floor(prop.min.y + i / prop.scale.y), PADDING_LEFT - 30, DPI_HEIGHT - PADDING_BOTTOM - i);
  }
}

function chartTitle(ctx, text, textColor) {
  ctx.font = "bold 40px sans";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = textColor;
  ctx.fillText(text, DPI_WIDTH / 2, DPI_HEIGHT - 10);
}

function drawLegend(ctx, startX, startY, ...args) {
  let maxTextLength = 0;
  let maxTextHeight = 0;
  for (let item of args) {
    if (maxTextLength < ctx.measureText(item.text).width) {
      maxTextLength = ctx.measureText(item.text).width;
    }
    if (maxTextHeight < item.textHeight) {
      maxTextHeight = item.textHeight;
    }
  }

  let widthLegend = maxTextLength;
  let heightLegend = maxTextHeight * args.length;

  ctx.strokeStyle = "rgba(19, 33, 152, .6)";
  ctx.fillStyle = "rgba(19, 33, 152, 0.3)";
  ctx.lineWidth = "4";

  ctx.moveTo(startX + PADDING_LEFT, startY + PADDING_TOP);
  ctx.fillRect(
    startX + PADDING_LEFT,
    startY + PADDING_TOP,
    startX + PADDING_LEFT + widthLegend+80,
    startY + PADDING_TOP + heightLegend
  );
  ctx.strokeRect(
    startX + PADDING_LEFT,
    startY + PADDING_TOP,
    startX + PADDING_LEFT + widthLegend+80,
    startY + PADDING_TOP + heightLegend
  );

  for (let i in args) {
    ctx.font=`bold ${args[i].textHeight}px sans`
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = args[i].color;
    ctx.strokeStyle = args[i].color;
    ctx.lineWidth = args[i].lineWidth;

    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT + startX + 10, i * args[i].textHeight + startY + PADDING_TOP + 35);
    ctx.lineTo(PADDING_LEFT + startX + 50, i * args[i].textHeight + startY + PADDING_TOP + 35);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText(args[i].text, PADDING_LEFT + startX + 60, i * args[i].textHeight + startY + PADDING_TOP + 35);
  }
}
