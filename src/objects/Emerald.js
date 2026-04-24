import Phaser from 'phaser';
import { CONFIG } from '../config/constants.js';

/**
 * Emerald — dropped by enemies, collected by the player.
 */
export class Emerald extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'emerald');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);
    this.body.setSize(12, 12);
    this.body.setOffset(10, 10);
    this.body.setImmovable(true);

    // Spawn pop effect
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scaleX: 1, scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Floating bob animation
    this.baseY = y;
    scene.tweens.add({
      targets: this,
      y: y - CONFIG.EMERALD_FLOAT_AMOUNT,
      duration: CONFIG.EMERALD_FLOAT_SPEED,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Sparkle alpha pulse
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.6 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect() {
    this.body.enable = false;

    // Collect animation: zoom up and fade
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5, scaleY: 1.5,
      alpha: 0,
      y: this.y - 20,
      duration: 250,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });

    // Sparkle particles
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0x44ee88, 0x22cc66, 0xaaffcc],
      emitting: false,
    });
    particles.explode(8);
    this.scene.time.delayedCall(500, () => particles.destroy());
  }
}
