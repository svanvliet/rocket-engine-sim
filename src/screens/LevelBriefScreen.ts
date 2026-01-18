import { Container, Graphics, Text } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { Colors, TextStyles, modifyStyle } from '../core/Theme';

export class LevelBriefScreen implements Screen {
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

    // Level header
    const levelStyle = modifyStyle(TextStyles.levelIndicator, { fontSize: 18, letterSpacing: 2 });
    const level = new Text({ text: 'LEVEL 1', style: levelStyle });
    level.anchor.set(0.5, 0);
    level.x = width / 2;
    level.y = 40;
    this.container.addChild(level);

    // Mission title
    const titleStyle = modifyStyle(TextStyles.screenTitle, { fontSize: 32 });
    const title = new Text({ text: 'First Engine Test', style: titleStyle });
    title.anchor.set(0.5, 0);
    title.x = width / 2;
    title.y = 70;
    this.container.addChild(title);

    // Mission briefing panel
    const panelWidth = 600;
    const panelHeight = 350;
    const panelX = (width - panelWidth) / 2;
    const panelY = 130;

    const panel = new Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.fill({ color: Colors.panel });
    panel.stroke({ color: Colors.border, width: 1 });
    this.container.addChild(panel);

    // Objectives section
    const objectivesLabel = new Text({
      text: 'OBJECTIVES',
      style: TextStyles.panelLabel,
    });
    objectivesLabel.x = panelX + 30;
    objectivesLabel.y = panelY + 25;
    this.container.addChild(objectivesLabel);

    // Primary objective
    const objectives = [
      { text: 'Achieve 100 kN thrust at sea level', primary: true },
      { text: 'Complete a successful test fire', primary: true },
      { text: 'Stay within budget ($50,000)', primary: false },
    ];

    objectives.forEach((obj, index) => {
      const bullet = new Graphics();
      bullet.circle(panelX + 40, panelY + 65 + index * 32, 6);
      bullet.fill({ color: obj.primary ? Colors.primary : Colors.secondary });
      this.container.addChild(bullet);

      const objText = new Text({
        text: obj.text,
        style: modifyStyle(TextStyles.body, { fontSize: 16, fill: Colors.textSecondary }),
      });
      objText.x = panelX + 60;
      objText.y = panelY + 55 + index * 32;
      this.container.addChild(objText);
    });

    // Divider
    const divider = new Graphics();
    divider.moveTo(panelX + 30, panelY + 175);
    divider.lineTo(panelX + panelWidth - 30, panelY + 175);
    divider.stroke({ color: Colors.border, width: 1 });
    this.container.addChild(divider);

    // Available resources section
    const resourcesLabel = new Text({
      text: 'AVAILABLE RESOURCES',
      style: TextStyles.panelLabel,
    });
    resourcesLabel.x = panelX + 30;
    resourcesLabel.y = panelY + 195;
    this.container.addChild(resourcesLabel);

    const resources = [
      { label: 'Budget', value: '$50,000' },
      { label: 'Propellant', value: 'RP-1 / LOX' },
      { label: 'Components', value: 'Basic (Steel, Aluminum)' },
    ];

    resources.forEach((res, index) => {
      const resLabel = new Text({
        text: res.label + ':',
        style: modifyStyle(TextStyles.body, { fontSize: 15, fill: Colors.textMuted }),
      });
      resLabel.x = panelX + 40;
      resLabel.y = panelY + 230 + index * 28;
      this.container.addChild(resLabel);

      const resValue = new Text({
        text: res.value,
        style: modifyStyle(TextStyles.body, { fontSize: 15, fill: Colors.textPrimary }),
      });
      resValue.x = panelX + 160;
      resValue.y = panelY + 230 + index * 28;
      this.container.addChild(resValue);
    });

    // Engineer quote
    const quoteStyle = modifyStyle(TextStyles.quote, { 
      wordWrap: true, 
      wordWrapWidth: panelWidth - 60 
    });
    const quote = new Text({
      text: '"Alright rookie, nothing fancy here. Just get the engine to produce 100 kilonewtons of thrust without blowing anything up. Easy, right?" — Chief Engineer',
      style: quoteStyle,
    });
    quote.x = panelX + 30;
    quote.y = panelY + panelHeight - 60;
    this.container.addChild(quote);

    // Back button
    const backBtn = this.createButton('← Back', false);
    backBtn.x = width / 2 - 120;
    backBtn.y = height - 60;
    backBtn.on('pointerdown', () => this.game.switchScreen('worldIntro'));
    this.container.addChild(backBtn);

    // Start button
    const startBtn = this.createButton('Start Design →', true);
    startBtn.x = width / 2 + 120;
    startBtn.y = height - 60;
    startBtn.on('pointerdown', () => this.game.switchScreen('design'));
    this.container.addChild(startBtn);
  }

  private createButton(label: string, primary: boolean): Container {
    const button = new Container();
    const buttonWidth = 180;
    const buttonHeight = 45;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    if (primary) {
      bg.fill({ color: Colors.primary });
    } else {
      bg.fill({ color: Colors.panelHover });
      bg.stroke({ color: Colors.borderHover, width: 1 });
    }
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: modifyStyle(TextStyles.button, { 
        fontSize: 16, 
        fontWeight: primary ? 'bold' : 'normal',
        fill: primary ? Colors.textPrimary : 0xaaaaaa 
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
