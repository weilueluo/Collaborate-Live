let slider;
let canvas;
let colorpicker;

let bgcolor = 0;

let restoreCanvas = false;

function setup() {
  //canvas
  pixelDensity(1);
  canvas = createCanvas(1000,700);
  canvas.parent('canvascontainer');
  canvas.addClass('canvas');
  canvas.id('canvas');
  background(0);
  //slider
  slider = document.getElementById("stroke-slider");
  //colorpicker
  colorpicker = document.getElementById("colorpicker");

  if(restoreCanvas) {
    redrawlines();
  }

  socket.on('drawing', receiveDrawing);
  socket.on('clear canvas', resetCanvas);
  socket.on('temp line', showtempline);
}

let currcolor;
let currweight;
let erasing = false;
let drawingline = false;
let lines = [];
let ready = false;
let drawinglineX, drawinglineY;

function draw() {
  if(!ready) return;
  currcolor = colorpicker.value;
  currweight = slider.value;
  if(erasing) {
    currcolor = bgcolor;
  }
  if(mouseIsPressed) {
    if(drawingline) {
      drawstraightline();
    } else {
      drawline();
    }
  }
}

function drawline() {
  var data = {
    px: pmouseX,
    py: pmouseY,
    x: mouseX,
    y: mouseY,
    c: currcolor,
    s: currweight
  }
  if(isFinite(data.x) && isFinite(data.y) && isFinite(data.px) && isFinite(data.py)) {
    socket.emit('drawing', data);
  }
  // console.log("in drawline: " + data.px + " py: " + data.py + " x: " + data.x + " y: " + data.y + " c: " + data.c + " s: " + data.s);
  drawfromdata(data);
  lines[lines.length] = data;
}

function drawstraightline() {
  line(drawinglineX, drawinglineY, mouseX, mouseY);
}

$('#resetButton').click(() => {
  socket.emit('clear canvas');
});

function resetCanvas() {
  clearcanvas();
  lines = [];
}

function clearcanvas() {
  $("canvas")[0].getContext('2d').clearRect(0,0,width,height);
}

function receiveDrawing(data) {
  lines[lines.length] = data;
  drawfromdata(data);
}

function drawfromdata(data) {
  push();
  stroke(data.c);
  strokeWeight(data.s);
  line(data.px, data.py, data.x, data.y);
  pop();
}

socket.on('restore canvas', datas => {
  lines = [];
  for(var index = 0; index < datas.length; index++) {
    lines[lines.length] = datas[index];
  }

  // will redraw in setup
  restoreCanvas = true;
});

function redrawlines() {
  clearcanvas();
  for(var i = 0; i < lines.length; i++) {
    drawfromdata(lines[i]);
  }
}

function mousePressed() {
  ready = true;
  if(drawingline) {
    noLoop();
    push();
    currcolor = colorpicker.value;
    currweight = slider.value;
    drawinglineX = mouseX;
    drawinglineY = mouseY;
  }
}

function mouseReleased() {
  if(drawingline) {
    var data = {
      px: drawinglineX,
      py: drawinglineY,
      x: mouseX,
      y: mouseY,
      c: currcolor,
      s: currweight
    }
    socket.emit('drawing', data);
    lines[lines.length] = data;
    redrawlines();
    drawinglineX = null;
    drawinglineY = null;
    pop();
    loop();
  }
}

function mouseDragged() {
  if(drawingline) {
    redrawlines();
    push();
    stroke(currcolor);
    strokeWeight(currweight);
    line(drawinglineX, drawinglineY, mouseX, mouseY);
    var data = {
      px: drawinglineX,
      py: drawinglineY,
      x: mouseX,
      y: mouseY,
      c: currcolor,
      s: currweight
    }
    socket.emit('temp line', data);
    pop();
  }
}

function showtempline(data) {
  redrawlines();
  drawfromdata(data);
}

function toggleeraser() {
  $('#eraser').toggleClass('active-option');
  erasing = !erasing;
}

function toggleline() {
  $('#line').toggleClass('active-option');
  drawingline = !drawingline;
}

$('#stroke-slider').mouseover(() => {
  noLoop();
  $('#canvas').off('mousedown');
});

$('#stroke-slider').mouseout(() => {
  loop();
  $('#canvas').on('mousedown');
});
