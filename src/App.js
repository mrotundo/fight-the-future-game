import './App.css';

import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    const onStart = (e) => {
      if (!started && (e.code === 'Enter' || e.key === 'Enter')) {
        e.preventDefault();
        setStarted(true);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onStart);
    return () => window.removeEventListener('keydown', onStart);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // make the canvas match the full viewport and stay responsive
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      WIDTH = canvas.width;
      HEIGHT = canvas.height;
    };
    window.addEventListener('resize', onResize);

    /* ================= IMAGES ================= */
    // Place these files in your 'public' folder
    const sprites = {
      player: new Image(),
      ground: new Image(),
      fly: new Image(),
      boss: new Image(),
    };
    sprites.player.src = '/player.png';
    sprites.ground.src = '/enemy.png';
    sprites.fly.src = '/fly.png';
    sprites.boss.src = '/boss.png';

    /* ================= PLAYER ================= */
    const player = {
      x: 100,
      y: HEIGHT - 140, // Adjusted for 60px height (floor is at HEIGHT-80)
      w: 80,
      h: 60,
      vx: 0,
      vy: 0,
      hp: 200,
      shootTimer: 0,
    };

    /* ================= INPUT ================= */
    const keys = {};
    // ensure space/enter are not treated as pressed from the start keydown
    keys[' '] = false;
    keys['Enter'] = false;
    const onKeyDown = (e) => {
      if (isGameOver) {
        if (e.key === 'Enter') {
          resetRun();
          isGameOver = false;
          keys['Enter'] = false; // prevent immediate shoot
        }
        return;
      }

      // Shoot on Space (semi-automatic, no repeat)
      if (e.key === ' ' && !e.repeat) {
        for (let i = -2; i <= 2; i++) {
          bullets.push({
            x: player.x + player.w,
            y: player.y + player.h / 2,
            vx: 8,
            vy: i * 0.5,
          });
        }
      }

      keys[e.key] = true;
    };
    const onKeyUp = (e) => {
      keys[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    /* ================= BULLETS ================= */
    const bullets = [];
    const enemyBullets = [];

    /* ================= SCORE & LEVEL ================= */
    let score = 0;
    let kills = 0;
    let growthLevel = 0;

    let level = 1;
    let killsThisLevel = 0;
    let levelsBeaten = 0;
    let bestLevel = 0;

    let spawnDelay = 120; // frames between enemy spawns
    let spawnTimer = 0;

    let flashTimer = 0;
    let isGameOver = false;

    /* ================= ENEMIES ================= */
    const enemies = [];

    function spawnEnemy(type = 'ground') {
      const w = type === 'boss' ? 100 : 60;
      const h = type === 'boss' ? 100 : 60;
      const groundY = HEIGHT - 80 - h; // Floor is at HEIGHT - 80
      const speed = type === 'boss' ? 1.5 : 2;
      
      // Calculate gravity so fly enemies land exactly at WIDTH / 2
      let gravity = 0;
      if (type === 'fly') {
        const startY = HEIGHT / 2;
        const distY = groundY - startY;
        const frames = (WIDTH / 2) / speed;
        if (frames > 0) {
          gravity = (2 * distY) / (frames * frames);
        }
      }

      enemies.push({
        type,
        x: WIDTH,
        y: type === 'fly' ? HEIGHT / 2 : groundY, // fly enemies start at middle height
        w,
        h,
        vy: 0, // vertical velocity for falling
        gravity,
        hp:
          type === 'boss'
            ? 1000 + Math.floor(score / 1000) * 100
            : 20,
        speed,
        shootTimer: 0,
        dying: false,
        fade: 1,
        counted: false,
      });
    }

    /* initial enemies */
    spawnEnemy();
    spawnEnemy('fly');

    /* ================= PLAYER GROW ================= */
    function growPlayer() {
      player.w += 10;
      player.h += 10;
      player.hp += 10;
      player.y -= 10; // keep feet on ground
    }

    /* ================= LEVEL CHECK ================= */
    function checkLevelUp() {
      const neededKills = 20 + (level - 1) * 10;
      if (killsThisLevel >= neededKills) {
        levelsBeaten++;
        level++;
        killsThisLevel = 0;

        // Speed up spawner by 10%
        spawnDelay *= 0.9;
        if (spawnDelay < 20) spawnDelay = 20;

        // Flash
        flashTimer = 12;

        if (level > bestLevel) bestLevel = level;
      }
    }

    /* ================= RESET ON DEATH ================= */
    function resetRun() {
      level = 1;
      killsThisLevel = 0;
      levelsBeaten = 0;
      bestLevel = 0;
      spawnDelay = 120;

      score = 0;
      kills = 0;
      growthLevel = 0;

      player.hp = 200;
      player.w = 80;
      player.h = 60;
      player.x = 100;
      player.y = HEIGHT - 140;
      player.vx = 0;
      player.vy = 0;
      player.shootTimer = 0;
      bullets.length = 0;
      enemyBullets.length = 0;
      enemies.length = 0;
      spawnEnemy();
      spawnEnemy('fly');
    }

    /* ================= ENEMY SPAWNER ================= */
    function levelSpawner() {
      spawnTimer++;
      if (spawnTimer >= spawnDelay) {
        spawnTimer = 0;
        const type = Math.random() < 0.3 ? 'fly' : 'ground';
        spawnEnemy(type);
      }
    }

    /* ================= GAME LOOP ================= */
    function update() {
      if (isGameOver) return;

      // PLAYER MOVE
      player.vx = keys.a ? -4 : keys.d ? 4 : 0;
      // Jump with W
      if (keys.w && player.y >= HEIGHT - 140) player.vy = -12;
      player.vy += 0.6;
      player.x += player.vx;
      player.y += player.vy;
      if (player.y > HEIGHT - 140) {
        player.y = HEIGHT - 140;
        player.vy = 0;
      }

      // SHOOT (forward) - mapped to Space
      // (Handled in onKeyDown for semi-automatic fire)

      bullets.forEach((b) => {
        b.x += b.vx;
        if (b.vy) b.y += b.vy;
      });

      // SPAWN ENEMIES
      levelSpawner();

      // UPDATE ENEMIES
      enemies.forEach((e, i) => {
        if (!e.dying) {
          e.x -= e.speed;

          // Apply gravity to fly enemies so they fall to ground
          if (e.type === 'fly') {
            e.vy += e.gravity;
            e.y += e.vy;
            const groundY = HEIGHT - 80 - e.h;
            if (e.y > groundY) {
              e.y = groundY;
              e.vy = 0;
            }
          }

          // keep all enemies on the ground (no vertical tracking)

          e.shootTimer++;
          // Reduced fire rate by ~20% (increased delay by 25%)
          // Boss: 20% faster than enemies (75 / 1.2 = 62.5 -> ~62)
          if (e.shootTimer > (e.type === 'boss' ? 62 : 75)) {
            enemyBullets.push({
              x: e.x,
              y: e.y + 20,
              vx: -5,
            });
            e.shootTimer = 0;
          }

          // PLAYER BULLET HIT
          bullets.forEach((b, bi) => {
            if (
              b.x < e.x + e.w &&
              b.x + 6 > e.x &&
              b.y < e.y + e.h &&
              b.y + 6 > e.y
            ) {
              e.hp -= 5;
              bullets.splice(bi, 1);
            }
          });

          // ENEMY DEATH
          if (e.hp <= 0 && !e.counted) {
            e.counted = true;
            e.dying = true;
            score += 100;
            kills++;
            killsThisLevel++;

            if (Math.floor(kills / 1000) > growthLevel) {
              growthLevel++;
              growPlayer();
            }

            checkLevelUp();
          }
        } else {
          // DYING FADE
          e.fade -= 0.05;
          e.y += 2;
          if (e.fade <= 0) {
            enemies.splice(i, 1);
          }
        }

        // ENEMY OFFSCREEN RESPAWN
        if (e.x < -150) {
          enemies.splice(i, 1);
          const type = Math.random() < 0.3 ? 'fly' : 'ground';
          spawnEnemy(type);
        }
      });

      // ENEMY BULLETS
      enemyBullets.forEach((b, bi) => {
        b.x += b.vx;
        if (
          b.x < player.x + player.w &&
          b.x + 6 > player.x &&
          b.y < player.y + player.h &&
          b.y + 6 > player.y
        ) {
          player.hp -= 5;
          enemyBullets.splice(bi, 1);
        }
      });

      // PLAYER DEATH
      if (player.hp <= 0) {
        isGameOver = true;
      }

    }

    /* ================= DRAW ================= */
    function draw() {
      // BACKGROUND
      ctx.fillStyle = '#180000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // FLASH
      if (flashTimer > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        flashTimer--;
      }

      // PLAYER
      if (sprites.player.complete && sprites.player.naturalWidth !== 0) {
        ctx.drawImage(sprites.player, player.x, player.y, player.w, player.h);
      } else {
        ctx.fillStyle = 'cyan';
        ctx.fillRect(player.x, player.y, player.w, player.h);
      }

      // BULLETS
      ctx.fillStyle = 'yellow';
      bullets.forEach((b) => ctx.fillRect(b.x, b.y, 6, 6));

      // ENEMY BULLETS
      ctx.fillStyle = 'orange';
      enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, 6, 6));

      // ENEMIES
      enemies.forEach((e) => {
        ctx.globalAlpha = e.fade;
        let sprite = sprites.ground;
        if (e.type === 'fly') sprite = sprites.fly;
        if (e.type === 'boss') sprite = sprites.boss;

        if (sprite.complete && sprite.naturalWidth !== 0) {
          ctx.drawImage(sprite, e.x, e.y, e.w, e.h);
        } else {
          ctx.fillStyle =
            e.type === 'boss' ? 'darkred' : e.type === 'fly' ? 'purple' : 'red';
          ctx.fillRect(e.x, e.y, e.w, e.h);
        }
        ctx.globalAlpha = 1;
      });

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '18px monospace';
      ctx.fillText('HP: ' + player.hp, 20, 30);
      ctx.fillText('Score: ' + score, 20, 55);
      ctx.fillText('Kills (level): ' + killsThisLevel, 20, 80);
      ctx.fillText('Level: ' + level, 20, 105);
      ctx.fillText('Levels Beaten: ' + levelsBeaten, 20, 130);
      ctx.fillText('Best Level (Run): ' + bestLevel, 20, 155);
      ctx.fillText('Boss Level: ' + Math.floor(score / 1000), 20, 180);

      if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText('Press Enter to Restart', WIDTH / 2, HEIGHT / 2 + 20);
        ctx.textAlign = 'left';
      }
    }

    /* ================= MAIN LOOP ================= */
    let rafId = 0;
    const loop = () => {
      update();
      draw();
      rafId = window.requestAnimationFrame(loop);
    };
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
    };
  }, [started]);

  return (
    <div className="App" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        id="c"
        
        data-testid="game-canvas"
      />
      {!started && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: 24,
          }}
        >
          Press Enter to Start
        </div>
      )}
    </div>
  );
}

export default App;
