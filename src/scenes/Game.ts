import Phaser from "phaser";

import { createCharacterAnims } from "../anims/CharacterAnims";
import { LevelFinishedScene } from "../const/SceneKeys";

import * as Colors from "../const/Color";
import { boxColorToTargetColor } from "../utils/ColorUtils";
import { Direction } from "../const/Direction";
import { offsetForDirection } from "../utils/TileUtils";
import { baseTweenForDirection } from "../utils/TweenUtils";

import isAllTargetsCovered from "../targets/isAllTargetsCovered";

export default class Game extends Phaser.Scene {
  private cursors:
    | Phaser.Types.Input.Keyboard.CursorKeys
    | undefined = undefined;
  private player?: Phaser.GameObjects.Sprite;
  private boxesByColor: { [key: number]: Phaser.GameObjects.Sprite[] } = {};
  private layer?: Phaser.Tilemaps.TilemapLayer;
  private targetsCoveredByColor: { [key: number]: number } = {};
  private movesCount: number = 0;
  private movesCountLabel: Phaser.GameObjects.Text | undefined = undefined;
  private currentLevel: number = 1;

  init(d: { level: number } = { level: 1 }) {
    const data = Object.assign({ level: 1 }, d);

    this.movesCount = 0;
    this.currentLevel = data.level;

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.tilemapTiledJSON(
      "tilemap",
      `levels/level${this.currentLevel}.json`
    );

    this.load.spritesheet("tiles", "assets/sokoban_tilesheet.png", {
      frameWidth: 64,
      startFrame: 0,
    });
  }

  create() {
    createCharacterAnims(this.anims);

    const map = this.make.tilemap({ key: "tilemap" });

    const tiles = map.addTilesetImage("sokoban", "tiles");
    this.layer = map.createLayer("Level", tiles, 0, 0);

    this.player = this.layer
      .createFromTiles(53, 0, {
        key: "tiles",
        frame: 52,
      })
      .pop();

    this.player?.setOrigin(0);

    this.extractBoxes(this.layer);

    this.movesCountLabel = this.add.text(540, 10, `Moves: ${this.movesCount}`, {
      fontFamily: '"Poppins"',
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cache.tilemap.remove("tilemap");
    });
  }

  private changeTargetCoveredCountForColor(color: number, change: number) {
    if (!(color in this.targetsCoveredByColor)) {
      this.targetsCoveredByColor[color] = 0;
    }

    this.targetsCoveredByColor[color] += change;

    if (change) {
      this.sound.play("confirmation");
    }
  }

  private getBoxDataAt(x: number, y: number) {
    const keys = Object.keys(this.boxesByColor);
    for (let i = 0; i < keys.length; i++) {
      const color = keys[i];
      const box = this.boxesByColor[color].find((box) => {
        const rect = box.getBounds();
        return rect.contains(x, y);
      });

      if (!box) {
        continue;
      }

      return {
        box,
        color: parseInt(color),
      };
    }

    return undefined;
  }

  private hasWallAt(x: number, y: number) {
    if (!this.layer) {
      return false;
    }

    const tile = this.layer.getTileAtWorldXY(x, y);
    if (!tile) {
      return false;
    }

    return tile.index === 101;
  }

  private hasTargetAt(x: number, y: number, tileIndex: number) {
    if (!this.layer) {
      return false;
    }

    const tile = this.layer.getTileAtWorldXY(x, y);
    if (!tile) {
      return false;
    }

    return tile.index === tileIndex + 1;
  }

  private updatePlayer() {
    const justLeft = Phaser.Input.Keyboard.JustDown(this.cursors!.left);
    const justRight = Phaser.Input.Keyboard.JustDown(this.cursors!.right);
    const justUp = Phaser.Input.Keyboard.JustDown(this.cursors!.up);
    const justDown = Phaser.Input.Keyboard.JustDown(this.cursors!.down);

    if (justLeft) {
      this.tweensMove(Direction.Left, () => {
        this.player?.anims.play("left", true);
      });
    } else if (justRight) {
      this.tweensMove(Direction.Right, () => {
        this.player?.anims.play("right", true);
      });
    } else if (justUp) {
      this.tweensMove(Direction.Up, () => {
        this.player?.anims.play("up", true);
      });
    } else if (justDown) {
      this.tweensMove(Direction.Down, () => {
        this.player?.anims.play("down", true);
      });
    }
  }

  private extractBoxes(layer: Phaser.Tilemaps.TilemapLayer) {
    const boxColors = [
      Colors.BoxOrange,
      Colors.BoxRed,
      Colors.BoxBlue,
      Colors.BoxGreen,
      Colors.BoxGrey,
    ];

    boxColors.forEach((color) => {
      this.boxesByColor[color] = layer
        .createFromTiles(color + 1, 0, {
          key: "tiles",
          frame: color,
        })
        .map((box) => box.setOrigin(0));

      const targetColor = boxColorToTargetColor(color);
      this.targetsCoveredByColor[targetColor] = 0;
    });
  }

  private tweensMove(direction: Direction, onStart: Function) {
    if (!this.player || this.tweens.isTweening(this.player)) {
      return;
    }

    const x = this.player.x;
    const y = this.player.y;

    const offset = offsetForDirection(direction);
    const ox = x + offset.x;
    const oy = y + offset.y;

    const hasWall = this.hasWallAt(ox, oy);
    if (hasWall) {
      this.sound.play("error");
      return;
    }

    const baseTween = baseTweenForDirection(direction);

    const boxData = this.getBoxDataAt(ox, oy);
    if (boxData) {
      const nextOffset = offsetForDirection(direction, 2);
      const nx = x + nextOffset.x;
      const ny = y + nextOffset.y;
      const nextBoxData = this.getBoxDataAt(nx, ny);
      if (nextBoxData) {
        this.sound.play("error");
        return;
      }

      if (this.hasWallAt(nx, ny)) {
        this.sound.play("error");
        return;
      }

      const { box, color: boxColor } = boxData;
      const targetColor = boxColorToTargetColor(boxColor);
      const coveredtarget = this.hasTargetAt(box.x, box.y, targetColor);
      if (coveredtarget) {
        this.changeTargetCoveredCountForColor(targetColor, -1);
      }

      this.sound.play("move");

      this.tweens.add({
        ...baseTween,
        targets: box,
        onComplete: () => {
          const coveredtarget = this.hasTargetAt(box.x, box.y, targetColor);
          if (coveredtarget) {
            this.changeTargetCoveredCountForColor(targetColor, 1);
          }
        },
      });
    }

    this.tweens.add({
      ...baseTween,
      targets: this.player,
      onComplete: this.handlerPlayerStopped,
      onCompleteScope: this,
      onStart,
    });
  }

  private handlerPlayerStopped() {
    this.updateMovesCount();
    this.stopPlayerAnimation();

    const LevelFinished = isAllTargetsCovered(
      this.targetsCoveredByColor,
      this.boxesByColor
    );

    if (LevelFinished) {
      this.scene.start(LevelFinishedScene, {
        moves: this.movesCount,
        currentLevel: this.currentLevel,
      });
    }
  }

  private updateMovesCount() {
    if (!this.movesCountLabel) {
      return;
    }

    this.movesCount++;
    this.movesCountLabel.setText(`Moves: ${this.movesCount}`);
  }

  private stopPlayerAnimation() {
    const key = this.player?.anims.currentAnim?.key;
    if (!key?.startsWith("idle-")) {
      this.player?.anims.play(`idle-${key}`, true);
    }
  }

  update() {
    if (!this.cursors || !this.player) {
      return;
    }

    this.updatePlayer();
  }
}
