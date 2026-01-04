import './App.css';

import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const onStart = (e) => {
      if (!started && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        setStarted(true);
      }
    };
    window.addEventListener('keydown', onStart);
    return () => window.removeEventListener('keydown', onStart);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    /* ================= PLAYER ================= */
    const player = {
      x: 100,
      y: 380,
      w: 40,
      h: 40,
      vx: 0,
      vy: 0,
      hp: 50,
    };

    /* ================= INPUT ================= */
    const keys = {};
    // ensure space is not treated as pressed from the start keydown
    keys[' '] = false;
    const onKeyDown = (e) => {
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

    /* ================= ENEMIES ================= */
    const enemies = [];

    function spawnEnemy(type = 'ground') {
      enemies.push({
        type,
        x: WIDTH,
        y: type === 'fly' ? 200 : 380,
        w: type === 'boss' ? 120 : 40,
        h: type === 'boss' ? 120 : 40,
        hp:
          type === 'boss'
            ? 100 + Math.floor(score / 1000) * 100
            : 20,
        speed: type === 'boss' ? 1.5 : 2,
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

      player.hp = 50;
      player.w = 40;
      player.h = 40;
      player.x = 100;
      player.y = 380;
      player.vx = 0;
      player.vy = 0;
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
      // PLAYER MOVE
      player.vx = keys.a ? -4 : keys.d ? 4 : 0;
      if (keys.w && player.y >= 380) player.vy = -12;
      player.vy += 0.6;
      player.x += player.vx;
      player.y += player.vy;
      if (player.y > 380) {
        player.y = 380;
        player.vy = 0;
      }

      // SHOOT (forward)
      if (keys[' ']) {
        bullets.push({
          x: player.x + player.w,
          y: player.y + player.h / 2 + (Math.random() * 6 - 3),
          vx: 8,
        });
      }

      bullets.forEach((b) => {
        b.x += b.vx;
      });

      // SPAWN ENEMIES
      levelSpawner();

      // UPDATE ENEMIES
      enemies.forEach((e, i) => {
        if (!e.dying) {
          e.x -= e.speed;

          if (e.type === 'fly') {
            e.y += (player.y - e.y) * 0.02;
          }

          e.shootTimer++;
          if (e.shootTimer > (e.type === 'boss' ? 20 : 60)) {
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
        resetRun();
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
      ctx.fillStyle = 'cyan';
      ctx.fillRect(player.x, player.y, player.w, player.h);

      // BULLETS
      ctx.fillStyle = 'yellow';
      bullets.forEach((b) => ctx.fillRect(b.x, b.y, 6, 6));

      // ENEMY BULLETS
      ctx.fillStyle = 'orange';
      enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, 6, 6));

      // ENEMIES
      enemies.forEach((e) => {
        ctx.globalAlpha = e.fade;
        ctx.fillStyle =
          e.type === 'boss' ? 'darkred' : e.type === 'fly' ? 'purple' : 'red';
        ctx.fillRect(e.x, e.y, e.w, e.h);
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
    };
  }, [started]);

  return (
    <div className="App" style={{ position: 'relative', width: 900, height: 500 }}>
      <canvas
        ref={canvasRef}
        id="c"
        width={900}
        height={500}
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
          Press Space to Start
        </div>
      )}
    </div>
  );
}

export default App;
