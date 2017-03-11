
var totalSprites = 50;
var germs = [];

var app = new PIXI.Application(0, 0, {backgroundColor : 0xFFFFFF});
document.body.appendChild(app.view);

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

var sprites = new PIXI.particles.ParticleContainer(100, {
  position: true,
  rotation: true
});
app.stage.addChild(sprites);

createGerms();

function createGerms(){
  for (var i = 0; i < totalSprites; i++) {

    var germ = PIXI.Sprite.fromImage('assets/germ.png');
    germ.anchor.set(0.5);
    germ.scale.set(0.8);

    germ.x = getRandomX();
    germ.y = getRandomY();

    setNewGermPath(germ);

    germs.push(germ);
    sprites.addChild(germ);
  }
}

function setNewGermPath(germ) {
  germ.destination = getRandomPoint();
  germ.rotation = getAngle(germ.position, germ.destination);
  germ.speed = Math.random() * 0.02 + 0.01;
}


app.ticker.add(function() {

  // iterate through the sprites and update their position
  for (var i = 0; i < germs.length; i++) {
    var germ = germs[i];
    
    if (getDistance(germ.position, germ.destination) < 1) {
      setNewGermPath(germ);
    }

    germ.x += (germ.destination.x - germ.x) * germ.speed;
    germ.y += (germ.destination.y - germ.y) * germ.speed;

  }
});


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

function getDistance(point1, point2)
{
  var xs;
  var ys;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

function getAngle(point1, point2) {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x) + Math.PI / 2;
}