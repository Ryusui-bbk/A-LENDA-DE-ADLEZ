import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.cameras.main;

    // Animated background
    this._drawBackground(width, height);

    // Floating particles
    this._createParticles(width, height);

    // Title
    const title = this.add.text(width / 2, height * 0.28, 'EMERALD\nQUEST', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '42px',
      color: '#44ee88',
      align: 'center',
      lineSpacing: 16,
      stroke: '#0a4422',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#0a2211', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Title glow pulse
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, height * 0.52, 'Uma aventura pixel art', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#88ccaa',
      align: 'center',
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.rectangle(width / 2, height * 0.68, 200, 48, 0x22aa55, 1)
      .setStrokeStyle(3, 0x44ee88)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height * 0.68, '▶  START', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Button hover
    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x33cc66);
      btnText.setScale(1.08);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x22aa55);
      btnText.setScale(1);
    });
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('GameScene'));
    });

    // Button pulse
    this.tweens.add({
      targets: btnBg,
      scaleX: { from: 1, to: 1.04 },
      scaleY: { from: 1, to: 1.04 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Controls info
    this.add.text(width / 2, height * 0.85, 'WASD / Setas = Mover  |  Espaço = Atacar', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#5a8a6a',
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }

  _drawBackground(w, h) {
    const g = this.add.graphics();
    // Dark gradient background
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const r = Math.floor(8 + t * 15);
      const gr = Math.floor(20 + t * 30);
      const b = Math.floor(12 + t * 20);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, y, w, 1);
    }
    // Ground-like section at bottom
    g.fillStyle(0x1a3a1a);
    g.fillRect(0, h * 0.92, w, h * 0.08);
  }

  _createParticles(w, h) {
    // Floating emerald-colored dots
    for (let i = 0; i < 20; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 3),
        0x44ee88,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.tweens.add({
        targets: dot,
        y: dot.y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          dot.x = Phaser.Math.Between(0, w);
          dot.y = Phaser.Math.Between(h * 0.3, h);
          dot.alpha = Phaser.Math.FloatBetween(0.1, 0.4);
        },
      });
    }
  }
}
