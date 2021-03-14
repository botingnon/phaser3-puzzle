import Phaser from "phaser";

import { Game } from "../const/SceneKeys";
import WebFontFile from "../fonts/WebFontFile";

export default class Preload extends Phaser.Scene {
  preload() {
    this.load.spritesheet("tiles", "assets/sokoban_tilesheet.png", {
      frameWidth: 64,
      startFrame: 0,
    });

    const fonts = new WebFontFile(this.load, ["Poppins", "Righteous"]);

    this.load.addFile(fonts);

    this.load.audio("game-music", "assets/music/CaveLoop.wav");
    this.load.audio("confirmation", "assets/sfx/confirmation_001.wav");
    this.load.audio("move", "assets/sfx/maximize_008.wav");
    this.load.audio("error", "assets/sfx/error_006.wav");
    this.load.audio("click", "assets/sfx/click2.wav");
  }

  create() {
    const music = this.sound.add("game-music", {
      loop: true,
      volume: 0.05,
    });

    if (!this.sound.locked) {
      music.play();
    } else {
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        music.play();
      });
    }

    this.scene.start(Game, { level: 1 });
  }
}
