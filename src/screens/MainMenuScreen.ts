import { Container, Graphics, Text } from 'pixi.js';
import { Screen, Game, ScreenName } from '../core/Game';
import { Colors, TextStyles, modifyStyle } from '../core/Theme';

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
    bg.fill({ color: Colors.background });
    this.container.addChild(bg);

    // Title
    const titleStyle = modifyStyle(TextStyles.title, { fontSize: 42 });
    const title = new Text({ text: 'ROCKET ENGINE SIMULATOR', style: titleStyle });
    title.anchor.set(0.5, 0);
    title.x = width / 2;
    title.y = 80;
    this.container.addChild(title);

    // Subtitle
    const subtitle = new Text({ 
      text: 'Join the scrappy startup racing to the stars', 
      style: TextStyles.quote 
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
    const versionStyle = modifyStyle(TextStyles.labelSmall, { fill: Colors.textDisabled });
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
    bg.fill({ color: enabled ? Colors.panelHover : 0x111111 });
    bg.stroke({ color: enabled ? Colors.primary : 0x333333, width: 2 });
    button.addChild(bg);

    // Button text
    const textStyle = modifyStyle(TextStyles.button, { 
      fontSize: 20,
      fill: enabled ? Colors.textPrimary : Colors.textDark 
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
        bg.stroke({ color: Colors.primaryHover, width: 2 });
      });

      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        bg.fill({ color: Colors.panelHover });
        bg.stroke({ color: Colors.primary, width: 2 });
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
