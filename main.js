import * as PIXI from "pixi.js";
import "./style.css";

// aliases
const Application = PIXI.Application,
  Assets = PIXI.Assets,
  Sprite = PIXI.Sprite;

// create Pixi application

const app = new Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: true,
  resolution: 1,
  hello: true,
  autoDensity: true,
});

// make canvas fill window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
// app.renderer.autoDensity = true;
app.resizeTo = window;

document.querySelector("#app").appendChild(app.view);

// load an image then make a sprite

async function makeSprite(imageFile) {
  const texture = await Assets.load(imageFile, (progress) =>
    console.log(
      `Loading progress for ${imageFile}: ${progress * 100}% complete...`
    )
  );
  console.log(`Image file ${imageFile} loaded as Texture:`);
  console.log(texture);

  const sprite = Sprite.from(texture);
  app.stage.addChild(sprite);

  sprite.position.set(96);
  sprite.pivot.set(0.5);
  sprite.rotation = 0.5;
}

makeSprite("images/cat.png");
