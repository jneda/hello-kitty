import * as PIXI from "pixi.js";
import "./style.css";

// aliases
const Application = PIXI.Application,
  Assets = PIXI.Assets,
  BaseTexture = PIXI.BaseTexture,
  Rectangle = PIXI.Rectangle,
  Sprite = PIXI.Sprite;

// create Pixi application

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

// load an spritesheet then make a sprite

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

const app = makeApp();
const spritesheet = await makeSpritesheet("images/explorer.json");

const dungeonSize = 16;
const tileSize = 32;

const wallTexture = spritesheet.textures["wall.png"];
const floorTexture = spritesheet.textures["floor.png"];

for (let i = 0; i < dungeonSize; i++) {
  for (let j = 0; j < dungeonSize; j++) {
    let texture;
    if (i === 0 || i === dungeonSize - 1 || j === 0 || j === dungeonSize - 1) {
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

const explorer = Sprite.from(spritesheet.textures["explorer.png"]);
explorer.anchor.set(0);
explorer.scale.set(2);
explorer.x = 68;
explorer.y = (dungeonSize * tileSize) / 2 - explorer.height / 2;
app.stage.addChild(explorer);
