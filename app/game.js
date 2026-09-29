/**
 * Flappy Bird Arcade Clone — DevOps Production Edition
 * Pure HTML5 Canvas Game Engine
 */

(function () {
  'use strict';

  // LocalStorage Key
  const HIGH_SCORE_KEY = 'flappyHighScore';

  // Game Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;

  const GRAVITY = 0.45;
  const FLAP_IMPULSE = -7.5;
  const PIPE_SPEED = 2.5;
  const PIPE_SPAWN_INTERVAL = 110; // frames
  const PIPE_GAP = 140;
  const PIPE_WIDTH = 64;

  const BIRD_RADIUS = 16;
  const BIRD_X = 80;

  // DOM Element References
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');

  const currentScoreElem = document.getElementById('currentScore');
  const highScoreElem = document.getElementById('highScore');
  const finalScoreElem = document.getElementById('finalScore');
  const finalHighScoreElem = document.getElementById('finalHighScore');
  const newRecordBadge = document.getElementById('newRecordBadge');

  // Game State Variables
  let gameState = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
  let animationFrameId = null;
  let frameCount = 0;
  let score = 0;
  let highScore = getStoredHighScore();

  // Bird Object
  let bird = {
    x: BIRD_X,
    y: CANVAS_HEIGHT / 2,
    velocity: 0,
    rotation: 0
  };

  // Pipes Array
  let pipes = [];

  // Ground Scroll offset
  let groundOffset = 0;

  // Audio Context (Optional Web Audio API synthesis)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
  }

  function playSound(type) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'flap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'score') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  // --- High Score Helpers ---
  function getStoredHighScore() {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(HIGH_SCORE_KEY);
        return val ? parseInt(val, 10) || 0 : 0;
      }
    } catch (e) {
      // LocalStorage unavailable
    }
    return 0;
  }

  function saveHighScore(newScore) {
    highScore = parseInt(newScore, 10) || 0;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(HIGH_SCORE_KEY, highScore.toString());
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // --- Initialization & Controls ---
  function updateHUD() {
    if (currentScoreElem) currentScoreElem.textContent = score;
    if (highScoreElem) highScoreElem.textContent = highScore;
  }

  function resetGame() {
    bird.x = BIRD_X;
    bird.y = CANVAS_HEIGHT / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    highScore = getStoredHighScore();
    updateHUD();
  }

  function flap() {
    initAudio();
    if (gameState === 'START') {
      startGame();
      bird.velocity = FLAP_IMPULSE;
      playSound('flap');
    } else if (gameState === 'PLAYING') {
      bird.velocity = FLAP_IMPULSE;
      playSound('flap');
    } else if (gameState === 'GAMEOVER') {
      // No flap on game over screen until restart clicked
    }
  }

  function startGame() {
    resetGame();
    gameState = 'PLAYING';
    if (startScreen) startScreen.classList.remove('active'), startScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.remove('active'), gameOverScreen.classList.add('hidden');
  }

  function triggerGameOver() {
    gameState = 'GAMEOVER';
    playSound('hit');

    const storedHighScore = getStoredHighScore();
    if (storedHighScore > highScore) {
      highScore = storedHighScore;
    }

    let isNewRecord = false;
    if (score > highScore) {
      highScore = score;
      saveHighScore(highScore);
      isNewRecord = true;
    }

    updateHUD();
    if (finalScoreElem) finalScoreElem.textContent = score;
    if (finalHighScoreElem) finalHighScoreElem.textContent = highScore;

    if (newRecordBadge) {
      if (isNewRecord && score > 0) {
        newRecordBadge.classList.remove('hidden');
      } else {
        newRecordBadge.classList.add('hidden');
      }
    }

    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
      gameOverScreen.classList.add('active');
    }
  }

  // --- Core Game Loop Functions ---
  function createPipe() {
    const minTop = 60;
    const maxTop = CANVAS_HEIGHT - 120 - PIPE_GAP;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    pipes.push({
      x: CANVAS_WIDTH,
      topHeight: topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false
    });
  }

  function update() {
    if (gameState !== 'PLAYING') return;

    frameCount++;

    // Update bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Bird rotation calculation
    if (bird.velocity < 0) {
      bird.rotation = Math.max(-0.4, bird.velocity * 0.05);
    } else {
      bird.rotation = Math.min(1.2, bird.velocity * 0.08);
    }

    // Spawn pipes
    if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
      createPipe();
    }

    // Ground scroll
    groundOffset = (groundOffset + PIPE_SPEED) % 20;

    // Update pipes & scoring
    for (let i = pipes.length - 1; i >= 0; i--) {
      let p = pipes[i];
      p.x -= PIPE_SPEED;

      // Score point when passing pipe center
      if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
        p.passed = true;
        score++;
        updateHUD();
        playSound('score');
      }

      // Remove off-screen pipes
      if (p.x + PIPE_WIDTH < 0) {
        pipes.splice(i, 1);
      }
    }

    // Collision Detection
    const groundY = CANVAS_HEIGHT - 60;
    // Ground or Ceiling collision
    if (bird.y + BIRD_RADIUS >= groundY || bird.y - BIRD_RADIUS <= 0) {
      triggerGameOver();
      return;
    }

    // Pipe collision check
    for (let p of pipes) {
      // Check horizontal overlap
      if (bird.x + BIRD_RADIUS > p.x && bird.x - BIRD_RADIUS < p.x + PIPE_WIDTH) {
        // Check vertical overlap with top or bottom pipe
        if (bird.y - BIRD_RADIUS < p.topHeight || bird.y + BIRD_RADIUS > p.bottomY) {
          triggerGameOver();
          return;
        }
      }
    }
  }

  function render() {
    if (!ctx) return;

    // Clear canvas & render sky background gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.7, '#70c5ce');
    skyGrad.addColorStop(1, '#a0e0e0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(80, 120, 30, 0, Math.PI * 2);
    ctx.arc(110, 110, 40, 0, Math.PI * 2);
    ctx.arc(140, 120, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(280, 200, 25, 0, Math.PI * 2);
    ctx.arc(305, 190, 35, 0, Math.PI * 2);
    ctx.arc(330, 200, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw Pipes
    for (let p of pipes) {
      const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
      pipeGrad.addColorStop(0, '#22c55e');
      pipeGrad.addColorStop(0.5, '#4ade80');
      pipeGrad.addColorStop(1, '#15803d');

      ctx.fillStyle = pipeGrad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 3;

      // Top Pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
      ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topHeight);

      // Top Pipe Cap
      ctx.fillRect(p.x - 4, p.topHeight - 20, PIPE_WIDTH + 8, 20);
      ctx.strokeRect(p.x - 4, p.topHeight - 20, PIPE_WIDTH + 8, 20);

      // Bottom Pipe
      const bottomHeight = CANVAS_HEIGHT - p.bottomY - 60;
      ctx.fillRect(p.x, p.bottomY, PIPE_WIDTH, bottomHeight);
      ctx.strokeRect(p.x, p.bottomY, PIPE_WIDTH, bottomHeight);

      // Bottom Pipe Cap
      ctx.fillRect(p.x - 4, p.bottomY, PIPE_WIDTH + 8, 20);
      ctx.strokeRect(p.x - 4, p.bottomY, PIPE_WIDTH + 8, 20);
    }

    // Draw Ground
    const groundY = CANVAS_HEIGHT - 60;
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 60);

    // Ground Grass Line
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 14);

    ctx.strokeStyle = '#579122';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 14);
    ctx.lineTo(CANVAS_WIDTH, groundY + 14);
    ctx.stroke();

    // Ground Stripes Pattern
    ctx.fillStyle = '#cbb86b';
    for (let x = -groundOffset; x < CANVAS_WIDTH + 20; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 14);
      ctx.lineTo(x + 10, groundY + 60);
      ctx.lineTo(x + 15, groundY + 60);
      ctx.lineTo(x + 5, groundY + 14);
      ctx.fill();
    }

    // Draw Bird
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Bird Body (Yellow Gradient Circle)
    const birdGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, BIRD_RADIUS);
    birdGrad.addColorStop(0, '#fef08a');
    birdGrad.addColorStop(0.8, '#eab308');
    birdGrad.addColorStop(1, '#ca8a04');

    ctx.fillStyle = birdGrad;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bird Wing
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(-6, 2, 8, 5, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bird Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bird Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(18, 4);
    ctx.lineTo(10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function gameLoop() {
    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Event Listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    });

    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        flap();
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
      });
    }
  }

  // Initial setup & start loop
  updateHUD();
  gameLoop();

  // Export engine methods for testing window environments
  if (typeof window !== 'undefined') {
    window.FlappyGame = {
      resetGame,
      startGame,
      triggerGameOver,
      flap,
      getScore: () => score,
      getHighScore: () => highScore,
      getBird: () => bird,
      getPipes: () => pipes,
      getStoredHighScore,
      saveHighScore
    };
  }
})();
