const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1150;
canvas.height = 800;

class Bullet {
  constructor(position, texture, angle, speed, emitter) {
    this.position = position;
    this.velocity = {
      x: -Math.cos((angle * 3.14) / 180) * speed,
      y: -Math.sin((angle * 3.14) / 180) * speed,
    };
    this.texture = texture;
    this.angle = angle;
    this.size = {
      w: 17,
      h: 12,
    };
    this.bounce = 0;
    this.emitter = emitter;
  }
  draw() {
    drawImageRot(
      this.texture,
      this.position.x,
      this.position.y,
      this.size.w,
      this.size.h,
      this.angle
    );
  }
  update() {
    this.draw();
    for (let i = 0; i < Bcollision.length; i++) {
      this.collision_walls(Bcollision[i]);
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  collision_walls(obj) {
    this.side = colliderect(
      this.position.y + this.velocity.y,
      this.position.x + this.velocity.x,
      this.size.w,
      this.size.h,
      obj.position.y,
      obj.position.x,
      obj.size.w,
      obj.size.h,
      4
    );
    if (this.side == "right") {
      this.bounce += 1;
      this.velocity.x = -this.velocity.x;
      this.angle = 180 - this.angle;
    }
    if (this.side == "left") {
      this.bounce += 1;
      this.velocity.x = -this.velocity.x;
      this.angle = 180 - this.angle;
    }
    if (this.side == "up") {
      this.bounce += 1;
      this.velocity.y = -this.velocity.y;
      this.angle = -this.angle;
    }
    if (this.side == "down") {
      this.bounce += 1;
      this.velocity.y = -this.velocity.y;
      this.angle = -this.angle;
    }
  }
}

class Mine {
  constructor(position, emitter) {
    this.position = position;
    this.radius = 15;
    this.timealive = 0;
    this.color = "yellow";
    this.emitter = emitter;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
  update() {
    if (this.timealive > 240) {
      if (this.timealive % 10 < 5) {
        this.color = "yellow";
      } else {
        this.color = "red";
      }
    }
    this.draw(this.color);
    this.timealive++;
  }
}

const mine1 = new Mine({
  x: 110,
  y: 110,
});

class Block {
  constructor(position, texture) {
    this.position = position;
    this.size = {
      w: 50,
      h: 50,
    };
    this.texture = texture;
  }
  draw() {
    c.drawImage(
      this.texture,
      this.position.x,
      this.position.y,
      this.size.w,
      this.size.h
    );
  }
}

class CollisonsBox {
  constructor(position, size) {
    this.position = position;
    this.size = size;
  }
  draw() {
    c.strokeStyle = debug;
    c.rect(this.position.x, this.position.y, this.size.w, this.size.h);
    c.strokeStyle = "black";
    c.strokeRect(this.position.x, this.position.y, this.size.w, this.size.h);
  }
}

class Player {
  constructor(position, body, turret) {
    this.position = position;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.size = {
      w: 48,
      h: 48,
    };
    this.turretsize = {
      w: 70,
      h: 40,
    };
    this.body = body;
    this.turret = turret;
    this.angle = 0;
    this.endpos = {
      x: 0,
      y: 0,
    };
    this.direction = {
      x: 0,
      y: 0,
    };
    this.bulletcount = 0;
    this.minecount = 0;
  }

  shoot() {
    if (this.bulletcount < 5) {
      this.bulletcount++;
      bullets.push(
        new Bullet(
          { x: this.endpos.x, y: this.endpos.y },
          bullet1,
          this.angle,
          4,
          this
        )
      );
    }
  }
  plant() {
    if (this.minecount < 3) {
      this.minecount++;
      mines.push(
        new Mine(
          {
            x: this.position.x + this.size.w / 2,
            y: this.position.y + this.size.h / 2,
          },
          this
        )
      );
    }
  }
  draw() {
    //body hit box
    c.fillStyle = debug;
    c.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);

    //drawing the body
    drawImageRot(
      this.body,
      this.position.x,
      this.position.y,
      this.size.w,
      this.size.h,
      this.rotation
    );

    //drawing the turet
    drawTurretRot(
      this.turret,
      this.position.x,
      this.position.y,
      this.turretsize.w,
      this.turretsize.h,
      this.angle
    );
    this.endofbarrel();
  }

  update() {
    this.draw();

    //change the angle of the image depending on the mvt direction
    this.velocity = this.direction;
    for (let i = 0; i < Bcollision.length; i++) {
      this.collision(Bcollision[i]);
    }
    if (this.velocity.x == mvtspeed) {
      this.rotation = 0;
    } else if (this.velocity.x == -mvtspeed) {
      this.rotation = 0;
    } else if (this.velocity.y == -mvtspeed) {
      this.rotation = 90;
    } else if (this.velocity.y == mvtspeed) {
      this.rotation = 90;
    }

    //handle the movement

    if (
      (this.velocity.x == mvtspeed || this.velocity.x == -mvtspeed) &&
      (this.velocity.y == mvtspeed || this.velocity.y == -mvtspeed)
    ) {
      //this.velocity.x = mvtspeed / 2;
      // this.velocity.y = mvtspeed / 2;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  collision(obj) {
    this.side = colliderect(
      this.position.y,
      this.position.x,
      this.size.w,
      this.size.h,
      obj.position.y,
      obj.position.x,
      obj.size.w,
      obj.size.h,
      3
    );
    if (this.side == "right") {
      if (this.velocity.x > 0) this.velocity.x = 0;
    }
    if (this.side == "left") {
      if (this.velocity.x < 0) this.velocity.x = 0;
    }
    if (this.side == "up") {
      if (this.velocity.y < 0) this.velocity.y = 0;
    }
    if (this.side == "down") {
      if (this.velocity.y > 0) this.velocity.y = 0;
    }
  }

  endofbarrel() {
    c.fillStyle = debug;
    this.endpos.x = this.position.x + 2.5 * (this.size.w / 6);
    this.endpos.y = this.position.y + 2.5 * (this.size.h / 6);
    this.hyp = 45;
    this.endpos.x -= Math.cos(this.angle * (Math.PI / 180)) * this.hyp;
    this.endpos.y -= Math.sin(this.angle * (Math.PI / 180)) * this.hyp;

    c.fillRect(this.endpos.x, this.endpos.y, 10, 10);
  }
}

body = new Image();
body.src = "image/tank_player/body.png";

turret = new Image();
turret.src = "image/tank_player/turret.png";

block1 = new Image();
block1.src = "image/block1.png";

block2 = new Image();
block2.src = "image/block2.png";

bullet1 = new Image();
bullet1.src = "image/bullet/bullet.png";

bg = new Image();
bg.src = "image/background_wood.png";
const mvtspeed = 3;

let MouseX = 0;
let MouseY = 0;

const player = new Player(
  {
    x: 110,
    y: 110,
  },
  body,
  turret
);

blocks = [];
Bcollision = [];
bullets = [];
mines = [];

loadlevel("levels/level1.json");

//debug = "rgba(255, 0, 0, 0.2)";
debug = "rgba(255, 0, 0, 0)";

function animate() {
  window.requestAnimationFrame(animate);
  c.drawImage(bg, 0, 0, canvas.width, canvas.height);
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
    if (bullets[i].bounce >= 3) {
      bullets[i].emitter.bulletcount--;
      bullets.splice(i, 1);
      i -= 1;
    }
  }
  for (let i = 0; i < mines.length; i++) {
    mines[i].update();
    if (mines[i].timealive >= 300) {
      mines[i].emitter.minecount--;
      mines.splice(i, 1);
      i -= 1;
    }
  }
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].draw();
  }
  for (let i = 0; i < Bcollision.length; i++) {
    Bcollision[i].draw();
  }
  player.update();
  CalculateAngle();
  c.fillStyle = debug;
  c.fillRect(MouseX, MouseY, 10, 10);
}

animate();

onmousemove = function (e) {
  var rect = canvas.getBoundingClientRect();
  MouseX = e.clientX - rect.left;
  MouseY = e.clientY - rect.top;
};
function CalculateAngle() {
  adjacent = MouseX - (player.position.x + player.size.w / 2);
  opposite = MouseY - (player.position.y + player.size.h / 2);
  angle = Math.atan(opposite / adjacent);
  console.log();
  if (adjacent < 0) {
    player.angle = (angle * 180) / Math.PI;
  } else {
    player.angle = (angle * 180) / Math.PI + 180;
  }
}

window.addEventListener("click", (event) => {
  player.shoot();
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      player.direction.x = mvtspeed;
      break;
    case "q":
      player.direction.x = -mvtspeed;
      break;
    case "z":
      player.direction.y = -mvtspeed;
      break;
    case "s":
      player.direction.y = mvtspeed;
      break;
    case " ":
      player.plant();
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      if (player.direction.x > 0) {
        player.direction.x = 0;
      }
      break;
    case "q":
      if (player.direction.x < 0) {
        player.direction.x = 0;
      }
      break;
    case "z":
      if (player.direction.y < 0) {
        player.direction.y = 0;
      }
      break;
    case "s":
      if (player.direction.y > 0) {
        player.direction.y = 0;
      }
      break;
  }
});

function drawImageRot(img, x, y, width, height, deg) {
  // Store the current context state (i.e. rotation, translation etc..)
  c.save();

  //Convert degrees to radian
  var rad = (deg * Math.PI) / 180;

  //Set the origin to the center of the image
  c.translate(x + width / 2, y + height / 2);

  //Rotate the canvas around the origin
  c.rotate(rad);

  //draw the image
  c.drawImage(img, (width / 2) * -1, (height / 2) * -1, width, height);

  // Restore canvas state as saved from above
  c.restore();
}

function drawTurretRot(img, x, y, width, height, deg) {
  // Store the current context state (i.e. rotation, translation etc..)
  c.save();

  //Convert degrees to radian
  var rad = (deg * Math.PI) / 180;

  //Set the origin to the center of the image
  c.translate(x + 3 * (width / 8), y + height / 2);

  //Rotate the canvas around the origin
  c.rotate(rad);

  //draw the image
  c.drawImage(img, -2 * (width / 3), (height / 2) * -1, width, height);

  // Restore canvas state as saved from above
  c.restore();
}

function loadlevel(name) {
  var request = new XMLHttpRequest();
  request.open("GET", name, false);
  request.send(null);
  var my_JSON_object = JSON.parse(request.responseText);
  blocklist = my_JSON_object["layers"][0]["data"];
  for (let l = 0; l <= 16; l++) {
    for (let c = 0; c <= 23; c++) {
      if (blocklist[l * 23 + c] == 1) {
        blocks.push(new Block({ x: c * 50, y: l * 50 }, block1));
      }
      if (blocklist[l * 23 + c] == 2) {
        blocks.push(new Block({ x: c * 50, y: l * 50 }, block2));
      }
      if (blocklist[l * 23 + c] == 3) {
        player.position.x = c * 50;
        player.position.y = l * 50;
      }
    }
  }
  boxed = [];
  i = 0;
  Bcollision = [];
  while (i < blocklist.length) {
    l = 1;
    col = 1;
    if (
      (blocklist[i] == 1 || blocklist[i] == 2) &&
      boxed.includes(i) == false
    ) {
      console.log(l);

      while (
        (blocklist[i + l] == 1 || blocklist[i + l] == 2) &&
        (i % 23) + l < 23 &&
        boxed.includes(i + 1) == false
      ) {
        l++;
      }
      while (
        (blocklist[i + 23 * col] == 1 || blocklist[i + 23 * col] == 2) &&
        Math.floor(i / 23) + col < 16 &&
        boxed.includes(i + 23 * col) == false
      ) {
        col++;
      }
      if (col > l) {
        l = 1;
        for (let b = 0; b < col; b++) {
          boxed.push(i + b * 23);
        }
      } else {
        col = 1;
        for (let b = 0; b < l; b++) {
          boxed.push(i + b);
        }
      }
      Bcollision.push(
        new CollisonsBox(
          { x: (i % 23) * 50, y: Math.floor(i / 23) * 50 },
          { w: l * 50, h: col * 50 }
        )
      );
    }
    i++;
  }
  boxed = [];
  console.log(Bcollision);
  for (let i = 0; i < Bcollision.length; i++) {
    for (let e = 0; e < Bcollision.length; e++) {
      if (
        i != e &&
        Bcollision[i].position.x === Bcollision[e].position.x &&
        Bcollision[i].position.y + Bcollision[i].size.h ===
          Bcollision[e].position.y &&
        Bcollision[i].size.w === Bcollision[e].size.w
      ) {
        Bcollision.push(
          new CollisonsBox(
            {
              x: Bcollision[i].position.x,
              y: Bcollision[i].position.y,
            },
            {
              w: Bcollision[i].size.w,
              h: Bcollision[i].size.h + Bcollision[e].size.h,
            }
          )
        );
        if (i > e) {
          Bcollision.splice(i, 1);
          Bcollision.splice(e, 1);
        } else {
          Bcollision.splice(e, 1);
          Bcollision.splice(i, 1);
        }
        i = 0;
        e = 0;
      }
    }
  }
  for (let i = 0; i < Bcollision.length; i++) {
    for (let e = 0; e < Bcollision.length; e++) {
      if (
        i != e &&
        Bcollision[i].position.y === Bcollision[e].position.y &&
        Bcollision[i].position.x + Bcollision[e].size.w ===
          Bcollision[e].position.x &&
        Bcollision[i].size.h === Bcollision[e].size.h
      ) {
        console.log("yes");

        Bcollision.push(
          new CollisonsBox(
            {
              x: Bcollision[i].position.x,
              y: Bcollision[i].position.y,
            },
            {
              w: Bcollision[i].size.w + Bcollision[e].size.w,
              h: Bcollision[i].size.h,
            }
          )
        );
        if (i > e) {
          Bcollision.splice(i, 1);
          Bcollision.splice(e, 1);
        } else {
          Bcollision.splice(e, 1);
          Bcollision.splice(i, 1);
        }
        i = 0;
        e = 0;
      }
    }
  }
}

function colliderect(
  rect1t,
  rect1l,
  rect1w,
  rect1h,
  rect2t,
  rect2l,
  rect2w,
  rect2h,
  offset
) {
  /* collide up */
  if (
    (rect1t - offset < rect2t + rect2h &&
      rect1t - offset > rect2t &&
      rect1l < rect2l + rect2w &&
      rect1l > rect2l) ||
    (rect1t - offset < rect2t + rect2h &&
      rect1t - offset > rect2t &&
      rect1l + rect1w / 2 < rect2l + rect2w &&
      rect1l + rect1w / 2 > rect2l) ||
    (rect1t - offset < rect2t + rect2h &&
      rect1t - offset > rect2t &&
      rect1l + rect1w < rect2l + rect2w &&
      rect1l + rect1w > rect2l)
  ) {
    return "up";
  }
  /* collide down */
  if (
    (rect1t + offset + rect1h < rect2t + rect2h &&
      rect1t + offset + rect1h > rect2t &&
      rect1l < rect2l + rect2w &&
      rect1l > rect2l) ||
    (rect1t + offset + rect1h < rect2t + rect2h &&
      rect1t + offset + rect1h > rect2t &&
      rect1l + rect1w / 2 < rect2l + rect2w &&
      rect1l + rect1w / 2 > rect2l) ||
    (rect1t + offset + rect1h < rect2t + rect2h &&
      rect1t + offset + rect1h > rect2t &&
      rect1l + rect1w < rect2l + rect2w &&
      rect1l + rect1w > rect2l)
  ) {
    return "down";
  }
  /* collide left */
  if (
    (rect1t < rect2t + rect2h &&
      rect1t > rect2t &&
      rect1l - offset < rect2l + rect2w &&
      rect1l - offset > rect2l) ||
    (rect1t + rect1h / 2 < rect2t + rect2h &&
      rect1t + rect1h / 2 > rect2t &&
      rect1l - offset < rect2l + rect2w &&
      rect1l - offset > rect2l) ||
    (rect1t + rect1h < rect2t + rect2h &&
      rect1t + rect1h > rect2t &&
      rect1l - offset < rect2l + rect2w &&
      rect1l - offset > rect2l)
  ) {
    return "left";
  }

  /* collide right */
  if (
    (rect1t < rect2t + rect2h &&
      rect1t > rect2t &&
      rect1l + offset + rect1w < rect2l + rect2w &&
      rect1l + offset + rect1w > rect2l) ||
    (rect1t + rect1h / 2 < rect2t + rect2h &&
      rect1t + rect1h / 2 > rect2t &&
      rect1l + offset + rect1w < rect2l + rect2w &&
      rect1l + offset + rect1w > rect2l) ||
    (rect1t + rect1h < rect2t + rect2h &&
      rect1t + rect1h > rect2t &&
      rect1l + offset + rect1w < rect2l + rect2w &&
      rect1l + offset + rect1w > rect2l)
  ) {
    return "right";
  }
  return "";
}
