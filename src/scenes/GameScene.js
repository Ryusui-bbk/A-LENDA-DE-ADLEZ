import Phaser from 'phaser';
import { CONFIG } from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Emerald } from '../objects/Emerald.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Build the procedural map
    this._buildMap();

    // Spawn player at center of map
    const cx = (CONFIG.MAP_COLS * CONFIG.TILE_SIZE) / 2;
    const cy = (CONFIG.MAP_ROWS * CONFIG.TILE_SIZE) / 2;
    this.player = new Player(this, cx, cy);

    // Camera setup
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, CONFIG.MAP_COLS * CONFIG.TILE_SIZE, CONFIG.MAP_ROWS * CONFIG.TILE_SIZE);

    // Player ↔ obstacle collisions
    this.physics.add.collider(this.player, this.obstacleGroup);

    // Give player brief invulnerability at start
    this.player.invulnerable = true;
    this.time.delayedCall(1500, () => {
      if (this.player) this.player.invulnerable = false;
    });

    // Enemies
    this.enemies = this.physics.add.group();
    this._spawnEnemies();

    // Enemy ↔ obstacle collisions
    this.physics.add.collider(this.enemies, this.obstacleGroup);
    // Enemy ↔ enemy collisions
    this.physics.add.collider(this.enemies, this.enemies);

    // Player ↔ enemy damage
    this.physics.add.overlap(this.player, this.enemies, this._onPlayerHitEnemy, null, this);

    // Sword ↔ enemy hit detection
    this.physics.add.overlap(this.player.swordHitbox, this.enemies, this._onSwordHitEnemy, null, this);

    // Emeralds group
    this.emeralds = this.physics.add.group();

    // Player ↔ emerald collection
    this.physics.add.overlap(this.player, this.emeralds, this._onCollectEmerald, null, this);

    // HUD
    this.hud = new HUD(this);
    this.hud.updateHealth(this.player.hp);

    // World bounds
    this.physics.world.setBounds(0, 0, CONFIG.MAP_COLS * CONFIG.TILE_SIZE, CONFIG.MAP_ROWS * CONFIG.TILE_SIZE);
    this.player.setCollideWorldBounds(true);
  }

  update(time, delta) {
    if (this.player) this.player.update();

    // Update each enemy with reference to player
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update(time, delta, this.player);
    });
  }

  /* ═══════ MAP GENERATION ═══════ */
  _buildMap() {
    const cols = CONFIG.MAP_COLS;
    const rows = CONFIG.MAP_ROWS;
    const ts = CONFIG.TILE_SIZE;

    // Ground layer: draw tiled ground using images
    this.groundGroup = this.add.group();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * ts + ts / 2;
        const y = r * ts + ts / 2;
        const isRoad = this._isRoad(c, r, cols, rows);
        let texKey;
        if (isRoad) {
          texKey = 'tile-road';
        } else {
          texKey = ((c + r) % 7 === 0) ? 'tile-grass2' : 'tile-grass';
        }
        this.add.image(x, y, texKey).setDepth(0);
      }
    }

    // Decorations (flowers)
    for (let i = 0; i < 60; i++) {
      const c = Phaser.Math.Between(1, cols - 2);
      const r = Phaser.Math.Between(1, rows - 2);
      if (!this._isRoad(c, r, cols, rows) && !this._isObstacleZone(c, r, cols, rows)) {
        this.add.image(c * ts + ts / 2, r * ts + ts / 2, 'tile-flowers').setDepth(0).setAlpha(0.8);
      }
    }

    // Obstacles (trees and rocks)
    this.obstacleGroup = this.physics.add.staticGroup();
    this._placeObstacles(cols, rows, ts);
  }

  _isRoad(c, r, cols, rows) {
    const midRow = Math.floor(rows / 2);
    const midCol = Math.floor(cols / 2);
    // Horizontal road
    if (r >= midRow - 1 && r <= midRow + 1) return true;
    // Vertical road
    if (c >= midCol - 1 && c <= midCol + 1) return true;
    return false;
  }

  _isObstacleZone(c, r, cols, rows) {
    // Don't place near center spawn
    const midR = Math.floor(rows / 2);
    const midC = Math.floor(cols / 2);
    if (Math.abs(c - midC) < 5 && Math.abs(r - midR) < 5) return true;
    return false;
  }

  _placeObstacles(cols, rows, ts) {
    // Trees around the edges and scattered
    const treePositions = [];

    // Border trees (every 2-3 tiles)
    for (let c = 0; c < cols; c += Phaser.Math.Between(2, 3)) {
      if (!this._isRoad(c, 0, cols, rows)) treePositions.push([c, 0]);
      if (!this._isRoad(c, 1, cols, rows)) treePositions.push([c, 1]);
      if (!this._isRoad(c, rows - 1, cols, rows)) treePositions.push([c, rows - 1]);
      if (!this._isRoad(c, rows - 2, cols, rows)) treePositions.push([c, rows - 2]);
    }
    for (let r = 0; r < rows; r += Phaser.Math.Between(2, 3)) {
      if (!this._isRoad(0, r, cols, rows)) treePositions.push([0, r]);
      if (!this._isRoad(1, r, cols, rows)) treePositions.push([1, r]);
      if (!this._isRoad(cols - 1, r, cols, rows)) treePositions.push([cols - 1, r]);
      if (!this._isRoad(cols - 2, r, cols, rows)) treePositions.push([cols - 2, r]);
    }

    // Scattered trees inside
    for (let i = 0; i < 35; i++) {
      const c = Phaser.Math.Between(3, cols - 4);
      const r = Phaser.Math.Between(3, rows - 4);
      if (!this._isRoad(c, r, cols, rows) && !this._isObstacleZone(c, r, cols, rows)) {
        treePositions.push([c, r]);
      }
    }

    treePositions.forEach(([c, r]) => {
      const tree = this.obstacleGroup.create(c * ts + ts / 2, r * ts + ts / 2, 'tile-tree');
      tree.setDepth(8);
      tree.body.setSize(16, 12);
      tree.body.setOffset(8, 18);
      tree.refreshBody();
    });

    // Scattered rocks
    for (let i = 0; i < 18; i++) {
      const c = Phaser.Math.Between(3, cols - 4);
      const r = Phaser.Math.Between(3, rows - 4);
      if (!this._isRoad(c, r, cols, rows) && !this._isObstacleZone(c, r, cols, rows)) {
        const rock = this.obstacleGroup.create(c * ts + ts / 2, r * ts + ts / 2, 'tile-rock');
        rock.setDepth(2);
        rock.body.setSize(20, 12);
        rock.body.setOffset(6, 10);
        rock.refreshBody();
      }
    }
  }

  /* ═══════ ENEMY SPAWNING ═══════ */
  _spawnEnemies() {
    const cols = CONFIG.MAP_COLS;
    const rows = CONFIG.MAP_ROWS;
    const ts = CONFIG.TILE_SIZE;
    const midC = Math.floor(cols / 2);
    const midR = Math.floor(rows / 2);

    for (let i = 0; i < CONFIG.ENEMY_COUNT; i++) {
      let c, r, attempts = 0;
      // Ensure enemies spawn away from center and not on roads
      do {
        c = Phaser.Math.Between(4, cols - 5);
        r = Phaser.Math.Between(4, rows - 5);
        attempts++;
      } while (
        attempts < 100 &&
        (this._isRoad(c, r, cols, rows) ||
        (Math.abs(c - midC) < 8 && Math.abs(r - midR) < 8))
      );

      const enemy = new Enemy(this, c * ts + ts / 2, r * ts + ts / 2);
      this.enemies.add(enemy);
      enemy.setCollideWorldBounds(true);
    }
  }

  /* ═══════ COLLISION CALLBACKS ═══════ */
  _onPlayerHitEnemy(player, enemy) {
    if (enemy.isDead || player.isDead || player.invulnerable) return;
    player.takeDamage(CONFIG.ENEMY_DAMAGE, enemy);
  }

  _onSwordHitEnemy(swordHitbox, enemy) {
    if (enemy.isDead || !this.player.isAttacking) return;
    // Prevent hitting same enemy multiple times per swing
    if (enemy._lastHitTime && this.time.now - enemy._lastHitTime < CONFIG.ATTACK_COOLDOWN) return;
    enemy._lastHitTime = this.time.now;
    enemy.takeDamage(CONFIG.ATTACK_DAMAGE, this.player);
  }

  _onCollectEmerald(player, emerald) {
    if (player.isDead) return;
    emerald.collect();
    player.collectEmerald();
  }

  /* ═══════ EMERALD SPAWNING (called by Enemy on death) ═══════ */
  spawnEmerald(x, y) {
    const emerald = new Emerald(this, x, y);
    this.emeralds.add(emerald);
  }
}
