let sprayPaint = function (p) {
  // get parameters
  let colorR = parameters.color[0]; // color of the spray R
  let colorG = parameters.color[1]; // color of the spray G
  let colorB = parameters.color[2]; // color of the spray B
  let width = parameters.width; // width of the spray
  let density = parameters.density; // density of spray dots
  let flow = parameters.flow; // number of paint flows
  let container = parameters.container; // canvas container
  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight * 4;

  // declare variables
  let inPause = true;
  let static = false;
  let densityReset = density;
  let flowReset = flow;
  let paintTrails = [];
  let color;
  let pointerX = -1, pointerY = -1, prePointerX = -1, prePointerY = -1;
  let rect, containerTop, containerRight, containerBottom, containerLeft;

  // setup
  p.setup = function () {
    p.createCanvas(canvasWidth, canvasHeight);
    color = p.color(colorR, colorG, colorB);
  };

  // draw the elements in the canavs
  p.draw = function () {
    // pause the drawing when the mouse is outside the canvas
    rect = container.getBoundingClientRect();
    containerTop = rect.top;
    containerRight = rect.right;
    containerBottom = rect.bottom;
    containerLeft = rect.left;
    if (
      p.winMouseX < containerLeft ||
      p.winMouseX > containerRight || // when not in codepen add
      p.winMouseY < containerTop || // + window.pageYOffset
      p.winMouseY > containerBottom // + window.pageYOffset
    ) {
      inPause = true;
    } else {
      inPause = false;
    }

    // draw if not paused
    if (!inPause) {
      // pointer position
      pointerX = p.mouseX;
      pointerY = p.mouseY;
      prePointerX = p.pmouseX;
      prePointerY = p.pmouseY;

      // color and size of the spray
      color.setAlpha(255);
      p.strokeWeight(width);
      p.stroke(color);
      p.fill(color);
      p.drawingContext.shadowBlur = width;
      p.drawingContext.shadowColor = color;

      // pause the spray, blur and flow effects when the mouse is static
      if (pointerX == prePointerX && pointerY == prePointerY) {
        if (density < densityReset / 1.3) {
          p.drawingContext.shadowBlur = 0;
        }
        static = true;
        density = density - densityReset / 20;
        flow = flow - flowReset / 200;
      } else if (static == true) {
        p.drawingContext.shadowBlur = width;
        static = false;
        density = densityReset;
        flow = flowReset;
      }

      // draw a line between precedent and current mouse position
      p.line(pointerX, pointerY, prePointerX, prePointerY);

      // reset stroke and blur for the spray dots
      p.strokeWeight(0);
      p.drawingContext.shadowBlur = 1;

      // display the spray dots randomly in a circle
      for (let i = 0; i < p.random(-1, density); i++) {
        let a = p.random(0, 1) * 2 * p.PI;
        let o = p.random(0.2, 1); // position from the center
        let r = 1.3 * width * p.sqrt(o); // position from the center
        let x = pointerX + r * p.cos(a); // x coordinate
        let y = pointerY + r * p.sin(a); // y coordinate
        let size = 0.7 - o; // smaller when further from center
        if (o < 0.3) {
          color.setAlpha(100);
          size = 0;
        } // less opacity when further from center
        let radius = 1 + (width / 10) * size; // dot radius

        p.stroke(color);
        p.fill(color);
        p.ellipse(x, y, radius);
      }

      // create paint trails
      if (p.random(1, 100) < flow) {
        paintTrails.push(new p.PaintTrail(pointerX, pointerY));
      }
    }

    // update paint trails
    for (var i = 0; i < paintTrails.length; i++) {
      // extend trails when the mouse is static
      if (
        p.abs(pointerX - prePointerX) < width / 4 &&
        p.abs(pointerY - prePointerY) < width / 4
      ) {
        paintTrails[i].extend();
      }
      paintTrails[i].draw();
    }
  };

  // resize canvas on window resize
  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight * 4);
  };

  // create a paint trail object
  p.PaintTrail = class {
    constructor(x, y) {
      this.shift = p.random(-width / 3, width / 3); // shift trail position
      this.x = x + this.shift; // coordinate x
      this.y = y + (width / 2 - p.abs(this.shift)); // coordinate y
      this.originalY = this.y;
      this.length = 0;
      this.maxLength = p.random(width/4, width); // length of the trail
      this.width = p.random(width/12, width/6); // width of the trail
      this.minWidth = this.width/3;
      this.speed = 100 / this.width; // trail with a larger width is faster
      this.time = p.millis();
    }

    // draw the paint trail
    draw() {
      if (p.millis() - this.time > this.speed && this.length < this.maxLength) {
        color.setAlpha(150);
        p.stroke(color);
        p.fill(color);
        p.strokeWeight(this.width);
        p.drawingContext.shadowBlur = 2;
        p.line(this.x, this.y, this.x, this.y + 1);
        
        this.y++;
        this.length++;
        if (this.width > this.minWidth){
          this.width = this.width - 0.03; // decrease trail width
          this.speed = this.speed + 0.05; // decrease trail speed
        } else {
          this.kill(); // kill trail if minimum width is reached
        }
        this.time = p.millis();
      }
    }

    // extends the trail if the mouse is around it
    extend() {
      if (
        p.abs(this.x - pointerX) < width / 2 &&
        pointerY >= this.originalY - width / 2 &&
        pointerY < this.y
      ) {
        this.maxLength = this.maxLength + 1;
      }
    }
    
    // stop the trail from growing
    kill() {
      paintTrails.splice(paintTrails.indexOf(this), 1);
    }
  };
};

// parameters are stored in an object
let parameters;

let createCanvas = function (color, width, density, flow, container) {
  parameters = {
    color: color,
    width: width,
    density: density,
    flow: flow,
    container: document.getElementById(container)
  };
  return new p5(sprayPaint, container);
};

graff1 = createCanvas([228, 72, 82], 30, 2000, 10, "canvas");