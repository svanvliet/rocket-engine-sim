import { 
  ComponentConfig, 
  ComponentType, 
  COMPONENT_DEFINITIONS, 
  EnginePerformance, 
  PhysicsEngine, 
  PROPELLANTS,
  PropellantType 
} from './Physics';

export interface LevelObjective {
  id: string;
  description: string;
  check: (performance: EnginePerformance, state: GameState) => boolean;
  isPrimary: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  budget: number;
  propellant: string;
  objectives: LevelObjective[];
  availableComponents: ComponentType[];
  availableMaterials: string[];
  engineerQuote: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'First Engine Test',
    description: 'Build your first rocket engine and achieve 100 kN of thrust',
    budget: 50000,
    propellant: 'RP1-LOX',
    objectives: [
      {
        id: 'thrust',
        description: 'Achieve 100 kN thrust at sea level',
        check: (p) => p.thrust >= 100,
        isPrimary: true,
      },
      {
        id: 'success',
        description: 'Complete a successful test fire',
        check: (p) => p.isValid && p.thrust > 0,
        isPrimary: true,
      },
      {
        id: 'budget',
        description: 'Stay within budget ($50,000)',
        check: (_p, s) => s.spentBudget <= s.totalBudget,
        isPrimary: false,
      },
    ],
    availableComponents: [
      'combustionChamber',
      'nozzle', 
      'fuelInjector',
      'turbopump',
      'fuelTank',
      'oxidizerTank',
    ],
    availableMaterials: ['steel', 'aluminum'],
    engineerQuote: "Alright rookie, nothing fancy here. Just get the engine to produce 100 kilonewtons of thrust without blowing anything up. Easy, right?",
  },
];

type GameStateListener = (state: GameState) => void;

export class GameState {
  private static instance: GameState;
  
  public currentLevel: LevelConfig;
  public components: ComponentConfig[] = [];
  public totalBudget: number = 50000;
  public spentBudget: number = 0;
  public propellant: PropellantType;
  public performance: EnginePerformance | null = null;
  
  private listeners: Set<GameStateListener> = new Set();
  private componentIdCounter = 0;

  private constructor() {
    this.currentLevel = LEVELS[0];
    this.totalBudget = this.currentLevel.budget;
    this.propellant = PROPELLANTS[this.currentLevel.propellant];
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.recalculate();
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  public addComponent(type: ComponentType, material: string = 'steel'): ComponentConfig {
    const def = COMPONENT_DEFINITIONS[type];
    const config: ComponentConfig = {
      id: `comp_${++this.componentIdCounter}`,
      type,
      material,
      size: 'medium',
      properties: { ...def.defaultProperties },
    };
    this.components.push(config);
    this.notify();
    return config;
  }

  public removeComponent(id: string): void {
    const index = this.components.findIndex(c => c.id === id);
    if (index >= 0) {
      this.components.splice(index, 1);
      this.notify();
    }
  }

  public updateComponent(id: string, updates: Partial<ComponentConfig>): void {
    const component = this.components.find(c => c.id === id);
    if (component) {
      if (updates.material) component.material = updates.material;
      if (updates.size) component.size = updates.size;
      if (updates.properties) {
        component.properties = { ...component.properties, ...updates.properties };
      }
      this.notify();
    }
  }

  public getComponent(id: string): ComponentConfig | undefined {
    return this.components.find(c => c.id === id);
  }

  public hasComponent(type: ComponentType): boolean {
    return this.components.some(c => c.type === type);
  }

  public recalculate(): void {
    this.performance = PhysicsEngine.calculatePerformance(this.components, this.propellant);
    this.spentBudget = this.performance.totalCost;
  }

  public checkObjectives(): { objective: LevelObjective; met: boolean }[] {
    if (!this.performance) this.recalculate();
    return this.currentLevel.objectives.map(obj => ({
      objective: obj,
      met: obj.check(this.performance!, this),
    }));
  }

  public isReadyForTest(): boolean {
    if (!this.performance) this.recalculate();
    return this.performance!.isValid && this.spentBudget <= this.totalBudget;
  }

  public getRemainingBudget(): number {
    return this.totalBudget - this.spentBudget;
  }

  public reset(): void {
    this.components = [];
    this.spentBudget = 0;
    this.performance = null;
    this.componentIdCounter = 0;
    this.notify();
  }

  public loadLevel(levelId: number): void {
    const level = LEVELS.find(l => l.id === levelId);
    if (level) {
      this.currentLevel = level;
      this.totalBudget = level.budget;
      this.propellant = PROPELLANTS[level.propellant];
      this.reset();
    }
  }
}
