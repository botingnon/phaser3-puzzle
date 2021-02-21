import Phaser from "phaser";

import { Game } from "../const/SceneKeys";

export default class Preload extends Phaser.Scene {
  preload() {
    this.load.spritesheet("tiles", "assets/sokoban_tilesheet.png", {
      frameWidth: 64,
      startFrame: 0,
    });
  }

  create() {
    this.scene.start(Game);
  }
}
