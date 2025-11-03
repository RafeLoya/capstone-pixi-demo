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
      
      // hide at first
      button.container.visible = false;
      
      this.buttons.push(button);
      this.container.addChild(button.container);

      // Create container for player indicators on this choice
      const indicatorContainer = new Container();
      indicatorContainer.x = screenWidth / 2 + buttonWidth / 2 + 20;
      indicatorContainer.y = startY + (buttonHeight + spacing) * index + buttonHeight / 2;
      this.container.addChild(indicatorContainer);
      this.playerIndicators[index] = { container: indicatorContainer, count: 0 };
    });

    // reveal choices w/ 10 sec delay
    this.revealChoices();
  }

  revealChoices() {
    this.buttons.forEach((button, index) => {
      setTimeout(() => {
        button.container.visible = true;
      }, 10000 + (index * 10000));
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
    // Show indicator that another player answered
    const choiceIndex = data.choiceIndex;
    const indicator = this.playerIndicators[choiceIndex];
    
    if (!indicator) return;

    // Create a small circle
    const circle = new Graphics();
    circle.beginFill(0x4CAF50); // Green color
    circle.drawCircle(0, 0, 8);
    circle.endFill();
    
    // Position circles in a row
    const spacing = 20;
    circle.x = indicator.count * spacing;
    circle.y = 0;
    
    indicator.container.addChild(circle);
    indicator.count++;
    
    console.log(`Player ${data.playerId} answered choice ${choiceIndex}`);
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