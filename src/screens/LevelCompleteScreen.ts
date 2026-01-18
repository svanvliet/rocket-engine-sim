import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';

export class LevelCompleteScreen implements Screen {
  public container: Container;
  private game: Game;
  private initialized = false;

  constructor() {
    this.container = new Container();
    this.game = Game.getInstance();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const { width, height } = this.game;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, width, height);
    bg.fill({ color: 0x0a0a0a });
    this.container.addChild(bg);

    // Celebration graphic
    const stars = this.createStars();
    stars.x = width / 2;
    stars.y = height / 2 - 100;
    this.container.addChild(stars);

    // Level complete text
    const completeStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      fill: 0xff6b35,
      letterSpacing: 4,
    });
    const complete = new Text({ text: 'LEVEL COMPLETE', style: completeStyle });
    complete.anchor.set(0.5);
    complete.x = width / 2;
    complete.y = height / 2 - 20;
    this.container.addChild(complete);

    // Level title
    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    const title = new Text({ text: 'First Engine Test', style: titleStyle });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 + 30;
    this.container.addChild(title);

    // Rating stars
    const ratingContainer = new Container();
    ratingContainer.x = width / 2;
    ratingContainer.y = height / 2 + 100;
    for (let i = 0; i < 3; i++) {
      const star = new Text({
        text: '★',
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 48,
          fill: i < 3 ? 0xffdd00 : 0x333333,
        }),
      });
      star.anchor.set(0.5);
      star.x = (i - 1) * 60;
      ratingContainer.addChild(star);
    }
    this.container.addChild(ratingContainer);

    // Stats summary
    const statsStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: 0x888888,
      align: 'center',
    });
    const stats = new Text({
      text: 'Budget Carried Over: $14,000\nTotal Time: 4m 32s',
      style: statsStyle,
    });
    stats.anchor.set(0.5);
    stats.x = width / 2;
    stats.y = height / 2 + 170;
    this.container.addChild(stats);

    // Unlocks
    const unlocksLabel = new Text({
      text: 'NEW UNLOCKS',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0x4ecdc4,
        letterSpacing: 2,
      }),
    });
    unlocksLabel.anchor.set(0.5);
    unlocksLabel.x = width / 2;
    unlocksLabel.y = height / 2 + 220;
    this.container.addChild(unlocksLabel);

    const unlocks = new Text({
      text: '🔓 Advanced Nozzle Designs   🔓 Aluminum Materials',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0xaaaaaa,
      }),
    });
    unlocks.anchor.set(0.5);
    unlocks.x = width / 2;
    unlocks.y = height / 2 + 250;
    this.container.addChild(unlocks);

    // Continue button
    const continueBtn = this.createButton('Continue to Next Level →', true);
    continueBtn.x = width / 2;
    continueBtn.y = height - 60;
    continueBtn.on('pointerdown', () => this.game.switchScreen('levelBrief'));
    this.container.addChild(continueBtn);
  }

  private createStars(): Container {
    const container = new Container();

    // Simple star burst effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const line = new Graphics();
      line.moveTo(0, 0);
      line.lineTo(Math.cos(angle) * 60, Math.sin(angle) * 60);
      line.stroke({ color: 0xff6b35, width: 2, alpha: 0.5 });
      container.addChild(line);
    }

    // Center circle
    const circle = new Graphics();
    circle.circle(0, 0, 30);
    circle.fill({ color: 0xff6b35 });
    container.addChild(circle);

    const check = new Text({
      text: '✓',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    check.anchor.set(0.5);
    container.addChild(check);

    return container;
  }

  private createButton(label: string, primary: boolean): Container {
    const button = new Container();
    const buttonWidth = 280;
    const buttonHeight = 50;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    if (primary) {
      bg.fill({ color: 0xff6b35 });
    } else {
      bg.fill({ color: 0x1a1a2e });
      bg.stroke({ color: 0x444444, width: 1 });
    }
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    return button;
  }

  public show(): void {
    this.container.visible = true;
  }

  public hide(): void {
    this.container.visible = false;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
