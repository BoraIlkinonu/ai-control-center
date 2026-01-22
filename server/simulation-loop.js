/**
 * Simulation Loop Controller
 * Runs continuous random scenario simulations for training purposes
 */

const {
  FACTORY_BASELINE,
  COMPONENTS,
  BUILT_IN_PRESETS,
  activateScenario,
  clearActiveScenario,
  generateSimulatedData
} = require('./scenarios');

// Loop state
let loopState = {
  running: false,
  paused: false,
  iteration: 0,
  history: [],
  currentTimeout: null,
  options: {
    intervalMin: 5000,
    intervalMax: 20000,
    scenarioPool: 'all',
    autoApprove: true
  }
};

// Temp database for simulation (isolated from main mock services)
let tempDatabase = {
  emails: [],
  purchaseOrders: [],
  invoices: [],
  audits: [],
  notifications: []
};

/**
 * Vary a numeric value by a percentage
 */
function vary(value, percentage) {
  const variance = value * percentage;
  return Math.round(value + (Math.random() * variance * 2) - variance);
}

/**
 * Random integer between min and max (inclusive)
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random scenario from the pool
 */
function pickRandomScenario(pool) {
  const scenarios = pool === 'all'
    ? Object.keys(BUILT_IN_PRESETS)
    : pool;

  const randomIndex = Math.floor(Math.random() * scenarios.length);
  return scenarios[randomIndex];
}

/**
 * Randomize scenario parameters within reasonable bounds
 */
function randomizeScenarioParams(scenarioId) {
  const baseScenario = BUILT_IN_PRESETS[scenarioId];
  if (!baseScenario) return null;

  const randomized = JSON.parse(JSON.stringify(baseScenario));
  const params = randomized.parameters;

  // Randomize order parameters
  if (params.injectOrder) {
    params.orderQuantity = vary(params.orderQuantity, 0.3);
    params.orderDeadlineDays = vary(params.orderDeadlineDays, 0.25);
    params.penaltyPerDayLate = vary(params.penaltyPerDayLate || 1000, 0.5);
  }

  // Randomize inventory levels
  if (params.inventoryLevels) {
    Object.keys(params.inventoryLevels).forEach(sku => {
      params.inventoryLevels[sku] = vary(params.inventoryLevels[sku], 0.3);
    });
  }

  // Randomize operational parameters
  params.workersAvailable = vary(params.workersAvailable || 100, 0.15);
  params.machineEfficiency = randomBetween(80, 98);
  params.qualityIssueRate = randomBetween(2, 15);
  params.supplierReliability = randomBetween(60, 95);

  // Randomize budget
  if (params.budgetForExpediting) {
    params.budgetForExpediting = vary(params.budgetForExpediting, 0.4);
  }

  return randomized;
}

/**
 * Generate a unique event ID
 */
function generateEventId() {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Clear temp database
 */
function clearTempDatabase() {
  tempDatabase = {
    emails: [],
    purchaseOrders: [],
    invoices: [],
    audits: [],
    notifications: []
  };
}

/**
 * Start the simulation loop
 */
function startLoop(options, broadcast, runPipeline) {
  if (loopState.running) {
    return { success: false, message: 'Loop already running' };
  }

  loopState = {
    running: true,
    paused: false,
    iteration: 0,
    history: [],
    currentTimeout: null,
    options: {
      intervalMin: options.intervalMin || 5000,
      intervalMax: options.intervalMax || 20000,
      scenarioPool: options.scenarioPool || 'all',
      autoApprove: options.autoApprove !== false
    }
  };

  // Clear temp database for fresh simulation
  clearTempDatabase();

  // Broadcast initial status
  broadcast({
    type: 'simulation_status',
    data: {
      running: true,
      paused: false,
      iteration: 0,
      message: 'Simulation loop started'
    }
  });

  // Start the loop
  scheduleNextEvent(broadcast, runPipeline);

  return { success: true, message: 'Simulation loop started' };
}

/**
 * Schedule the next simulation event
 */
function scheduleNextEvent(broadcast, runPipeline) {
  if (!loopState.running || loopState.paused) return;

  const delay = randomBetween(loopState.options.intervalMin, loopState.options.intervalMax);

  loopState.currentTimeout = setTimeout(async () => {
    if (!loopState.running || loopState.paused) return;

    loopState.iteration++;
    const eventId = generateEventId();

    // Pick and randomize a scenario
    const scenarioId = pickRandomScenario(loopState.options.scenarioPool);
    const randomizedScenario = randomizeScenarioParams(scenarioId);

    if (!randomizedScenario) {
      console.error('Failed to randomize scenario:', scenarioId);
      scheduleNextEvent(broadcast, runPipeline);
      return;
    }

    // Generate simulated data
    const simulatedData = generateSimulatedData(randomizedScenario.parameters);
    randomizedScenario.simulatedData = simulatedData;
    randomizedScenario.activatedAt = new Date().toISOString();
    randomizedScenario.eventId = eventId;
    randomizedScenario.iteration = loopState.iteration;

    // Log the event
    const eventRecord = {
      eventId,
      iteration: loopState.iteration,
      timestamp: new Date().toISOString(),
      scenarioId,
      scenarioName: randomizedScenario.name,
      parameters: {
        orderQuantity: randomizedScenario.parameters.orderQuantity,
        deadlineDays: randomizedScenario.parameters.orderDeadlineDays,
        qualityIssueRate: randomizedScenario.parameters.qualityIssueRate
      },
      status: 'started'
    };

    loopState.history.push(eventRecord);
    if (loopState.history.length > 50) {
      loopState.history.shift(); // Keep last 50 events
    }

    // Broadcast event start
    broadcast({
      type: 'simulation_event',
      data: {
        eventId,
        iteration: loopState.iteration,
        scenario: randomizedScenario,
        status: 'started',
        message: `Scenario: ${randomizedScenario.name}`
      }
    });

    broadcast({
      type: 'log',
      data: {
        timestamp: new Date().toISOString(),
        type: 'step',
        message: `[LOOP #${loopState.iteration}] Starting scenario: ${randomizedScenario.name}`
      }
    });

    // Activate the scenario
    try {
      // Update active scenario
      broadcast({
        type: 'scenario_activated',
        data: randomizedScenario
      });

      // If auto-approve is on, just broadcast the scenario data
      // The frontend will show it and it will auto-proceed
      if (loopState.options.autoApprove && runPipeline) {
        // Run the pipeline with auto-pilot
        await runPipeline(true, randomizedScenario);
      }

      // Update event record
      eventRecord.status = 'completed';

      // Broadcast event completion
      broadcast({
        type: 'simulation_event',
        data: {
          eventId,
          iteration: loopState.iteration,
          scenario: randomizedScenario,
          status: 'completed'
        }
      });

    } catch (error) {
      console.error('Simulation event error:', error);
      eventRecord.status = 'error';
      eventRecord.error = error.message;

      broadcast({
        type: 'log',
        data: {
          timestamp: new Date().toISOString(),
          type: 'error',
          message: `[LOOP #${loopState.iteration}] Error: ${error.message}`
        }
      });
    }

    // Schedule next event
    scheduleNextEvent(broadcast, runPipeline);

  }, delay);

  broadcast({
    type: 'log',
    data: {
      timestamp: new Date().toISOString(),
      type: 'info',
      message: `Next simulation event in ${(delay / 1000).toFixed(1)}s...`
    }
  });
}

/**
 * Stop the simulation loop
 */
function stopLoop(broadcast) {
  if (!loopState.running) {
    return { success: false, message: 'Loop not running' };
  }

  if (loopState.currentTimeout) {
    clearTimeout(loopState.currentTimeout);
  }

  loopState.running = false;
  loopState.paused = false;
  loopState.currentTimeout = null;

  // Clear active scenario
  broadcast({
    type: 'scenario_deactivated'
  });

  broadcast({
    type: 'simulation_status',
    data: {
      running: false,
      paused: false,
      iteration: loopState.iteration,
      message: 'Simulation loop stopped',
      totalIterations: loopState.iteration
    }
  });

  broadcast({
    type: 'log',
    data: {
      timestamp: new Date().toISOString(),
      type: 'success',
      message: `Simulation loop stopped after ${loopState.iteration} iterations`
    }
  });

  return {
    success: true,
    message: 'Simulation loop stopped',
    totalIterations: loopState.iteration,
    history: loopState.history
  };
}

/**
 * Pause the simulation loop
 */
function pauseLoop(broadcast) {
  if (!loopState.running) {
    return { success: false, message: 'Loop not running' };
  }

  if (loopState.paused) {
    return { success: false, message: 'Loop already paused' };
  }

  if (loopState.currentTimeout) {
    clearTimeout(loopState.currentTimeout);
  }

  loopState.paused = true;

  broadcast({
    type: 'simulation_status',
    data: {
      running: true,
      paused: true,
      iteration: loopState.iteration,
      message: 'Simulation loop paused'
    }
  });

  return { success: true, message: 'Simulation loop paused' };
}

/**
 * Resume the simulation loop
 */
function resumeLoop(broadcast, runPipeline) {
  if (!loopState.running) {
    return { success: false, message: 'Loop not running' };
  }

  if (!loopState.paused) {
    return { success: false, message: 'Loop not paused' };
  }

  loopState.paused = false;

  broadcast({
    type: 'simulation_status',
    data: {
      running: true,
      paused: false,
      iteration: loopState.iteration,
      message: 'Simulation loop resumed'
    }
  });

  scheduleNextEvent(broadcast, runPipeline);

  return { success: true, message: 'Simulation loop resumed' };
}

/**
 * Get current loop status
 */
function getLoopStatus() {
  return {
    running: loopState.running,
    paused: loopState.paused,
    iteration: loopState.iteration,
    historyCount: loopState.history.length,
    options: loopState.options
  };
}

/**
 * Get loop history
 */
function getLoopHistory() {
  return loopState.history;
}

/**
 * Get temp database (for isolated simulation data)
 */
function getTempDatabase() {
  return tempDatabase;
}

module.exports = {
  startLoop,
  stopLoop,
  pauseLoop,
  resumeLoop,
  getLoopStatus,
  getLoopHistory,
  getTempDatabase,
  clearTempDatabase
};
