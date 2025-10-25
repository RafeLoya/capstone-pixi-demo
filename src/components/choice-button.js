import { Graphics, Text, Container } from 'pixi.js';

export class ChoiceButton {
  constructor(text, x, y, width, height, onClick) {
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;
    this.isSelected = false;
    this.isDisabled = false;
    this.onClick = onClick;

    // Background
    this.bg = new Graphics();
    this.drawBackground('#3498db');
    this.container.addChild(this.bg);

    // Text
    this.label = new Text({
      text: text,
      style: {
        fill: '#ffffff',
        wordWrap: true,
        wordWrapWidth: width - 20
      }
    })
    this.label.anchor.set(0.5);
    this.label.x = width / 2;
    this.label.y = height / 2;
    this.container.addChild(this.label);

    // Make interactive
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    this.container.on('pointerover', () => {
      if (!this.isDisabled) {
        this.drawBackground('#2980b9');
      }
    });

    this.container.on('pointerout', () => {
      if (!this.isDisabled && !this.isSelected) {
        this.drawBackground('#3498db');
      }
    });

    this.container.on('pointerdown', () => {
      if (!this.isDisabled) {
        this.select();
        this.onClick();
      }
    });

    this.width = width;
    this.height = height;
  }

  drawBackground(color) {
    this.bg.clear();
    this.bg.rect(0, 0, this.width, this.height);
    this.bg.fill(color);
    this.bg.stroke({ width: 2, color: '#ecf0f1' });
  }

  select() {
    this.isSelected = true;
    this.drawBackground('#27ae60');
  }

  disable() {
    this.isDisabled = true;
    this.container.cursor = 'default';
    this.drawBackground('#95a5a6');
  }

  showCorrect() {
    this.drawBackground('#27ae60');
  }

  showIncorrect() {
    this.drawBackground('#e74c3c');
  }
}