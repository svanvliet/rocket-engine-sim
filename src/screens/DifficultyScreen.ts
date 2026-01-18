import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';

type Difficulty = 'casual' | 'normal' | 'hard' | 'hardcore';

interface DifficultyOption {
  id: Difficulty;
  name: string;
  description: string;
  color: number;
}

export class DifficultyScreen implements Screen {
  public container: Container;
  private game: Game;
  private initialized = false;
  private selectedDifficulty: Difficulty = 'normal';

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

    // Title
    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    const title = new Text({ text: 'SELECT DIFFICULTY', style: titleStyle });
    title.anchor.set(0.5, 0);
    title.x = width / 2;
    title.y = 60;
    this.container.addChild(title);

    // Difficulty options
    const difficulties: DifficultyOption[] = [
      {
        id: 'casual',
        name: 'Casual',
        description: 'Forgiving failures, no time pressure, simplified physics',
        color: 0x4ecdc4,
      },
      {
        id: 'normal',
        name: 'Normal',
        description: 'Moderate consequences, realistic physics with accessibility',
        color: 0x45b7d1,
      },
      {
        id: 'hard',
        name: 'Hard',
        description: 'Strict consequences, time pressure, complex physics',
        color: 0xff6b35,
      },
      {
        id: 'hardcore',
        name: 'Hardcore',
        description: 'Permadeath - failed test ends the game. For experts only.',
        color: 0xff3333,
      },
    ];

    const cardStartY = 140;
    const cardSpacing = 110;

    difficulties.forEach((diff, index) => {
      const card = this.createDifficultyCard(
        diff,
        width / 2,
        cardStartY + index * cardSpacing
      );
      this.container.addChild(card);
    });

    // Back button
    const backButton = this.createBackButton();
    backButton.x = 100;
    backButton.y = height - 50;
    this.container.addChild(backButton);

    // Start button
    const startButton = this.createStartButton();
    startButton.x = width - 100;
    startButton.y = height - 50;
    this.container.addChild(startButton);
  }

  private createDifficultyCard(
    diff: DifficultyOption,
    x: number,
    y: number
  ): Container {
    const card = new Container();
    card.x = x;
    card.y = y;

    const cardWidth = 500;
    const cardHeight = 90;
    const isSelected = diff.id === this.selectedDifficulty;

    // Card background
    const bg = new Graphics();
    bg.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
    bg.fill({ color: isSelected ? 0x1a1a2e : 0x111111 });
    bg.stroke({ color: isSelected ? diff.color : 0x333333, width: isSelected ? 3 : 1 });
    card.addChild(bg);

    // Difficulty name
    const nameStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: diff.color,
    });
    const name = new Text({ text: diff.name, style: nameStyle });
    name.anchor.set(0, 0.5);
    name.x = -cardWidth / 2 + 20;
    name.y = -15;
    card.addChild(name);

    // Description
    const descStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: 0x888888,
      wordWrap: true,
      wordWrapWidth: cardWidth - 40,
    });
    const desc = new Text({ text: diff.description, style: descStyle });
    desc.anchor.set(0, 0.5);
    desc.x = -cardWidth / 2 + 20;
    desc.y = 18;
    card.addChild(desc);

    // Selection indicator
    if (isSelected) {
      const indicator = new Graphics();
      indicator.circle(cardWidth / 2 - 30, 0, 12);
      indicator.fill({ color: diff.color });
      card.addChild(indicator);

      const check = new Text({ 
        text: '✓', 
        style: new TextStyle({ fontSize: 16, fill: 0xffffff, fontWeight: 'bold' }) 
      });
      check.anchor.set(0.5);
      check.x = cardWidth / 2 - 30;
      check.y = 0;
      card.addChild(check);
    }

    // Make interactive
    card.eventMode = 'static';
    card.cursor = 'pointer';

    card.on('pointerover', () => {
      if (diff.id !== this.selectedDifficulty) {
        bg.clear();
        bg.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        bg.fill({ color: 0x151520 });
        bg.stroke({ color: 0x444444, width: 1 });
      }
    });

    card.on('pointerout', () => {
      if (diff.id !== this.selectedDifficulty) {
        bg.clear();
        bg.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        bg.fill({ color: 0x111111 });
        bg.stroke({ color: 0x333333, width: 1 });
      }
    });

    card.on('pointerdown', () => {
      this.selectedDifficulty = diff.id;
      this.initialized = false;
      this.container.removeChildren();
      this.init();
    });

    return card;
  }

  private createBackButton(): Container {
    const button = new Container();
    const buttonWidth = 120;
    const buttonHeight = 40;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    bg.fill({ color: 0x222222 });
    bg.stroke({ color: 0x444444, width: 1 });
    button.addChild(bg);

    const text = new Text({
      text: '← Back',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xaaaaaa,
      }),
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', () => {
      this.game.switchScreen('mainMenu');
    });

    return button;
  }

  private createStartButton(): Container {
    const button = new Container();
    const buttonWidth = 160;
    const buttonHeight = 45;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    bg.fill({ color: 0xff6b35 });
    button.addChild(bg);

    const text = new Text({
      text: 'Start Game →',
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

    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
      bg.fill({ color: 0xff8c5a });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
      bg.fill({ color: 0xff6b35 });
    });

    button.on('pointerdown', () => {
      // TODO: Store difficulty selection and proceed
      this.game.switchScreen('worldIntro');
    });

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
