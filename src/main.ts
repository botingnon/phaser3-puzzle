import Phaser from "phaser";

import Preload from "./scenes/Preload";
import Game from "./scenes/Game";
import LevelFinishedScene from "./scenes/LevelFinishedScene";

import * as SceneKeys from "./const/SceneKeys";

const config = {
  type: Phaser.AUTO,
  parent: "phaser",
  dom: {
    createContainer: true,
  },
  width: 640,
  height: 512,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);

game.scene.add(SceneKeys.Preload, Preload);
game.scene.add(SceneKeys.Game, Game);
game.scene.add(SceneKeys.LevelFinishedScene, LevelFinishedScene);

game.scene.start(SceneKeys.Preload);

export default game;
