let canvas = document.getElementById('particlesCanvas');
let ctx = canvas.getContext('2d');

window.addEventListener("resize", resizeparticlesCanvas);

function resizeparticlesCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
  
}


resizeparticlesCanvas();




//Particle generation and rule creation



let particleCount = 4;
let particles = [];
let particles_colour = ['#FF0000', '#00CAFF', '#8DE456', '#AD28E2']
let mouse = {
  x: 0,
  y: 0,
  radius: 20,
  maxRadius: 20,
  color: '#000000',
  isClicked: false
};
let particleCreationInterval;
let particleCreationFrequency = 100;
let collisionSound = document.getElementById('collisionSound');


function createParticles() {
  for (let i = 0; i < particleCount; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let radius = 15;
    let color = particles_colour[i % 4];

    particles.push(new Particle(x, y, radius, color));
  }
}

function renderParticles() {
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 0.1; // You can adjust this value to your liking
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1; // Reset alpha so that particles appear normally
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.draw();
    particle.update();
    let dx = mouse.x - particle.x;
    let dy = mouse.y - particle.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius + particle.radius) {
      let angle = Math.atan2(dy, dx);
      let sin = Math.sin(angle);
      let cos = Math.cos(angle);

      if (
        particle.color === '#AD28E2' ||
        particle.color === '#FF0000' ||
        particle.color === '#00CAFF' ||
        particle.color === '#8DE456'
      ) {
        let dx = mouse.x - particle.x;
        let dy = mouse.y - particle.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        let minDistance = mouse.radius + particle.radius;
        let moveDistance = minDistance - distance;

        particle.x -= moveDistance * cos;
        particle.y -= moveDistance * sin;
      }
    }
  }

  requestAnimationFrame(renderParticles);
}


function Particle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.vx = (Math.random() - 0.5) * 2;
  this.vy = (Math.random() - 0.5) * 2;
}

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.closePath();
};




Particle.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  let attractionRange = 100;
  let elasticity = 0.5;

let moveRadius = Math.min(canvas.width, canvas.height) / 2; // The radius of the circle is half of the minimum value of the width and height of the canvas
let moveCenterX = canvas.width / 2; // x-coordinate of the center of the canvas
let moveCenterY = canvas.height / 2;
  
  let dx = this.x - moveCenterX;
  let dy = this.y - moveCenterY;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > moveRadius - this.radius) {
    let angle = Math.atan2(dy, dx);
    let reflectionAngle = angle + Math.PI; // Reflection angle, plus π radians
    this.vx = Math.cos(reflectionAngle);
    this.vy = Math.sin(reflectionAngle);

    // Move particles to the inside of the circular boundary
    this.x = moveCenterX + Math.cos(angle) * (moveRadius - this.radius);
    this.y = moveCenterY + Math.sin(angle) * (moveRadius - this.radius);
  }


  // Collision detection and mouse attraction
  for (let i = 0; i < particles.length; i++) {
    let otherParticle = particles[i];
    if (otherParticle !== this) {
      let dx = this.x - otherParticle.x;
      let dy = this.y - otherParticle.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.radius + otherParticle.radius) {
        // Collision Handling
        let angle = Math.atan2(dy, dx);
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        let vx1 = this.vx * cos + this.vy * sin;
        let vy1 = this.vy * cos - this.vx * sin;
        let vx2 = otherParticle.vx * cos + otherParticle.vy * sin;
        let vy2 = otherParticle.vy * cos - otherParticle.vx * sin;

        let finalVx1 = ((this.radius - otherParticle.radius) * vx1 + (otherParticle.radius + this.radius) * vx2) / (this.radius + otherParticle.radius) * elasticity;
        let finalVx2 = ((this.radius + otherParticle.radius) * vx1 + (otherParticle.radius - this.radius) * vx2) / (this.radius + otherParticle.radius) * elasticity;

        this.vx = finalVx1 * cos - vy1 * sin;
        this.vy = vy1 * cos + finalVx1 * sin;
        otherParticle.vx = finalVx2 * cos - vy2 * sin;
        otherParticle.vy = vy2 * cos + finalVx2 * sin;
      } else if (distance < attractionRange) {


        if (this.color === '#FF0000') {
          if (otherParticle.color !== '#FF0000') {
            this.vx -= dx * attractionForce;
            this.vy -= dy * attractionForce;
            collisionSound.play();
          } else {
            this.vx += dx * repulsionForce;
            this.vy += dy * repulsionForce;
          }
        } else if (this.color === '#00CAFF') {
          if (otherParticle.color !== '#8DE456') {
            this.vx += dx * repulsionForce;
            this.vy += dy * repulsionForce;
            collisionSound.play();
          } else {
            this.vx -= dx * attractionForce;
            this.vy -= dy * attractionForce;
          }
        } else if (this.color === '#8DE456') {
          if (otherParticle.color !== '#00CAFF') {
            this.vx -= dx * attractionForce;
            this.vy -= dy * attractionForce;
            collisionSound.play();
          } else {
            this.vx += dx * repulsionForce;
            this.vy += dy * repulsionForce;
          }
        } else if (this.color === '#AD28E2') {
          if (otherParticle.color === '#AD28E2') {
            this.vx -= dx * attractionForce;
            this.vy -= dy * attractionForce;
            collisionSound.play();
          } else {
            this.vx += dx * repulsionForce;
            this.vy += dy * repulsionForce;
          }
        }
      }
    }
  }
};



//Use tone.js to add sound effects
let synth;
synth = new Tone.PolySynth().toDestination();

function playRandomTone() {
  // Randomly select a tone
  let pitch = ['C3', 'D#3', 'F3', 'G#3', 'C4', 'D#4', 'F4', 'G#4', 'C3', 'D#3', 'F3', 'G#3', 'C4', 'D#4', 'F4', 'G#4', 'C5', 'D#5', 'F5', 'G#5', 'C4', 'D#4', 'F4', 'G#4', 'C5', 'D#5', 'F5', 'G#5', 'C3', 'D#3', 'F3', 'G#3', 'C4', 'D#4', 'F4', 'G#4'][Math.floor(Math.random() * 27)];
  // Using PolySynth objects to trigger tones
  synth.triggerAttackRelease(pitch, '8n');
}

// Add screenshot function
document.addEventListener('keydown', function(event) {
  
  if (event.key === 's') {
   
    var screenShot = document.createElement('canvas');
    screenShot.width = canvas.width;
    screenShot.height = canvas.height;
    var scrShot =screenShot.getContext('2d');

    
    scrShot.drawImage(canvas, 0, 0);

    
    var downloadLink = document.createElement('a');
    downloadLink.href = screenShot.toDataURL();
    downloadLink.download = 'screenshot.png'; 

    
    downloadLink.click();
  }
});


//Interactive functions such as mouse and keyboard

canvas.addEventListener('mousemove', function (event) {
  mouse.x = event.offsetX;
  mouse.y = event.offsetY;
});
canvas.addEventListener('mousedown', function () {
  // Existing code
  mouse.isClicked = true;
  isInteracted = true;
  increaseRadius();

  // New code to create a new particle at the mouse position every 100ms
  particleCreationInterval = setInterval(function () {
    let x = mouse.x;
    let y = mouse.y;
    let randomNumber = Math.random() * 10 + 5;
    let radius = randomNumber;
    let color = particles_colour[Math.floor(Math.random() * particles_colour.length)];

    // Calculate a random direction for the particle's initial velocity
    let direction = Math.random() * Math.PI * 2; // Random angle in radians
    let speed = Math.random() * 5 + 5; // Random speed between 5 and 10 units per frame

    let vx = Math.cos(direction) * speed;
    let vy = Math.sin(direction) * speed;

    let particle = new Particle(x, y, radius, color);
    particle.vx = vx;
    particle.vy = vy;
    particles.push(particle);
    if (isInteracted) {playRandomTone();}
    
  }, particleCreationFrequency); // Adjust this value to change the frequency of particle creation

});

canvas.addEventListener('mouseup', function () {
  // Existing code
  mouse.isClicked = false;

  decreaseRadius();

  // New code to stop creating particles
  clearInterval(particleCreationInterval);
});

function increaseRadius() {
  let interval = setInterval(function () {
    mouse.radius += 2; // Increase the radius of black circle on the mouse by 2 each time
    if (mouse.radius >= mouse.maxRadius * 10) {
      clearInterval(interval);
      decreaseRadius()
    }
  }, 5); // time frequency
}

function decreaseRadius() {
  let interval = setInterval(function () {
    mouse.radius -= 10; // Decrease the radius of black circle on the mouse by 10 each time
    if (mouse.radius <= mouse.maxRadius) {
      clearInterval(interval);
    }
  }, 1); // time frequency
}




const MAX_FREQUENCY = 500;
const MIN_FREQUENCY = 10;
const MAX_FORCE = 10000;
const MIN_FORCE = 0.0001;

function increaseFrequency() {
  // Increase the interval time
  if (particleCreationFrequency < MAX_FREQUENCY) {
    particleCreationFrequency += 10;
    console.log("increaseD() is called");
    console.log(particleCreationFrequency);
    // update the display
    let frequencyDisplay = document.getElementById('particleFrequency');
    frequencyDisplay.innerHTML = particleCreationFrequency;

    // If there's an active particle creation interval, restart it with the new frequency
    if (particleCreationInterval) {
      clearInterval(particleCreationInterval);
      particleCreationInterval = setInterval(particle = new Particle(x, y, radius, color), particleCreationFrequency);
      // update the display
      let frequencyDisplay = document.getElementById('particleFrequency');
      frequencyDisplay.innerHTML = particleCreationFrequency;
    }
  }
}

function decreaseFrequency() {
  if (particleCreationFrequency > MIN_FREQUENCY) {
    console.log("increaseF() is called");
    console.log(particleCreationFrequency);
    particleCreationFrequency -= 10;
    // update the display
    let frequencyDisplay = document.getElementById('particleFrequency');
    frequencyDisplay.innerHTML = particleCreationFrequency;
  }

  // If there's an active particle creation interval, restart it with the new frequency
  if (particleCreationInterval) {
    clearInterval(particleCreationInterval);
    particleCreationInterval = setInterval(particle = new Particle(x, y, radius, color), particleCreationFrequency);
    // update the display
    let frequencyDisplay = document.getElementById('particleFrequency');
    frequencyDisplay.innerHTML = particleCreationFrequency;
  }
}

function increaseForces() {
  console.log("increaseForces() is called");
  if (attractionForce < MAX_FORCE && repulsionForce < MAX_FORCE) {
    attractionForce *= 10;
    repulsionForce *= 10;
    let forceDisplay = document.getElementById('particleBothForce');
    forceDisplay.innerHTML = attractionForce;
  }
}

function decreaseForces() {
  console.log("decreaseForces() is called");
  if (attractionForce > MIN_FORCE && repulsionForce > MIN_FORCE) {
    attractionForce /= 10;
    repulsionForce /= 10;
    let forceDisplay = document.getElementById('particleBothForce');
    forceDisplay.innerHTML = attractionForce;
  }
}

let attractionForce = 0.001;
let repulsionForce = 0.001;

function init() {
  createParticles();
  renderParticles();
  let increaseButton = document.getElementById("Button1");
  let decreaseButton = document.getElementById("Button2");
  let increaseFrequencyButton = document.getElementById("increaseFrequency");
  let decreaseFrequencyButton = document.getElementById("decreaseFrequency");

  increaseButton.addEventListener("click", increaseForces);
  decreaseButton.addEventListener("click", decreaseForces);
  increaseFrequencyButton.addEventListener("click", increaseFrequency);
  decreaseFrequencyButton.addEventListener("click", decreaseFrequency);
}



window.onload = init;