import Phaser from "phaser";

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "idle-down",
    frames: [{ key: "tiles", frame: 52 }],
  });

  anims.create({
    key: "idle-left",
    frames: [{ key: "tiles", frame: 81 }],
  });

  anims.create({
    key: "idle-right",
    frames: [{ key: "tiles", frame: 78 }],
  });

  anims.create({
    key: "idle-up",
    frames: [{ key: "tiles", frame: 55 }],
  });

  anims.create({
    key: "left",
    frames: anims.generateFrameNumbers("tiles", { start: 81, end: 83 }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: "right",
    frames: anims.generateFrameNumbers("tiles", { start: 78, end: 80 }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: "up",
    frames: anims.generateFrameNumbers("tiles", { start: 55, end: 57 }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: "down",
    frames: anims.generateFrameNumbers("tiles", { start: 52, end: 54 }),
    frameRate: 10,
    repeat: -1,
  });
};

export { createCharacterAnims };
