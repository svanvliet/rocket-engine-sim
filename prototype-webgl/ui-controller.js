// Rocket Engine Simulator - UI Controller
// Handles screen management, DOM updates, and event binding

// ========== Screen Management ==========

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        gameState.currentScreen = screenId;
    }
}

// ========== Budget Display Updates ==========

function updateBudgetDisplays() {
    const remaining = gameState.budget - gameState.budgetSpent;
    const briefingBudget = document.getElementById('briefing-budget');
    const designBudget = document.getElementById('design-budget');
    
    if (briefingBudget) briefingBudget.textContent = formatMoney(gameState.budget);
    if (designBudget) {
        designBudget.textContent = formatMoney(remaining);
        designBudget.classList.remove('warning', 'danger');
        if (remaining < gameState.budget * 0.25) {
            designBudget.classList.add('danger');
        } else if (remaining < gameState.budget * 0.5) {
            designBudget.classList.add('warning');
        }
    }
}

// ========== Component Selection UI ==========

function updateComponentSelection() {
    const selectedList = document.getElementById('selected-list');
    const totalCostEl = document.getElementById('total-cost');
    const testFireBtn = document.getElementById('test-fire-btn');
    
    let total = 0;
    let html = '';
    const categories = ['chamber', 'injector', 'nozzle', 'pump', 'propellant'];
    const categoryNames = {
        chamber: 'Chamber',
        injector: 'Injector', 
        nozzle: 'Nozzle',
        pump: 'Turbopump',
        propellant: 'Propellant'
    };
    
    categories.forEach(cat => {
        if (gameState.selectedComponents[cat]) {
            const comp = gameState.selectedComponents[cat];
            html += `<div class="selected-item"><span>${categoryNames[cat]}</span><span style="color:#4ade80">${formatMoney(comp.cost)}</span></div>`;
            total += comp.cost;
        }
    });
    
    if (html === '') {
        html = '<div style="color: #8ab4d8; font-size: 13px; font-style: italic;">No components selected</div>';
    }
    
    selectedList.innerHTML = html;
    gameState.budgetSpent = total;
    totalCostEl.textContent = formatMoney(total);
    totalCostEl.style.color = total > gameState.budget ? '#ef4444' : '#4ade80';
    
    // Update estimated performance
    const perf = calculateEstimatedPerformance();
    const hasAnyComponents = Object.keys(gameState.selectedComponents).length > 0;
    document.getElementById('est-thrust').textContent = hasAnyComponents ? `~${perf.thrust} kN` : '-- kN';
    document.getElementById('est-isp').textContent = hasAnyComponents ? `~${perf.isp} s` : '-- s';
    document.getElementById('est-pressure').textContent = hasAnyComponents ? `~${perf.pressure.toFixed(1)} MPa` : '-- MPa';
    
    // Enable test fire button
    testFireBtn.disabled = !(hasRequiredComponents() && isWithinBudget());
    
    updateBudgetDisplays();
}

// ========== Results Screen ==========

function showResultsScreen(testResults) {
    gameState.lastTestResults = testResults;
    gameState.selectedContracts = [];
    
    // Update results display
    const isSuccess = testResults.thrust >= 100 && testResults.isp >= 280 && !testResults.aborted;
    const isAborted = testResults.aborted;
    const titleEl = document.getElementById('results-title');
    
    if (isAborted) {
        titleEl.textContent = '⛔ Test Aborted';
        titleEl.className = 'results-title failure';
        document.getElementById('results-subtitle').textContent = 'Test was manually aborted. Review partial results.';
    } else if (isSuccess) {
        titleEl.textContent = '✓ Test Successful!';
        titleEl.className = 'results-title success';
        document.getElementById('results-subtitle').textContent = 'Great work! Your engine met the mission requirements.';
    } else {
        titleEl.textContent = '⚠ Test Complete';
        titleEl.className = 'results-title';
        document.getElementById('results-subtitle').textContent = 'Review performance and iterate on your design.';
    }
    
    // Performance values
    const thrustEl = document.getElementById('result-thrust');
    thrustEl.textContent = `${testResults.thrust.toFixed(1)} kN`;
    thrustEl.className = 'perf-value ' + (testResults.thrust >= 100 ? 'good' : 'bad');
    
    const ispEl = document.getElementById('result-isp');
    ispEl.textContent = `${testResults.isp.toFixed(0)} s`;
    ispEl.className = 'perf-value ' + (testResults.isp >= 280 ? 'good' : 'bad');
    
    const pressureEl = document.getElementById('result-pressure');
    pressureEl.textContent = `${testResults.pressure.toFixed(1)} MPa`;
    pressureEl.className = 'perf-value ' + (testResults.pressure >= 20 && testResults.pressure <= 30 ? 'good' : 'bad');
    
    const durationEl = document.getElementById('result-duration');
    durationEl.textContent = `${testResults.duration.toFixed(1)} s`;
    durationEl.className = 'perf-value ' + (testResults.duration >= 5 ? 'good' : 'bad');
    
    // Current budget
    const remainingBudget = gameState.budget - gameState.budgetSpent;
    document.getElementById('results-current-budget').textContent = formatMoney(remainingBudget);
    document.getElementById('results-budget-addition').textContent = '';
    
    // Generate contracts
    renderContracts(testResults);
    
    showScreen('results-screen');
}

// ========== Contract Rendering ==========

function renderContracts(testResults) {
    const grid = document.getElementById('contracts-grid');
    grid.innerHTML = '';
    
    const costPerEngine = getManufacturingCostPerEngine();
    
    // Update header with progress
    const signedCount = getSignedContractsCount();
    const totalCount = getTotalContractsCount();
    const allComplete = areAllContractsSigned();
    const progressHeader = document.getElementById('contracts-progress-header');
    if (progressHeader) {
        progressHeader.textContent = `(${signedCount}/${totalCount} signed${allComplete ? ' ✓' : ''})`;
        progressHeader.style.color = allComplete ? '#4ade80' : '#a3a3a3';
        progressHeader.style.fontSize = '14px';
    }
    
    gameState.contracts.forEach(contract => {
        const isSigned = isContractSigned(contract.id);
        const meetsAll = checkContractRequirements(contract, testResults);
        
        const card = document.createElement('div');
        card.style.position = 'relative';
        
        if (isSigned) {
            card.className = 'contract-card signed';
        } else if (meetsAll) {
            card.className = 'contract-card';
        } else {
            card.className = 'contract-card locked';
        }
        card.dataset.contractId = contract.id;
        
        let reqText = `Requires: ${contract.requirements.thrust}+ kN, ${contract.requirements.isp}+ s Isp`;
        if (contract.requirements.pressure) {
            reqText += `, ${contract.requirements.pressure}+ MPa`;
        }
        
        const manufacturingCost = contract.engines * costPerEngine;
        const netProfit = contract.payout - manufacturingCost;
        
        card.innerHTML = `
            ${isSigned ? '<div class="contract-signed-badge">✓ Signed</div>' : ''}
            <div class="contract-org">
                <span class="contract-icon">${contract.icon}</span>
                <span class="contract-name">${contract.name}</span>
            </div>
            <div class="contract-desc">${contract.desc}</div>
            <div class="contract-requirements ${meetsAll || isSigned ? 'met' : 'unmet'}">${reqText}</div>
            <div class="contract-engines">🔧 ${contract.engines} engine${contract.engines > 1 ? 's' : ''} required</div>
            <div class="contract-costs">
                <span class="contract-payout">+${formatMoney(contract.payout)}</span>
                <span class="contract-manufacturing">-${formatMoney(manufacturingCost)} mfg</span>
            </div>
            <div class="contract-profit">Net: <span style="color: ${netProfit >= 0 ? '#4ade80' : '#ef4444'}">${formatMoney(netProfit)}</span></div>
        `;
        
        // Only allow clicking on unsigned contracts that meet requirements
        if (meetsAll && !isSigned) {
            card.addEventListener('click', () => handleContractClick(contract, card));
        }
        
        grid.appendChild(card);
    });
}

function handleContractClick(contract, card) {
    const wasSelected = toggleContractSelection(contract);
    
    if (wasSelected) {
        card.classList.add('selected');
    } else {
        card.classList.remove('selected');
    }
    
    updateContractSummary();
}

function updateContractSummary() {
    const additionEl = document.getElementById('results-budget-addition');
    
    if (gameState.selectedContracts.length > 0) {
        const totals = calculateSelectedContractsTotals();
        additionEl.innerHTML = `+${formatMoney(totals.totalPayout)} revenue<br>-${formatMoney(totals.totalManufacturing)} manufacturing (${totals.totalEngines} engines @ ${formatMoney(totals.costPerEngine)}/ea)<br><strong style="color: ${totals.netProfit >= 0 ? '#4ade80' : '#ef4444'}">Net: ${formatMoney(totals.netProfit)}</strong>`;
    } else {
        additionEl.textContent = '';
    }
}

// ========== Failure Screen ==========

function showFailureScreen(failure) {
    gameState.lastFailure = failure;
    
    // Render failure alerts
    const alertsContainer = document.getElementById('failure-alerts');
    alertsContainer.innerHTML = '';
    
    failure.causes.forEach(cause => {
        const alert = document.createElement('div');
        alert.className = 'failure-alert';
        alert.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${cause.icon}</span>
                <span class="alert-title">${cause.title}</span>
            </div>
            <div class="alert-description">${cause.description}</div>
            <div class="alert-consequence">${cause.consequence}</div>
        `;
        alertsContainer.appendChild(alert);
    });
    
    // Add final "Engine Failure" alert
    const finalAlert = document.createElement('div');
    finalAlert.className = 'failure-alert';
    finalAlert.innerHTML = `
        <div class="alert-header">
            <span class="alert-icon">⚠️</span>
            <span class="alert-title">Engine Failure!</span>
        </div>
        <div class="alert-description">Thrust dropped to 0 kN. Test terminated.</div>
        <div class="alert-consequence">No performance data recorded</div>
    `;
    alertsContainer.appendChild(finalAlert);
    
    // Render engineering suggestions
    const suggestionsContainer = document.getElementById('failure-suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (failure.suggestions && failure.suggestions.length > 0) {
        failure.suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'failure-suggestion';
            suggestionDiv.innerHTML = `
                <div class="suggestion-speaker">${suggestion.speaker}</div>
                <div class="suggestion-text">${suggestion.suggestion}</div>
            `;
            suggestionsContainer.appendChild(suggestionDiv);
        });
    }
    
    // Update consequence values
    document.getElementById('failure-thrust').textContent = `${failure.peakThrustBeforeFailure.toFixed(1)} kN`;
    document.getElementById('failure-duration').textContent = `${failure.duration.toFixed(1)} s`;
    
    // Update remaining budget
    const remainingBudget = gameState.budget - gameState.budgetSpent;
    document.getElementById('failure-budget').textContent = formatMoney(remainingBudget);
    
    showScreen('failure-screen');
}

// ========== Navigation Helpers ==========

function returnToDesignPhase() {
    document.querySelectorAll('.component-item').forEach(i => i.classList.remove('selected'));
    resetDesign();
    updateBudgetDisplays();
    updateComponentSelection();
    showScreen('design-phase');
}

// ========== Event Binding ==========

function initializeUI() {
    // Splash screen auto-advance
    setTimeout(() => showScreen('main-menu'), 2500);
    
    // Main Menu
    document.getElementById('new-game-btn').addEventListener('click', () => {
        showScreen('difficulty-screen');
    });
    
    // Difficulty Selection
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            setDifficulty(card.dataset.difficulty);
            updateBudgetDisplays();
        });
    });
    
    document.getElementById('diff-back-btn').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('confirm-difficulty-btn').addEventListener('click', () => {
        updateBudgetDisplays();
        showScreen('world-intro');
    });
    
    // World Intro
    document.getElementById('world-back-btn').addEventListener('click', () => showScreen('difficulty-screen'));
    document.getElementById('enter-level-btn').addEventListener('click', () => showScreen('level-briefing'));
    
    // Level Briefing
    document.getElementById('brief-back-btn').addEventListener('click', () => showScreen('world-intro'));
    document.getElementById('start-design-btn').addEventListener('click', () => {
        resetDesign();
        updateComponentSelection();
        showScreen('design-phase');
    });
    
    // Design Phase
    document.getElementById('design-back-btn').addEventListener('click', () => showScreen('level-briefing'));
    
    document.querySelectorAll('.component-item').forEach(item => {
        item.addEventListener('click', () => {
            const component = item.dataset.component;
            const category = item.dataset.category;
            const cost = parseInt(item.dataset.cost);
            
            // Deselect other items in same category
            document.querySelectorAll(`.component-item[data-category="${category}"]`).forEach(i => {
                i.classList.remove('selected');
            });
            
            // Toggle selection
            if (gameState.selectedComponents[category]?.id === component) {
                deselectComponent(category);
            } else {
                item.classList.add('selected');
                selectComponent(category, component, cost);
            }
            
            updateComponentSelection();
        });
    });
    
    document.getElementById('reset-design-btn').addEventListener('click', () => {
        document.querySelectorAll('.component-item').forEach(i => i.classList.remove('selected'));
        resetDesign();
        updateComponentSelection();
    });
    
    document.getElementById('test-fire-btn').addEventListener('click', () => {
        prepareForTest();
        
        if (window.rocketSim) {
            window.rocketSim.configureFromDesign(getComponentStatsForEngine());
        }
        showScreen('test-fire-screen');
    });
    
    // Help Overlay
    document.getElementById('help-btn').addEventListener('click', () => showScreen('help-overlay'));
    document.getElementById('close-help-btn').addEventListener('click', () => showScreen('design-phase'));
    
    // Results Screen
    document.getElementById('skip-contracts-btn').addEventListener('click', () => {
        gameState.selectedContracts = [];
        returnToDesignPhase();
    });
    
    document.getElementById('accept-contracts-btn').addEventListener('click', () => {
        acceptSelectedContracts();
        returnToDesignPhase();
    });
    
    // Failure Screen
    document.getElementById('failure-back-btn').addEventListener('click', () => {
        returnToDesignPhase();
    });
    
    // Initialize displays
    updateBudgetDisplays();
    updateComponentSelection();
}

// Expose for engine-3d.js
window.onTestComplete = showResultsScreen;
window.onTestFailure = showFailureScreen;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUI);
