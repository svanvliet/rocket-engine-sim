import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';

export class SimulationScreen implements Screen {
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
    bg.fill({ color: 0x050508 });
    this.container.addChild(bg);

    // Title bar
    const titleBar = new Graphics();
    titleBar.rect(0, 0, width, 50);
    titleBar.fill({ color: 0x111118 });
    this.container.addChild(titleBar);

    const title = new Text({
      text: '🔥 TEST FIRE SIMULATION',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xff6b35,
      }),
    });
    title.anchor.set(0.5, 0.5);
    title.x = width / 2;
    title.y = 25;
    this.container.addChild(title);

    // Main simulation area
    const simArea = this.createSimulationArea();
    simArea.x = 50;
    simArea.y = 70;
    this.container.addChild(simArea);

    // Right panel - Live metrics
    const metricsPanel = this.createMetricsPanel();
    metricsPanel.x = width - 280;
    metricsPanel.y = 70;
    this.container.addChild(metricsPanel);

    // Bottom control bar
    const controlBar = this.createControlBar();
    controlBar.x = 0;
    controlBar.y = height - 70;
    this.container.addChild(controlBar);
  }

  private createSimulationArea(): Container {
    const area = new Container();
    const areaWidth = this.game.width - 350;
    const areaHeight = this.game.height - 160;

    // Background with subtle gradient feel
    const bg = new Graphics();
    bg.roundRect(0, 0, areaWidth, areaHeight, 8);
    bg.fill({ color: 0x0a0a12 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    area.addChild(bg);

    // Test stand representation
    const standY = areaHeight - 100;

    // Ground/stand
    const stand = new Graphics();
    stand.rect(areaWidth / 2 - 80, standY, 160, 20);
    stand.fill({ color: 0x333333 });
    area.addChild(stand);

    // Engine representation (simple)
    const engine = this.createEngineGraphic();
    engine.x = areaWidth / 2;
    engine.y = standY - 60;
    area.addChild(engine);

    // Countdown display
    const countdown = new Text({
      text: 'T-00:03',
      style: new TextStyle({
        fontFamily: 'Courier New, monospace',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0x00ff88,
      }),
    });
    countdown.anchor.set(0.5);
    countdown.x = areaWidth / 2;
    countdown.y = 80;
    area.addChild(countdown);

    // Status text
    const status = new Text({
      text: 'IGNITION SEQUENCE INITIATED',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xffcc00,
        letterSpacing: 2,
      }),
    });
    status.anchor.set(0.5);
    status.x = areaWidth / 2;
    status.y = 130;
    area.addChild(status);

    return area;
  }

  private createEngineGraphic(): Container {
    const engine = new Container();

    // Combustion chamber
    const chamber = new Graphics();
    chamber.roundRect(-30, -80, 60, 80, 5);
    chamber.fill({ color: 0x555555 });
    chamber.stroke({ color: 0x888888, width: 2 });
    engine.addChild(chamber);

    // Nozzle
    const nozzle = new Graphics();
    nozzle.moveTo(-30, 0);
    nozzle.lineTo(-50, 60);
    nozzle.lineTo(50, 60);
    nozzle.lineTo(30, 0);
    nozzle.closePath();
    nozzle.fill({ color: 0x444444 });
    nozzle.stroke({ color: 0x666666, width: 2 });
    engine.addChild(nozzle);

    // Exhaust flame (animated later)
    const flame = new Graphics();
    flame.moveTo(-40, 60);
    flame.lineTo(0, 180);
    flame.lineTo(40, 60);
    flame.closePath();
    flame.fill({ color: 0xff6600 });
    engine.addChild(flame);

    const flameCore = new Graphics();
    flameCore.moveTo(-25, 60);
    flameCore.lineTo(0, 150);
    flameCore.lineTo(25, 60);
    flameCore.closePath();
    flameCore.fill({ color: 0xffaa00 });
    engine.addChild(flameCore);

    const flameHot = new Graphics();
    flameHot.moveTo(-12, 60);
    flameHot.lineTo(0, 110);
    flameHot.lineTo(12, 60);
    flameHot.closePath();
    flameHot.fill({ color: 0xffffcc });
    engine.addChild(flameHot);

    return engine;
  }

  private createMetricsPanel(): Container {
    const panel = new Container();
    const panelWidth = 260;
    const panelHeight = this.game.height - 160;

    const bg = new Graphics();
    bg.roundRect(0, 0, panelWidth, panelHeight, 8);
    bg.fill({ color: 0x111118 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'LIVE TELEMETRY',
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

    // Metrics
    const metrics = [
      { label: 'Thrust', value: '98.4 kN', target: '100 kN', good: true },
      { label: 'Chamber Pressure', value: '6.8 MPa', target: '7.0 MPa', good: true },
      { label: 'Specific Impulse', value: '311 s', target: '300 s', good: true },
      { label: 'Mass Flow Rate', value: '32.1 kg/s', target: '-', good: true },
      { label: 'Chamber Temp', value: '3,420 K', target: '<3,500 K', good: true },
      { label: 'Nozzle Temp', value: '1,850 K', target: '<2,000 K', good: true },
    ];

    metrics.forEach((metric, index) => {
      const y = 50 + index * 70;

      // Label
      const label = new Text({
        text: metric.label,
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fill: 0x888888,
        }),
      });
      label.x = 15;
      label.y = y;
      panel.addChild(label);

      // Value
      const value = new Text({
        text: metric.value,
        style: new TextStyle({
          fontFamily: 'Courier New, monospace',
          fontSize: 22,
          fontWeight: 'bold',
          fill: metric.good ? 0x00ff88 : 0xff4444,
        }),
      });
      value.x = 15;
      value.y = y + 18;
      panel.addChild(value);

      // Target
      const target = new Text({
        text: 'Target: ' + metric.target,
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 10,
          fill: 0x555555,
        }),
      });
      target.x = 15;
      target.y = y + 48;
      panel.addChild(target);
    });

    return panel;
  }

  private createControlBar(): Container {
    const bar = new Container();
    const { width } = this.game;
    const barHeight = 70;

    const bg = new Graphics();
    bg.rect(0, 0, width, barHeight);
    bg.fill({ color: 0x111118 });
    bar.addChild(bg);

    // Abort button
    const abortBtn = this.createButton('ABORT', 0xff3333, false);
    abortBtn.x = 100;
    abortBtn.y = barHeight / 2;
    abortBtn.on('pointerdown', () => this.game.switchScreen('design'));
    bar.addChild(abortBtn);

    // Results button (would show after test completes)
    const resultsBtn = this.createButton('View Results →', 0xff6b35, true);
    resultsBtn.x = width - 120;
    resultsBtn.y = barHeight / 2;
    resultsBtn.on('pointerdown', () => this.game.switchScreen('results'));
    bar.addChild(resultsBtn);

    // Test progress
    const progress = new Text({
      text: 'Test Progress: 67% | Duration: 20.1s / 30s',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0x888888,
      }),
    });
    progress.anchor.set(0.5);
    progress.x = width / 2;
    progress.y = barHeight / 2;
    bar.addChild(progress);

    return bar;
  }

  private createButton(label: string, color: number, primary: boolean): Container {
    const button = new Container();
    const buttonWidth = primary ? 160 : 120;
    const buttonHeight = 40;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    if (primary) {
      bg.fill({ color });
    } else {
      bg.fill({ color: 0x1a1a2e });
      bg.stroke({ color, width: 2 });
    }
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: primary ? 0xffffff : color,
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
