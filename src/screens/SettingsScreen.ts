import { Container, Graphics, Text } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { Colors, TextStyles, modifyStyle } from '../core/Theme';

export class SettingsScreen implements Screen {
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
    bg.fill({ color: Colors.background });
    this.container.addChild(bg);

    // Title
    const title = new Text({ text: 'SETTINGS', style: TextStyles.screenTitle });
    title.anchor.set(0.5, 0);
    title.x = width / 2;
    title.y = 60;
    this.container.addChild(title);

    // Settings panel
    const panelWidth = 500;
    const panelHeight = 400;
    const panelX = (width - panelWidth) / 2;
    const panelY = 130;

    const panel = new Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.fill({ color: 0x111111 });
    panel.stroke({ color: Colors.border, width: 1 });
    this.container.addChild(panel);

    // Settings items
    const settings = [
      { label: 'Graphics Quality', value: 'Medium', options: ['Low', 'Medium', 'High'] },
      { label: 'Master Volume', value: '80%', type: 'slider' },
      { label: 'Music Volume', value: '70%', type: 'slider' },
      { label: 'SFX Volume', value: '100%', type: 'slider' },
      { label: 'Show Advanced Math', value: 'Off', options: ['Off', 'On'] },
    ];

    settings.forEach((setting, index) => {
      const itemY = panelY + 50 + index * 65;
      
      // Label
      const labelStyle = modifyStyle(TextStyles.subheading, { fill: Colors.textSecondary });
      const label = new Text({ text: setting.label, style: labelStyle });
      label.x = panelX + 30;
      label.y = itemY;
      this.container.addChild(label);

      // Value/Control
      const valueStyle = modifyStyle(TextStyles.button, { fontSize: 16, fill: Colors.primary });
      const value = new Text({ text: setting.value, style: valueStyle });
      value.anchor.set(1, 0);
      value.x = panelX + panelWidth - 30;
      value.y = itemY;
      this.container.addChild(value);

      // Divider line
      if (index < settings.length - 1) {
        const divider = new Graphics();
        divider.moveTo(panelX + 20, itemY + 45);
        divider.lineTo(panelX + panelWidth - 20, itemY + 45);
        divider.stroke({ color: 0x222222, width: 1 });
        this.container.addChild(divider);
      }
    });

    // Back button
    const backButton = this.createBackButton();
    backButton.x = width / 2;
    backButton.y = height - 60;
    this.container.addChild(backButton);
  }

  private createBackButton(): Container {
    const button = new Container();
    const buttonWidth = 150;
    const buttonHeight = 45;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    bg.fill({ color: Colors.panelHover });
    bg.stroke({ color: Colors.primary, width: 2 });
    button.addChild(bg);

    const text = new Text({
      text: '← Back',
      style: modifyStyle(TextStyles.button, { fontSize: 18 }),
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
      bg.fill({ color: 0x2a2a4e });
      bg.stroke({ color: Colors.primaryHover, width: 2 });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
      bg.fill({ color: Colors.panelHover });
      bg.stroke({ color: Colors.primary, width: 2 });
    });

    button.on('pointerdown', () => {
      this.game.switchScreen('mainMenu');
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
