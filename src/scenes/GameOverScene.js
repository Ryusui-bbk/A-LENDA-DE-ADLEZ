import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.emeralds || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dark red background
    const g = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Math.floor(30 + t * 20);
      const gr = Math.floor(5 + t * 8);
      const b = Math.floor(5 + t * 8);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, y, width, 1);
    }

    // GAME OVER text
    const gameOver = this.add.text(width / 2, height * 0.3, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '36px',
      color: '#cc2233',
      stroke: '#440011',
      strokeThickness: 5,
      shadow: { offsetX: 3, offsetY: 3, color: '#220000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.48, 'Esmeraldas coletadas', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#88aa88',
    }).setOrigin(0.5);

    const scoreText = this.add.text(width / 2, height * 0.56, `💎 ${this.finalScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#44ee88',
      stroke: '#0a4422',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Pulse score
    this.tweens.add({
      targets: scoreText, scaleX: 1.1, scaleY: 1.1,
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Restart button
    const btnBg = this.add.rectangle(width / 2, height * 0.73, 220, 48, 0x882222, 1)
      .setStrokeStyle(3, 0xcc4444)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height * 0.73, '↻  RESTART', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => { btnBg.setFillStyle(0xaa3333); btnText.setScale(1.08); });
    btnBg.on('pointerout', () => { btnBg.setFillStyle(0x882222); btnText.setScale(1); });
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });

    // Menu button
    const menuBg = this.add.rectangle(width / 2, height * 0.85, 180, 36, 0x333333, 1)
      .setStrokeStyle(2, 0x666666)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.85, 'MENU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0x444444));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x333333));
    menuBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    });

    // Fade in
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Flicker game over text
    this.tweens.add({
      targets: gameOver, alpha: { from: 1, to: 0.5 },
      duration: 1000, yoyo: true, repeat: -1,
    });
  }
}
