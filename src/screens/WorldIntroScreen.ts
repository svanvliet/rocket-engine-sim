import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';

export class WorldIntroScreen implements Screen {
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

    // Background - gradient effect
    const bg = new Graphics();
    bg.rect(0, 0, width, height);
    bg.fill({ color: 0x0a0a0a });
    this.container.addChild(bg);

    // World number
    const worldNumStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fill: 0xff6b35,
      letterSpacing: 4,
    });
    const worldNum = new Text({ text: 'WORLD 1', style: worldNumStyle });
    worldNum.anchor.set(0.5);
    worldNum.x = width / 2;
    worldNum.y = height / 2 - 120;
    this.container.addChild(worldNum);

    // World title
    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 56,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    const title = new Text({ text: 'The Garage', style: titleStyle });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 50;
    this.container.addChild(title);

    // Decorative line
    const line = new Graphics();
    line.moveTo(width / 2 - 100, height / 2 + 10);
    line.lineTo(width / 2 + 100, height / 2 + 10);
    line.stroke({ color: 0xff6b35, width: 2 });
    this.container.addChild(line);

    // Description
    const descStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      fill: 0xaaaaaa,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500,
      lineHeight: 28,
    });
    const desc = new Text({
      text: "Welcome to the team! We're a scrappy rocket startup working out of someone's garage. It's cramped and improvised, but we're enthusiastic.\n\nLet's build our first engine.",
      style: descStyle,
    });
    desc.anchor.set(0.5);
    desc.x = width / 2;
    desc.y = height / 2 + 80;
    this.container.addChild(desc);

    // Continue button
    const continueBtn = this.createContinueButton();
    continueBtn.x = width / 2;
    continueBtn.y = height - 80;
    this.container.addChild(continueBtn);

    // Skip text
    const skipStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: 0x555555,
    });
    const skip = new Text({ text: 'Press any key to continue', style: skipStyle });
    skip.anchor.set(0.5);
    skip.x = width / 2;
    skip.y = height - 30;
    this.container.addChild(skip);

    // Make entire screen clickable
    this.container.eventMode = 'static';
    this.container.on('pointerdown', () => this.continue());
  }

  private createContinueButton(): Container {
    const button = new Container();
    const buttonWidth = 180;
    const buttonHeight = 50;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    bg.fill({ color: 0xff6b35 });
    button.addChild(bg);

    const text = new Text({
      text: 'Continue →',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.fill({ color: 0xff8c5a });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.fill({ color: 0xff6b35 });
    });

    button.on('pointerdown', (e) => {
      e.stopPropagation();
      this.continue();
    });

    return button;
  }

  private continue(): void {
    this.game.switchScreen('levelBrief');
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
