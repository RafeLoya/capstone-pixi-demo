import { Container, Text, Graphics } from 'pixi.js';
import { ChoiceButton } from '../components/choice-button.js';

export class QuizScene {
  constructor(app, questionData, onAnswerCallback) {
    this.app = app;
    this.questionData = questionData;
    this.onAnswerCallback = onAnswerCallback;
    this.container = new Container();
    this.buttons = [];
    this.selectedChoice = null;
    this.playerIndicators = {};

    this.build();
  }

  build() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // question text
    const questionText = new Text({
      text: this.questionData.question,
      style: {
        fontSize: 28,
        fill: '#ffffff',
        wordWrap: true,
        wordWrapWidth: screenWidth - 100,
        align: 'center'
      }
    });
    questionText.anchor.set(0.5, 0);
    questionText.x = screenWidth / 2;
    questionText.y = 50;
    this.container.addChild(questionText);

    // answer buttons
    const buttonWidth = 400;
    const buttonHeight = 80;
    const startY = 200;
    const spacing = 20;

    this.questionData.choices.forEach((choice, index) => {
      const button = new ChoiceButton(
        choice,
        screenWidth / 2 - buttonWidth / 2,
        startY + (buttonHeight + spacing) * index,
        buttonWidth,
        buttonHeight,
        () => this.selectAnswer(index)
      );
      
      this.buttons.push(button);
      this.container.addChild(button.container);
    });
  }

  selectAnswer(choiceIndex) {
    if (this.selectedChoice !== null) return; // already answered

    this.selectedChoice = choiceIndex;
    this.buttons[choiceIndex].select();
    
    // disable all buttons
    this.buttons.forEach(btn => btn.disable());

    // send to server
    this.onAnswerCallback(choiceIndex);
  }

  onPlayerAnswered(data) {
    // show indicator that another player answered
    // for now, just logging it
    console.log(`Player ${data.playerId} answered`);
  }

  showResults(results) {
    // show correct answer
    const correctIndex = this.questionData.correctAnswer;
    
    this.buttons.forEach((button, index) => {
      if (index === correctIndex) {
        button.showCorrect();
      } else if (index === this.selectedChoice) {
        button.showIncorrect();
      }
      button.disable();
    });

    // show score update
    const scoreText = new Text({
      text: `Score: ${results.scores[results.playerId]} (+${results.pointsEarned || 0})`,
      style: {
        fontSize: 24,
        fill: '#ffffff'
      }
    });
    scoreText.x = 20;
    scoreText.y = 20;
    this.container.addChild(scoreText);
  }
}