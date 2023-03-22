import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import "./style.css";

// aliases
const Application = PIXI.Application,
  Assets = PIXI.Assets,
  BaseTexture = PIXI.BaseTexture,
  Container = PIXI.Container,
  Graphics = PIXI.Graphics,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle;

// create PIXI application

const app = makeApp();

const gameScene = new Container();
app.stage.addChild(gameScene);

const gameOverScene = new Container();
app.stage.addChild(gameOverScene);
gameOverScene.visible = false;

const dungeonSize = 16;
const tileSize = 32;

const boundary = new Rectangle(
  tileSize,
  tileSize,
  (dungeonSize - 1) * tileSize,
  (dungeonSize - 1) * tileSize
);

// display the game area

const spritesheet = await makeSpritesheet("images/explorer.json");

drawDungeon();

// display entities

const [explorer, blobs, treasure, door] = makeEntities();

// draw UI

const [healthBar] = drawUI();
gameScene.addChild(healthBar);

const message = drawMessage("The End!", {
  x: (dungeonSize * tileSize) / 2 - tileSize / 2,
  y: (dungeonSize * tileSize) / 2 - tileSize / 2,
});
console.log(message);
gameOverScene.addChild(message);

// input setup

const left = keyboard("ArrowLeft"),
  up = keyboard("ArrowUp"),
  right = keyboard("ArrowRight"),
  down = keyboard("ArrowDown");

left.press = () => {
  explorer.vx = -5;
  explorer.vy = 0;
};

left.release = () => {
  if (!right.isDown && explorer.vy === 0) {
    explorer.vx = 0;
  }
};

up.press = () => {
  explorer.vx = 0;
  explorer.vy = -5;
};

up.release = () => {
  if (!down.isDown && explorer.vx === 0) {
    explorer.vy = 0;
  }
};

right.press = () => {
  explorer.vx = 5;
  explorer.vy = 0;
};

right.release = () => {
  if (!left.isDown && explorer.vy === 0) {
    explorer.vx = 0;
  }
};

down.press = () => {
  explorer.vx = 0;
  explorer.vy = 5;
};

down.release = () => {
  if (!up.isDown && explorer.vx === 0) {
    explorer.vy = 0;
  }
};

// game loop

let state = play;

app.ticker.add((delta) => gameLoop(delta));

function gameLoop(delta) {
  // console.log(`${delta} frames elapsed since last frame.`);
  state(delta);
}

function play(delta) {
  explorer.hit = false;

  explorer.x += explorer.vx * delta;
  explorer.y += explorer.vy * delta;
  contain(explorer, boundary);

  blobs.forEach((blob) => {
    blob.y += blob.vy;

    const blobHitsWall = contain(blob, boundary);

    if (blobHitsWall === "top" || blobHitsWall === "bottom") {
      blob.vy *= -1;
    }

    if (hitTestRectangle(explorer, blob)) {
      explorer.hit = true;
    }
  });

  if (explorer.hit) {
    explorer.alpha = 0.5;
    healthBar.outer.width -= 1;
    if (healthBar.outer.width < 0) {
      healthBar.outer.width = 0;
    }
  } else {
    explorer.alpha = 1;
  }

  if (hitTestRectangle(explorer, treasure)) {
    treasure.position.set(explorer.x + 8, explorer.y + 8);
  }

  const goalArea = new Rectangle(
    tileSize,
    tileSize,
    tileSize / 2,
    tileSize / 2
  );
  if (hitTestRectangle(treasure, goalArea)) {
    console.log("Treasure reached goal area!");
    state = end;
    message.text = "You won! :D";
  }

  if (healthBar.outer.width <= 0) {
    state = end;
    message.text = "You lost! :(";
  }
}

// game over screen

function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}

// util functions

// app maker

function makeApp() {
  const app = new Application({
    width: 256,
    height: 256,
    antialias: false,
    transparent: true,
    backgroundAlpha: 0.8,
    resolution: 1,
    roundPixels: true,
    hello: true,
    autoDensity: true,
  });

  // pixel art mode
  BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

  // make canvas fill window
  app.renderer.view.style.position = "absolute";
  app.renderer.view.style.display = "block";
  // app.renderer.autoDensity = true;
  app.resizeTo = window;

  document.querySelector("#app").appendChild(app.view);

  return app;
}

// spritesheet loader

async function makeSpritesheet(spritesheetFile) {
  const spritesheet = await Assets.load(spritesheetFile, (progress) =>
    console.log(
      `Loading progress for ${spritesheetFile}: ${progress * 100}% complete...`
    )
  );
  console.log(`Spritesheet file ${spritesheetFile} loaded as:`);
  console.log(spritesheet);
  return spritesheet;
}

// draw functions

function drawDungeon() {
  const wallTexture = spritesheet.textures["wall.png"];
  const floorTexture = spritesheet.textures["floor.png"];

  for (let i = 0; i < dungeonSize; i++) {
    for (let j = 0; j < dungeonSize; j++) {
      let texture;
      if (
        i === 0 ||
        i === dungeonSize - 1 ||
        j === 0 ||
        j === dungeonSize - 1
      ) {
        texture = wallTexture;
      } else {
        texture = floorTexture;
      }
      const sprite = Sprite.from(texture);
      sprite.anchor.set(0);
      sprite.scale.set(2);
      sprite.position.set(i * tileSize, j * tileSize);
      gameScene.addChild(sprite);
    }
  }
}

function drawUI() {
  const healthBar = new Container();
  const offsetRight = 170;
  const width = 128;
  const height = 4;

  healthBar.position.set(dungeonSize * tileSize - offsetRight, height);

  const innerBar = new Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, width, height * 2);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  const outerBar = new Graphics();
  outerBar.beginFill(0xff3300);
  outerBar.drawRect(0, 0, width, height * 2);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  healthBar.outer = outerBar;

  return [healthBar];
}

function drawMessage(text, position) {
  const style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white",
  });
  const message = new Text(text, style);
  message.position.set(position.x, position.y);

  console.log(message);
  return message;
}

function makeEntities() {
  const explorer = putSprite("explorer.png", {
    x: 68,
    y: (dungeonSize * tileSize) / 2 - tileSize / 2,
  });

  (explorer.vx = 0), (explorer.vy = 0);

  const treasure = putSprite("chest.png", {
    x: dungeonSize * tileSize - tileSize - 48,
    y: (dungeonSize * tileSize) / 2 - tileSize / 2,
  });

  const door = putSprite("door.png", {
    x: 32,
    y: 0,
  });

  const numberOfBlobs = 6,
    spacing = 48,
    xOffset = 150,
    speed = 2,
    blobs = [];

  let direction = 1;

  for (let i = 0; i < numberOfBlobs; i++) {
    const blob = putSprite("blob.png", {
      x: spacing * i + xOffset,
      y: randomInt(tileSize, dungeonSize * tileSize - 2 * tileSize),
    });
    blobs.push(blob);

    // set blob vertical velocity then invert direction for the next one
    blob.vy = speed * direction;
    direction *= -1;
  }

  return [explorer, blobs, treasure, door];
}

function putSprite(textureId, position) {
  const sprite = Sprite.from(spritesheet.textures[textureId]);
  sprite.anchor.set(0);
  sprite.scale.set(2);
  sprite.x = position.x;
  sprite.y = position.y;
  gameScene.addChild(sprite);
  return sprite;
}

// keyboard handler

function keyboard(value) {
  const key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downhandler = (e) => {
    if (e.key === key.value) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
      e.preventDefault();
    }
  };

  key.uphandler = (e) => {
    if (e.key === key.value) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
      e.preventDefault();
    }
  };

  // attach event listeners
  const downListener = key.downhandler.bind(key);
  const upListener = key.uphandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
}

// utils

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// collision detection

function hitTestRectangle(r1, r2) {
  let hit = false;

  // find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  // find the half-widths
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  // find distance vector
  const vx = r1.centerX - r2.centerX;
  const vy = r1.centerY - r2.centerY;

  // find combined half-widths
  const combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  const combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  // check for collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    // check for collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    }
  }

  return hit;
}

function contain(sprite, rectangle) {
  let collision = undefined;

  if (sprite.x < rectangle.x) {
    sprite.x = rectangle.x;
    collision = "left";
  }

  if (sprite.y < rectangle.y) {
    sprite.y = rectangle.y;
    collision = "top";
  }

  if (sprite.x + tileSize > rectangle.width) {
    sprite.x = rectangle.width - tileSize;
    collision = "right";
  }

  if (sprite.y + tileSize > rectangle.height) {
    sprite.y = rectangle.height - tileSize;
    collision = "bottom";
  }

  return collision;
}
