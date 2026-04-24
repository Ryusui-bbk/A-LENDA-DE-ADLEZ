import Phaser from 'phaser';
import { CONFIG } from '../config/constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero-down-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(16, 16);
    this.body.setOffset(8, 14);

    this.hp = CONFIG.PLAYER_MAX_HP;
    this.direction = 'down';
    this.isAttacking = false;
    this.attackCooldown = false;
    this.invulnerable = false;
    this.isDead = false;
    this.emeralds = 0;

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Sword hitbox (invisible physics body)
    this.swordHitbox = scene.add.rectangle(0, 0, CONFIG.SWORD_WIDTH, CONFIG.SWORD_HEIGHT, 0xffffff, 0);
    scene.physics.add.existing(this.swordHitbox, false);
    this.swordHitbox.body.enable = false;
    this.swordHitbox.setDepth(11);

    // Sword visual — uses directional textures
    this.swordSprite = scene.add.image(0, 0, 'sword-down').setVisible(false).setDepth(11);

    // Mouse attack
    scene.input.on('pointerdown', () => this.attack());
  }

  update() {
    if (this.isDead) return;
    if (this.isAttacking) return;

    const speed = CONFIG.PLAYER_SPEED;
    let vx = 0, vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx = -1;
    else if (right) vx = 1;
    if (up) vy = -1;
    else if (down) vy = 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const norm = Math.SQRT1_2;
      vx *= norm;
      vy *= norm;
    }

    this.setVelocity(vx * speed, vy * speed);

    // Direction
    if (vx < 0) this.direction = 'left';
    else if (vx > 0) this.direction = 'right';
    else if (vy < 0) this.direction = 'up';
    else if (vy > 0) this.direction = 'down';

    // Animation
    if (vx !== 0 || vy !== 0) {
      this.play(`hero-walk-${this.direction}`, true);
    } else {
      this.play(`hero-idle-${this.direction}`, true);
    }

    // Attack input
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.attack();
    }
  }

  attack() {
    if (this.isAttacking || this.attackCooldown || this.isDead) return;
    this.isAttacking = true;
    this.attackCooldown = true;
    this.setVelocity(0, 0);

    const range = CONFIG.SWORD_RANGE;

    // Sword placement per direction (offset from player + arc swing)
    const swingCfg = {
      down:  { sx: -8, sy: 12, ex: 8,  ey: 12, tex: 'sword-down' },
      up:    { sx: 8,  sy:-12, ex:-8,  ey:-12, tex: 'sword-up' },
      left:  { sx: -12,sy:-8,  ex:-12, ey: 8,  tex: 'sword-left' },
      right: { sx: 12, sy: 8,  ex: 12, ey:-8,  tex: 'sword-right' },
    };
    const sw = swingCfg[this.direction];

    // Enable hitbox in front of player
    const hbOffsets = {
      down:  { x: 0, y: range },
      up:    { x: 0, y: -range },
      left:  { x: -range, y: 0 },
      right: { x: range, y: 0 },
    };
    const hb = hbOffsets[this.direction];
    this.swordHitbox.setPosition(this.x + hb.x, this.y + hb.y);
    this.swordHitbox.body.enable = true;

    // Show sword with correct directional texture
    this.swordSprite.setTexture(sw.tex);
    this.swordSprite.setPosition(this.x + sw.sx, this.y + sw.sy);
    this.swordSprite.setRotation(0);
    this.swordSprite.setVisible(true);
    this.swordSprite.setAlpha(1);

    // Slash arc swing (sword moves in an arc)
    this.scene.tweens.add({
      targets: this.swordSprite,
      x: this.x + sw.ex,
      y: this.y + sw.ey,
      duration: CONFIG.ATTACK_DURATION,
      ease: 'Power2',
    });

    // End attack
    this.scene.time.delayedCall(CONFIG.ATTACK_DURATION, () => {
      this.isAttacking = false;
      this.swordHitbox.body.enable = false;
      this.swordSprite.setVisible(false);
    });

    // Cooldown
    this.scene.time.delayedCall(CONFIG.ATTACK_COOLDOWN, () => {
      this.attackCooldown = false;
    });
  }

  takeDamage(amount, source) {
    if (this.invulnerable || this.isDead) return;
    this.hp -= amount;
    this.invulnerable = true;

    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);

    // Flash red
    this.setTintFill(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint());

    // Knockback from source
    if (source) {
      const angle = Phaser.Math.Angle.Between(source.x, source.y, this.x, this.y);
      this.setVelocity(
        Math.cos(angle) * CONFIG.KNOCKBACK_FORCE * 1.5,
        Math.sin(angle) * CONFIG.KNOCKBACK_FORCE * 1.5,
      );
      this.scene.time.delayedCall(150, () => this.setVelocity(0, 0));
    }

    // Blink effect
    this.scene.tweens.add({
      targets: this, alpha: 0.3,
      duration: 80, yoyo: true, repeat: 5,
      onComplete: () => { this.setAlpha(1); },
    });

    // End invulnerability
    this.scene.time.delayedCall(CONFIG.PLAYER_INVULN_MS, () => {
      this.invulnerable = false;
    });

    // Update HUD
    if (this.scene.hud) this.scene.hud.updateHealth(this.hp);

    // Death
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.setTintFill(0xff0000);

    this.scene.tweens.add({
      targets: this, alpha: 0, scaleX: 0.5, scaleY: 0.5, angle: 90,
      duration: 600, ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(800, () => {
          this.scene.scene.start('GameOverScene', { emeralds: this.emeralds });
        });
      },
    });
  }

  collectEmerald() {
    this.emeralds++;
    if (this.scene.hud) this.scene.hud.updateEmeralds(this.emeralds);
  }
}
