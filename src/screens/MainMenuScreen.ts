import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game, ScreenName } from '../core/Game';

interface MenuButton {
  label: string;
  target: ScreenName | null;
  enabled: boolean;
}

export class MainMenuScreen implements Screen {
  public container: Container;
  private game: Game;
  private initialized = false;
  private buttons: Container[] = [];

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
      fontSize: 42,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    const title = new Text({ text: 'ROCKET ENGINE SIMULATOR', style: titleStyle });
    title.anchor.set(0.5, 0);
    title.x = width / 2;
    title.y = 80;
    this.container.addChild(title);

    // Subtitle
    const subtitleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: 0x888888,
      fontStyle: 'italic',
    });
    const subtitle = new Text({ 
      text: 'Join the scrappy startup racing to the stars', 
      style: subtitleStyle 
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.x = width / 2;
    subtitle.y = 135;
    this.container.addChild(subtitle);

    // Menu buttons
    const menuItems: MenuButton[] = [
      { label: 'New Game', target: 'difficulty', enabled: true },
      { label: 'Continue', target: null, enabled: false },
      { label: 'Level Select', target: 'worldMap', enabled: false },
      { label: 'Sandbox Mode', target: 'sandbox', enabled: false },
      { label: 'Settings', target: 'settings', enabled: true },
    ];

    const buttonStartY = 220;
    const buttonSpacing = 70;

    menuItems.forEach((item, index) => {
      const button = this.createButton(
        item.label,
        width / 2,
        buttonStartY + index * buttonSpacing,
        item.enabled,
        item.target
      );
      this.buttons.push(button);
      this.container.addChild(button);
    });

    // Version text
    const versionStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      fill: 0x444444,
    });
    const version = new Text({ text: 'v0.1.0 - MVP', style: versionStyle });
    version.anchor.set(0, 1);
    version.x = 20;
    version.y = height - 20;
    this.container.addChild(version);

    // Credits
    const credits = new Text({ text: 'An open source game', style: versionStyle });
    credits.anchor.set(1, 1);
    credits.x = width - 20;
    credits.y = height - 20;
    this.container.addChild(credits);
  }

  private createButton(
    label: string,
    x: number,
    y: number,
    enabled: boolean,
    target: ScreenName | null
  ): Container {
    const button = new Container();
    button.x = x;
    button.y = y;

    const buttonWidth = 280;
    const buttonHeight = 50;

    // Button background
    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    bg.fill({ color: enabled ? 0x1a1a2e : 0x111111 });
    bg.stroke({ color: enabled ? 0xff6b35 : 0x333333, width: 2 });
    button.addChild(bg);

    // Button text
    const textStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: enabled ? 0xffffff : 0x555555,
    });
    const text = new Text({ text: label, style: textStyle });
    text.anchor.set(0.5);
    button.addChild(text);

    if (enabled && target) {
      button.eventMode = 'static';
      button.cursor = 'pointer';

      button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        bg.fill({ color: 0x2a2a4e });
        bg.stroke({ color: 0xff8c5a, width: 2 });
      });

      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        bg.fill({ color: 0x1a1a2e });
        bg.stroke({ color: 0xff6b35, width: 2 });
      });

      button.on('pointerdown', () => {
        this.game.switchScreen(target);
      });
    }

    return button;
  }

  public show(): void {
    this.container.visible = true;
    this.container.alpha = 1;
  }

  public hide(): void {
    this.container.visible = false;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
