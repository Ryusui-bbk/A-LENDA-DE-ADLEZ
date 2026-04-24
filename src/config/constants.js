/** Game-wide constants for easy tuning */
export const CONFIG = {
  // Display
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  TILE_SIZE: 32,
  MAP_COLS: 50,
  MAP_ROWS: 40,

  // Player
  PLAYER_SPEED: 160,
  PLAYER_MAX_HP: 6,          // 3 hearts × 2 HP each
  PLAYER_INVULN_MS: 1000,    // invulnerability after hit
  ATTACK_DURATION: 200,      // sword swing ms
  ATTACK_COOLDOWN: 400,      // ms between attacks
  ATTACK_DAMAGE: 2,
  SWORD_RANGE: 28,           // pixels in front of player
  SWORD_WIDTH: 26,
  SWORD_HEIGHT: 14,

  // Enemy
  ENEMY_SPEED: 70,
  ENEMY_HP: 4,
  ENEMY_DAMAGE: 2,           // 1 heart of damage
  CHASE_RADIUS: 150,
  WANDER_INTERVAL: 2500,     // ms between wander direction changes
  KNOCKBACK_FORCE: 200,
  KNOCKBACK_DURATION: 150,
  ENEMY_COUNT: 10,
  RESPAWN_DELAY: 8000,       // ms before respawn

  // Emerald
  EMERALD_FLOAT_SPEED: 1500,
  EMERALD_FLOAT_AMOUNT: 4,
};
