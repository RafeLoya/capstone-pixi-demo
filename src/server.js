import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// serve static files
app.use(express.static(path.join(__dirname, '..')));

// game state, implement state machine
const gameState = {
  players: {},
  currentQuestion: 0,
  answers: {},
  scores: {},
  gameStarted: false
};

// sample questions
const questions = [
  {
    question: "What is the capital of France?",
    choices: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    choices: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    question: "What is 2 + 2?",
    choices: ["3", "4", "5", "6"],
    correctAnswer: 1
  }
];

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // add player
  gameState.players[socket.id] = {
    id: socket.id,
    score: 0
  };
  gameState.scores[socket.id] = 0;

  // start game when we have at least 2 players (or after timeout)
  if (Object.keys(gameState.players).length >= 2 && !gameState.gameStarted) {
    startGame();
  }

  socket.on('submitAnswer', (data) => {
    const playerId = socket.id;
    const timestamp = Date.now();

    // store answer
    if (!gameState.answers[playerId]) {
      gameState.answers[playerId] = {
        choice: data.choiceIndex,
        timestamp: timestamp
      };

      // notify all players that someone answered
      io.emit('playerAnswered', { playerId });

      // check if all players answered
      const allAnswered = Object.keys(gameState.players).every(
        pid => gameState.answers[pid]
      );

      if (allAnswered) {
        processRoundResults();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete gameState.players[socket.id];
    delete gameState.scores[socket.id];
    delete gameState.answers[socket.id];
  });
});

function startGame() {
  gameState.gameStarted = true;
  gameState.currentQuestion = 0;
  
  io.emit('gameStart', { 
    players: Object.keys(gameState.players) 
  });

  // send first question after a delay
  setTimeout(() => {
    sendNextQuestion();
  }, 2000);
}

function sendNextQuestion() {
  if (gameState.currentQuestion >= questions.length) {
    endGame();
    return;
  }

  const question = questions[gameState.currentQuestion];
  gameState.answers = {}; // reset answers

  io.emit('newQuestion', {
    questionNumber: gameState.currentQuestion + 1,
    totalQuestions: questions.length,
    question: question.question,
    choices: question.choices,
    correctAnswer: question.correctAnswer // TODO! sending for now, should be hidden later
  });
}

function processRoundResults() {
  const question = questions[gameState.currentQuestion];
  const correctAnswer = question.correctAnswer;

  // calculate scores
  const playerAnswers = Object.entries(gameState.answers);
  const correctPlayers = playerAnswers.filter(([_, ans]) => ans.choice === correctAnswer);
  const allCorrect = correctPlayers.length === playerAnswers.length;

  // sort by timestamp to find who was first
  const sortedAnswers = playerAnswers.sort((a, b) => a[1].timestamp - b[1].timestamp);
  const firstCorrectPlayer = sortedAnswers.find(([_, ans]) => ans.choice === correctAnswer)?.[0];

  // award points
  playerAnswers.forEach(([playerId, answer]) => {
    let points = 0;
    
    if (answer.choice === correctAnswer) {
      points = 10; // base points for correct answer
      
      if (allCorrect) {
        points += 5; // bonus if everyone got it right
      }
      
      if (playerId === firstCorrectPlayer && correctPlayers.length > 1) {
        points += 5; // bonus for being first
      }
    }

    gameState.scores[playerId] += points;
  });

  // send results to all players
  Object.keys(gameState.players).forEach(playerId => {
    io.to(playerId).emit('roundResults', {
      playerId: playerId,
      scores: gameState.scores,
      correctAnswer: correctAnswer,
      playerAnswers: gameState.answers,
      pointsEarned: gameState.answers[playerId] ? 
        (gameState.answers[playerId].choice === correctAnswer ? 10 : 0) : 0
    });
  });

  // move to next question
  gameState.currentQuestion++;
  setTimeout(() => {
    sendNextQuestion();
  }, 5000); // wait 5 seconds before next question
}

function endGame() {
  io.emit('gameEnd', gameState.scores);
  
  // reset game after a delay
  setTimeout(() => {
    gameState.gameStarted = false;
    gameState.currentQuestion = 0;
    gameState.answers = {};
    Object.keys(gameState.scores).forEach(pid => {
      gameState.scores[pid] = 0;
    });
  }, 10000);
}

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});