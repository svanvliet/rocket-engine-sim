import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { GameState } from '../core/GameState';
import { 
  ComponentType, 
  COMPONENT_DEFINITIONS,
  MATERIALS 
} from '../core/Physics';

export class DesignScreen implements Screen {
  public container: Container;
  private game: Game;
  private gameState: GameState;
  private initialized = false;
  
  // UI references for updates
  private budgetText!: Text;
  private statsText!: Text;
  private propertiesPanel!: Container;
  private enginePreview!: Container;
  private componentListPanel!: Container;
  private validationText!: Text;
  private testButton!: Container;
  
  private selectedComponentId: string | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.container = new Container();
    this.game = Game.getInstance();
    this.gameState = GameState.getInstance();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Subscribe to state changes
    this.unsubscribe = this.gameState.subscribe(() => this.onStateChange());

    const { width, height } = this.game;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, width, height);
    bg.fill({ color: 0x0d0d12 });
    this.container.addChild(bg);

    // Top bar
    this.createTopBar();

    // Left panel - Components palette
    const leftPanel = this.createComponentPalette();
    leftPanel.x = 0;
    leftPanel.y = 50;
    this.container.addChild(leftPanel);

    // Center - Engine preview and added components
    const centerPanel = this.createCenterPanel();
    centerPanel.x = 220;
    centerPanel.y = 50;
    this.container.addChild(centerPanel);

    // Right panel - Component properties
    this.propertiesPanel = this.createPropertiesPanel();
    this.propertiesPanel.x = width - 280;
    this.propertiesPanel.y = 50;
    this.container.addChild(this.propertiesPanel);

    // Bottom bar with actions
    const bottomBar = this.createBottomBar();
    bottomBar.x = 0;
    bottomBar.y = height - 70;
    this.container.addChild(bottomBar);

    // Initial state update
    this.onStateChange();
  }

  private createTopBar(): void {
    const { width } = this.game;

    const topBar = new Graphics();
    topBar.rect(0, 0, width, 50);
    topBar.fill({ color: 0x111118 });
    this.container.addChild(topBar);

    // Level indicator
    const levelText = new Text({
      text: `Level ${this.gameState.currentLevel.id}: ${this.gameState.currentLevel.name}`,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    levelText.x = 20;
    levelText.y = 15;
    this.container.addChild(levelText);

    // Budget display
    this.budgetText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0x4ecdc4,
      }),
    });
    this.budgetText.anchor.set(1, 0);
    this.budgetText.x = width - 20;
    this.budgetText.y = 17;
    this.container.addChild(this.budgetText);
  }

  private createComponentPalette(): Container {
    const panel = new Container();
    const panelWidth = 210;
    const panelHeight = this.game.height - 120;

    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: 0x111118 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'ADD COMPONENTS',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0x888888,
        letterSpacing: 2,
      }),
    });
    title.x = 15;
    title.y = 12;
    panel.addChild(title);

    // Component buttons
    const componentTypes: ComponentType[] = [
      'combustionChamber',
      'nozzle',
      'fuelInjector',
      'turbopump',
      'fuelTank',
      'oxidizerTank',
    ];

    componentTypes.forEach((type, index) => {
      const def = COMPONENT_DEFINITIONS[type];
      const hasComponent = this.gameState.hasComponent(type);
      const item = this.createPaletteItem(def, hasComponent, panelWidth - 20);
      item.x = 10;
      item.y = 40 + index * 58;
      panel.addChild(item);
    });

    return panel;
  }

  private createPaletteItem(
    def: typeof COMPONENT_DEFINITIONS[ComponentType],
    hasComponent: boolean,
    itemWidth: number
  ): Container {
    const item = new Container();
    const itemHeight = 50;

    const bgColor = hasComponent ? 0x1a3a1a : 0x1a1a2e;
    const borderColor = hasComponent ? 0x2a5a2a : 0x333344;

    const bg = new Graphics();
    bg.roundRect(0, 0, itemWidth, itemHeight, 6);
    bg.fill({ color: bgColor });
    bg.stroke({ color: borderColor, width: 1 });
    item.addChild(bg);

    // Icon
    const icon = new Text({
      text: def.icon,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: hasComponent ? 0x4ecdc4 : 0xff6b35,
      }),
    });
    icon.x = 10;
    icon.y = 14;
    item.addChild(icon);

    // Name
    const name = new Text({
      text: def.name,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0xdddddd,
      }),
    });
    name.x = 35;
    name.y = 8;
    item.addChild(name);

    // Cost and status
    const statusText = hasComponent ? '✓ Added' : `$${def.baseCost.toLocaleString()}`;
    const status = new Text({
      text: statusText,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fill: hasComponent ? 0x4ecdc4 : 0x888888,
      }),
    });
    status.x = 35;
    status.y = 28;
    item.addChild(status);

    // Add button
    if (!hasComponent) {
      const addBtn = new Graphics();
      addBtn.roundRect(itemWidth - 35, 12, 25, 25, 4);
      addBtn.fill({ color: 0xff6b35 });
      item.addChild(addBtn);

      const plus = new Text({
        text: '+',
        style: new TextStyle({ fontSize: 18, fill: 0xffffff, fontWeight: 'bold' }),
      });
      plus.anchor.set(0.5);
      plus.x = itemWidth - 22;
      plus.y = 24;
      item.addChild(plus);

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
        bg.fill({ color: bgColor });
        bg.stroke({ color: borderColor, width: 1 });
      });

      item.on('pointerdown', () => {
        const comp = this.gameState.addComponent(def.type);
        this.selectedComponentId = comp.id;
        this.refreshUI();
      });
    }

    return item;
  }

  private createCenterPanel(): Container {
    const panel = new Container();
    const panelWidth = this.game.width - 510;
    const panelHeight = this.game.height - 120;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: 0x0a0a10 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'YOUR ENGINE',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0x888888,
        letterSpacing: 2,
      }),
    });
    title.x = 15;
    title.y = 12;
    panel.addChild(title);

    // Engine preview container
    this.enginePreview = new Container();
    this.enginePreview.x = panelWidth / 2;
    this.enginePreview.y = panelHeight / 2 - 20;
    panel.addChild(this.enginePreview);

    // Component list (clickable)
    this.componentListPanel = new Container();
    this.componentListPanel.x = 15;
    this.componentListPanel.y = 40;
    panel.addChild(this.componentListPanel);

    // Validation messages
    this.validationText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0xff6b35,
        wordWrap: true,
        wordWrapWidth: panelWidth - 30,
      }),
    });
    this.validationText.x = 15;
    this.validationText.y = panelHeight - 50;
    panel.addChild(this.validationText);

    return panel;
  }

  private createPropertiesPanel(): Container {
    const panel = new Container();
    const panelWidth = 270;
    const panelHeight = this.game.height - 120;

    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: 0x111118 });
    bg.stroke({ color: 0x2a2a3a, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'COMPONENT PROPERTIES',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0x888888,
        letterSpacing: 2,
      }),
    });
    title.x = 15;
    title.y = 12;
    panel.addChild(title);

    return panel;
  }

  private updatePropertiesPanel(): void {
    // Clear existing content (except background and title)
    while (this.propertiesPanel.children.length > 2) {
      this.propertiesPanel.removeChildAt(2);
    }

    const panelWidth = 270;
    const panelHeight = this.game.height - 120;

    if (!this.selectedComponentId) {
      const placeholder = new Text({
        text: 'Click a component\nin your engine to\nedit its properties',
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fill: 0x555555,
          align: 'center',
          lineHeight: 24,
        }),
      });
      placeholder.anchor.set(0.5);
      placeholder.x = panelWidth / 2;
      placeholder.y = panelHeight / 2;
      this.propertiesPanel.addChild(placeholder);
      return;
    }

    const comp = this.gameState.getComponent(this.selectedComponentId);
    if (!comp) return;

    const def = COMPONENT_DEFINITIONS[comp.type];
    let yPos = 45;

    // Component name
    const nameText = new Text({
      text: def.name,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xff6b35,
      }),
    });
    nameText.x = 15;
    nameText.y = yPos;
    this.propertiesPanel.addChild(nameText);
    yPos += 30;

    // Material selector
    const materialLabel = new Text({
      text: 'Material:',
      style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 12, fill: 0x888888 }),
    });
    materialLabel.x = 15;
    materialLabel.y = yPos;
    this.propertiesPanel.addChild(materialLabel);
    yPos += 20;

    const materials = this.gameState.currentLevel.availableMaterials;
    materials.forEach((matId, index) => {
      const mat = MATERIALS[matId];
      const isSelected = comp.material === matId;
      const btn = this.createMaterialButton(mat.name, isSelected, matId, comp.id);
      btn.x = 15 + index * 85;
      btn.y = yPos;
      this.propertiesPanel.addChild(btn);
    });
    yPos += 45;

    // Property sliders
    for (const [key, range] of Object.entries(def.propertyRanges)) {
      const currentValue = comp.properties[key] || range.min;
      
      const label = new Text({
        text: range.label,
        style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 12, fill: 0x888888 }),
      });
      label.x = 15;
      label.y = yPos;
      this.propertiesPanel.addChild(label);

      const valueText = new Text({
        text: `${currentValue.toFixed(2)} ${range.unit}`,
        style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 12, fill: 0x4ecdc4 }),
      });
      valueText.anchor.set(1, 0);
      valueText.x = panelWidth - 15;
      valueText.y = yPos;
      this.propertiesPanel.addChild(valueText);
      yPos += 22;

      // Slider
      const slider = this.createSlider(
        panelWidth - 30,
        currentValue,
        range.min,
        range.max,
        range.step,
        (value) => {
          this.gameState.updateComponent(comp.id, {
            properties: { [key]: value },
          });
        }
      );
      slider.x = 15;
      slider.y = yPos;
      this.propertiesPanel.addChild(slider);
      yPos += 35;
    }

    // Remove button
    const removeBtn = this.createButton('Remove Component', 0xff4444, false, 240);
    removeBtn.x = panelWidth / 2;
    removeBtn.y = panelHeight - 40;
    removeBtn.on('pointerdown', () => {
      this.gameState.removeComponent(comp.id);
      this.selectedComponentId = null;
      this.refreshUI();
    });
    this.propertiesPanel.addChild(removeBtn);
  }

  private createMaterialButton(name: string, selected: boolean, matId: string, compId: string): Container {
    const btn = new Container();
    const w = 80;
    const h = 30;

    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 4);
    bg.fill({ color: selected ? 0x2a4a2a : 0x1a1a2e });
    bg.stroke({ color: selected ? 0x4ecdc4 : 0x333344, width: 1 });
    btn.addChild(bg);

    const text = new Text({
      text: name.split(' ')[0], // Just first word
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fill: selected ? 0x4ecdc4 : 0xaaaaaa,
      }),
    });
    text.anchor.set(0.5);
    text.x = w / 2;
    text.y = h / 2;
    btn.addChild(text);

    if (!selected) {
      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => {
        this.gameState.updateComponent(compId, { material: matId });
      });
    }

    return btn;
  }

  private createSlider(
    width: number,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void
  ): Container {
    const slider = new Container();
    const height = 20;
    const normalized = (value - min) / (max - min);

    // Track
    const track = new Graphics();
    track.roundRect(0, 8, width, 4, 2);
    track.fill({ color: 0x333344 });
    slider.addChild(track);

    // Fill
    const fill = new Graphics();
    fill.roundRect(0, 8, width * normalized, 4, 2);
    fill.fill({ color: 0xff6b35 });
    slider.addChild(fill);

    // Handle
    const handle = new Graphics();
    handle.circle(width * normalized, 10, 8);
    handle.fill({ color: 0xff6b35 });
    handle.stroke({ color: 0xffffff, width: 2 });
    slider.addChild(handle);

    // Decrease button
    const decBtn = this.createSmallButton('-', 0, 0);
    decBtn.on('pointerdown', () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    });
    slider.addChild(decBtn);

    // Increase button
    const incBtn = this.createSmallButton('+', width + 5, 0);
    incBtn.on('pointerdown', () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    });
    slider.addChild(incBtn);

    // Make track clickable
    track.eventMode = 'static';
    track.cursor = 'pointer';
    track.hitArea = { contains: (x: number, y: number) => x >= 0 && x <= width && y >= 0 && y <= height };
    track.on('pointerdown', (e) => {
      const localX = e.global.x - slider.getGlobalPosition().x;
      const newNormalized = Math.max(0, Math.min(1, localX / width));
      const newValue = min + newNormalized * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      onChange(steppedValue);
    });

    return slider;
  }

  private createSmallButton(label: string, x: number, y: number): Container {
    const btn = new Container();
    btn.x = x - 15;
    btn.y = y;

    const bg = new Graphics();
    bg.circle(0, 10, 10);
    bg.fill({ color: 0x2a2a4e });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({ fontSize: 14, fill: 0xffffff, fontWeight: 'bold' }),
    });
    text.anchor.set(0.5);
    text.x = 0;
    text.y = 10;
    btn.addChild(text);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    return btn;
  }

  private updateComponentList(): void {
    this.componentListPanel.removeChildren();

    const components = this.gameState.components;
    
    if (components.length === 0) {
      const hint = new Text({
        text: '← Add components from the left panel\n\nBuild a complete engine with:\n• Combustion Chamber\n• Nozzle\n• Fuel Injector\n• Turbopump\n• Fuel Tank\n• Oxidizer Tank',
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          fill: 0x555555,
          lineHeight: 22,
        }),
      });
      this.componentListPanel.addChild(hint);
      return;
    }

    components.forEach((comp, index) => {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const isSelected = comp.id === this.selectedComponentId;
      
      const item = new Container();
      item.y = index * 35;

      const bg = new Graphics();
      bg.roundRect(0, 0, 200, 30, 4);
      bg.fill({ color: isSelected ? 0x2a4a6a : 0x1a1a2e });
      bg.stroke({ color: isSelected ? 0x4ecdc4 : 0x333344, width: 1 });
      item.addChild(bg);

      const icon = new Text({
        text: def.icon,
        style: new TextStyle({ fontSize: 14, fill: 0xff6b35 }),
      });
      icon.x = 8;
      icon.y = 6;
      item.addChild(icon);

      const name = new Text({
        text: def.name,
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fill: isSelected ? 0x4ecdc4 : 0xcccccc,
        }),
      });
      name.x = 30;
      name.y = 7;
      item.addChild(name);

      item.eventMode = 'static';
      item.cursor = 'pointer';
      item.on('pointerdown', () => {
        this.selectedComponentId = comp.id;
        this.updatePropertiesPanel();
        this.updateComponentList();
      });

      this.componentListPanel.addChild(item);
    });
  }

  private updateEnginePreview(): void {
    this.enginePreview.removeChildren();
    
    const components = this.gameState.components;
    if (components.length === 0) return;

    // Simple visual representation of engine
    const hasChamber = components.some(c => c.type === 'combustionChamber');
    const hasNozzle = components.some(c => c.type === 'nozzle');
    const hasPump = components.some(c => c.type === 'turbopump');
    const hasInjector = components.some(c => c.type === 'fuelInjector');
    const hasFuelTank = components.some(c => c.type === 'fuelTank');
    const hasOxTank = components.some(c => c.type === 'oxidizerTank');

    let yOffset = -120;

    // Tanks
    if (hasFuelTank || hasOxTank) {
      if (hasFuelTank) {
        const tank = new Graphics();
        tank.roundRect(-50, yOffset, 40, 60, 5);
        tank.fill({ color: 0x8b0000 });
        tank.stroke({ color: 0xcc4444, width: 2 });
        this.enginePreview.addChild(tank);
        
        const label = new Text({ text: 'FUEL', style: new TextStyle({ fontSize: 8, fill: 0xffffff }) });
        label.anchor.set(0.5);
        label.x = -30;
        label.y = yOffset + 30;
        this.enginePreview.addChild(label);
      }
      if (hasOxTank) {
        const tank = new Graphics();
        tank.roundRect(10, yOffset, 40, 60, 5);
        tank.fill({ color: 0x4169e1 });
        tank.stroke({ color: 0x6699ff, width: 2 });
        this.enginePreview.addChild(tank);
        
        const label = new Text({ text: 'LOX', style: new TextStyle({ fontSize: 8, fill: 0xffffff }) });
        label.anchor.set(0.5);
        label.x = 30;
        label.y = yOffset + 30;
        this.enginePreview.addChild(label);
      }
      yOffset += 70;
    }

    // Turbopump
    if (hasPump) {
      const pump = new Graphics();
      pump.circle(0, yOffset + 15, 20);
      pump.fill({ color: 0x444444 });
      pump.stroke({ color: 0x888888, width: 2 });
      this.enginePreview.addChild(pump);
      
      const gear = new Text({ text: '⚙', style: new TextStyle({ fontSize: 20, fill: 0xff6b35 }) });
      gear.anchor.set(0.5);
      gear.x = 0;
      gear.y = yOffset + 15;
      this.enginePreview.addChild(gear);
      yOffset += 45;
    }

    // Injector
    if (hasInjector) {
      const injector = new Graphics();
      injector.rect(-25, yOffset, 50, 15);
      injector.fill({ color: 0x555555 });
      injector.stroke({ color: 0x777777, width: 1 });
      this.enginePreview.addChild(injector);
      yOffset += 20;
    }

    // Combustion chamber
    if (hasChamber) {
      const chamber = new Graphics();
      chamber.roundRect(-30, yOffset, 60, 50, 5);
      chamber.fill({ color: 0x666666 });
      chamber.stroke({ color: 0x999999, width: 2 });
      this.enginePreview.addChild(chamber);
      yOffset += 55;
    }

    // Nozzle
    if (hasNozzle) {
      const nozzle = new Graphics();
      nozzle.moveTo(-30, yOffset);
      nozzle.lineTo(-45, yOffset + 60);
      nozzle.lineTo(45, yOffset + 60);
      nozzle.lineTo(30, yOffset);
      nozzle.closePath();
      nozzle.fill({ color: 0x555555 });
      nozzle.stroke({ color: 0x888888, width: 2 });
      this.enginePreview.addChild(nozzle);
    }
  }

  private createBottomBar(): Container {
    const bar = new Container();
    const { width } = this.game;
    const barHeight = 70;

    const bg = new Graphics();
    bg.rect(0, 0, width, barHeight);
    bg.fill({ color: 0x111118 });
    bar.addChild(bg);

    // Back button
    const backBtn = this.createButton('← Back', 0x444444, false, 100);
    backBtn.x = 70;
    backBtn.y = barHeight / 2;
    backBtn.on('pointerdown', () => this.game.switchScreen('levelBrief'));
    bar.addChild(backBtn);

    // Stats display
    this.statsText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Courier New, monospace',
        fontSize: 14,
        fill: 0x4ecdc4,
      }),
    });
    this.statsText.anchor.set(0.5);
    this.statsText.x = width / 2;
    this.statsText.y = barHeight / 2;
    bar.addChild(this.statsText);

    // Test Fire button
    this.testButton = this.createButton('🔥 Test Fire', 0xff6b35, true, 150);
    this.testButton.x = width - 100;
    this.testButton.y = barHeight / 2;
    this.testButton.on('pointerdown', () => {
      if (this.gameState.isReadyForTest()) {
        this.game.switchScreen('simulation');
      }
    });
    bar.addChild(this.testButton);

    return bar;
  }

  private createButton(label: string, color: number, primary: boolean, buttonWidth: number): Container {
    const button = new Container();
    const buttonHeight = 40;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 6);
    if (primary) {
      bg.fill({ color });
    } else {
      bg.fill({ color: 0x1a1a2e });
      bg.stroke({ color, width: 1 });
    }
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: primary ? 'bold' : 'normal',
        fill: primary ? 0xffffff : color,
      }),
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    return button;
  }

  private onStateChange(): void {
    if (!this.initialized) return;
    
    // Update budget display
    const remaining = this.gameState.getRemainingBudget();
    const total = this.gameState.totalBudget;
    const spent = this.gameState.spentBudget;
    const budgetColor = remaining >= 0 ? 0x4ecdc4 : 0xff4444;
    this.budgetText.text = `Budget: $${spent.toLocaleString()} / $${total.toLocaleString()}`;
    this.budgetText.style.fill = budgetColor;

    // Update stats
    const perf = this.gameState.performance;
    if (perf && perf.isValid) {
      this.statsText.text = `Thrust: ${perf.thrust.toFixed(1)} kN  |  Isp: ${perf.specificImpulse.toFixed(0)} s  |  Mass: ${perf.totalMass.toFixed(0)} kg`;
      this.statsText.style.fill = 0x4ecdc4;
    } else {
      this.statsText.text = 'Add all required components to see performance';
      this.statsText.style.fill = 0x888888;
    }

    // Update validation messages
    if (perf && !perf.isValid) {
      this.validationText.text = '⚠ ' + perf.validationErrors.join('\n⚠ ');
    } else if (remaining < 0) {
      this.validationText.text = '⚠ Over budget! Remove or downgrade components.';
    } else if (perf && perf.thrust < 100) {
      this.validationText.text = `ℹ Current thrust: ${perf.thrust.toFixed(1)} kN (need 100 kN)`;
    } else {
      this.validationText.text = '';
    }

    // Update engine preview
    this.updateEnginePreview();
    this.updateComponentList();
    this.updatePropertiesPanel();
  }

  private refreshUI(): void {
    // Full refresh of left panel
    this.container.removeChildren();
    this.initialized = false;
    this.init();
  }

  public show(): void {
    this.container.visible = true;
  }

  public hide(): void {
    this.container.visible = false;
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.container.destroy({ children: true });
  }
}
