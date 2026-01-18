import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';

export class DesignScreen implements Screen {
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
    bg.fill({ color: 0x0d0d12 });
    this.container.addChild(bg);

    // Top bar
    const topBar = new Graphics();
    topBar.rect(0, 0, width, 50);
    topBar.fill({ color: 0x111118 });
    this.container.addChild(topBar);

    // Level indicator
    const levelText = new Text({
      text: 'Level 1: First Engine Test',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xffffff,
      }),
    });
    levelText.x = 20;
    levelText.y = 15;
    this.container.addChild(levelText);

    // Budget display
    const budgetText = new Text({
      text: 'Budget: $50,000 / $50,000',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0x4ecdc4,
      }),
    });
    budgetText.anchor.set(1, 0);
    budgetText.x = width - 20;
    budgetText.y = 17;
    this.container.addChild(budgetText);

    // Left panel - Components palette
    const leftPanel = this.createComponentPanel();
    leftPanel.x = 0;
    leftPanel.y = 50;
    this.container.addChild(leftPanel);

    // Right panel - Component properties
    const rightPanel = this.createPropertiesPanel();
    rightPanel.x = width - 250;
    rightPanel.y = 50;
    this.container.addChild(rightPanel);

    // Center - Design canvas
    const canvasArea = this.createDesignCanvas();
    canvasArea.x = 200;
    canvasArea.y = 50;
    this.container.addChild(canvasArea);

    // Bottom bar with actions
    const bottomBar = this.createBottomBar();
    bottomBar.x = 0;
    bottomBar.y = height - 60;
    this.container.addChild(bottomBar);
  }

  private createComponentPanel(): Container {
    const panel = new Container();
    const panelWidth = 200;
    const panelHeight = this.game.height - 110;

    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: 0x111118 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'COMPONENTS',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0x888888,
        letterSpacing: 2,
      }),
    });
    title.x = 15;
    title.y = 15;
    panel.addChild(title);

    // Component categories
    const components = [
      { name: 'Combustion Chamber', cost: '$8,000', icon: '◉' },
      { name: 'Nozzle', cost: '$5,000', icon: '▽' },
      { name: 'Fuel Injector', cost: '$3,000', icon: '⊕' },
      { name: 'Turbopump', cost: '$12,000', icon: '⚙' },
      { name: 'Fuel Tank', cost: '$4,000', icon: '▭' },
      { name: 'Oxidizer Tank', cost: '$4,000', icon: '▭' },
    ];

    components.forEach((comp, index) => {
      const item = this.createComponentItem(comp, panelWidth - 20);
      item.x = 10;
      item.y = 50 + index * 60;
      panel.addChild(item);
    });

    return panel;
  }

  private createComponentItem(
    comp: { name: string; cost: string; icon: string },
    itemWidth: number
  ): Container {
    const item = new Container();
    const itemHeight = 50;

    const bg = new Graphics();
    bg.roundRect(0, 0, itemWidth, itemHeight, 6);
    bg.fill({ color: 0x1a1a2e });
    bg.stroke({ color: 0x333344, width: 1 });
    item.addChild(bg);

    // Icon
    const icon = new Text({
      text: comp.icon,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: 0xff6b35,
      }),
    });
    icon.x = 12;
    icon.y = 12;
    item.addChild(icon);

    // Name
    const name = new Text({
      text: comp.name,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fill: 0xdddddd,
      }),
    });
    name.x = 40;
    name.y = 8;
    item.addChild(name);

    // Cost
    const cost = new Text({
      text: comp.cost,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0x4ecdc4,
      }),
    });
    cost.x = 40;
    cost.y = 28;
    item.addChild(cost);

    item.eventMode = 'static';
    item.cursor = 'pointer';

    item.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, itemWidth, itemHeight, 6);
      bg.fill({ color: 0x2a2a4e });
      bg.stroke({ color: 0xff6b35, width: 1 });
    });

    item.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, itemWidth, itemHeight, 6);
      bg.fill({ color: 0x1a1a2e });
      bg.stroke({ color: 0x333344, width: 1 });
    });

    return item;
  }

  private createPropertiesPanel(): Container {
    const panel = new Container();
    const panelWidth = 250;
    const panelHeight = this.game.height - 110;

    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: 0x111118 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'PROPERTIES',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0x888888,
        letterSpacing: 2,
      }),
    });
    title.x = 15;
    title.y = 15;
    panel.addChild(title);

    // Placeholder
    const placeholder = new Text({
      text: 'Select a component\nto view properties',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0x555555,
        align: 'center',
      }),
    });
    placeholder.anchor.set(0.5);
    placeholder.x = panelWidth / 2;
    placeholder.y = panelHeight / 2;
    panel.addChild(placeholder);

    return panel;
  }

  private createDesignCanvas(): Container {
    const canvas = new Container();
    const canvasWidth = this.game.width - 450;
    const canvasHeight = this.game.height - 110;

    // Grid background
    const grid = new Graphics();
    grid.rect(0, 0, canvasWidth, canvasHeight);
    grid.fill({ color: 0x0a0a10 });

    // Draw grid lines
    const gridSize = 40;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, canvasHeight);
      grid.stroke({ color: 0x1a1a24, width: 1 });
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(canvasWidth, y);
      grid.stroke({ color: 0x1a1a24, width: 1 });
    }
    canvas.addChild(grid);

    // Center instruction
    const instruction = new Text({
      text: 'Drag components here to build your engine',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0x444444,
      }),
    });
    instruction.anchor.set(0.5);
    instruction.x = canvasWidth / 2;
    instruction.y = canvasHeight / 2;
    canvas.addChild(instruction);

    return canvas;
  }

  private createBottomBar(): Container {
    const bar = new Container();
    const { width } = this.game;
    const barHeight = 60;

    const bg = new Graphics();
    bg.rect(0, 0, width, barHeight);
    bg.fill({ color: 0x111118 });
    bar.addChild(bg);

    // Help button
    const helpBtn = this.createActionButton('📖 Help', false);
    helpBtn.x = 120;
    helpBtn.y = barHeight / 2;
    bar.addChild(helpBtn);

    // Test Fire button
    const testBtn = this.createActionButton('🔥 Test Fire', true);
    testBtn.x = width - 120;
    testBtn.y = barHeight / 2;
    testBtn.on('pointerdown', () => this.game.switchScreen('simulation'));
    bar.addChild(testBtn);

    // Current stats
    const stats = new Text({
      text: 'Est. Thrust: -- kN  |  Est. Isp: -- s  |  Mass: -- kg',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0x888888,
      }),
    });
    stats.anchor.set(0.5);
    stats.x = width / 2;
    stats.y = barHeight / 2;
    bar.addChild(stats);

    return bar;
  }

  private createActionButton(label: string, primary: boolean): Container {
    const button = new Container();
    const buttonWidth = 140;
    const buttonHeight = 40;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
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
        fontSize: 14,
        fontWeight: primary ? 'bold' : 'normal',
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
