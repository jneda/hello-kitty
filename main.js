import * as PIXI from "pixi.js";
import "./style.css";

// aliases
const Application = PIXI.Application,
  Assets = PIXI.Assets,
  BaseTexture = PIXI.BaseTexture,
  Sprite = PIXI.Sprite;

// create PIXI application
// laod spritesheet

const app = makeApp();
const spritesheet = await makeSpritesheet("images/explorer.json");

// display the game area

const dungeonSize = 16;
const tileSize = 32;

drawDungeon();

// display entities

const [explorer] = makeEntities();

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
  explorer.x += explorer.vx * delta;
  explorer.y += explorer.vy * delta;
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
      app.stage.addChild(sprite);
    }
  }
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
    xOffset = 150;

  for (let i = 0; i < numberOfBlobs; i++) {
    const blob = putSprite("blob.png", {
      x: spacing * i + xOffset,
      y: randomInt(tileSize, dungeonSize * tileSize - 2 * tileSize),
    });
  }

  return [explorer];
}

function putSprite(textureId, position) {
  const sprite = Sprite.from(spritesheet.textures[textureId]);
  sprite.anchor.set(0);
  sprite.scale.set(2);
  sprite.x = position.x;
  sprite.y = position.y;
  app.stage.addChild(sprite);
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
