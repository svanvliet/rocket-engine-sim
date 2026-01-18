// Rocket engine physics calculations
// Based on real rocket science principles
// References: 
// - Sutton & Biblarz "Rocket Propulsion Elements"
// - NASA technical reports on liquid rocket engines

export interface PropellantType {
  name: string;
  fuelName: string;
  oxidizerName: string;
  specificImpulseVacuum: number; // seconds (real-world values)
  specificImpulseSeaLevel: number; // seconds
  densityFuel: number; // kg/m³
  densityOxidizer: number; // kg/m³
  optimalMixtureRatio: number; // O/F ratio (mass of oxidizer / mass of fuel)
  combustionTemp: number; // Kelvin (adiabatic flame temperature)
  characteristicVelocity: number; // c* in m/s - key performance parameter
}

export const PROPELLANTS: Record<string, PropellantType> = {
  'RP1-LOX': {
    name: 'RP-1/LOX',
    fuelName: 'RP-1 (Kerosene)',
    oxidizerName: 'Liquid Oxygen',
    // Real values: Merlin 1D achieves 282s at sea level, 311s vacuum
    specificImpulseVacuum: 311,
    specificImpulseSeaLevel: 282,
    densityFuel: 810, // kg/m³ at 25°C
    densityOxidizer: 1141, // kg/m³ at -183°C (LOX boiling point)
    optimalMixtureRatio: 2.34, // SpaceX Merlin uses ~2.34
    combustionTemp: 3670, // K - typical for RP-1/LOX
    characteristicVelocity: 1800, // m/s - c* for RP-1/LOX
  },
  'CH4-LOX': {
    name: 'Methane/LOX',
    fuelName: 'Liquid Methane',
    oxidizerName: 'Liquid Oxygen',
    // Real values: Raptor achieves ~330s at sea level, ~363s vacuum
    specificImpulseVacuum: 363,
    specificImpulseSeaLevel: 330,
    densityFuel: 422, // kg/m³ at -161°C
    densityOxidizer: 1141,
    optimalMixtureRatio: 3.6, // Raptor uses ~3.6
    combustionTemp: 3550, // K
    characteristicVelocity: 1850, // m/s
  },
};

export interface MaterialType {
  name: string;
  density: number; // kg/m³
  maxTemp: number; // Kelvin - service temperature limit
  yieldStrength: number; // MPa - for pressure vessel calculations
  costPerKg: number; // dollars
}

export const MATERIALS: Record<string, MaterialType> = {
  steel: {
    name: 'Stainless Steel 304L',
    density: 8000, // kg/m³
    maxTemp: 1089, // K (~816°C) - typical service limit
    yieldStrength: 170, // MPa at room temp
    costPerKg: 4,
  },
  aluminum: {
    name: 'Aluminum 2219-T87',
    density: 2840, // kg/m³
    maxTemp: 422, // K (~149°C) - loses strength above this
    yieldStrength: 393, // MPa - actually stronger than steel per weight!
    costPerKg: 12,
  },
  inconel: {
    name: 'Inconel 718',
    density: 8190, // kg/m³
    maxTemp: 1255, // K (~982°C) - superalloy for hot sections
    yieldStrength: 1034, // MPa
    costPerKg: 45,
  },
};

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  material: string;
  size: 'small' | 'medium' | 'large';
  properties: Record<string, number>;
}

export type ComponentType = 
  | 'combustionChamber'
  | 'nozzle'
  | 'fuelInjector'
  | 'turbopump'
  | 'fuelTank'
  | 'oxidizerTank';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  baseCost: number;
  baseMass: number; // kg - dry mass of component
  icon: string;
  requiredForEngine: boolean;
  defaultProperties: Record<string, number>;
  propertyRanges: Record<string, { min: number; max: number; step: number; unit: string; label: string; description: string }>;
}

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  combustionChamber: {
    type: 'combustionChamber',
    name: 'Combustion Chamber',
    description: 'Where propellants mix and burn. Higher pressure = more thrust but heavier walls needed.',
    baseCost: 15000,
    baseMass: 45, // kg - scales with pressure
    icon: '◉',
    requiredForEngine: true,
    defaultProperties: {
      chamberPressure: 7.0, // MPa (Merlin runs at ~9.7 MPa, Raptor at ~30 MPa)
    },
    propertyRanges: {
      chamberPressure: { 
        min: 3.0, max: 15.0, step: 0.5, unit: 'MPa', 
        label: 'Chamber Pressure',
        description: 'Higher pressure increases thrust and efficiency but requires stronger (heavier) walls'
      },
    },
  },
  nozzle: {
    type: 'nozzle',
    name: 'Nozzle (De Laval)',
    description: 'Converging-diverging nozzle accelerates exhaust gases. Throat size determines mass flow.',
    baseCost: 8000,
    baseMass: 25, // kg - scales with throat size and expansion ratio
    icon: '▽',
    requiredForEngine: true,
    defaultProperties: {
      throatDiameter: 0.15, // meters - determines mass flow rate
      expansionRatio: 16, // Ae/At - Merlin ~16, Raptor SL ~33, Raptor Vacuum ~200
    },
    propertyRanges: {
      throatDiameter: { 
        min: 0.08, max: 0.30, step: 0.01, unit: 'm', 
        label: 'Throat Diameter',
        description: 'Larger throat = more mass flow = more thrust, but needs bigger turbopump'
      },
      expansionRatio: { 
        min: 8, max: 40, step: 1, unit: ':1', 
        label: 'Expansion Ratio',
        description: 'Ae/At ratio. ~16 optimal for sea level. Higher = more efficient but heavier'
      },
    },
  },
  fuelInjector: {
    type: 'fuelInjector',
    name: 'Injector Plate',
    description: 'Atomizes and mixes propellants. More injectors = better mixing = higher combustion efficiency.',
    baseCost: 12000,
    baseMass: 18,
    icon: '⊕',
    requiredForEngine: true,
    defaultProperties: {
      injectorElements: 100, // Number of injector elements (coaxial, pintle, etc.)
      combustionEfficiency: 0.95, // η_c* - how close to theoretical c* we achieve
    },
    propertyRanges: {
      injectorElements: { 
        min: 40, max: 200, step: 10, unit: '', 
        label: 'Injector Elements',
        description: 'More elements = better atomization/mixing but more complex and expensive'
      },
      combustionEfficiency: { 
        min: 0.90, max: 0.99, step: 0.01, unit: '', 
        label: 'Combustion Efficiency',
        description: 'η_c* - ratio of actual to theoretical c*. Better injectors achieve higher values'
      },
    },
  },
  turbopump: {
    type: 'turbopump',
    name: 'Turbopump Assembly',
    description: 'Pressurizes propellants. Must exceed chamber pressure to ensure flow into chamber.',
    baseCost: 25000,
    baseMass: 65, // kg - heavy! Includes turbine, pumps, bearings
    icon: '⚙',
    requiredForEngine: true,
    defaultProperties: {
      dischargePressure: 10.0, // MPa - must be > chamber pressure
      pumpEfficiency: 0.70, // Typical range 0.6-0.8
    },
    propertyRanges: {
      dischargePressure: { 
        min: 5.0, max: 25.0, step: 0.5, unit: 'MPa', 
        label: 'Discharge Pressure',
        description: 'Must be 20-30% higher than chamber pressure to overcome injector pressure drop'
      },
      pumpEfficiency: { 
        min: 0.55, max: 0.80, step: 0.05, unit: '', 
        label: 'Pump Efficiency',
        description: 'Higher efficiency = less turbine power needed = less propellant wasted driving turbine'
      },
    },
  },
  fuelTank: {
    type: 'fuelTank',
    name: 'Fuel Tank',
    description: 'Stores RP-1 kerosene. Tank mass is typically 5-10% of propellant mass.',
    baseCost: 5000,
    baseMass: 15, // kg - empty tank mass scales with capacity
    icon: '▭',
    requiredForEngine: true,
    defaultProperties: {
      propellantMass: 400, // kg of fuel
    },
    propertyRanges: {
      propellantMass: { 
        min: 100, max: 1500, step: 50, unit: 'kg', 
        label: 'Fuel Load',
        description: 'Mass of RP-1 fuel. More fuel = longer burn but heavier vehicle'
      },
    },
  },
  oxidizerTank: {
    type: 'oxidizerTank',
    name: 'Oxidizer Tank',
    description: 'Stores LOX. Requires insulation. Tank mass ratio similar to fuel tank.',
    baseCost: 6000,
    baseMass: 20, // kg - slightly heavier due to insulation
    icon: '▭',
    requiredForEngine: true,
    defaultProperties: {
      propellantMass: 1000, // kg of LOX (O/F ratio ~2.5 means ~2.5x fuel mass)
    },
    propertyRanges: {
      propellantMass: { 
        min: 200, max: 4000, step: 100, unit: 'kg', 
        label: 'LOX Load',
        description: 'Mass of liquid oxygen. Should be ~2.3x fuel mass for RP-1/LOX'
      },
    },
  },
};

export interface EnginePerformance {
  // Primary performance metrics
  thrust: number; // kN - the main goal!
  specificImpulse: number; // seconds - fuel efficiency
  thrustToWeight: number; // T/W ratio - must be > 1 to lift off
  
  // Derived metrics
  massFlowRate: number; // kg/s
  exitVelocity: number; // m/s
  chamberPressure: number; // MPa
  
  // Mass breakdown
  dryMass: number; // kg - engine without propellant
  propellantMass: number; // kg
  totalMass: number; // kg - wet mass
  
  // Other
  burnTime: number; // seconds
  totalCost: number; // dollars
  mixtureRatio: number; // actual O/F ratio
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  warnings: string[];
}

export class PhysicsEngine {
  // Standard gravity for Isp calculations
  private static readonly G0 = 9.80665; // m/s²
  
  /**
   * Main thrust equation (simplified from real rocket equation):
   * F = ṁ * Ve + (Pe - Pa) * Ae
   * 
   * At sea level with properly expanded nozzle, pressure term ≈ 0
   * So: F = ṁ * Ve = ṁ * Isp * g0
   * 
   * Mass flow rate from choked flow at throat:
   * ṁ = (Pc * At) / c*
   * 
   * Where c* (characteristic velocity) depends on propellant and combustion efficiency
   */
  public static calculatePerformance(
    components: ComponentConfig[],
    propellant: PropellantType
  ): EnginePerformance {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Find required components
    const chamber = components.find(c => c.type === 'combustionChamber');
    const nozzle = components.find(c => c.type === 'nozzle');
    const injector = components.find(c => c.type === 'fuelInjector');
    const turbopump = components.find(c => c.type === 'turbopump');
    const fuelTank = components.find(c => c.type === 'fuelTank');
    const oxidizerTank = components.find(c => c.type === 'oxidizerTank');

    // Validate required components
    if (!chamber) errors.push('Missing combustion chamber');
    if (!nozzle) errors.push('Missing nozzle');
    if (!injector) errors.push('Missing fuel injector');
    if (!turbopump) errors.push('Missing turbopump');
    if (!fuelTank) errors.push('Missing fuel tank');
    if (!oxidizerTank) errors.push('Missing oxidizer tank');

    if (errors.length > 0) {
      return this.emptyPerformance(errors);
    }

    // Extract component properties
    const chamberPressure = chamber!.properties.chamberPressure ?? 7.0; // MPa
    const throatDiameter = nozzle!.properties.throatDiameter ?? 0.15; // m
    const expansionRatio = nozzle!.properties.expansionRatio ?? 16;
    const combustionEfficiency = injector!.properties.combustionEfficiency ?? 0.95;
    const dischargePressure = turbopump!.properties.dischargePressure ?? 10.0; // MPa
    const pumpEfficiency = turbopump!.properties.pumpEfficiency ?? 0.70;
    const fuelMass = fuelTank!.properties.propellantMass ?? 400; // kg
    const oxidizerMass = oxidizerTank!.properties.propellantMass ?? 1000; // kg

    // === VALIDATION ===
    
    // Turbopump must provide enough pressure (need ~20% margin for injector pressure drop)
    const requiredPumpPressure = chamberPressure * 1.25;
    if (dischargePressure < requiredPumpPressure) {
      errors.push(`Turbopump pressure (${dischargePressure} MPa) too low. Need ≥${requiredPumpPressure.toFixed(1)} MPa for ${chamberPressure} MPa chamber`);
    }

    // Check mixture ratio
    const actualMixtureRatio = oxidizerMass / fuelMass;
    const optimalRatio = propellant.optimalMixtureRatio;
    const ratioDeviation = Math.abs(actualMixtureRatio - optimalRatio) / optimalRatio;
    
    if (ratioDeviation > 0.3) {
      errors.push(`O/F ratio ${actualMixtureRatio.toFixed(2)} is too far from optimal ${optimalRatio.toFixed(2)}`);
    } else if (ratioDeviation > 0.15) {
      warnings.push(`O/F ratio ${actualMixtureRatio.toFixed(2)} differs from optimal ${optimalRatio.toFixed(2)} - reduced efficiency`);
    }

    // If critical errors, return early
    if (errors.length > 0) {
      return this.emptyPerformance(errors);
    }

    // === PHYSICS CALCULATIONS ===
    
    // Throat area (m²)
    const throatArea = Math.PI * Math.pow(throatDiameter / 2, 2);
    
    // Characteristic velocity with combustion efficiency
    // c* = c*_ideal * η_c*
    const cStar = propellant.characteristicVelocity * combustionEfficiency;
    
    // Mass flow rate from choked flow equation
    // ṁ = (Pc * At) / c*
    // Pc in Pa, At in m², c* in m/s → ṁ in kg/s
    const massFlowRate = (chamberPressure * 1e6 * throatArea) / cStar;
    
    // Mixture ratio efficiency penalty
    // Performance drops as we deviate from optimal O/F
    const mixtureEfficiency = 1 - (ratioDeviation * 0.5); // Up to 15% loss
    
    // Nozzle efficiency based on expansion ratio for sea level
    // Optimal for sea level is ~15-20, higher causes flow separation
    const nozzleEfficiency = this.calculateNozzleEfficiency(expansionRatio);
    
    // Overall efficiency
    const overallEfficiency = combustionEfficiency * mixtureEfficiency * nozzleEfficiency;
    
    // Specific impulse at sea level
    // Isp = Isp_ideal * overall_efficiency * sqrt(pump_efficiency)
    // Pump efficiency affects how much propellant is wasted driving turbine
    const specificImpulse = propellant.specificImpulseSeaLevel * overallEfficiency * Math.sqrt(pumpEfficiency);
    
    // Exit velocity
    const exitVelocity = specificImpulse * this.G0;
    
    // THRUST! F = ṁ * Ve
    const thrustNewtons = massFlowRate * exitVelocity;
    const thrust = thrustNewtons / 1000; // Convert to kN
    
    // === MASS CALCULATIONS ===
    
    // Calculate dry mass (engine without propellant)
    const dryMass = this.calculateDryMass(components, chamberPressure, throatDiameter, expansionRatio);
    
    // Total propellant
    const propellantMass = fuelMass + oxidizerMass;
    
    // Wet mass (total)
    const totalMass = dryMass + propellantMass;
    
    // Thrust-to-weight ratio (critical for success!)
    // T/W = F / (m * g)
    const thrustToWeight = thrustNewtons / (totalMass * this.G0);
    
    // Burn time
    const burnTime = propellantMass / massFlowRate;
    
    // Cost
    const totalCost = this.calculateTotalCost(components);
    
    // Add warnings for edge cases
    if (thrustToWeight < 1.0) {
      warnings.push(`T/W ratio ${thrustToWeight.toFixed(2)} < 1.0 - engine cannot lift itself!`);
    } else if (thrustToWeight < 1.3) {
      warnings.push(`T/W ratio ${thrustToWeight.toFixed(2)} is marginal - aim for >1.3`);
    }
    
    if (burnTime < 10) {
      warnings.push(`Burn time only ${burnTime.toFixed(1)}s - consider more propellant`);
    }

    return {
      thrust,
      specificImpulse,
      thrustToWeight,
      massFlowRate,
      exitVelocity,
      chamberPressure,
      dryMass,
      propellantMass,
      totalMass,
      burnTime,
      totalCost,
      mixtureRatio: actualMixtureRatio,
      isValid: true,
      validationErrors: [],
      warnings,
    };
  }

  /**
   * Nozzle efficiency for sea-level operation
   * Based on expansion ratio optimization
   */
  private static calculateNozzleEfficiency(expansionRatio: number): number {
    // For sea level, optimal expansion ratio is ~15-20
    // Too low: under-expanded, wasting potential energy
    // Too high: over-expanded, flow separation reduces thrust
    const optimalSeaLevel = 16;
    
    if (expansionRatio < optimalSeaLevel) {
      // Under-expanded: efficiency drops gradually
      const deviation = (optimalSeaLevel - expansionRatio) / optimalSeaLevel;
      return 0.98 - (deviation * 0.15);
    } else {
      // Over-expanded: efficiency drops more steeply
      const deviation = (expansionRatio - optimalSeaLevel) / optimalSeaLevel;
      return 0.98 - (deviation * 0.25);
    }
  }

  /**
   * Calculate dry mass of engine based on component properties
   * Heavier components for higher performance requirements
   */
  private static calculateDryMass(
    components: ComponentConfig[],
    chamberPressure: number,
    throatDiameter: number,
    expansionRatio: number
  ): number {
    let mass = 0;
    
    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const material = MATERIALS[comp.material] || MATERIALS.steel;
      let componentMass = def.baseMass;
      
      // Material density affects mass
      const densityFactor = material.density / 8000; // Normalized to steel
      
      switch (comp.type) {
        case 'combustionChamber':
          // Higher pressure needs thicker walls → more mass
          // Mass scales roughly with pressure squared (hoop stress)
          const pressureFactor = Math.pow(chamberPressure / 7.0, 1.5);
          componentMass = def.baseMass * pressureFactor * densityFactor;
          break;
          
        case 'nozzle':
          // Larger throat and higher expansion ratio = heavier nozzle
          const throatFactor = Math.pow(throatDiameter / 0.15, 2);
          const expansionFactor = Math.pow(expansionRatio / 16, 0.7);
          componentMass = def.baseMass * throatFactor * expansionFactor * densityFactor;
          break;
          
        case 'turbopump':
          // Higher discharge pressure = heavier pump
          const pumpPressure = comp.properties.dischargePressure ?? 10;
          const pumpFactor = Math.pow(pumpPressure / 10, 1.2);
          componentMass = def.baseMass * pumpFactor;
          break;
          
        case 'fuelTank':
        case 'oxidizerTank':
          // Tank mass is ~8% of propellant mass for aluminum, ~12% for steel
          const propMass = comp.properties.propellantMass ?? 500;
          const tankMassRatio = comp.material === 'aluminum' ? 0.08 : 0.12;
          componentMass = def.baseMass + (propMass * tankMassRatio);
          break;
          
        default:
          componentMass = def.baseMass * densityFactor;
      }
      
      mass += componentMass;
    }
    
    return Math.round(mass);
  }

  /**
   * Calculate total cost based on components, materials, and performance
   */
  private static calculateTotalCost(components: ComponentConfig[]): number {
    let cost = 0;
    
    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const material = MATERIALS[comp.material] || MATERIALS.steel;
      
      // Base cost
      let componentCost = def.baseCost;
      
      // Material cost scaling
      componentCost *= (material.costPerKg / 4); // Normalized to steel at $4/kg
      
      // Higher performance = higher cost
      for (const [key, value] of Object.entries(comp.properties)) {
        const range = def.propertyRanges[key];
        if (range) {
          const normalized = (value - range.min) / (range.max - range.min);
          componentCost *= (1 + normalized * 0.5); // Up to 50% more for max settings
        }
      }
      
      cost += componentCost;
    }
    
    return Math.round(cost);
  }

  private static emptyPerformance(errors: string[]): EnginePerformance {
    return {
      thrust: 0,
      specificImpulse: 0,
      thrustToWeight: 0,
      massFlowRate: 0,
      exitVelocity: 0,
      chamberPressure: 0,
      dryMass: 0,
      propellantMass: 0,
      totalMass: 0,
      burnTime: 0,
      totalCost: 0,
      mixtureRatio: 0,
      isValid: false,
      validationErrors: errors,
      warnings: [],
    };
  }
}
