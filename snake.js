const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
let snake = [{x: 9*box, y: 10*box}];
let direction = 'DOWN'; // Сразу двигаемся вниз
let food = {x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box};
let score = 0;
let game;
const scoreDiv = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const leaderboardUl = document.getElementById('leaderboard');

// Получить username из Telegram WebApp (или "Anonymous")
let username = "Anonymous";
try {
  let tg = window.Telegram?.WebApp;
  if (tg && tg.initDataUnsafe?.user?.username) {
    username = tg.initDataUnsafe.user.username;
  }
} catch (e) {
  // Оставляем "Anonymous"
}

// Управление
document.addEventListener('keydown', dir);
function dir(e) {
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 400, 400);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#0f0" : "#0a0";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === 'LEFT') snakeX -= box;
  if (direction === 'UP') snakeY -= box;
  if (direction === 'RIGHT') snakeX += box;
  if (direction === 'DOWN') snakeY += box;

  // Проверка на съедание еды
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    food = {
      x: Math.floor(Math.random()*20)*box,
      y: Math.floor(Math.random()*20)*box
    };
  } else {
    snake.pop();
  }

  let newHead = {x: snakeX, y: snakeY};

  // Game over
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= 400 || snakeY >= 400 ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    sendScore();
    return;
  }

  snake.unshift(newHead);
  scoreDiv.textContent = "Очки: " + score;
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

function sendScore() {
  fetch('https://spacesnake-backend.onrender.com/score', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, score})
  })
  .then(() => getLeaderboard())
  .catch(() => alert('Ошибка отправки очков на сервер!'));
}

function getLeaderboard() {
  fetch('https://spacesnake-backend.onrender.com/leaderboard')
    .then(res => res.json())
    .then(data => {
      leaderboardUl.innerHTML = '';
      data.forEach((row, i) => {
        leaderboardUl.innerHTML += `<li>${i+1}. ${row.username}: ${row.score}</li>`;
      });
    })
    .catch(() => {
      leaderboardUl.innerHTML = '<li>Ошибка загрузки таблицы лидеров</li>';
    });
}

restartBtn.onclick = () => {
  snake = [{x: 9*box, y: 10*box}];
  direction = 'DOWN';
  score = 0;
  clearInterval(game);
  game = setInterval(draw, 100);
};

getLeaderboard();
game = setInterval(draw, 100);
