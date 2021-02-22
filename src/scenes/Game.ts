import Phaser from "phaser";

import { createCharacterAnims } from "../anims/CharacterAnims";

import * as Colors from "../const/Color";
import {
  boxColorToTargetColor,
  targetColorToBoxColor,
} from "../utils/ColorUtils";
import { Direction } from "../const/Direction";
import { offsetForDirection } from "../utils/TileUtils";

export default class Game extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Phaser.GameObjects.Sprite;
  private boxesByColor: { [key: number]: Phaser.GameObjects.Sprite[] } = {};
  private layer?: Phaser.Tilemaps.TilemapLayer;
  private targetsCoveredByColor: { [key: number]: number } = {};

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    createCharacterAnims(this.anims);

    const level = [
      [0, 0, 100, 100, 100, 0, 0, 0, 0, 0],
      [0, 0, 100, 64, 100, 0, 0, 0, 0, 0],
      [0, 0, 100, 0, 100, 100, 100, 100, 0, 0],
      [100, 100, 100, 9, 0, 9, 64, 100, 0, 0],
      [100, 64, 0, 9, 52, 100, 100, 100, 0, 0],
      [100, 100, 100, 100, 9, 100, 0, 0, 0, 0],
      [0, 0, 0, 100, 64, 100, 0, 0, 0, 0],
      [0, 0, 0, 100, 100, 100, 0, 0, 0, 0],
    ];

    const map = this.make.tilemap({
      data: level,
      tileWidth: 64,
      tileHeight: 64,
    });

    const tiles = map.addTilesetImage("tiles");
    this.layer = map.createLayer(0, tiles, 0, 0);

    this.player = this.layer
      .createFromTiles(52, 0, {
        key: "tiles",
        frame: 52,
      })
      .pop();

    this.player.setOrigin(0);

    this.extractBoxes(this.layer);
  }

  private changeTargetCoveredCountForColor(color: number, change: number) {
    if (!(color in this.targetsCoveredByColor)) {
      this.targetsCoveredByColor[color] = 0;
    }

    this.targetsCoveredByColor[color] += change;

    console.log(this.targetsCoveredByColor);
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

    return tile.index === 100;
  }

  private hasTargetAt(x: number, y: number, tileIndex: number) {
    if (!this.layer) {
      return false;
    }

    const tile = this.layer.getTileAtWorldXY(x, y);
    if (!tile) {
      return false;
    }

    return tile.index === tileIndex;
  }

  private updatePlayer() {
    const justLeft = Phaser.Input.Keyboard.JustDown(this.cursors.left);
    const justRight = Phaser.Input.Keyboard.JustDown(this.cursors.right);
    const justUp = Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const justDown = Phaser.Input.Keyboard.JustDown(this.cursors.down);

    if (justLeft) {
      const baseTweens = {
        x: "-=64",
        duration: 500,
      };

      this.tweensMove(Direction.Left, baseTweens, () => {
        this.player.anims.play("left", true);
      });
    } else if (justRight) {
      const baseTweens = {
        x: "+=64",
        duration: 500,
      };

      this.tweensMove(Direction.Right, baseTweens, () => {
        this.player.anims.play("right", true);
      });
    } else if (justUp) {
      const baseTweens = {
        y: "-=64",
        duration: 500,
      };

      this.tweensMove(Direction.Up, baseTweens, () => {
        this.player.anims.play("up", true);
      });
    } else if (justDown) {
      const baseTweens = {
        y: "+=64",
        duration: 500,
      };

      this.tweensMove(Direction.Down, baseTweens, () => {
        this.player.anims.play("down", true);
      });
    } else {
      // this.player.setVelocity(0, 0);
      // const parts = this.player.anims.currentAnim.key?.split("-");
      // this.player.anims.play(`${parts[0]}-idle`, true);
    }
  }

  private allTargetsCovered() {
    const targetColors = Object.keys(this.targetsCoveredByColor);
    for (let i = 0; i < targetColors.length; i++) {
      const targetColor = parseInt(targetColors[i]);
      const boxColor = targetColorToBoxColor(targetColor);
      if (!(boxColor in this.boxesByColor)) {
        continue;
      }

      const numBoxes = this.boxesByColor[boxColor].length;
      const numCovered = this.targetsCoveredByColor[targetColor];

      if (numCovered < numBoxes) {
        return false;
      }
    }

    return true;
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
        .createFromTiles(color, 0, {
          key: "tiles",
          frame: color,
        })
        .map((box) => box.setOrigin(0));

      const targetColor = boxColorToTargetColor(color);
      this.targetsCoveredByColor[targetColor] = 0;
    });
  }

  private tweensMove(direction: Direction, baseTweens: any, onStart: Function) {
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
      return;
    }

    const boxData = this.getBoxDataAt(ox, oy);
    if (boxData) {
      const nextOffset = offsetForDirection(direction, 2);
      const nx = x + nextOffset.x;
      const ny = y + nextOffset.y;
      const nextBoxData = this.getBoxDataAt(nx, ny);
      if (nextBoxData) {
        return;
      }

      if (this.hasWallAt(nx, ny)) {
        return;
      }

      const { box, color: boxColor } = boxData;
      const targetColor = boxColorToTargetColor(boxColor);
      const coveredtarget = this.hasTargetAt(box.x, box.y, targetColor);
      if (coveredtarget) {
        this.changeTargetCoveredCountForColor(targetColor, -1);
      }

      this.tweens.add({
        ...baseTweens,
        targets: box,
        onComplete: () => {
          const coveredtarget = this.hasTargetAt(box.x, box.y, targetColor);
          if (coveredtarget) {
            this.changeTargetCoveredCountForColor(targetColor, 1);
          }

          console.dir(this.allTargetsCovered());
        },
      });
    }

    this.tweens.add({
      ...baseTweens,
      targets: this.player,
      onComplete: this.stopPlayerAnimation,
      onCompleteScope: this,
      onStart: onStart,
    });
  }

  private stopPlayerAnimation() {
    const key = this.player?.anims.currentAnim?.key;
    if (!key.startsWith("idle-")) {
      this.player.anims.play(`idle-${key}`, true);
    }
  }

  update() {
    if (!this.cursors || !this.player) {
      return;
    }

    this.updatePlayer();
  }
}
