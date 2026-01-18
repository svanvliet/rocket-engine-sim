import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Screen, Game } from '../core/Game';
import { GameState } from '../core/GameState';
import { 
  ComponentType, 
  COMPONENT_DEFINITIONS,
  MATERIALS 
} from '../core/Physics';
import { Colors, TextStyles, Fonts, UI, modifyStyle } from '../core/Theme';

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
    topBar.fill({ color: Colors.panel });
    this.container.addChild(topBar);

    // Level indicator
    const levelText = new Text({
      text: `Level ${this.gameState.currentLevel.id}: ${this.gameState.currentLevel.name}`,
      style: TextStyles.subheading,
    });
    levelText.x = UI.spacing.lg;
    levelText.y = 15;
    this.container.addChild(levelText);

    // Budget display
    this.budgetText = new Text({
      text: '',
      style: modifyStyle(TextStyles.value, { fontSize: 14 }),
    });
    this.budgetText.anchor.set(1, 0);
    this.budgetText.x = width - UI.spacing.lg;
    this.budgetText.y = 17;
    this.container.addChild(this.budgetText);
  }

  private createComponentPalette(): Container {
    const panel = new Container();
    const panelWidth = 210;
    const panelHeight = this.game.height - 120;

    const bg = new Graphics();
    bg.rect(0, 0, panelWidth, panelHeight);
    bg.fill({ color: Colors.panel });
    bg.stroke({ color: Colors.border, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'ADD COMPONENTS',
      style: TextStyles.panelLabel,
    });
    title.x = UI.spacing.md;
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

    const bgColor = hasComponent ? Colors.successDark : Colors.panelHover;
    const borderColor = hasComponent ? 0x2a5a2a : Colors.borderLight;

    const bg = new Graphics();
    bg.roundRect(0, 0, itemWidth, itemHeight, UI.borderRadius.medium);
    bg.fill({ color: bgColor });
    bg.stroke({ color: borderColor, width: 1 });
    item.addChild(bg);

    // Icon
    const icon = new Text({
      text: def.icon,
      style: modifyStyle(TextStyles.icon, { 
        fill: hasComponent ? Colors.secondary : Colors.primary 
      }),
    });
    icon.x = 10;
    icon.y = 14;
    item.addChild(icon);

    // Name
    const name = new Text({
      text: def.name,
      style: TextStyles.bodySmall,
    });
    name.x = 35;
    name.y = 8;
    item.addChild(name);

    // Cost and status
    const statusText = hasComponent ? '✓ Added' : `$${def.baseCost.toLocaleString()}`;
    const status = new Text({
      text: statusText,
      style: modifyStyle(TextStyles.labelSmall, {
        fill: hasComponent ? Colors.secondary : Colors.textMuted,
        fontSize: 10,
      }),
    });
    status.x = 35;
    status.y = 28;
    item.addChild(status);

    // Add button
    if (!hasComponent) {
      const addBtn = new Graphics();
      addBtn.roundRect(itemWidth - 35, 12, 25, 25, UI.borderRadius.small);
      addBtn.fill({ color: Colors.primary });
      item.addChild(addBtn);

      const plus = new Text({
        text: '+',
        style: new TextStyle({ 
          fontFamily: Fonts.body, 
          fontSize: 18, 
          fill: Colors.textPrimary, 
          fontWeight: 'bold' 
        }),
      });
      plus.anchor.set(0.5);
      plus.x = itemWidth - 22;
      plus.y = 24;
      item.addChild(plus);

      item.eventMode = 'static';
      item.cursor = 'pointer';

      item.on('pointerover', () => {
        bg.clear();
        bg.roundRect(0, 0, itemWidth, itemHeight, UI.borderRadius.medium);
        bg.fill({ color: 0x2a2a4e });
        bg.stroke({ color: Colors.primary, width: 1 });
      });

      item.on('pointerout', () => {
        bg.clear();
        bg.roundRect(0, 0, itemWidth, itemHeight, UI.borderRadius.medium);
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
    bg.fill({ color: Colors.background });
    bg.stroke({ color: Colors.border, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'YOUR ENGINE',
      style: TextStyles.panelLabel,
    });
    title.x = UI.spacing.md;
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
      style: modifyStyle(TextStyles.body, {
        fill: Colors.primary,
        wordWrap: true,
        wordWrapWidth: panelWidth - 30,
      }),
    });
    this.validationText.x = UI.spacing.md;
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
    bg.fill({ color: Colors.panel });
    bg.stroke({ color: Colors.border, width: 1 });
    panel.addChild(bg);

    // Title
    const title = new Text({
      text: 'COMPONENT PROPERTIES',
      style: TextStyles.panelLabel,
    });
    title.x = UI.spacing.md;
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
        style: modifyStyle(TextStyles.body, {
          fill: Colors.textMuted,
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
      style: modifyStyle(TextStyles.subheading, { fill: Colors.primary }),
    });
    nameText.x = UI.spacing.md;
    nameText.y = yPos;
    this.propertiesPanel.addChild(nameText);
    yPos += 30;

    // Material selector
    const materialLabel = new Text({
      text: 'Material:',
      style: TextStyles.label,
    });
    materialLabel.x = UI.spacing.md;
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
        style: TextStyles.label,
      });
      label.x = UI.spacing.md;
      label.y = yPos;
      this.propertiesPanel.addChild(label);

      const valueText = new Text({
        text: `${currentValue.toFixed(2)} ${range.unit}`,
        style: TextStyles.value,
      });
      valueText.anchor.set(1, 0);
      valueText.x = panelWidth - UI.spacing.md;
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
      slider.x = UI.spacing.md;
      slider.y = yPos;
      this.propertiesPanel.addChild(slider);
      yPos += 35;
    }

    // Remove button
    const removeBtn = this.createButton('Remove Component', Colors.danger, false, 240);
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
    bg.roundRect(0, 0, w, h, UI.borderRadius.small);
    bg.fill({ color: selected ? Colors.successDark : Colors.panelHover });
    bg.stroke({ color: selected ? Colors.secondary : Colors.borderLight, width: 1 });
    btn.addChild(bg);

    const text = new Text({
      text: name.split(' ')[0], // Just first word
      style: modifyStyle(TextStyles.labelSmall, {
        fill: selected ? Colors.secondary : Colors.textSecondary,
        fontSize: 10,
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
    const trackWidth = width - 50; // Leave room for +/- buttons
    const normalized = (value - min) / (max - min);

    // Track background
    const track = new Graphics();
    track.roundRect(25, 8, trackWidth, 4, 2);
    track.fill({ color: Colors.borderLight });
    slider.addChild(track);

    // Filled portion
    const fill = new Graphics();
    fill.roundRect(25, 8, trackWidth * normalized, 4, 2);
    fill.fill({ color: Colors.primary });
    slider.addChild(fill);

    // Handle
    const handle = new Graphics();
    handle.circle(25 + trackWidth * normalized, 10, 8);
    handle.fill({ color: Colors.primary });
    handle.stroke({ color: Colors.textPrimary, width: 2 });
    slider.addChild(handle);

    // Make handle draggable
    handle.eventMode = 'static';
    handle.cursor = 'grab';
    
    let isDragging = false;
    
    const updateFromX = (globalX: number) => {
      const sliderGlobalX = slider.getGlobalPosition().x;
      const localX = globalX - sliderGlobalX - 25; // Offset for left button
      const newNormalized = Math.max(0, Math.min(1, localX / trackWidth));
      const rawValue = min + newNormalized * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onChange(clampedValue);
    };
    
    handle.on('pointerdown', (e) => {
      isDragging = true;
      handle.cursor = 'grabbing';
      e.stopPropagation();
    });
    
    handle.on('globalpointermove', (e) => {
      if (isDragging) {
        updateFromX(e.global.x);
      }
    });
    
    handle.on('pointerup', () => {
      isDragging = false;
      handle.cursor = 'grab';
    });
    
    handle.on('pointerupoutside', () => {
      isDragging = false;
      handle.cursor = 'grab';
    });

    // Make track clickable
    track.eventMode = 'static';
    track.cursor = 'pointer';
    track.on('pointerdown', (e) => {
      updateFromX(e.global.x);
    });

    // Decrease button
    const decBtn = this.createSmallButton('-', 5, 10);
    decBtn.on('pointerdown', () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    });
    slider.addChild(decBtn);

    // Increase button  
    const incBtn = this.createSmallButton('+', width - 5, 10);
    incBtn.on('pointerdown', () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    });
    slider.addChild(incBtn);

    return slider;
  }

  private createSmallButton(label: string, x: number, y: number): Container {
    const btn = new Container();
    btn.x = x;
    btn.y = y;

    const bg = new Graphics();
    bg.circle(0, 10, 10);
    bg.fill({ color: Colors.panelHover });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({ 
        fontFamily: Fonts.body,
        fontSize: 14, 
        fill: Colors.textPrimary, 
        fontWeight: 'bold' 
      }),
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
        style: modifyStyle(TextStyles.body, {
          fill: Colors.textMuted,
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
      bg.roundRect(0, 0, 200, 30, UI.borderRadius.small);
      bg.fill({ color: isSelected ? 0x2a4a6a : Colors.panelHover });
      bg.stroke({ color: isSelected ? Colors.secondary : Colors.borderLight, width: 1 });
      item.addChild(bg);

      const icon = new Text({
        text: def.icon,
        style: modifyStyle(TextStyles.icon, { fontSize: 14, fill: Colors.primary }),
      });
      icon.x = 8;
      icon.y = 6;
      item.addChild(icon);

      const name = new Text({
        text: def.name,
        style: modifyStyle(TextStyles.bodySmall, {
          fill: isSelected ? Colors.secondary : Colors.textSecondary,
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
        
        const label = new Text({ 
          text: 'FUEL', 
          style: modifyStyle(TextStyles.labelSmall, { fontSize: 8, fill: Colors.textPrimary }) 
        });
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
        
        const label = new Text({ 
          text: 'LOX', 
          style: modifyStyle(TextStyles.labelSmall, { fontSize: 8, fill: Colors.textPrimary }) 
        });
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
      
      const gear = new Text({ 
        text: '⚙', 
        style: modifyStyle(TextStyles.icon, { fontSize: 20, fill: Colors.primary }) 
      });
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
    bg.fill({ color: Colors.panel });
    bar.addChild(bg);

    // Back button
    const backBtn = this.createButton('← Back', Colors.textMuted, false, 100);
    backBtn.x = 70;
    backBtn.y = barHeight / 2;
    backBtn.on('pointerdown', () => this.game.switchScreen('levelBrief'));
    bar.addChild(backBtn);

    // Stats display
    this.statsText = new Text({
      text: '',
      style: TextStyles.statValue,
    });
    this.statsText.anchor.set(0.5);
    this.statsText.x = width / 2;
    this.statsText.y = barHeight / 2;
    bar.addChild(this.statsText);

    // Test Fire button
    this.testButton = this.createButton('🔥 Test Fire', Colors.primary, true, 150);
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
    const buttonHeight = UI.buttonHeight;

    const bg = new Graphics();
    bg.roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, UI.borderRadius.medium);
    if (primary) {
      bg.fill({ color });
    } else {
      bg.fill({ color: Colors.panelHover });
      bg.stroke({ color, width: 1 });
    }
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: Fonts.body,
        fontSize: 14,
        fontWeight: primary ? 'bold' : 'normal',
        fill: primary ? Colors.textPrimary : color,
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
    const budgetColor = remaining >= 0 ? Colors.secondary : Colors.danger;
    this.budgetText.text = `Budget: $${spent.toLocaleString()} / $${total.toLocaleString()}`;
    this.budgetText.style.fill = budgetColor;

    // Update stats
    const perf = this.gameState.performance;
    if (perf && perf.isValid) {
      const twrColor = perf.thrustToWeight >= 1.2 ? '✓' : '⚠';
      this.statsText.text = `Thrust: ${perf.thrust.toFixed(1)} kN | T/W: ${perf.thrustToWeight.toFixed(2)} ${twrColor} | Isp: ${perf.specificImpulse.toFixed(0)}s | Mass: ${perf.totalMass.toFixed(0)} kg`;
      this.statsText.style.fill = perf.thrustToWeight >= 1.2 && perf.thrust >= 100 ? Colors.secondary : Colors.warning;
    } else {
      this.statsText.text = 'Add all required components to see performance';
      this.statsText.style.fill = Colors.textMuted;
    }

    // Update validation messages
    const messages: string[] = [];
    
    if (perf && !perf.isValid && perf.validationErrors.length > 0) {
      messages.push(...perf.validationErrors.map(e => `⚠ ${e}`));
    }
    
    if (perf && perf.warnings && perf.warnings.length > 0) {
      messages.push(...perf.warnings.map(w => `ℹ ${w}`));
    }
    
    if (remaining < 0) {
      messages.push('⚠ Over budget! Remove or downgrade components.');
    }
    
    if (perf && perf.isValid) {
      if (perf.thrust < 100) {
        messages.push(`ℹ Need more thrust: ${perf.thrust.toFixed(1)} kN / 100 kN`);
      }
      if (perf.thrustToWeight < 1.2) {
        messages.push(`ℹ T/W too low: ${perf.thrustToWeight.toFixed(2)} / 1.2 - reduce weight or increase thrust`);
      }
    }
    
    this.validationText.text = messages.join('\n');

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
