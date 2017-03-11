var totalSprites = (7 + 1) * 4;
var germs = [];
var circleGerms;
var digitGerms;
var tick = 0;
var isIdle = true;
var isDragging = false;
var isPointerDown = false;
var idleTimeout;
var bgColor = 0xFFFFFF;
var digitScale = 1.8;
var drawFunc;
var digitPoints;
var pointer;
var center;

var app = new PIXI.Application(0, 0, {backgroundColor: bgColor});
document.body.appendChild(app.view);

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
center = new PIXI.Point(
  app.renderer.width / 2,
  app.renderer.height * 0.6
);

app.stage.interactive = true;

var sprites = new PIXI.particles.ParticleContainer(100, {
  position: true,
  rotation: true
});

app.stage.addChild(sprites);

createGerms();

function createGerms() {
  for (var i = 0; i < totalSprites; i++) {

    var germ = PIXI.Sprite.fromImage('assets/germ.png');
    germ.index = i;
    germ.anchor.set(0.5);
    germ.scale.set(0.6);

    germ.x = getRandomX();
    germ.y = getRandomY();

    germ.randomSeed1 = Math.random();
    germ.randomSeed2 = Math.random();

    setNewGermPath(germ);

    germs.push(germ);
    sprites.addChild(germ);
  }

  circleGerms = germs.slice(germs.length / 4);
  digitGerms = germs.slice(0, germs.length / 4);
}

function setNewGermPath(germ) {
  germ.destination = getRandomPoint();
  germ.angle = getAngle(germ.position, germ.destination);
  germ.speed = Math.random() * 0.02 + 0.01;
}


app.ticker.add(function () {

  // iterate through the sprites and update their position
  for (var i = 0; i < germs.length; i++) {
    var germ = germs[i];

    if (isIdle && getDistance(germ.position, germ.destination) < 1) {
      setNewGermPath(germ);
    }
    else if (drawFunc) {
      drawFunc();
    }

    germ.x += (germ.destination.x - germ.x) * germ.speed;
    germ.y += (germ.destination.y - germ.y) * germ.speed;

    germ.rotation = germ.angle;

  }

  tick += 0.03;
});


// Interaction:
app.renderer.plugins.interaction.on('pointerdown', onPointerDown);
app.renderer.plugins.interaction.on('pointerup', onPointerUp);
app.renderer.plugins.interaction.on('pointerupoutside', onPointerUp);
app.renderer.plugins.interaction.on('pointermove', onPointerMove);

function onPointerDown() {
  isPointerDown = true;
  if (isIdle) {
    isIdle = false;
    drawFunc = drawCircle;
    drawDigit();
  }
  else {
    clearTimeout(idleTimeout);
    goIdle();
  }
}

function onPointerUp() {
  isPointerDown = false;
  if (!isIdle) {
    idleTimeout = setTimeout(goIdle, 3000);
  }
  isDragging = false;
}

function onPointerMove(event) {
  if (isPointerDown) {
    isDragging = true;
    pointer = event.data.global;
  }
}

function goIdle() {
  isIdle = true;
  drawFunc = null;
  germs.forEach(function (germ) {
    setNewGermPath(germ);
  });
}

function drawDigit() {
  digitPoints = getDigitPoints(digitGerms.length);
  digitGerms.forEach(function (germ, i) {
    var point = digitPoints[i];
    var angle = 0;
    if (i < digitGerms.length - 1) {
      var nextPoint = digitPoints[i + 1];
      angle = getAngle(point, nextPoint);
    }

    germ.destination = digitPoints[i];
    germ.angle = angle;
    germ.speed = 0.1;
  });
}

function drawCircle() {
  circleGerms.forEach(function (germ, i) {
    var ii = i + tick;
    var r = 380 + Math.sin(ii * 10) * 20;
    germ.destination.x = Math.sin((Math.PI * 2 / circleGerms.length) * ii) * r + center.x;
    germ.destination.y = Math.cos((Math.PI * 2 / circleGerms.length) * ii) * r + center.y;
    germ.angle = (Math.PI * 2 / circleGerms.length) * ii * -1;
    germ.speed = 0.1;
  });
}


// Utils:

function getRandomX() {
  return Math.random() * (app.renderer.width + 100) - 50;
}

function getRandomY() {
  return Math.random() * (app.renderer.height + 100) - 50;
}

function getRandomPoint() {
  return new PIXI.Point(getRandomX(), getRandomY());
}

function getDistance(point1, point2) {
  var xs;
  var ys;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}

function getAngle(point1, point2) {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x) + Math.PI / 2;
}

function getDigitPoints(length) {
  var lowFiPoints = [
    new PIXI.Point(-80, -87),
    new PIXI.Point(-27, -87),
    new PIXI.Point(27, -87),
    new PIXI.Point(90, -87),
    new PIXI.Point(40.85, -40),
    new PIXI.Point(11.3, 5.1),
    new PIXI.Point(-7.33, 50.23),
    new PIXI.Point(-20.8, 105)
  ];

  var mult = (length - 1) / (lowFiPoints.length - 1);
  if (mult % 1 != 0) {
    console.warn('Can\'t devide!');
    return;
  }

  var points = [];

  lowFiPoints.forEach(function (lowFiPoint, i) {
    var point = lowFiPoint.clone();
    point.x *= digitScale;
    point.y *= digitScale;

    point.x += center.x;
    point.y += center.y;

    points.push(point);

    if (i < lowFiPoints.length - 1) {
      var nextPoint = lowFiPoints[i + 1];
      for (var j = 1; j < mult; j++) {
        point = new PIXI.Point();
        point.x = ((nextPoint.x - lowFiPoint.x) / mult) * j + lowFiPoint.x;
        point.y = ((nextPoint.y - lowFiPoint.y) / mult) * j + lowFiPoint.y;

        point.x *= digitScale;
        point.y *= digitScale;

        point.x += center.x;
        point.y += center.y;

        points.push(point);
      }
    }
  });
  return points;
}