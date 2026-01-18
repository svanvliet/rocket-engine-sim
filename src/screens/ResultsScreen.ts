import { Container, Graphics, Text } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { Colors, TextStyles, modifyStyle } from '../core/Theme';

export class ResultsScreen implements Screen {
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

    // Success banner
    const banner = new Graphics();
    banner.rect(0, 60, width, 80);
    banner.fill({ color: Colors.successDark });
    this.container.addChild(banner);

    const successText = new Text({
      text: '✓ TEST SUCCESSFUL',
      style: modifyStyle(TextStyles.screenTitle, { fontSize: 32, fill: Colors.success }),
    });
    successText.anchor.set(0.5);
    successText.x = width / 2;
    successText.y = 100;
    this.container.addChild(successText);

    // Results panel
    const panelWidth = 600;
    const panelHeight = 350;
    const panelX = (width - panelWidth) / 2;
    const panelY = 170;

    const panel = new Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.fill({ color: Colors.panel });
    panel.stroke({ color: Colors.border, width: 1 });
    this.container.addChild(panel);

    // Objectives completion
    const objectivesTitle = new Text({
      text: 'OBJECTIVES',
      style: TextStyles.panelLabel,
    });
    objectivesTitle.x = panelX + 30;
    objectivesTitle.y = panelY + 20;
    this.container.addChild(objectivesTitle);

    const objectives = [
      { text: 'Achieve 100 kN thrust at sea level', achieved: true, value: '98.4 kN' },
      { text: 'Complete a successful test fire', achieved: true, value: '30.0s' },
      { text: 'Stay within budget ($50,000)', achieved: true, value: '$36,000 spent' },
    ];

    objectives.forEach((obj, index) => {
      const y = panelY + 55 + index * 40;

      // Check mark or X
      const icon = new Text({
        text: obj.achieved ? '✓' : '✗',
        style: modifyStyle(TextStyles.button, { fontSize: 20, fill: obj.achieved ? Colors.success : Colors.error }),
      });
      icon.x = panelX + 30;
      icon.y = y;
      this.container.addChild(icon);

      // Objective text
      const text = new Text({
        text: obj.text,
        style: modifyStyle(TextStyles.body, { fontSize: 16, fill: obj.achieved ? Colors.textSecondary : Colors.textDark }),
      });
      text.x = panelX + 60;
      text.y = y + 2;
      this.container.addChild(text);

      // Value
      const value = new Text({
        text: obj.value,
        style: modifyStyle(TextStyles.body, { fill: obj.achieved ? Colors.success : Colors.error }),
      });
      value.anchor.set(1, 0);
      value.x = panelX + panelWidth - 30;
      value.y = y + 2;
      this.container.addChild(value);
    });

    // Divider
    const divider = new Graphics();
    divider.moveTo(panelX + 30, panelY + 180);
    divider.lineTo(panelX + panelWidth - 30, panelY + 180);
    divider.stroke({ color: Colors.border, width: 1 });
    this.container.addChild(divider);

    // Performance metrics
    const metricsTitle = new Text({
      text: 'PERFORMANCE SUMMARY',
      style: TextStyles.panelLabel,
    });
    metricsTitle.x = panelX + 30;
    metricsTitle.y = panelY + 200;
    this.container.addChild(metricsTitle);

    const metrics = [
      { label: 'Peak Thrust', value: '101.2 kN' },
      { label: 'Avg Thrust', value: '98.4 kN' },
      { label: 'Specific Impulse', value: '311 s' },
      { label: 'Test Duration', value: '30.0 s' },
      { label: 'Propellant Used', value: '963 kg' },
      { label: 'Budget Remaining', value: '$14,000' },
    ];

    const colWidth = (panelWidth - 60) / 3;
    metrics.forEach((metric, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = panelX + 30 + col * colWidth;
      const y = panelY + 235 + row * 50;

      const label = new Text({
        text: metric.label,
        style: modifyStyle(TextStyles.labelSmall, { fill: Colors.textDark }),
      });
      label.x = x;
      label.y = y;
      this.container.addChild(label);

      const value = new Text({
        text: metric.value,
        style: modifyStyle(TextStyles.subheading, { fill: Colors.textPrimary }),
      });
      value.x = x;
      value.y = y + 18;
      this.container.addChild(value);
    });

    // Action buttons
    const backBtn = this.createButton('← Back to Design', false);
    backBtn.x = width / 2 - 140;
    backBtn.y = height - 60;
    backBtn.on('pointerdown', () => this.game.switchScreen('design'));
    this.container.addChild(backBtn);

    const continueBtn = this.createButton('Complete Level →', true);
    continueBtn.x = width / 2 + 140;
    continueBtn.y = height - 60;
    continueBtn.on('pointerdown', () => this.game.switchScreen('levelComplete'));
    this.container.addChild(continueBtn);
  }

  private createButton(label: string, primary: boolean): Container {
    const button = new Container();
    const buttonWidth = 200;
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
