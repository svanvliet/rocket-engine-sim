// Rocket Engine Simulator - Game State and Data
// Contains game state, component stats, contracts, and calculation functions

const gameState = {
    currentScreen: 'splash',
    difficulty: 'normal',
    budget: 600000,
    budgetSpent: 0,
    selectedComponents: {},
    selectedContracts: [],
    signedContracts: [],        // Contracts already accepted (can't be re-accepted)
    lastTestResults: null,
    lastDesignCost: 0,
    testCount: 0,               // Track number of tests run
    lastFailure: null,          // Store failure details for display
    
    difficultyBudgets: {
        casual: 1000000,
        normal: 600000,
        hard: 400000,
        hardcore: 200000
    },
    
    componentStats: {
        // Chamber: major contributor to thrust and pressure
        'chamber-basic': { thrust: 15, isp: 8, pressure: 1 },
        'chamber-advanced': { thrust: 30, isp: 12, pressure: 2 },
        'chamber-premium': { thrust: 45, isp: 18, pressure: 3 },
        
        // Injector: moderate contribution to all
        'injector-basic': { thrust: 5, isp: 5, pressure: 0.5 },
        'injector-advanced': { thrust: 10, isp: 8, pressure: 1 },
        'injector-premium': { thrust: 15, isp: 12, pressure: 1.5 },
        
        // Nozzle: major contributor to Isp, some thrust
        'nozzle-basic': { thrust: 5, isp: 8, pressure: 0 },
        'nozzle-advanced': { thrust: 10, isp: 12, pressure: 0 },
        'nozzle-premium': { thrust: 15, isp: 18, pressure: 0 },
        
        // Pump: major contributor to pressure, some thrust
        'pump-basic': { thrust: 0, isp: 2, pressure: 1 },
        'pump-advanced': { thrust: 5, isp: 4, pressure: 2 },
        'pump-premium': { thrust: 10, isp: 6, pressure: 3 }
    },
    
    contracts: [
        {
            id: 'cubesat',
            icon: '🛰️',
            name: 'CubeSat Launch Co.',
            desc: 'University research satellites need affordable rides to orbit.',
            requirements: { thrust: 15, isp: 50 },
            engines: 1,
            payout: 75000
        },
        {
            id: 'starlink-competitor',
            icon: '📡',
            name: 'OrbitNet Inc.',
            desc: 'Broadband constellation needs reliable small-sat deployment.',
            requirements: { thrust: 20, isp: 65 },
            engines: 2,
            payout: 150000
        },
        {
            id: 'space-tourist',
            icon: '🧑‍🚀',
            name: 'Orbital Adventures',
            desc: 'Space tourism company seeking suborbital flight partner.',
            requirements: { thrust: 25, isp: 70 },
            engines: 3,
            payout: 250000
        },
        {
            id: 'nasa-cubesat',
            icon: '🇺🇸',
            name: 'NASA CubeSat Program',
            desc: 'Government science missions require proven reliability.',
            requirements: { thrust: 30, isp: 75, pressure: 5 },
            engines: 4,
            payout: 350000
        },
        {
            id: 'esa-science',
            icon: '🇪🇺',
            name: 'ESA Science Division',
            desc: 'European space agency interested in secondary payload capacity.',
            requirements: { thrust: 35, isp: 80, pressure: 6 },
            engines: 5,
            payout: 400000
        },
        {
            id: 'commercial-sat',
            icon: '🌐',
            name: 'GlobalComm Satellites',
            desc: 'Major telecom needs dedicated launch vehicle development.',
            requirements: { thrust: 40, isp: 85, pressure: 7 },
            engines: 6,
            payout: 500000
        },
        {
            id: 'moon-mission',
            icon: '🌙',
            name: 'Lunar Gateway Partners',
            desc: 'Cislunar logistics consortium seeking propulsion partners.',
            requirements: { thrust: 50, isp: 90, pressure: 8 },
            engines: 9,
            payout: 750000
        },
        {
            id: 'mars-venture',
            icon: '🔴',
            name: 'Mars Colonial Transport',
            desc: 'Ambitious Mars mission needs high-performance engines.',
            requirements: { thrust: 60, isp: 100, pressure: 10 },
            engines: 12,
            payout: 1000000
        }
    ]
};

// ========== Utility Functions ==========

function formatMoney(amount) {
    return '$' + amount.toLocaleString();
}

// ========== Budget & Cost Calculations ==========

function getManufacturingCostPerEngine() {
    return Math.round(gameState.lastDesignCost / 25);
}

function calculateContractManufacturingCost(contract) {
    return contract.engines * getManufacturingCostPerEngine();
}

function calculateContractNetProfit(contract) {
    return contract.payout - calculateContractManufacturingCost(contract);
}

function calculateSelectedContractsTotals() {
    const costPerEngine = getManufacturingCostPerEngine();
    const totalPayout = gameState.selectedContracts.reduce((sum, c) => sum + c.payout, 0);
    const totalEngines = gameState.selectedContracts.reduce((sum, c) => sum + c.engines, 0);
    const totalManufacturing = gameState.selectedContracts.reduce((sum, c) => sum + (c.engines * costPerEngine), 0);
    const netProfit = totalPayout - totalManufacturing;
    
    return { totalPayout, totalEngines, totalManufacturing, netProfit, costPerEngine };
}

// ========== Performance Calculations ==========

function calculateEstimatedPerformance() {
    const baseThrust = 10, baseIsp = 50, basePressure = 2;
    let thrust = baseThrust, isp = baseIsp, pressure = basePressure;
    
    Object.values(gameState.selectedComponents).forEach(comp => {
        if (comp.stats) {
            thrust += comp.stats.thrust || 0;
            isp += comp.stats.isp || 0;
            pressure += comp.stats.pressure || 0;
        }
    });
    
    return { thrust, isp, pressure };
}

function checkContractRequirements(contract, testResults) {
    const meetsThrust = testResults.thrust >= contract.requirements.thrust;
    const meetsIsp = testResults.isp >= contract.requirements.isp;
    const meetsPressure = !contract.requirements.pressure || testResults.pressure >= contract.requirements.pressure;
    return meetsThrust && meetsIsp && meetsPressure;
}

// ========== State Mutations ==========

function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    gameState.budget = gameState.difficultyBudgets[difficulty];
}

function selectComponent(category, componentId, cost) {
    gameState.selectedComponents[category] = {
        id: componentId,
        cost: cost,
        stats: gameState.componentStats[componentId] || {}
    };
    recalculateBudgetSpent();
}

function deselectComponent(category) {
    delete gameState.selectedComponents[category];
    recalculateBudgetSpent();
}

function recalculateBudgetSpent() {
    gameState.budgetSpent = Object.values(gameState.selectedComponents)
        .reduce((sum, comp) => sum + (comp.cost || 0), 0);
}

function resetDesign() {
    gameState.selectedComponents = {};
    gameState.budgetSpent = 0;
}

function toggleContractSelection(contract) {
    const idx = gameState.selectedContracts.findIndex(c => c.id === contract.id);
    if (idx >= 0) {
        gameState.selectedContracts.splice(idx, 1);
        return false; // was deselected
    } else {
        gameState.selectedContracts.push(contract);
        return true; // was selected
    }
}

function acceptSelectedContracts() {
    const { netProfit } = calculateSelectedContractsTotals();
    gameState.budget += netProfit;
    
    // Mark selected contracts as signed (permanently)
    gameState.selectedContracts.forEach(contract => {
        if (!gameState.signedContracts.includes(contract.id)) {
            gameState.signedContracts.push(contract.id);
        }
    });
    
    gameState.selectedContracts = [];
}

function isContractSigned(contractId) {
    return gameState.signedContracts.includes(contractId);
}

function areAllContractsSigned() {
    return gameState.contracts.every(c => gameState.signedContracts.includes(c.id));
}

function getSignedContractsCount() {
    return gameState.signedContracts.length;
}

function getTotalContractsCount() {
    return gameState.contracts.length;
}

function prepareForTest() {
    gameState.lastDesignCost = gameState.budgetSpent;
    gameState.testCount++;
}

function getComponentStatsForEngine() {
    const componentStats = {};
    Object.keys(gameState.selectedComponents).forEach(category => {
        const comp = gameState.selectedComponents[category];
        componentStats[category] = {
            id: comp.id,
            ...comp.stats
        };
    });
    return componentStats;
}

function hasRequiredComponents() {
    return gameState.selectedComponents.chamber && 
           gameState.selectedComponents.injector && 
           gameState.selectedComponents.nozzle &&
           gameState.selectedComponents.propellant;
}

function isWithinBudget() {
    return gameState.budgetSpent <= gameState.budget;
}

// ========== Failure System ==========

const failureCauses = [
    {
        id: 'injector-leak',
        icon: '⚠️',
        title: 'Injector Leak!',
        description: 'Propellant leaked from injector seal, causing combustion instability.',
        consequence: 'Fuel mixture ratio disrupted'
    },
    {
        id: 'turbopump-overpressure',
        icon: '🔴',
        title: 'Exceeded Turbopump Pressure!',
        description: 'Turbopump exceeded safe operating pressure limits.',
        consequence: 'Emergency shutdown triggered'
    },
    {
        id: 'chamber-breach',
        icon: '💥',
        title: 'Chamber Wall Breach!',
        description: 'Combustion chamber developed a crack under thermal stress.',
        consequence: 'Hot gas escape detected'
    },
    {
        id: 'igniter-failure',
        icon: '⚡',
        title: 'Igniter Malfunction!',
        description: 'Ignition system failed to sustain combustion.',
        consequence: 'Flame-out occurred'
    },
    {
        id: 'gasket-failure',
        icon: '🔧',
        title: 'Gasket Failure!',
        description: 'High-pressure gasket failed at chamber-nozzle interface.',
        consequence: 'Pressure loss detected'
    },
    {
        id: 'valve-stuck',
        icon: '🚫',
        title: 'Valve Stuck Open!',
        description: 'Main fuel valve failed to regulate properly.',
        consequence: 'Uncontrolled propellant flow'
    },
    {
        id: 'cooling-failure',
        icon: '🌡️',
        title: 'Cooling System Failure!',
        description: 'Regenerative cooling channels blocked or restricted.',
        consequence: 'Thermal runaway imminent'
    },
    {
        id: 'human-error',
        icon: '👷',
        title: 'Operator Error!',
        description: 'Test conductor initiated emergency abort due to procedural deviation.',
        consequence: 'Manual abort executed'
    },
    {
        id: 'sensor-malfunction',
        icon: '📡',
        title: 'Sensor Malfunction!',
        description: 'Critical pressure sensors reported erratic readings.',
        consequence: 'Automatic safety shutdown'
    },
    {
        id: 'feed-line-rupture',
        icon: '💧',
        title: 'Feed Line Rupture!',
        description: 'Propellant feed line developed a crack under pressure.',
        consequence: 'Propellant supply interrupted'
    }
];

function shouldTestFail() {
    // Never fail on first test
    if (gameState.testCount <= 1) {
        return false;
    }
    // 20% chance of failure after first test
    return Math.random() < 0.2;
}

function generateFailure() {
    // Pick 1-3 random failure causes
    const numCauses = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...failureCauses].sort(() => Math.random() - 0.5);
    const causes = shuffled.slice(0, numCauses);
    
    // Generate failure timing (0-100% through test)
    const failureTime = Math.random();
    
    // Generate engineering suggestions based on causes
    const suggestions = generateEngineeringSuggestions(causes);
    
    return {
        causes: causes,
        failureTime: failureTime,
        peakThrustBeforeFailure: 0,
        peakIspBeforeFailure: 0,
        peakPressureBeforeFailure: 0,
        suggestions: suggestions
    };
}

function generateEngineeringSuggestions(causes) {
    const suggestionMap = {
        'injector-leak': {
            speaker: '🧑‍🔬 Dr. Chen',
            suggestion: 'Consider upgrading to a higher-quality injector. The Impinging or Pintle designs have better seal integrity.'
        },
        'turbopump-overpressure': {
            speaker: '🧑‍🔧 Sam',
            suggestion: 'The pump is working too hard. A more advanced turbopump with staged combustion handles pressure spikes better.'
        },
        'chamber-breach': {
            speaker: '🧑‍🔬 Dr. Chen',
            suggestion: 'Thermal stress cracked the chamber wall. Regenerative cooling or Inconel alloy would handle the heat better.'
        },
        'igniter-failure': {
            speaker: '🧑‍💼 Marcus',
            suggestion: 'Ignition is tricky. Sometimes it just takes another attempt. Make sure your fuel mixture is dialed in.'
        },
        'gasket-failure': {
            speaker: '🧑‍🔧 Sam',
            suggestion: 'High-pressure seals are always a weak point. Premium components use better gasket materials.'
        },
        'valve-stuck': {
            speaker: '🧑‍🔧 Sam',
            suggestion: 'Valve actuators can stick under pressure. More expensive components have redundant valve systems.'
        },
        'cooling-failure': {
            speaker: '🧑‍🔬 Dr. Chen',
            suggestion: 'Regeneratively cooled chambers circulate fuel through the walls. It\'s expensive but prevents thermal runaway.'
        },
        'human-error': {
            speaker: '🧑‍💼 Marcus',
            suggestion: 'These things happen. The team learned from this. Let\'s run it back with the same configuration.'
        },
        'sensor-malfunction': {
            speaker: '🧑‍🔧 Sam',
            suggestion: 'Faulty sensor data triggered the abort. The engine might actually be fine—worth testing again.'
        },
        'feed-line-rupture': {
            speaker: '🧑‍🔬 Dr. Chen',
            suggestion: 'Feed lines failed under pressure. Higher-rated pumps maintain steadier flow and reduce line stress.'
        }
    };
    
    return causes.map(cause => suggestionMap[cause.id] || {
        speaker: '🧑‍🔬 Dr. Chen',
        suggestion: 'Review the design and try again. Rocket science is hard!'
    });
}

function recordFailure(failure) {
    gameState.lastFailure = failure;
}
