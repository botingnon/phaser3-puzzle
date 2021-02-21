import Phaser from "phaser";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      sokoban(x: number, y: number, texture: string, frame?: string | number);
    }
  }
}

export default class Sokoban extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    this.anims.play("down-idle");
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const speed = 200;

    if (cursors.left.isDown) {
      this.setVelocity(-speed, 0);
      this.anims.play("left-walk", true);
    } else if (cursors.right.isDown) {
      this.setVelocity(speed, 0);
      this.anims.play("right-walk", true);
    } else if (cursors.up.isDown) {
      this.setVelocity(0, -speed);
      this.anims.play("up-walk", true);
    } else if (cursors.down.isDown) {
      this.setVelocity(0, speed);
      this.anims.play("down-walk", true);
    } else {
      this.setVelocity(0, 0);

      const parts = this.anims.currentAnim.key?.split("-");
      this.anims.play(`${parts[0]}-idle`, true);
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "sokoban",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const sprite = new Sokoban(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    return sprite;
  }
);
