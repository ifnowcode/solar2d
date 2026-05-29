// Solar
// https://www.space.com/ & https://www.space.com/12288-solar-system-photo-tour-sun-planets-moons.html
//
// https://nineplanets.org/
// https://www.universetoday.com/36649/planets-in-order-of-size/
// https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/
// https://planetfacts.org/orbital-speed-of-planets-in-order/
// https://science.nasa.gov/dwarf-planets/
// https://www.space.com/18584-dwarf-planets-solar-system-infographic.html
// https://www.space.com/12692-dwarf-planets-solar-system-tour.html
// https://spaceplace.nasa.gov/how-many-moons/en/
// https://starlust.org/how-many-moons-are-there-in-the-solar-system/
//
// https://en.wikipedia.org/wiki/Astronomical_unit
//  1 AU = 149,597,870,700 miles (149597870700)
//
// Haumea (1080 miles or 1740 km in diameter, 4B miles, or 6.5 km distance or 43AU, Solar rotation is 285 earth days, rotation is 4 hours)
//
// Asteriod Belt
// https://www.youtube.com/watch?v=Y-jyY0QjZq421 Must-Know Facts About The Kuiper Belt
//
// Universe is 4.6 Billion years old
//
// Stars
// https://en.wikipedia.org/wiki/Galactic_coordinate_system
// https://svs.gsfc.nasa.gov/4851
// http://www.atlasoftheuniverse.com/galchart.html
// https://stellarium-web.org/
// https://in-the-sky.org/ngc3d.php
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.canvas.width = window.innerWidth*2;
ctx.canvas.height = window.innerHeight*2;

const stats = Stats();
document.body.appendChild(stats.dom);

let runonce = false;
let radius = 200;
let mstime = 0;

const DIST_MIN = 1;
const DIST_MAX = 2000;

const scale = {
  distance: 258,
  speed: 10,
  sun: 100
};

// https://barionleg.github.io/dat.gui/API.html
const gui = new dat.GUI();
//gui.close();
const optionsFolder = gui.addFolder('Options');
const options = {
  run: true,
  update: true,
  render: true,
  stars: true,
  orbits: false,
  asteroids: false,
  dwarfs: true,
  kuiper: false,
  oort: false,
  labels: false,
  border: false,
  filled: false,
};
optionsFolder.add(options, "run");
optionsFolder.add(options, "update");
optionsFolder.add(options, "render");
optionsFolder.close();
const drawFolder = gui.addFolder('Draw');
drawFolder.add(options, "stars");
drawFolder.add(options, "dwarfs");
drawFolder.add(options, "orbits");
drawFolder.add(options, "asteroids");
drawFolder.add(options, "kuiper");
drawFolder.add(options, "oort");
drawFolder.add(options, "labels");
drawFolder.add(options, "border");
drawFolder.add(options, "filled");
drawFolder.open();
const scaleFolder = gui.addFolder("Scale");
scaleFolder.add(scale, "sun", 1, 400, 1);
// https://github.com/dataarts/dat.gui/issues/206 & https://github.com/dataarts/dat.gui/pull/246
scaleFolder.add(scale, "distance", DIST_MIN, DIST_MAX, 1)
  .listen(); //.updateDisplay(force);
scaleFolder.add(scale, "speed", 1, 1000, 1);
//scaleFolder.add(scale, "speed", 100, 100000, 100);
scaleFolder.open();

let paused = false;

window.addEventListener('resize', function() {
  ctx.canvas.width = window.innerWidth*2;
  ctx.canvas.height = window.innerHeight*2;
  stars = createStars();
});

class Point {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
};

document.addEventListener("keydown", function(event) {
    //console.log("Key", event.keyCode)
    // https://stackoverflow.com/questions/17401364/how-and-when-to-use-preventdefault
    if (event.code == "KeyF") {
      fnum = 0;
    }
    if (event.code == "Space") {
      paused = !paused;
      console.log("Paused", paused);
      event.preventDefault(); // by default space will page down which is undesirable here
    }
});

let dblclick = new Point();
dblclick['clicked'] = false;
// https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
canvas.addEventListener('dblclick', function(event) {
  console.log("event", event)
  dblclick.clicked = true;
  dblclick.x = event.layerX;
  dblclick.y = event.layerY;
  // TODO: collision detection to determine what was clicked
  //window.open("https://www.geeksforgeeks.org", "_blank");
}, false);

// https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
// https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
// https://dev.to/cubiclesocial/when-to-actually-use-preventdefault-stoppropagation-and-settimeout-in-javascript-event-listeners-48n7
// https://stackoverflow.com/questions/20026502/prevent-mouse-wheel-scrolling-but-not-scrollbar-event-javascript
window.addEventListener("wheel", e => e.preventDefault(), { passive:false })
document.addEventListener("wheel", function(event) {
  event.preventDefault();
  console.log(event);
  scale.distance += event.deltaY;
  if (scale.distance < DIST_MIN) scale.distance = DIST_MIN;
  if (scale.distance > DIST_MAX) scale.distance = DIST_MAX;
}, false);

function calculateCircumference(radius) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/PI
  return 2 * Math.PI * radius;
}

// normal method of drawing a circles
function getRadians(degrees) {
  // https://code.mu/en/javascript/book/supreme/canvas/circle/
	return (Math.PI / 180) * degrees;
}

function rotate(cx, cy, x, y, angle) {
  let radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

function random(min, max) {
  return min + Math.random() * (max + 1 - min);
}

function createStars() {
  let stars = [];
  const canvasSize = canvas.width * canvas.height;
  const starsFraction = canvasSize / 2000;

  for(let i = 0; i < starsFraction; i++) {
    stars.push(
      {'index': i, 'x': random(2, canvas.width - 2),'y': random(2, canvas.height - 2), 'alpha': random(0.1, 1), 'size': random(1, 2), 'fill': '#ffffff'}
    );
  }
  //console.log("Stars", stars);
  return stars;
}

let stars = createStars();

function drawStars() {
  const canvasSize = canvas.width * canvas.height;
  const starsFraction = canvasSize / 2000;

  ctx.save();
  for(let i = 0; i < starsFraction; i++) {
    ctx.fillStyle = stars[i].fill;
    //console.log(i, "Color", stars[i].fill);
    ctx.globalAlpha = stars[i].alpha;
    ctx.fillRect(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
  }
  ctx.restore();
}

class Orbital extends Point{
  constructor(name, category, size, distance, speed, spin, color, position, site) {
    super();
    this.name = name;
    this.category = category;
    this.size = size;
    this.distance = distance;
    this.speed = speed;
    this.spin = spin;
    this.color = color;
    this.position = position;
    this.orbitals = [];
    this.site = site;
  }
};

let center = new Orbital("Sun", "Star", 100, 0, 0, 0, "yellow", 0, "https://science.nasa.gov/sun/facts/");
center.x = canvas.width /2;
center.y = canvas.height /2;
let p3 = new Orbital("Earth", "Planet", 3.9, .093, -2.8, 23.9, "green", 0, "https://science.nasa.gov/earth/facts/");
p3.orbitals.push(new Orbital("Luna", "Satellite", 1, .0002, 2.8 * 36, 0, "yellow", 0, "https://science.nasa.gov/moon/facts/"))

//                name, category, size, distance, speed, spin, color, position
let orbitals = [                                                                                  // distance from sun in billions of miles
  new Orbital("Mercury", "Planet", 1.5, .036, -4.8, 0, "white", 0, "https://science.nasa.gov/mercury/facts/"),     // .036   https://www.space.com/36-mercury-the-suns-closest-planetary-neighbor.html
  new Orbital("Venus", "Planet", 3.7, .067, -3.5, 0, "orange", 0, "https://science.nasa.gov/venus/facts/"),       // .067   https://www.space.com/44-venus-second-planet-from-the-sun-brightest-planet-in-solar-system.html
  p3,                                                 // .093   https://www.space.com/54-earth-history-composition-and-atmosphere.html
  new Orbital("Mars", "Planet", 2.4, .141, -2.4, 0, "red", 0, "https://science.nasa.gov/mars/facts/"),            // .141   https://www.space.com/47-mars-the-red-planet-fourth-planet-from-the-sun.html
  new Orbital("Jupiter", "Planet", 43.4, .778, -1.3, 10.5, "#406", 0, "https://science.nasa.gov/jupiter/facts/"),    // .778   https://www.space.com/7-jupiter-largest-planet-solar-system.html
  new Orbital("Saturn", "Planet", 36.2, .889, -.9, 0, "#112", 0, "https://science.nasa.gov/saturn/facts/"),       // .889   https://www.space.com/48-saturn-the-solar-systems-major-ring-bearer.html
  new Orbital("Uranus", "Planet", 15.7, 1.8, -.6, 0, "aqua", 0, "https://science.nasa.gov/uranus/facts/"),      // 1.8    https://www.space.com/45-uranus-seventh-planet-in-earths-solar-system-was-first-discovered-planet.html
  new Orbital("Neptune", "Planet", 15.2, 2.8, -.5, 0, "blue", 0, "https://science.nasa.gov/neptune/facts/"),    // 2.8    https://www.space.com/41-neptune-the-other-blue-planet-in-our-solar-system.html
  new Orbital("Pluto", "Dwarf", .7, 3.7, -.02, 0, "orange", 0, "https://science.nasa.gov/dwarf-planets/pluto/facts/"),    // 3.67   https://www.space.com/43-pluto-the-ninth-planet-that-was-a-dwarf.html
  new Orbital("Eris", "Dwarf", .7, 6.3, -.01, 0, "blue", 0, "https://science.nasa.gov/dwarf-planets/eris/"),       // 6.3    https://www.space.com/13403-dwarf-planet-eris-pluto-twin.html
  new Orbital("Haumea", "Dwarf", .8, 4, -.005, 0, "yellow", 4, "https://science.nasa.gov/dwarf-planets/haumea/"),  // 4 or 43 AU     https://www.space.com/23091-haumea.html
  new Orbital("Makemake", "Dwarf", .55, 4.3, -.001, 0, "red", 0, "https://science.nasa.gov/dwarf-planets/makemake/"),  // 4.3    https://www.space.com/23122-makemake.html
  new Orbital("Ceres", "Dwarf", 1.2, .257, -1, 0, "white", 0, "https://science.nasa.gov/dwarf-planets/ceres/facts/"),          // .257   https://www.space.com/22891-ceres-dwarf-planet.html
  new Orbital("Vesta", "Asteroid", 1, .257, -1, 0, "white", .2, "https://science.nasa.gov/solar-system/asteroids/4-vesta/"),
  new Orbital("Pallas", "Asteroid", 1, .3, -1, 0, "white", .4, "https://science.nasa.gov/solar-system/asteroids"),
  new Orbital("Juno", "Asteroid", 1, .3, -1, 0, "white", .6, "https://science.nasa.gov/solar-system/asteroids"),
  new Orbital("Hygia", "Asteroid", 1, .3, -1, 0, "white", .7, "https://science.nasa.gov/solar-system/asteroids"),
  new Orbital("Asteroid belt", "Belt", .1, .3, -.1, .8, "white", 1, "https://science.nasa.gov/resource/asteroid-belt/"),
  new Orbital("Kuiper belt", "Belt", .1, 3.6, -.1, 0, "gray", 0, "https://science.nasa.gov/solar-system/kuiper-belt/facts/"), // inner 30 - 50 AU, outer 50 - 1000 AU (4,487,936,121,000) - pronounced kiper
  new Orbital("Oort cloud", "Belt", .1, 34, -.1, 0, "white", 0, "https://science.nasa.gov/solar-system/oort-cloud/"), // 2,000 - 5,000 AU
];

function update(delta) {
  //console.log("ms", delta);
  step = delta / 10000000000;
  for (let p = 0; p < orbitals.length;p++) {
    orbital = orbitals[p];
    //console.log(delta, orbital.speed, scale.speed);
    orbital.position += ((step) * orbital.speed * scale.speed*scale.speed*1000) % 2;
    //console.log(orbital.name, "position is", orbital.position);
    for (let m = 0; m < orbital.orbitals.length;m++) {
      orbital.orbitals[m].position += ((step) * orbital.orbitals[m].speed * scale.speed*scale.speed*1000) % 2;
      //console.log(orbital.orbitals[m].name, "position is", orbital.orbitals[m].position);
    }
  }
}

function drawAsteroidBelt() {
  let distance = center.size + .17 * scale.distance;
  let size = center.size + .5 * scale.distance;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = size-distance;
  ctx.globalAlpha = 0.1;
  ctx.arc(center.x, center.y, distance+(size-distance)/2, 0, Math.PI * 2, true);
  ctx.strokeStyle = "gray";
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawKuiperBelt() {
  // https://science.nasa.gov/solar-system/kuiper-belt/facts/
  // kuiper is 2.9 - 4.5 B
  let distance = center.size + 2.9 * scale.distance;
  let size = center.size + 4.5 * scale.distance;
  ctx.save()
  if (false) {
    // inner line
    ctx.beginPath();
    ctx.arc(center.x, center.y, distance, 0, Math.PI * 2, true);
    ctx.strokeStyle = "gray";
    ctx.stroke();
    ctx.closePath();

    // outer line
    ctx.beginPath();
    ctx.arc(center.x, center.y, size, 0, Math.PI * 2, true);
    ctx.strokeStyle = "gray";
    ctx.stroke();
    ctx.closePath();
  }

  ctx.beginPath();
  ctx.lineWidth = size-distance;
  ctx.globalAlpha = 0.1;
  ctx.arc(center.x, center.y, distance+(size-distance)/2, 0, Math.PI * 2, true);
  ctx.strokeStyle = "gray";
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawOortCloud() {
  // https://science.nasa.gov/solar-system/oort-cloud/
  let distance = center.size + 20 * scale.distance;
  let size = center.size + 50 * scale.distance;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = size-distance;
  ctx.globalAlpha = 0.05;
  ctx.arc(center.x, center.y, distance+(size-distance)/2, 0, Math.PI * 2, true);
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawOrbitalPaths() {
  for (let p = 0; p < orbitals.length;p++) {
    orbital = orbitals[p];
    if (orbital.name == "Kuiper belt") continue;
    if (orbital.name == "Oort cloud") continue;
    let radius = center.size + orbital.distance * scale.distance;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  }
}

function drawSun() {
  center.size = scale.sun;
  ctx.beginPath();
  ctx.arc(center.x, center.y, center.size, 0, 2 * Math.PI);
  ctx.fillStyle = center.color;
  //console.log("Color", ctx.fillStyle);
  ctx.fill();
  ctx.closePath();
  if (options.labels) {
    txt = ctx.measureText(center.name);
    //console.log("text", txt);
    txt['height'] = txt.fontBoundingBoxAscent + txt.fontBoundingBoxDescent;
    let rect = {'x': center.x, 'y': center.y-txt.fontBoundingBoxAscent+2, 'width': txt.width+5, 'height': txt.height}
    if (dblclick.clicked) {
      if (isClicked(dblclick, rect)) {
        window.open(center.site, "_blank");
      }
    }
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    if (options.border || options.filled) {
      if (options.filled) {
        ctx.fillStyle = "black";
        ctx.fill();
      } else {
        ctx.strokeStyle = "black";
        ctx.stroke();
      }
      ctx.closePath();
    }
    ctx.beginPath();
    ctx.font = "16px serif";
    ctx.fillStyle = "white";
    ctx.fillText(center.name, center.x+2, center.y);
    ctx.closePath();
  }
}

function drawOrbitals() {
  for (let p = 0; p < orbitals.length;p++) {
    orbital = orbitals[p];
    if (!options.dwarfs && orbital.category == "Dwarf") continue;
    if (!options.asteroids && orbital.category == "Asteroid") continue;
    if (!options.asteroids && orbital.name == "Asteroid belt") continue;
    if (!options.kuiper && orbital.name == "Kuiper belt") continue;
    if (!options.oort && orbital.name == "Oort cloud") continue;
    let radius = center.size + orbital.distance * scale.distance;
    let radians = Math.PI * orbital.position;
    orbital.x = center.x+radius*Math.cos(radians);
    orbital.y = center.y+radius*Math.sin(radians);
    ctx.beginPath();
    ctx.arc(center.x+radius*Math.cos(radians), center.y+radius*Math.sin(radians), orbital.size, 0, Math.PI * 2, true);
    ctx.fillStyle = orbital.color;
    //console.log("Color", ctx.fillStyle);
    ctx.fill();
    ctx.closePath();
    if (options.labels) {
      txt = ctx.measureText(orbital.name);
      //console.log("text", txt);
      txt['height'] = txt.fontBoundingBoxAscent + txt.fontBoundingBoxDescent;
      let rect = {'x': orbital.x, 'y': orbital.y-txt.fontBoundingBoxAscent+2, 'width': txt.width+5, 'height': txt.height};
      if (dblclick.clicked) {
        if (isClicked(dblclick, rect)) {
          window.open(orbital.site, "_blank");
        }
      }
      if (options.border || options.filled) {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        if (options.filled) {
          ctx.fillStyle = "black";
          ctx.fill();
        } else {
          ctx.strokeStyle = "black";
          ctx.stroke();
        }
        ctx.closePath();
      }
      ctx.beginPath();
      ctx.font = "16px serif";
      ctx.fillStyle = "white";
      ctx.fillText(orbital.name, orbital.x+2, orbital.y);
      ctx.closePath();
    }
    for (let m = 0; m < orbital.orbitals.length;m++) {
      o = orbital.orbitals[m];
      let radius = orbital.size + o.distance * scale.distance;
      let radians = Math.PI * o.position;
      ctx.beginPath();
      ctx.arc(orbital.x+radius*Math.cos(radians), orbital.y+radius*Math.sin(radians), o.size, 0, Math.PI * 2, true);
      ctx.fillStyle = o.color;
      //console.log("Color", ctx.fillStyle);
      ctx.fill();
      ctx.closePath();
    }
  }
}

function isClicked(point, rect) {
  //console.log("Checking click", point, rect);
  if (point.x > rect.x
    && point.x < rect.x + rect.width
    && point.y > rect.y
    && point.y < rect.y + rect.height) {
      return true;
    }
  return false;
}

function render() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (options.stars) drawStars();

  drawSun();

  if (options.asteroids) drawAsteroidBelt();
  if (options.kuiper) drawKuiperBelt();
  if (options.oort) drawOortCloud();
  if (options.orbits) drawOrbitalPaths();

  drawOrbitals();

  if (dblclick.clicked) {
    dblclick.clicked = false;
  }

  if (false) {
    ctx.beginPath();
    //console.log(dblclick.x, dblclick.y);
    // BUG: click is off by 8 pts on x and y
    ctx.arc(dblclick.x-8, dblclick.y-8, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }
}

function gameloop(milliseconds) {
  if (!runonce) requestAnimationFrame(gameloop);
  let delta = milliseconds - mstime;
  //console.log("Delta", delta, milliseconds, mstime);
  mstime = milliseconds;
  if (!paused) {
    if (options.run) {
      if (options.update) {
        update(delta);
      }
      if (options.render) {
        render();
      }
    }
    stats.update();
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
window.scrollTo(canvas.width/3, canvas.height/4);
requestAnimationFrame(gameloop);
