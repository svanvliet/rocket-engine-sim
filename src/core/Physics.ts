// Rocket engine physics calculations
// Based on real rocket science principles (simplified for gameplay)

export interface PropellantType {
  name: string;
  fuelName: string;
  oxidizerName: string;
  specificImpulseVacuum: number; // seconds
  specificImpulseSeaLevel: number; // seconds
  densityFuel: number; // kg/m³
  densityOxidizer: number; // kg/m³
  optimalMixtureRatio: number; // O/F ratio
  combustionTemp: number; // Kelvin
  costPerKg: number; // dollars
}

export const PROPELLANTS: Record<string, PropellantType> = {
  'RP1-LOX': {
    name: 'RP-1/LOX',
    fuelName: 'RP-1 (Kerosene)',
    oxidizerName: 'Liquid Oxygen',
    specificImpulseVacuum: 350,
    specificImpulseSeaLevel: 300,
    densityFuel: 810,
    densityOxidizer: 1141,
    optimalMixtureRatio: 2.56,
    combustionTemp: 3670,
    costPerKg: 1.5,
  },
  'CH4-LOX': {
    name: 'Methane/LOX',
    fuelName: 'Liquid Methane',
    oxidizerName: 'Liquid Oxygen',
    specificImpulseVacuum: 363,
    specificImpulseSeaLevel: 310,
    densityFuel: 422,
    densityOxidizer: 1141,
    optimalMixtureRatio: 3.6,
    combustionTemp: 3550,
    costPerKg: 0.8,
  },
};

export interface MaterialType {
  name: string;
  density: number; // kg/m³
  maxTemp: number; // Kelvin
  strengthFactor: number; // relative strength
  costMultiplier: number;
}

export const MATERIALS: Record<string, MaterialType> = {
  steel: {
    name: 'Stainless Steel',
    density: 8000,
    maxTemp: 1700,
    strengthFactor: 1.0,
    costMultiplier: 1.0,
  },
  aluminum: {
    name: 'Aluminum Alloy',
    density: 2700,
    maxTemp: 900,
    strengthFactor: 0.6,
    costMultiplier: 1.2,
  },
  inconel: {
    name: 'Inconel',
    density: 8440,
    maxTemp: 2100,
    strengthFactor: 1.4,
    costMultiplier: 3.5,
  },
};

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  material: string;
  size: 'small' | 'medium' | 'large';
  // Type-specific properties
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
  baseMass: number; // kg
  icon: string;
  requiredForEngine: boolean;
  defaultProperties: Record<string, number>;
  propertyRanges: Record<string, { min: number; max: number; step: number; unit: string; label: string }>;
}

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  combustionChamber: {
    type: 'combustionChamber',
    name: 'Combustion Chamber',
    description: 'Where fuel and oxidizer mix and burn to produce hot gases',
    baseCost: 8000,
    baseMass: 50,
    icon: '◉',
    requiredForEngine: true,
    defaultProperties: {
      chamberPressure: 5.0, // MPa
      chamberDiameter: 0.3, // meters
    },
    propertyRanges: {
      chamberPressure: { min: 2.0, max: 15.0, step: 0.5, unit: 'MPa', label: 'Chamber Pressure' },
      chamberDiameter: { min: 0.15, max: 0.6, step: 0.05, unit: 'm', label: 'Diameter' },
    },
  },
  nozzle: {
    type: 'nozzle',
    name: 'Nozzle',
    description: 'Converts thermal energy to kinetic energy through gas expansion',
    baseCost: 5000,
    baseMass: 30,
    icon: '▽',
    requiredForEngine: true,
    defaultProperties: {
      expansionRatio: 15, // exit area / throat area
      throatDiameter: 0.12, // meters
    },
    propertyRanges: {
      expansionRatio: { min: 5, max: 40, step: 1, unit: ':1', label: 'Expansion Ratio' },
      throatDiameter: { min: 0.05, max: 0.3, step: 0.01, unit: 'm', label: 'Throat Diameter' },
    },
  },
  fuelInjector: {
    type: 'fuelInjector',
    name: 'Fuel Injector',
    description: 'Delivers and atomizes propellants into the combustion chamber',
    baseCost: 3000,
    baseMass: 15,
    icon: '⊕',
    requiredForEngine: true,
    defaultProperties: {
      injectorCount: 12,
      flowEfficiency: 0.92,
    },
    propertyRanges: {
      injectorCount: { min: 6, max: 36, step: 2, unit: '', label: 'Injector Count' },
      flowEfficiency: { min: 0.80, max: 0.98, step: 0.02, unit: '', label: 'Flow Efficiency' },
    },
  },
  turbopump: {
    type: 'turbopump',
    name: 'Turbopump',
    description: 'Pressurizes propellants for injection into the combustion chamber',
    baseCost: 12000,
    baseMass: 80,
    icon: '⚙',
    requiredForEngine: true,
    defaultProperties: {
      pumpPressure: 8.0, // MPa
      pumpEfficiency: 0.65,
    },
    propertyRanges: {
      pumpPressure: { min: 4.0, max: 20.0, step: 0.5, unit: 'MPa', label: 'Output Pressure' },
      pumpEfficiency: { min: 0.50, max: 0.85, step: 0.05, unit: '', label: 'Efficiency' },
    },
  },
  fuelTank: {
    type: 'fuelTank',
    name: 'Fuel Tank',
    description: 'Stores the fuel (RP-1 kerosene)',
    baseCost: 4000,
    baseMass: 20,
    icon: '▭',
    requiredForEngine: true,
    defaultProperties: {
      capacity: 500, // kg of propellant
    },
    propertyRanges: {
      capacity: { min: 100, max: 2000, step: 50, unit: 'kg', label: 'Capacity' },
    },
  },
  oxidizerTank: {
    type: 'oxidizerTank',
    name: 'Oxidizer Tank',
    description: 'Stores the oxidizer (Liquid Oxygen)',
    baseCost: 4000,
    baseMass: 25,
    icon: '▭',
    requiredForEngine: true,
    defaultProperties: {
      capacity: 1200, // kg of propellant
    },
    propertyRanges: {
      capacity: { min: 200, max: 5000, step: 100, unit: 'kg', label: 'Capacity' },
    },
  },
};

export interface EnginePerformance {
  thrust: number; // kN
  specificImpulse: number; // seconds
  massFlowRate: number; // kg/s
  chamberTemperature: number; // K
  chamberPressure: number; // MPa
  exitVelocity: number; // m/s
  thrustToWeight: number;
  burnTime: number; // seconds
  totalMass: number; // kg
  totalCost: number; // dollars
  isValid: boolean;
  validationErrors: string[];
}

export class PhysicsEngine {
  private static G0 = 9.80665; // Standard gravity m/s²

  public static calculatePerformance(
    components: ComponentConfig[],
    propellant: PropellantType
  ): EnginePerformance {
    const errors: string[] = [];
    
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

    // Extract properties
    const chamberPressure = chamber!.properties.chamberPressure || 5.0;
    // chamberDiameter reserved for future use in volume calculations
    const expansionRatio = nozzle!.properties.expansionRatio || 15;
    const throatDiameter = nozzle!.properties.throatDiameter || 0.12;
    const injectorEfficiency = injector!.properties.flowEfficiency || 0.92;
    const pumpPressure = turbopump!.properties.pumpPressure || 8.0;
    const pumpEfficiency = turbopump!.properties.pumpEfficiency || 0.65;
    const fuelCapacity = fuelTank!.properties.capacity || 500;
    const oxidizerCapacity = oxidizerTank!.properties.capacity || 1200;

    // Validate pump pressure vs chamber pressure
    if (pumpPressure < chamberPressure * 1.2) {
      errors.push('Turbopump pressure too low for chamber pressure');
    }

    // Calculate throat area
    const throatArea = Math.PI * Math.pow(throatDiameter / 2, 2);

    // Calculate mass flow rate (simplified)
    // ṁ = (Pc * At) / (c* efficiency)
    // c* is characteristic velocity, approximately Isp * g0 / Cf
    const characteristicVelocity = propellant.specificImpulseSeaLevel * this.G0 / 1.5;
    const massFlowRate = (chamberPressure * 1e6 * throatArea) / characteristicVelocity * injectorEfficiency;

    // Calculate specific impulse with efficiency losses
    const nozzleEfficiency = this.calculateNozzleEfficiency(expansionRatio);
    const overallEfficiency = injectorEfficiency * nozzleEfficiency * pumpEfficiency;
    const specificImpulse = propellant.specificImpulseSeaLevel * Math.sqrt(overallEfficiency);

    // Calculate thrust
    // F = ṁ * Isp * g0
    const thrust = massFlowRate * specificImpulse * this.G0 / 1000; // kN

    // Calculate exit velocity
    const exitVelocity = specificImpulse * this.G0;

    // Calculate total propellant and burn time
    const totalPropellant = fuelCapacity + oxidizerCapacity;
    const burnTime = totalPropellant / massFlowRate;

    // Calculate masses
    const componentMass = this.calculateTotalMass(components);
    const totalMass = componentMass + totalPropellant;

    // Calculate cost
    const totalCost = this.calculateTotalCost(components);

    // Thrust to weight
    const thrustToWeight = (thrust * 1000) / (totalMass * this.G0);

    // Chamber temperature (simplified)
    const chamberTemperature = propellant.combustionTemp * overallEfficiency;

    return {
      thrust,
      specificImpulse,
      massFlowRate,
      chamberTemperature,
      chamberPressure,
      exitVelocity,
      thrustToWeight,
      burnTime,
      totalMass,
      totalCost,
      isValid: errors.length === 0,
      validationErrors: errors,
    };
  }

  private static calculateNozzleEfficiency(expansionRatio: number): number {
    // Optimal expansion ratio for sea level is around 10-15
    // Too low or too high reduces efficiency
    const optimal = 12;
    const deviation = Math.abs(expansionRatio - optimal) / optimal;
    return Math.max(0.7, 1 - deviation * 0.3);
  }

  private static calculateTotalMass(components: ComponentConfig[]): number {
    let mass = 0;
    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const material = MATERIALS[comp.material] || MATERIALS.steel;
      const sizeFactor = comp.size === 'small' ? 0.7 : comp.size === 'large' ? 1.5 : 1.0;
      mass += def.baseMass * sizeFactor * (material.density / 8000);
    }
    return mass;
  }

  private static calculateTotalCost(components: ComponentConfig[]): number {
    let cost = 0;
    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const material = MATERIALS[comp.material] || MATERIALS.steel;
      const sizeFactor = comp.size === 'small' ? 0.7 : comp.size === 'large' ? 1.5 : 1.0;
      cost += def.baseCost * sizeFactor * material.costMultiplier;

      // Add cost for upgraded properties
      for (const [key, value] of Object.entries(comp.properties)) {
        const range = def.propertyRanges[key];
        if (range) {
          const normalized = (value - range.min) / (range.max - range.min);
          cost += def.baseCost * 0.2 * normalized; // Up to 20% more for max properties
        }
      }
    }
    return Math.round(cost);
  }

  private static emptyPerformance(errors: string[]): EnginePerformance {
    return {
      thrust: 0,
      specificImpulse: 0,
      massFlowRate: 0,
      chamberTemperature: 0,
      chamberPressure: 0,
      exitVelocity: 0,
      thrustToWeight: 0,
      burnTime: 0,
      totalMass: 0,
      totalCost: 0,
      isValid: false,
      validationErrors: errors,
    };
  }
}
