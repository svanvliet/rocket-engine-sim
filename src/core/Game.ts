import { Application, Container } from 'pixi.js';

export type ScreenName = 
  | 'splash'
  | 'mainMenu'
  | 'difficulty'
  | 'worldIntro'
  | 'worldMap'
  | 'levelBrief'
  | 'design'
  | 'simulation'
  | 'results'
  | 'levelComplete'
  | 'settings'
  | 'sandbox';

export interface Screen {
  container: Container;
  init(): Promise<void>;
  show(): void;
  hide(): void;
  update?(delta: number): void;
  destroy(): void;
}

export class Game {
  public app: Application;
  private screens: Map<ScreenName, Screen> = new Map();
  private currentScreen: ScreenName | null = null;
  private static instance: Game;
  private isNavigating = false;

  private constructor() {
    this.app = new Application();
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  public async init(): Promise<void> {
    await this.app.init({
      background: '#0a0a0a',
      resizeTo: window,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.app.canvas);
    }

    // Handle resize
    window.addEventListener('resize', () => this.onResize());

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      if (event.state?.screen) {
        this.navigateToScreen(event.state.screen, false);
      }
    });
  }

  private onResize(): void {
    // PixiJS handles resize via resizeTo, but screens may need to reposition elements
  }

  public registerScreen(name: ScreenName, screen: Screen): void {
    this.screens.set(name, screen);
  }

  public async switchScreen(name: ScreenName, pushHistory = true): Promise<void> {
    await this.navigateToScreen(name, pushHistory);
  }

  private async navigateToScreen(name: ScreenName, pushHistory: boolean): Promise<void> {
    if (this.isNavigating) return;
    this.isNavigating = true;

    try {
      // Hide current screen
      if (this.currentScreen) {
        const current = this.screens.get(this.currentScreen);
        if (current) {
          current.hide();
          this.app.stage.removeChild(current.container);
        }
      }

      // Show new screen
      const next = this.screens.get(name);
      if (next) {
        await next.init();
        this.app.stage.addChild(next.container);
        next.show();
        this.currentScreen = name;

        // Update browser history
        if (pushHistory) {
          history.pushState({ screen: name }, '', `#${name}`);
        }
      }
    } finally {
      this.isNavigating = false;
    }
  }

  public getScreen<T extends Screen>(name: ScreenName): T | undefined {
    return this.screens.get(name) as T | undefined;
  }

  public get width(): number {
    return this.app.screen.width;
  }

  public get height(): number {
    return this.app.screen.height;
  }
}
