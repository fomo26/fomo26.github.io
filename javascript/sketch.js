// Code borrowed from https://editor.p5js.org/JeromePaddick/sketches/bjA_UOPip

var noNodes = 150;
var noConn = 150;
var gravityConstant = 0.5;
var forceConstant = 4000;
var physics = true;

var nodes = [];
var nodeCon = [];
var clicked = false;
var lerpValue = 0.2;
var startDisMultiplier = 10;
var closeNode;
var closeNodeMag;

let overlayGraphics;

function setup() {
  // Get the dimensions of the "brains" section
  const brainsSection = document.getElementById("brains");
  const sectionWidth = brainsSection.offsetWidth;
  const sectionHeight = brainsSection.offsetHeight;

  // Create the canvas to match the size of the "brains" section
  const canvas = createCanvas(sectionWidth, sectionHeight);
  canvas.parent("brains"); // Attach the canvas to the "brains" section

  // Create a graphics buffer for the overlay with the same size
  overlayGraphics = createGraphics(sectionWidth, sectionHeight);
  // Draw the overlay on the graphics buffer
  overlayGraphics.fill(256, 256, 256, 180); // Semi-transparent black
  overlayGraphics.noStroke();
  overlayGraphics.rect(0, 0, sectionWidth, sectionHeight);

  frameRate(20);
  for (let i = 0; i < noNodes; i++) {
    let x = random(-startDisMultiplier*width , startDisMultiplier*width)
    let y = random(-startDisMultiplier*height , startDisMultiplier*height)
    node = new Node(createVector(x, y), random(1, 5))
    nodes.push(node);
  }
  closeNode = nodes[0]
  for (let n = 0; n < noConn; n++) {
    nodeCon.push([
      round(random(noNodes - 1)),
      round(random(noNodes - 1)),
      random(100, 300)
    ])
  }
  nodeCon.push([0,1,200])


  // lets add a connection from all solo nodes for good measure

  let connected = new Set()
  nodeCon.forEach(conn=>{
    connected.add(conn[0])
    connected.add(conn[1])
  })

  for (let n = 0; n < noNodes; n++) {
    if (!connected.has(n)){
        nodeCon.push([
          n,
          round(random(noNodes - 1)),
          random(100, 300)
          ]
        )
    }
  }

  // Skip initialization
  for (let i = 0; i < 150; i++) {
    draw();
  }
}

function windowResized() {
  // Resize the canvas when the window is resized
  const brainsSection = document.getElementById("brains");
  const sectionWidth = brainsSection.offsetWidth;
  const sectionHeight = brainsSection.offsetHeight;

  resizeCanvas(sectionWidth, sectionHeight);
  overlayGraphics = createGraphics(sectionWidth, sectionHeight);
  overlayGraphics.fill(256, 256, 256, 150);
  overlayGraphics.noStroke();
  overlayGraphics.rect(0, 0, sectionWidth, sectionHeight);
}

let drawCount = 0;

function draw() {
  col = 150 + max(0, 170 - drawCount);
  drawCount++;

  console.log(col);
  fill(col);
  stroke(col);

  // Use push/pop to limit the translation
  push();
  translate(width / 2, height / 2);
  background(250);

  nodeCon.forEach(con => {
    node1 = nodes[con[0]];
    node2 = nodes[con[1]];
    line(node1.pos.x, node1.pos.y, node2.pos.x, node2.pos.y);
  });
  applyForces(nodes);
  nodes.forEach(node => {
    node.draw();
    if (physics) {
      node.update();
    }
  });
  pop();

  // Draw the overlay in the default coordinate system (top-left)
  image(overlayGraphics, 0, 0);
}

function applyForces(nodes) {

  // apply force towards centre
  nodes.forEach(node => {
    gravity = node.pos.copy().mult(-1).mult(gravityConstant)
    node.force = gravity
  })

  // apply repulsive force between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pos = nodes[i].pos
      dir = nodes[j].pos.copy().sub(pos)
      force = dir.div(dir.mag() * dir.mag())
      force.mult(forceConstant)
      nodes[i].force.add(force.copy().mult(-1))
      nodes[j].force.add(force)
    }
  }

  // apply forces applied by connections
  nodeCon.forEach(con => {
    let node1 = nodes[con[0]]
    let node2 = nodes[con[1]]
    let maxDis = con[2]
    let dis = node1.pos.copy().sub(node2.pos)
    diff = dis.mag() - maxDis
    node1.force.sub(dis)
    node2.force.add(dis)
  })
}

function Node(pos, size) {
  this.pos = pos
  this.force = createVector(0, 0)
  this.mass = (2 * PI * size)/1.5
  this.size = 15
  this.fs = []
}

Node.prototype.update = function() {
  force = this.force.copy()
  vel = force.copy().div(this.mass)
  // print("VEL", vel, "FORCE", force)
  this.pos.add(vel)
}

//Node.prototype.draw = function() {
  // ellipse(this.pos.x, this.pos.y, this.mass, this.mass)
//  ellipse(this.pos.x, this.pos.y, this.size, this.size)
//}

Node.prototype.draw = function() {
  textAlign(CENTER, CENTER);
  textSize(this.size * 1.5);
  text('🧠', this.pos.x, this.pos.y);
}
