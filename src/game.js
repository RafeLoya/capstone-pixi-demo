import { io } from 'socket.io-client';
import { Text } from 'pixi.js'
import { QuizScene } from './scenes/quiz-scene.js';
import { ResultScene } from './scenes/result-scene.js';

export class Game {
  constructor(app) {
    this.app = app;
    this.socket = null;
    this.currentScene = null;
    this.score = 0;
    this.playerId = null;
  }

  async start() {
    // connect to server
    this.socket = io('http://localhost:3000');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.playerId = this.socket.id;
    });

    this.socket.on('gameStart', (data) => {
      console.log('Game starting with players:', data.players);
      this.showWaitingScreen();
    });

    this.socket.on('newQuestion', (questionData) => {
      this.showQuizScene(questionData);
    });

    this.socket.on('playerAnswered', (data) => {
      // visual feedback that another player answered
      if (this.currentScene && this.currentScene.onPlayerAnswered) {
        this.currentScene.onPlayerAnswered(data);
      }
    });

    this.socket.on('roundResults', (results) => {
      this.score = results.scores[this.playerId] || 0;
      if (this.currentScene && this.currentScene.showResults) {
        this.currentScene.showResults(results);
      }
    });

    this.socket.on('gameEnd', (finalScores) => {
      this.showResultScene(finalScores);
    });

    // show initial waiting screen
    this.showWaitingScreen();
  }

  showWaitingScreen() {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
    }
    
    // simple waiting text for now
    const waitingText = new Text({
      text: 'Waiting for game to start...',
      style: {
        fontSize: 32,
        fill: '#ffffff'
      }
    });
    waitingText.anchor.set(0.5);
    waitingText.x = this.app.screen.width / 2;
    waitingText.y = this.app.screen.height / 2;
    this.app.stage.addChild(waitingText);
  }

  showQuizScene(questionData) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
    }

    this.currentScene = new QuizScene(this.app, questionData, (choiceIndex) => {
      this.submitAnswer(choiceIndex);
    });
    
    this.app.stage.addChild(this.currentScene.container);
  }

  showResultScene(finalScores) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
    }

    this.currentScene = new ResultScene(this.app, finalScores, this.playerId);
    this.app.stage.addChild(this.currentScene.container);
  }

  submitAnswer(choiceIndex) {
    this.socket.emit('submitAnswer', {
      choiceIndex: choiceIndex
    });
  }
}