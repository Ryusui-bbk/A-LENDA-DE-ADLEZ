import Phaser from 'phaser';

/**
 * BootScene — generates all pixel-art textures programmatically and sets up animations.
 * No external image files needed!
 */
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this.generateTileset();
    this.generateHero();
    this.generateOrc();
    this.generateEmerald();
    this.generateUI();
    this.generateSwordSlash();
    this.generateParticle();
    this.createAnimations();
    this.scene.start('MenuScene');
  }

  /* ── Helper: draw a 16×16 pixel grid scaled 2× onto a 32×32 canvas ── */
  _tex(key, pixelRows, scale = 2) {
    const h = pixelRows.length;
    const w = pixelRows[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const color = pixelRows[r][c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }
    this.textures.addImage(key, canvas);
  }

  /* ── Helper: parse a compact string map into color arrays ── */
  _parse(lines, palette) {
    return lines.map(row =>
      row.split('').map(ch => palette[ch] || null)
    );
  }

  /* ═══════ TILESET ═══════ */
  generateTileset() {
    const grass1 = [
      '#4a7c2e','#4a7c2e','#5a9a3a','#4a7c2e',  '#4a7c2e','#5a9a3a','#4a7c2e','#4a7c2e',
      '#5a9a3a','#4a7c2e','#4a7c2e','#5a9a3a',  '#4a7c2e','#4a7c2e','#5a9a3a','#4a7c2e',
    ];
    // Grass tile
    this._drawSolidTile('tile-grass', '#4a7c2e', (ctx, s) => {
      ctx.fillStyle = '#5a9a3a';
      ctx.fillRect(2*s,0,s,s); ctx.fillRect(6*s,3*s,s,s);
      ctx.fillRect(10*s,1*s,s,s); ctx.fillRect(14*s,7*s,s,s);
      ctx.fillRect(4*s,10*s,s,s); ctx.fillRect(12*s,13*s,s,s);
      ctx.fillRect(1*s,14*s,s,s); ctx.fillRect(8*s,6*s,s,s);
    });
    // Grass variant
    this._drawSolidTile('tile-grass2', '#3f7228', (ctx, s) => {
      ctx.fillStyle = '#5a9a3a';
      ctx.fillRect(5*s,2*s,s,s); ctx.fillRect(11*s,5*s,s,s);
      ctx.fillRect(3*s,12*s,s,s); ctx.fillRect(9*s,9*s,s,s);
      ctx.fillStyle = '#6aaa4a';
      ctx.fillRect(7*s,14*s,s,s); ctx.fillRect(13*s,1*s,s,s);
    });
    // Dirt road
    this._drawSolidTile('tile-road', '#b8945a', (ctx, s) => {
      ctx.fillStyle = '#a8844a';
      ctx.fillRect(3*s,2*s,s,s); ctx.fillRect(9*s,7*s,s,s);
      ctx.fillRect(1*s,11*s,s,s); ctx.fillRect(13*s,4*s,s,s);
      ctx.fillStyle = '#c8a46a';
      ctx.fillRect(7*s,1*s,s,s); ctx.fillRect(5*s,13*s,s,s);
      ctx.fillRect(11*s,10*s,s,s);
    });
    // Tree
    this._generateTree();
    // Rock
    this._generateRock();
    // Flowers
    this._drawSolidTile('tile-flowers', '#4a7c2e', (ctx, s) => {
      ctx.fillStyle = '#ff6688'; ctx.fillRect(4*s,4*s,s,s); ctx.fillRect(10*s,3*s,s,s);
      ctx.fillStyle = '#ffee44'; ctx.fillRect(7*s,8*s,s,s); ctx.fillRect(2*s,11*s,s,s);
      ctx.fillStyle = '#ff88aa'; ctx.fillRect(12*s,12*s,s,s); ctx.fillRect(6*s,14*s,s,s);
      ctx.fillStyle = '#5a9a3a';
      ctx.fillRect(3*s,5*s,s,s); ctx.fillRect(9*s,10*s,s,s);
    });
  }

  _drawSolidTile(key, baseColor, detailsFn) {
    const s = 2, size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * s;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size * s, size * s);
    if (detailsFn) detailsFn(ctx, s);
    this.textures.addImage(key, canvas);
  }

  _generateTree() {
    const P = {
      '.': null, 'T': '#2d5a1e', 't': '#3a7a28', 'L': '#1e4a14',
      'W': '#6b4226', 'w': '#7b5236', 'G': '#4a7c2e',
    };
    const data = this._parse([
      '......tttt......',
      '....ttTTTTtt....',
      '...tTTLTTLTTt...',
      '..tTTTTTTTTTTt..',
      '..tTLTTTTTTLTt..',
      '.tTTTTTTTTTTTTt.',
      '.tTTTTTLTTTTTTt.',
      '..tTTTTTTTTTTt..',
      '..ttTTTTTTTTtt..',
      '...ttTTTTTTt....',
      '.....tWWWt......',
      '......WwW.......',
      '......WwW.......',
      '......WwW.......',
      '.....GWWWG......',
      '....GG..GG......',
    ], P);
    this._tex('tile-tree', data);
  }

  _generateRock() {
    const P = {
      '.': null, 'R': '#888888', 'r': '#aaaaaa', 'D': '#666666', 'G': '#4a7c2e',
    };
    const data = this._parse([
      '................',
      '......RRRR......',
      '....RRrrrRRR....',
      '...RrrrrrrrrR...',
      '..RRrrrrrrrRRR..',
      '..RrrrrrrrrrrR..',
      '.RRrrrDrrrrrrRR.',
      '.RrrrrDDrrrrrRR.',
      '.RRrrrrrrrrrRR..',
      '..RRrrrrrrRRR...',
      '...RRRRRRRRR....',
      '....DRRRRRD.....',
      '................',
      '................',
      '................',
      '................',
    ], P);
    this._tex('tile-rock', data);
  }

  /* ═══════ HERO ═══════ */
  generateHero() {
    const P = {
      '.': null,
      'H': '#7b4a2a', 'h': '#9b6a3a', // hair
      'S': '#ffcc99', 's': '#ffe0bd', // skin
      'E': '#222222',                  // eyes
      'B': '#2255aa', 'b': '#3366cc', // tunic
      'A': '#1a3a7a',                  // tunic dark
      'P': '#443322', 'p': '#554433', // pants
      'K': '#333333',                  // boots
    };
    // Down idle
    this._tex('hero-down-0', this._parse([
      '......HHHH......',
      '.....HHhhHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '.....SESSSE.....',
      '.....SSSSSS.....',
      '.....sSsSsS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '.....PP..PP.....',
      '.....PP..PP.....',
      '.....KK..KK.....',
      '................',
    ], P));
    // Down walk 1
    this._tex('hero-down-1', this._parse([
      '......HHHH......',
      '.....HHhhHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '.....SESSSE.....',
      '.....SSSSSS.....',
      '.....sSsSsS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '....PP....PP....',
      '.....PP..PP.....',
      '....KK....KK....',
      '................',
    ], P));
    // Down walk 2
    this._tex('hero-down-2', this._parse([
      '......HHHH......',
      '.....HHhhHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '.....SESSSE.....',
      '.....SSSSSS.....',
      '.....sSsSsS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '......PP.PP.....',
      '.....PP..PP.....',
      '......KK.KK.....',
      '................',
    ], P));
    // Up idle
    this._tex('hero-up-0', this._parse([
      '......HHHH......',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '.....PP..PP.....',
      '.....PP..PP.....',
      '.....KK..KK.....',
      '................',
      '................',
    ], P));
    this._tex('hero-up-1', this._parse([
      '......HHHH......',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '....PP....PP....',
      '.....PP..PP.....',
      '....KK....KK....',
      '................',
      '................',
    ], P));
    this._tex('hero-up-2', this._parse([
      '......HHHH......',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....HHHHHH.....',
      '.....SSSSSS.....',
      '....BBBbBBBB....',
      '....BBBbBBBB....',
      '....ABBBBBBA....',
      '....ABBBBBBA....',
      '.....BBBBBB.....',
      '......PP.PP.....',
      '.....PP..PP.....',
      '......KK.KK.....',
      '................',
      '................',
    ], P));
    // Left idle
    this._tex('hero-left-0', this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '.....PP.........',
      '.....PP.........',
      '.....KK.........',
      '................',
    ], P));
    this._tex('hero-left-1', this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '....PP..........',
      '.....PP.........',
      '....KK..........',
      '................',
    ], P));
    // Left walk 2
    this._tex('hero-left-2', this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '.....PP.........',
      '....PP..........',
      '.....KK.........',
      '................',
    ], P));
    // Right (mirrored left)
    this._tex('hero-right-0', this._mirrorH(this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '.....PP.........',
      '.....PP.........',
      '.....KK.........',
      '................',
    ], P)));
    this._tex('hero-right-1', this._mirrorH(this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '....PP..........',
      '.....PP.........',
      '....KK..........',
      '................',
    ], P)));
    this._tex('hero-right-2', this._mirrorH(this._parse([
      '................',
      '......HHHH......',
      '.....HHHHH......',
      '.....HHHSH......',
      '.....SSSS.......',
      '.....SESS.......',
      '.....SSS........',
      '....BBBBB.......',
      '....BBBBB.......',
      '....ABBBA.......',
      '....ABBBA.......',
      '.....BBBB.......',
      '.....PP.........',
      '....PP..........',
      '.....KK.........',
      '................',
    ], P)));
    // Attack frames (same pose, sword drawn in Sword.js)
    // reuse idle frames for attack body
  }

  _mirrorH(data) {
    return data.map(row => [...row].reverse());
  }

  /* ═══════ ORC ═══════ */
  generateOrc() {
    const P = {
      '.': null,
      'G': '#3a8a3a', 'g': '#2a6a2a', // green skin
      'D': '#1a4a1a',                  // dark green
      'E': '#cc2222', 'e': '#ff4444',  // red eyes
      'A': '#5a3a2a', 'a': '#6a4a3a',  // armor
      'P': '#4a3a2a',                  // pants
      'K': '#333333',                  // boots
      'T': '#ffcc44',                  // teeth
    };
    this._tex('orc-down-0', this._parse([
      '.....gGGGGg.....',
      '....gGGGGGGg....',
      '....GGGGGGGG....',
      '....GGEGGEGg....',
      '....GGeGGeGG....',
      '....GGTTTGGG....',
      '....gGGGGGGg....',
      '...aaAAAAAAAA...',
      '...aAAAAAAAAa...',
      '...AAAAAAAAAA...',
      '...aaAAAAAAAA...',
      '....AAAAAAAA....',
      '....PP....PP....',
      '....PP....PP....',
      '....KK....KK....',
      '................',
    ], P));
    this._tex('orc-down-1', this._parse([
      '.....gGGGGg.....',
      '....gGGGGGGg....',
      '....GGGGGGGG....',
      '....GGEGGEGg....',
      '....GGeGGeGG....',
      '....GGTTTGGG....',
      '....gGGGGGGg....',
      '...aaAAAAAAAA...',
      '...aAAAAAAAAa...',
      '...AAAAAAAAAA...',
      '...aaAAAAAAAA...',
      '....AAAAAAAA....',
      '...PP......PP...',
      '....PP....PP....',
      '...KK......KK...',
      '................',
    ], P));
    this._tex('orc-up-0', this._parse([
      '.....gGGGGg.....',
      '....gGGGGGGg....',
      '....GGGGGGGG....',
      '....GGGGGGGG....',
      '....GGGGGGGG....',
      '....gGGGGGGg....',
      '...aaAAAAAAAA...',
      '...aAAAAAAAAa...',
      '...AAAAAAAAAA...',
      '...aaAAAAAAAA...',
      '....AAAAAAAA....',
      '....PP....PP....',
      '....PP....PP....',
      '....KK....KK....',
      '................',
      '................',
    ], P));
    this._tex('orc-up-1', this._parse([
      '.....gGGGGg.....',
      '....gGGGGGGg....',
      '....GGGGGGGG....',
      '....GGGGGGGG....',
      '....GGGGGGGG....',
      '....gGGGGGGg....',
      '...aaAAAAAAAA...',
      '...aAAAAAAAAa...',
      '...AAAAAAAAAA...',
      '...aaAAAAAAAA...',
      '....AAAAAAAA....',
      '...PP......PP...',
      '....PP....PP....',
      '...KK......KK...',
      '................',
      '................',
    ], P));
    this._tex('orc-left-0', this._parse([
      '................',
      '.....gGGGg......',
      '....gGGGGg......',
      '....GGGGG.......',
      '....GEGG........',
      '....GTGG........',
      '....gGGg........',
      '...AAAAAA.......',
      '...AAAAAA.......',
      '...aAAAAa.......',
      '....AAAA........',
      '....PP..........',
      '....PP..........',
      '....KK..........',
      '................',
      '................',
    ], P));
    this._tex('orc-left-1', this._parse([
      '................',
      '.....gGGGg......',
      '....gGGGGg......',
      '....GGGGG.......',
      '....GEGG........',
      '....GTGG........',
      '....gGGg........',
      '...AAAAAA.......',
      '...AAAAAA.......',
      '...aAAAAa.......',
      '....AAAA........',
      '...PP...........',
      '....PP..........',
      '...KK...........',
      '................',
      '................',
    ], P));
    this._tex('orc-right-0', this._mirrorH(this._parse([
      '................',
      '.....gGGGg......',
      '....gGGGGg......',
      '....GGGGG.......',
      '....GEGG........',
      '....GTGG........',
      '....gGGg........',
      '...AAAAAA.......',
      '...AAAAAA.......',
      '...aAAAAa.......',
      '....AAAA........',
      '....PP..........',
      '....PP..........',
      '....KK..........',
      '................',
      '................',
    ], P)));
    this._tex('orc-right-1', this._mirrorH(this._parse([
      '................',
      '.....gGGGg......',
      '....gGGGGg......',
      '....GGGGG.......',
      '....GEGG........',
      '....GTGG........',
      '....gGGg........',
      '...AAAAAA.......',
      '...AAAAAA.......',
      '...aAAAAa.......',
      '....AAAA........',
      '...PP...........',
      '....PP..........',
      '...KK...........',
      '................',
      '................',
    ], P)));
    // Death frame
    this._tex('orc-death', this._parse([
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '....gGGGGGGg....',
      '...GGEGGEGGG....',
      '...GGTTTGGGG....',
      '..aaAAAAAAAAaa..',
      '..aAAAAAAAAAAAA.',
      '................',
    ], P));
  }

  /* ═══════ EMERALD ═══════ */
  generateEmerald() {
    const P = {
      '.': null,
      'E': '#22cc66', 'e': '#44ee88', 'D': '#118844', 'd': '#0a6633',
      'S': '#aaffcc', // shine
    };
    this._tex('emerald', this._parse([
      '................',
      '................',
      '......eSe.......',
      '.....eEEEe......',
      '....eEESSEe.....',
      '...eEESSEEEe....',
      '...EEESEEEED....',
      '..eEEEEEEEEDd...',
      '..EEEEEEEEDD....',
      '...EEEEEEDDd....',
      '...eEEEEDDd.....',
      '....eEEDDd......',
      '.....eDDd.......',
      '......dd........',
      '................',
      '................',
    ], P));
  }

  /* ═══════ UI ═══════ */
  generateUI() {
    // Heart full
    const P = { '.': null, 'R': '#ee2244', 'r': '#ff6677', 'D': '#aa1133' };
    this._tex('heart-full', this._parse([
      '..rr..rr..',
      '.RRRRRRRR.',
      '.RRRRRRRR.',
      'RRrRRRRRRR',
      'RRRRRRRRRR',
      'RRRRRRRRRR',
      '.RRRRRRRR.',
      '..RRRRRR..',
      '...RRRR...',
      '....RR....',
    ], P), 2);
    // Heart empty
    const Q = { '.': null, 'R': '#553333', 'r': '#664444', 'D': '#442222' };
    this._tex('heart-empty', this._parse([
      '..rr..rr..',
      '.RRRRRRRR.',
      '.RRRRRRRR.',
      'RRRRRRRRRR',
      'RRRRRRRRRR',
      'RRRRRRRRRR',
      '.RRRRRRRR.',
      '..RRRRRR..',
      '...RRRR...',
      '....RR....',
    ], Q), 2);
    // Emerald icon (small)
    const I = { '.': null, 'E': '#22cc66', 'e': '#44ee88', 'S': '#aaffcc' };
    this._tex('emerald-icon', this._parse([
      '...Se...',
      '..eEEe..',
      '.eESEEe.',
      '.EEEEEE.',
      '..eEEe..',
      '...ee...',
    ], I), 3);
  }

  /* ═══════ SWORD — proper pixel art sword per direction ═══════ */
  generateSwordSlash() {
    const P = {
      '.': null,
      'B': '#c0c0c0', // blade
      'b': '#e0e0e0', // blade highlight
      'T': '#ffffff',  // tip
      'G': '#daa520', // crossguard (gold)
      'g': '#b8860b', // crossguard dark
      'H': '#6b3a1f', // handle
      'h': '#8b5a2f', // handle light
      'W': '#ffeecc', // slash trail glow
    };
    // Sword pointing DOWN (blade extends downward)
    this._tex('sword-down', this._parse([
      '....hH....',
      '....Hh....',
      '...gGGg...',
      '....Bb....',
      '....bB....',
      '....Bb....',
      '....bB....',
      '....Bb....',
      '....TB....',
      '....TT....',
    ], P), 2);
    // Sword pointing UP
    this._tex('sword-up', this._parse([
      '....TT....',
      '....TB....',
      '....Bb....',
      '....bB....',
      '....Bb....',
      '....bB....',
      '....Bb....',
      '...gGGg...',
      '....Hh....',
      '....hH....',
    ], P), 2);
    // Sword pointing RIGHT (blade extends right)
    this._tex('sword-right', this._parse([
      '..........',
      '..........',
      '..........',
      'hHgBbBbBTT',
      'HhGbBbBBT.',
      '..........',
      '..........',
      '..........',
    ], P), 2);
    // Sword pointing LEFT (blade extends left)
    this._tex('sword-left', this._parse([
      '..........',
      '..........',
      '..........',
      'TTBbBbBgHh',
      '.TBBbBbGhH',
      '..........',
      '..........',
      '..........',
    ], P), 2);
    // Slash arc effect (semi-transparent swoosh)
    this._tex('slash-arc', this._parse([
      '......WW..',
      '....WW....',
      '..WW......',
      '.W........',
      '.W........',
      '..WW......',
      '....WW....',
      '......WW..',
    ], { '.': null, 'W': 'rgba(255,255,220,0.5)' }), 2);
  }

  /* ═══════ PARTICLE ═══════ */
  generateParticle() {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 4;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);
    this.textures.addImage('particle', canvas);
  }

  /* ═══════ ANIMATIONS ═══════ */
  createAnimations() {
    const dirs = ['down', 'up', 'left', 'right'];
    // Hero walk
    dirs.forEach(d => {
      this.anims.create({
        key: `hero-walk-${d}`,
        frames: [
          { key: `hero-${d}-0` },
          { key: `hero-${d}-1` },
          { key: `hero-${d}-0` },
          { key: `hero-${d}-2` },
        ],
        frameRate: 8, repeat: -1,
      });
      this.anims.create({
        key: `hero-idle-${d}`,
        frames: [{ key: `hero-${d}-0` }],
        frameRate: 1, repeat: -1,
      });
    });
    // Orc walk
    dirs.forEach(d => {
      this.anims.create({
        key: `orc-walk-${d}`,
        frames: [
          { key: `orc-${d}-0` },
          { key: `orc-${d}-1` },
        ],
        frameRate: 6, repeat: -1,
      });
      this.anims.create({
        key: `orc-idle-${d}`,
        frames: [{ key: `orc-${d}-0` }],
        frameRate: 1, repeat: -1,
      });
    });
  }
}
