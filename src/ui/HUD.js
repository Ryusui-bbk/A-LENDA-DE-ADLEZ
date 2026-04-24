import Phaser from 'phaser';
import { CONFIG } from '../config/constants.js';

export class HUD extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(100);

    this.hearts = [];
    this.emeraldCount = 0;

    this._createHearts();
    this._createEmeraldCounter();
  }

  _createHearts() {
    const maxHearts = CONFIG.PLAYER_MAX_HP / 2;
    for (let i = 0; i < maxHearts; i++) {
      const heart = this.scene.add.image(24 + i * 28, 24, 'heart-full')
        .setScrollFactor(0).setDepth(100).setScale(1.2);
      this.hearts.push(heart);
    }
  }

  _createEmeraldCounter() {
    this.emeraldIcon = this.scene.add.image(24, 56, 'emerald-icon')
      .setScrollFactor(0).setDepth(100).setScale(0.7);

    this.emeraldText = this.scene.add.text(46, 48, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#44ee88',
      stroke: '#0a3322',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);
  }

  updateHealth(hp) {
    const maxHearts = CONFIG.PLAYER_MAX_HP / 2;
    for (let i = 0; i < maxHearts; i++) {
      const heartHP = (i + 1) * 2;
      if (hp >= heartHP) {
        this.hearts[i].setTexture('heart-full');
      } else {
        this.hearts[i].setTexture('heart-empty');
      }
    }
  }

  updateEmeralds(count) {
    this.emeraldCount = count;
    this.emeraldText.setText(String(count));

    // Pop animation
    this.scene.tweens.add({
      targets: this.emeraldText,
      scaleX: 1.4, scaleY: 1.4,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: this.emeraldIcon,
      scaleX: 1, scaleY: 1,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }
}
