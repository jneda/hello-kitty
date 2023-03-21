import * as PIXI from "pixi.js";
import "./style.css";

const app = new PIXI.Application({
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
