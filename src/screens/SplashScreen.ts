import { Container, Graphics, Text } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { Colors, TextStyles, modifyStyle } from '../core/Theme';

export class SplashScreen implements Screen {
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

    // Rocket icon (simple geometric representation)
    const rocket = this.createRocketGraphic();
    rocket.x = width / 2;
    rocket.y = height / 2 - 60;
    this.container.addChild(rocket);

    // Title
    const title = new Text({ text: 'ROCKET ENGINE\nSIMULATOR', style: TextStyles.title });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 + 80;
    this.container.addChild(title);

    // Subtitle
    const subtitleStyle = modifyStyle(TextStyles.subheading, { fill: Colors.textMuted, align: 'center' });
    const subtitle = new Text({ text: 'Design. Build. Test. Launch.', style: subtitleStyle });
    subtitle.anchor.set(0.5);
    subtitle.x = width / 2;
    subtitle.y = height / 2 + 160;
    this.container.addChild(subtitle);

    // Click to continue
    const continueStyle = modifyStyle(TextStyles.body, { fill: Colors.textDark, fontSize: 16 });
    const continueText = new Text({ text: 'Click anywhere to continue', style: continueStyle });
    continueText.anchor.set(0.5);
    continueText.x = width / 2;
    continueText.y = height - 60;
    this.container.addChild(continueText);

    // Make interactive
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', () => this.onContinue());
  }

  private createRocketGraphic(): Container {
    const rocket = new Container();

    // Rocket body
    const body = new Graphics();
    body.roundRect(-20, -60, 40, 100, 8);
    body.fill({ color: Colors.textSecondary });
    rocket.addChild(body);

    // Nose cone
    const nose = new Graphics();
    nose.moveTo(0, -90);
    nose.lineTo(-20, -60);
    nose.lineTo(20, -60);
    nose.closePath();
    nose.fill({ color: Colors.primary });
    rocket.addChild(nose);

    // Fins
    const leftFin = new Graphics();
    leftFin.moveTo(-20, 30);
    leftFin.lineTo(-40, 50);
    leftFin.lineTo(-20, 40);
    leftFin.closePath();
    leftFin.fill({ color: Colors.primary });
    rocket.addChild(leftFin);

    const rightFin = new Graphics();
    rightFin.moveTo(20, 30);
    rightFin.lineTo(40, 50);
    rightFin.lineTo(20, 40);
    rightFin.closePath();
    rightFin.fill({ color: Colors.primary });
    rocket.addChild(rightFin);

    // Engine nozzle
    const nozzle = new Graphics();
    nozzle.moveTo(-15, 40);
    nozzle.lineTo(-20, 55);
    nozzle.lineTo(20, 55);
    nozzle.lineTo(15, 40);
    nozzle.closePath();
    nozzle.fill({ color: 0x444444 });
    rocket.addChild(nozzle);

    // Flame (exhaust)
    const flame = new Graphics();
    flame.moveTo(-15, 55);
    flame.lineTo(0, 100);
    flame.lineTo(15, 55);
    flame.closePath();
    flame.fill({ color: 0xff9500 });
    rocket.addChild(flame);

    const flameInner = new Graphics();
    flameInner.moveTo(-8, 55);
    flameInner.lineTo(0, 85);
    flameInner.lineTo(8, 55);
    flameInner.closePath();
    flameInner.fill({ color: 0xffdd00 });
    rocket.addChild(flameInner);

    return rocket;
  }

  private onContinue(): void {
    this.game.switchScreen('mainMenu');
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
