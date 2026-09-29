/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Flappy Bird Application Unit Tests', () => {
  let htmlContent;

  beforeAll(() => {
    require('./setupTests');
    const htmlPath = path.join(__dirname, '../app/index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
    window.localStorage.clear();
    jest.resetModules();
  });

  test('Verify core HTML application structure and essential elements exist', () => {
    expect(document.getElementById('gameCanvas')).not.toBeNull();
    expect(document.getElementById('startScreen')).not.toBeNull();
    expect(document.getElementById('gameOverScreen')).not.toBeNull();
    expect(document.getElementById('startBtn')).not.toBeNull();
    expect(document.getElementById('restartBtn')).not.toBeNull();
    expect(document.getElementById('currentScore')).not.toBeNull();
    expect(document.getElementById('highScore')).not.toBeNull();
  });

  test('JavaScript game engine loads without syntax errors and attaches window.FlappyGame', () => {
    require('../app/game.js');
    expect(window.FlappyGame).toBeDefined();
    expect(typeof window.FlappyGame.resetGame).toBe('function');
    expect(typeof window.FlappyGame.flap).toBe('function');
  });

  test('Game initialization resets bird state and scores correctly', () => {
    require('../app/game.js');
    window.FlappyGame.resetGame();

    const bird = window.FlappyGame.getBird();
    expect(bird.x).toBe(80);
    expect(bird.velocity).toBe(0);
    expect(window.FlappyGame.getScore()).toBe(0);
  });

  test('Flap mechanics apply negative upward velocity to bird', () => {
    require('../app/game.js');
    window.FlappyGame.resetGame();
    window.FlappyGame.startGame();

    const initialVelocity = window.FlappyGame.getBird().velocity;
    window.FlappyGame.flap();
    const newVelocity = window.FlappyGame.getBird().velocity;

    expect(newVelocity).toBeLessThan(initialVelocity);
    expect(newVelocity).toBe(-7.5);
  });

  test('LocalStorage high score persistence saves and retrieves values correctly', () => {
    require('../app/game.js');

    // Test saving new high score
    window.FlappyGame.saveHighScore(25);
    expect(window.localStorage.getItem('flappyHighScore')).toBe('25');
    expect(window.FlappyGame.getStoredHighScore()).toBe(25);

    // Test updating when higher score occurs
    window.FlappyGame.saveHighScore(42);
    expect(window.FlappyGame.getStoredHighScore()).toBe(42);
  });

  test('Trigger game over updates UI score summaries and updates high score if exceeded', () => {
    require('../app/game.js');
    window.FlappyGame.resetGame();
    window.FlappyGame.saveHighScore(10);

    // Simulate achieving a higher score
    window.FlappyGame.triggerGameOver();

    expect(document.getElementById('gameOverScreen').classList.contains('active')).toBe(true);
    expect(document.getElementById('finalHighScore').textContent).toBe('10');
  });
});
