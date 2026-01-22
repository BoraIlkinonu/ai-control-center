/**
 * SCENARIO SIMULATION ENGINE
 * Manages scenario presets, parameter injection, and data simulation
 */

// Factory capacity and constraints (baseline)
const FACTORY_BASELINE = {
  dailyCapacity: 500,           // Units per day at normal operation
  maxCapacity: 750,             // Units per day at full overtime
  workersTotal: 200,            // Total workforce
  productionWorkers: 120,       // Workers on production line
  shiftsPerDay: 2,              // Normal shifts
  maxShiftsPerDay: 3,           // With overtime
  hoursPerShift: 8,

  // Costs
  workerHourlyRate: 25,         // Regular hourly rate
  overtimeMultiplier: 1.5,      // Overtime pay multiplier
  tempWorkerHourlyRate: 35,     // Temp agency rate
  tempWorkerMinDays: 5,         // Minimum temp contract

  // Lead times (days)
  normalMaterialLeadTime: 7,
  expeditedMaterialLeadTime: 2,
  expeditedMaterialPremium: 2.5, // 2.5x cost for rush orders

  // Inventory thresholds
  safetyStockDays: 5,
  criticalStockDays: 2
};

// Component costs and lead times
const COMPONENTS = {
  'BT-5300': { name: 'Bluetooth Chip', unitCost: 2.50, normalLead: 7, rushLead: 2, rushPremium: 2.5, minOrder: 500 },
  'DRV-10MM': { name: 'Driver Unit', unitCost: 1.80, normalLead: 5, rushLead: 2, rushPremium: 2.0, minOrder: 500 },
  'BAT-055': { name: 'Lithium Battery', unitCost: 0.90, normalLead: 10, rushLead: 3, rushPremium: 3.0, minOrder: 1000 },
  'BAT-500': { name: 'Case Battery', unitCost: 2.20, normalLead: 10, rushLead: 3, rushPremium: 3.0, minOrder: 500 },
  'TIP-SML': { name: 'Ear Tips Set', unitCost: 0.30, normalLead: 3, rushLead: 1, rushPremium: 1.5, minOrder: 2000 },
  'HSG-ABS': { name: 'ABS Housing', unitCost: 0.45, normalLead: 4, rushLead: 1, rushPremium: 1.8, minOrder: 1000 },
  'TCH-CAP': { name: 'Touch Sensor', unitCost: 1.10, normalLead: 7, rushLead: 2, rushPremium: 2.5, minOrder: 500 },
  'MIC-MEMS': { name: 'MEMS Microphone', unitCost: 0.70, normalLead: 5, rushLead: 2, rushPremium: 2.2, minOrder: 1000 },
  'USB-C01': { name: 'USB-C Port', unitCost: 0.40, normalLead: 4, rushLead: 1, rushPremium: 1.8, minOrder: 1000 },
  'PCB-MAIN': { name: 'Main PCB', unitCost: 1.50, normalLead: 8, rushLead: 3, rushPremium: 2.8, minOrder: 500 },
  'PKG-BOX': { name: 'Packaging', unitCost: 0.80, normalLead: 3, rushLead: 1, rushPremium: 1.5, minOrder: 1000 },
  'DOC-MAN': { name: 'User Manual', unitCost: 0.10, normalLead: 2, rushLead: 1, rushPremium: 1.3, minOrder: 2000 }
};

// Built-in scenario presets
const BUILT_IN_PRESETS = {
  'normal_operations': {
    id: 'normal_operations',
    name: 'Normal Operations',
    description: 'Standard day-to-day operations with typical order volume',
    isBuiltIn: true,
    parameters: {
      // Injected order
      injectOrder: false,
      orderQuantity: 0,
      orderDeadlineDays: 0,
      orderPriority: 'normal',
      customerType: 'regular',

      // Current inventory levels (% of safety stock)
      inventoryLevels: {
        'BT-5300': 100,
        'DRV-10MM': 100,
        'BAT-055': 100,
        'BAT-500': 100,
        'TIP-SML': 120,
        'HSG-ABS': 110,
        'TCH-CAP': 95,
        'MIC-MEMS': 100,
        'USB-C01': 130,
        'PCB-MAIN': 90,
        'PKG-BOX': 150,
        'DOC-MAN': 200
      },

      // Workforce
      workersAvailable: 100,      // % of normal workforce
      tempWorkersAvailable: true,
      maxTempWorkers: 30,

      // Production constraints
      machineEfficiency: 100,     // % efficiency
      qualityIssueRate: 3,        // % defect rate

      // External factors
      supplierReliability: 95,    // % on-time delivery
      shippingDelays: false,

      // Financial constraints
      budgetForExpediting: 50000,
      maxOvertimeHoursPerWeek: 160
    }
  },

  'urgent_large_order': {
    id: 'urgent_large_order',
    name: 'Urgent Large Order',
    description: 'Major customer needs 5,000 units in 10 days - exceeds normal capacity',
    isBuiltIn: true,
    parameters: {
      injectOrder: true,
      orderQuantity: 5000,
      orderDeadlineDays: 10,
      orderPriority: 'critical',
      customerType: 'key_account',
      customerName: 'TechMart Distribution',
      penaltyPerDayLate: 5000,

      inventoryLevels: {
        'BT-5300': 60,
        'DRV-10MM': 70,
        'BAT-055': 45,
        'BAT-500': 50,
        'TIP-SML': 120,
        'HSG-ABS': 80,
        'TCH-CAP': 55,
        'MIC-MEMS': 75,
        'USB-C01': 90,
        'PCB-MAIN': 40,
        'PKG-BOX': 100,
        'DOC-MAN': 150
      },

      workersAvailable: 95,
      tempWorkersAvailable: true,
      maxTempWorkers: 50,

      machineEfficiency: 95,
      qualityIssueRate: 4,

      supplierReliability: 90,
      shippingDelays: false,

      budgetForExpediting: 100000,
      maxOvertimeHoursPerWeek: 300
    }
  },

  'supply_chain_crisis': {
    id: 'supply_chain_crisis',
    name: 'Supply Chain Crisis',
    description: 'Critical component shortage - main chip supplier has 3-week delay',
    isBuiltIn: true,
    parameters: {
      injectOrder: true,
      orderQuantity: 2000,
      orderDeadlineDays: 14,
      orderPriority: 'high',
      customerType: 'regular',

      inventoryLevels: {
        'BT-5300': 15,   // CRITICAL - only 15% of safety stock
        'DRV-10MM': 80,
        'BAT-055': 25,   // LOW
        'BAT-500': 30,   // LOW
        'TIP-SML': 100,
        'HSG-ABS': 90,
        'TCH-CAP': 20,   // CRITICAL
        'MIC-MEMS': 85,
        'USB-C01': 95,
        'PCB-MAIN': 35,  // LOW
        'PKG-BOX': 120,
        'DOC-MAN': 180
      },

      // Supplier issues
      supplierDelays: {
        'BT-5300': 21,   // 3 weeks additional delay
        'TCH-CAP': 14,   // 2 weeks additional delay
        'BAT-055': 7     // 1 week additional delay
      },

      workersAvailable: 100,
      tempWorkersAvailable: true,
      maxTempWorkers: 20,

      machineEfficiency: 100,
      qualityIssueRate: 3,

      supplierReliability: 60,
      shippingDelays: true,

      budgetForExpediting: 75000,
      maxOvertimeHoursPerWeek: 200
    }
  },

  'quality_crisis': {
    id: 'quality_crisis',
    name: 'Quality Crisis',
    description: 'Defect rate spiked to 15% - batch recall possible, production slowdown needed',
    isBuiltIn: true,
    parameters: {
      injectOrder: true,
      orderQuantity: 1500,
      orderDeadlineDays: 12,
      orderPriority: 'high',
      customerType: 'regular',

      inventoryLevels: {
        'BT-5300': 70,
        'DRV-10MM': 65,   // Suspected bad batch
        'BAT-055': 80,
        'BAT-500': 75,
        'TIP-SML': 100,
        'HSG-ABS': 60,    // Suspected bad batch
        'TCH-CAP': 85,
        'MIC-MEMS': 90,
        'USB-C01': 95,
        'PCB-MAIN': 70,
        'PKG-BOX': 110,
        'DOC-MAN': 150
      },

      // Quality issues
      qualityIssueRate: 15,
      suspectedBadBatches: ['DRV-10MM', 'HSG-ABS'],
      recallRisk: true,
      unitsAtRisk: 800,

      workersAvailable: 100,
      tempWorkersAvailable: false,  // No temps during quality crisis
      maxTempWorkers: 0,

      machineEfficiency: 70,  // Reduced for extra QC

      supplierReliability: 85,
      shippingDelays: false,

      budgetForExpediting: 40000,
      maxOvertimeHoursPerWeek: 100  // Limited OT during crisis
    }
  },

  'seasonal_peak': {
    id: 'seasonal_peak',
    name: 'Holiday Season Peak',
    description: 'Q4 holiday rush - multiple large orders, all resources stretched',
    isBuiltIn: true,
    parameters: {
      injectOrder: true,
      orderQuantity: 8000,
      orderDeadlineDays: 21,
      orderPriority: 'high',
      customerType: 'multiple',

      // Multiple orders scenario
      additionalOrders: [
        { customer: 'ElectroWorld', quantity: 3000, deadline: 18 },
        { customer: 'GadgetZone', quantity: 2500, deadline: 21 },
        { customer: 'TechHub Online', quantity: 2500, deadline: 25 }
      ],

      inventoryLevels: {
        'BT-5300': 85,
        'DRV-10MM': 90,
        'BAT-055': 80,
        'BAT-500': 85,
        'TIP-SML': 70,
        'HSG-ABS': 75,
        'TCH-CAP': 80,
        'MIC-MEMS': 85,
        'USB-C01': 90,
        'PCB-MAIN': 70,
        'PKG-BOX': 60,   // Running low on packaging
        'DOC-MAN': 100
      },

      workersAvailable: 90,  // Some on vacation
      tempWorkersAvailable: true,
      maxTempWorkers: 80,    // More temps available in Q4

      machineEfficiency: 92,
      qualityIssueRate: 5,   // Slightly higher due to pace

      supplierReliability: 80,  // Everyone is busy
      shippingDelays: true,     // Carrier congestion

      budgetForExpediting: 150000,
      maxOvertimeHoursPerWeek: 400
    }
  },

  'cost_optimization': {
    id: 'cost_optimization',
    name: 'Cost Optimization Challenge',
    description: 'Meet demand while minimizing costs - tight margins, no rush spending',
    isBuiltIn: true,
    parameters: {
      injectOrder: true,
      orderQuantity: 3000,
      orderDeadlineDays: 30,
      orderPriority: 'normal',
      customerType: 'price_sensitive',
      targetMargin: 25,  // Must maintain 25% margin

      inventoryLevels: {
        'BT-5300': 110,
        'DRV-10MM': 105,
        'BAT-055': 95,
        'BAT-500': 100,
        'TIP-SML': 130,
        'HSG-ABS': 120,
        'TCH-CAP': 100,
        'MIC-MEMS': 110,
        'USB-C01': 125,
        'PCB-MAIN': 90,
        'PKG-BOX': 140,
        'DOC-MAN': 200
      },

      workersAvailable: 100,
      tempWorkersAvailable: false,  // Too expensive
      maxTempWorkers: 0,

      machineEfficiency: 98,
      qualityIssueRate: 2,

      supplierReliability: 95,
      shippingDelays: false,

      budgetForExpediting: 10000,  // Very limited
      maxOvertimeHoursPerWeek: 80   // Minimize OT
    }
  }
};

// In-memory storage for custom presets
let customPresets = {};

// Current active scenario
let activeScenario = null;

/**
 * Get all available presets (built-in + custom)
 */
function getAllPresets() {
  return {
    builtIn: Object.values(BUILT_IN_PRESETS),
    custom: Object.values(customPresets)
  };
}

/**
 * Get a specific preset by ID
 */
function getPreset(presetId) {
  return BUILT_IN_PRESETS[presetId] || customPresets[presetId] || null;
}

/**
 * Save a custom preset
 */
function saveCustomPreset(preset) {
  const id = preset.id || `custom_${Date.now()}`;
  customPresets[id] = {
    ...preset,
    id,
    isBuiltIn: false,
    createdAt: new Date().toISOString()
  };
  return customPresets[id];
}

/**
 * Delete a custom preset
 */
function deleteCustomPreset(presetId) {
  if (customPresets[presetId]) {
    delete customPresets[presetId];
    return true;
  }
  return false;
}

/**
 * Activate a scenario
 */
function activateScenario(presetId) {
  const preset = getPreset(presetId);
  if (!preset) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  activeScenario = {
    ...preset,
    activatedAt: new Date().toISOString(),
    simulatedData: generateSimulatedData(preset.parameters)
  };

  return activeScenario;
}

/**
 * Get current active scenario
 */
function getActiveScenario() {
  return activeScenario;
}

/**
 * Clear active scenario (return to real data)
 */
function clearActiveScenario() {
  activeScenario = null;
}

/**
 * Generate simulated data based on scenario parameters
 */
function generateSimulatedData(params) {
  const simulated = {
    injectedOrders: [],
    inventoryStatus: [],
    capacityAnalysis: {},
    materialRequirements: [],
    laborAnalysis: {},
    costProjections: {},
    timeline: [],
    criticalDecisions: []
  };

  // Generate injected orders
  if (params.injectOrder) {
    const mainOrder = {
      order_id: `SIM-ORD-${Date.now()}`,
      customer_id: params.customerName || 'Simulated Customer',
      customer_type: params.customerType,
      total_quantity: params.orderQuantity,
      deadline_days: params.orderDeadlineDays,
      priority: params.orderPriority,
      penalty_per_day_late: params.penaltyPerDayLate || 0,
      status: 'Urgent',
      order_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + params.orderDeadlineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    simulated.injectedOrders.push(mainOrder);

    // Add additional orders if present
    if (params.additionalOrders) {
      params.additionalOrders.forEach((ord, idx) => {
        simulated.injectedOrders.push({
          order_id: `SIM-ORD-${Date.now()}-${idx}`,
          customer_id: ord.customer,
          total_quantity: ord.quantity,
          deadline_days: ord.deadline,
          priority: 'high',
          status: 'Confirmed',
          order_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + ord.deadline * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      });
    }
  }

  // Calculate total demand
  const totalDemand = simulated.injectedOrders.reduce((sum, o) => sum + o.total_quantity, 0);
  const earliestDeadline = Math.min(...simulated.injectedOrders.map(o => o.deadline_days || 999));

  // Capacity analysis
  const normalCapacity = FACTORY_BASELINE.dailyCapacity * earliestDeadline;
  const maxCapacity = FACTORY_BASELINE.maxCapacity * earliestDeadline;
  const capacityShortfall = totalDemand - normalCapacity;
  const canMeetWithOvertime = totalDemand <= maxCapacity;

  simulated.capacityAnalysis = {
    totalDemand,
    earliestDeadline,
    normalDailyCapacity: FACTORY_BASELINE.dailyCapacity,
    maxDailyCapacity: FACTORY_BASELINE.maxCapacity,
    normalCapacityInPeriod: normalCapacity,
    maxCapacityInPeriod: maxCapacity,
    capacityShortfall: Math.max(0, capacityShortfall),
    capacityUtilization: Math.round((totalDemand / normalCapacity) * 100),
    canMeetWithNormalOps: totalDemand <= normalCapacity,
    canMeetWithOvertime,
    requiresExternalHelp: !canMeetWithOvertime,
    daysNeededAtNormalPace: Math.ceil(totalDemand / FACTORY_BASELINE.dailyCapacity),
    daysNeededAtMaxPace: Math.ceil(totalDemand / FACTORY_BASELINE.maxCapacity)
  };

  // Inventory status and material requirements
  const safetyStockUnits = FACTORY_BASELINE.dailyCapacity * FACTORY_BASELINE.safetyStockDays;

  Object.keys(COMPONENTS).forEach(sku => {
    const component = COMPONENTS[sku];
    const levelPercent = params.inventoryLevels[sku] || 100;
    const currentStock = Math.round(safetyStockUnits * (levelPercent / 100));
    const requiredForOrder = totalDemand; // 1:1 for simplicity
    const shortage = Math.max(0, requiredForOrder - currentStock);
    const supplierDelay = params.supplierDelays?.[sku] || 0;

    const status = {
      sku,
      name: component.name,
      currentStock,
      levelPercent,
      required: requiredForOrder,
      shortage,
      status: levelPercent < 30 ? 'CRITICAL' : levelPercent < 60 ? 'LOW' : 'OK',
      normalLeadDays: component.normalLead + supplierDelay,
      rushLeadDays: component.rushLead + Math.floor(supplierDelay / 2),
      normalCost: shortage * component.unitCost,
      rushCost: shortage * component.unitCost * component.rushPremium,
      supplierDelay
    };

    simulated.inventoryStatus.push(status);

    if (shortage > 0) {
      simulated.materialRequirements.push({
        ...status,
        orderQuantity: Math.max(shortage, component.minOrder),
        normalDeliveryDate: new Date(Date.now() + status.normalLeadDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rushDeliveryDate: new Date(Date.now() + status.rushLeadDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        recommendation: status.normalLeadDays > earliestDeadline ? 'RUSH_ORDER' : 'NORMAL_ORDER'
      });
    }
  });

  // Labor analysis
  const workersNeeded = Math.ceil(totalDemand / (earliestDeadline * (FACTORY_BASELINE.dailyCapacity / FACTORY_BASELINE.productionWorkers)));
  const currentWorkers = Math.round(FACTORY_BASELINE.productionWorkers * (params.workersAvailable / 100));
  const workerShortfall = Math.max(0, workersNeeded - currentWorkers);

  const regularHours = earliestDeadline * FACTORY_BASELINE.hoursPerShift * FACTORY_BASELINE.shiftsPerDay;
  const overtimeHoursNeeded = simulated.capacityAnalysis.capacityShortfall > 0
    ? Math.ceil((simulated.capacityAnalysis.capacityShortfall / FACTORY_BASELINE.dailyCapacity) * FACTORY_BASELINE.hoursPerShift * currentWorkers)
    : 0;

  simulated.laborAnalysis = {
    currentProductionWorkers: currentWorkers,
    workersNeededForPace: workersNeeded,
    workerShortfall,
    tempWorkersAvailable: params.tempWorkersAvailable,
    maxTempWorkers: params.maxTempWorkers || 0,
    tempWorkersNeeded: Math.min(workerShortfall, params.maxTempWorkers || 0),

    regularHoursAvailable: regularHours * currentWorkers,
    overtimeHoursNeeded,
    overtimeHoursAllowed: params.maxOvertimeHoursPerWeek * Math.ceil(earliestDeadline / 7),
    overtimePossible: overtimeHoursNeeded <= (params.maxOvertimeHoursPerWeek * Math.ceil(earliestDeadline / 7)),

    regularLaborCost: regularHours * currentWorkers * FACTORY_BASELINE.workerHourlyRate,
    overtimeLaborCost: overtimeHoursNeeded * FACTORY_BASELINE.workerHourlyRate * FACTORY_BASELINE.overtimeMultiplier,
    tempLaborCost: workerShortfall * earliestDeadline * FACTORY_BASELINE.hoursPerShift * FACTORY_BASELINE.tempWorkerHourlyRate
  };

  // Cost projections
  const materialCostNormal = simulated.materialRequirements.reduce((sum, m) => sum + m.normalCost, 0);
  const materialCostRush = simulated.materialRequirements.reduce((sum, m) => sum + m.rushCost, 0);

  simulated.costProjections = {
    scenario1_normal: {
      name: 'Normal Operations (May Miss Deadline)',
      materials: materialCostNormal,
      labor: simulated.laborAnalysis.regularLaborCost,
      total: materialCostNormal + simulated.laborAnalysis.regularLaborCost,
      estimatedCompletionDays: simulated.capacityAnalysis.daysNeededAtNormalPace,
      meetsDeadline: simulated.capacityAnalysis.canMeetWithNormalOps,
      penalties: simulated.capacityAnalysis.canMeetWithNormalOps ? 0 :
        (simulated.capacityAnalysis.daysNeededAtNormalPace - earliestDeadline) * (params.penaltyPerDayLate || 0)
    },
    scenario2_overtime: {
      name: 'Maximum Overtime',
      materials: materialCostNormal,
      labor: simulated.laborAnalysis.regularLaborCost + simulated.laborAnalysis.overtimeLaborCost,
      total: materialCostNormal + simulated.laborAnalysis.regularLaborCost + simulated.laborAnalysis.overtimeLaborCost,
      estimatedCompletionDays: simulated.capacityAnalysis.daysNeededAtMaxPace,
      meetsDeadline: simulated.capacityAnalysis.canMeetWithOvertime,
      penalties: 0
    },
    scenario3_rush: {
      name: 'Rush Everything (Materials + Overtime)',
      materials: materialCostRush,
      labor: simulated.laborAnalysis.regularLaborCost + simulated.laborAnalysis.overtimeLaborCost + simulated.laborAnalysis.tempLaborCost,
      total: materialCostRush + simulated.laborAnalysis.regularLaborCost + simulated.laborAnalysis.overtimeLaborCost + simulated.laborAnalysis.tempLaborCost,
      estimatedCompletionDays: Math.max(
        ...simulated.materialRequirements.map(m => m.rushLeadDays),
        simulated.capacityAnalysis.daysNeededAtMaxPace
      ),
      meetsDeadline: true,
      penalties: 0
    }
  };

  // Critical decisions the AI should present
  simulated.criticalDecisions = [];

  // Decision 1: Order acceptance
  if (!simulated.capacityAnalysis.canMeetWithNormalOps) {
    simulated.criticalDecisions.push({
      id: 'order_acceptance',
      priority: 'CRITICAL',
      title: 'Order Acceptance Decision',
      question: `Should we accept this ${totalDemand}-unit order with ${earliestDeadline}-day deadline?`,
      context: `Normal capacity is ${normalCapacity} units in this period. We would need ${simulated.capacityAnalysis.capacityShortfall} additional units.`,
      options: [
        { id: 'accept_full', label: 'Accept full order', impact: 'Requires overtime and/or rush materials', risk: 'High' },
        { id: 'accept_partial', label: 'Counter-offer partial delivery', impact: 'Propose split shipment', risk: 'Medium' },
        { id: 'negotiate_deadline', label: 'Negotiate extended deadline', impact: `Need ${simulated.capacityAnalysis.daysNeededAtNormalPace} days`, risk: 'Low' },
        { id: 'decline', label: 'Decline order', impact: 'Protect current commitments', risk: 'Customer relationship' }
      ],
      recommendation: simulated.capacityAnalysis.canMeetWithOvertime ? 'accept_full' : 'negotiate_deadline'
    });
  }

  // Decision 2: Material procurement
  const criticalMaterials = simulated.materialRequirements.filter(m => m.recommendation === 'RUSH_ORDER');
  if (criticalMaterials.length > 0) {
    simulated.criticalDecisions.push({
      id: 'material_procurement',
      priority: 'HIGH',
      title: 'Material Procurement Strategy',
      question: `${criticalMaterials.length} components need rush ordering. Total rush premium: $${(materialCostRush - materialCostNormal).toFixed(2)}`,
      context: criticalMaterials.map(m => `${m.name}: ${m.shortage} units needed, normal ${m.normalLeadDays}d vs rush ${m.rushLeadDays}d`).join('\n'),
      options: [
        { id: 'rush_all', label: 'Rush order all materials', impact: `+$${(materialCostRush - materialCostNormal).toFixed(2)} premium`, risk: 'Cost overrun' },
        { id: 'rush_critical', label: 'Rush only critical path items', impact: 'Selective spending', risk: 'Some delays possible' },
        { id: 'normal_order', label: 'Normal ordering (accept delay)', impact: 'Save rush premiums', risk: 'Miss deadline' },
        { id: 'split_orders', label: 'Split between normal and rush', impact: 'Balance cost and time', risk: 'Complexity' }
      ],
      recommendation: params.budgetForExpediting >= (materialCostRush - materialCostNormal) ? 'rush_critical' : 'split_orders'
    });
  }

  // Decision 3: Labor strategy
  if (simulated.laborAnalysis.overtimeHoursNeeded > 0) {
    simulated.criticalDecisions.push({
      id: 'labor_strategy',
      priority: 'HIGH',
      title: 'Workforce Strategy',
      question: `Need ${simulated.laborAnalysis.overtimeHoursNeeded} additional labor hours. How should we proceed?`,
      context: `Current workers: ${currentWorkers}, Overtime allowed: ${params.maxOvertimeHoursPerWeek}h/week, Temp workers available: ${params.tempWorkersAvailable ? params.maxTempWorkers : 'No'}`,
      options: [
        { id: 'overtime_only', label: 'Maximize overtime', impact: `$${simulated.laborAnalysis.overtimeLaborCost.toFixed(2)} cost`, risk: 'Worker fatigue' },
        { id: 'hire_temps', label: 'Hire temporary workers', impact: `$${simulated.laborAnalysis.tempLaborCost.toFixed(2)} for ${simulated.laborAnalysis.tempWorkersNeeded} temps`, risk: 'Training time' },
        { id: 'mixed', label: 'Combination approach', impact: 'Balance cost and capacity', risk: 'Coordination complexity' },
        { id: 'pace_production', label: 'Pace production (avoid idle days)', impact: 'Steady production rate', risk: 'May not meet deadline' }
      ],
      recommendation: params.tempWorkersAvailable && simulated.laborAnalysis.workerShortfall > 5 ? 'mixed' : 'overtime_only'
    });
  }

  // Decision 4: Production pacing
  const criticalStockItems = simulated.inventoryStatus.filter(i => i.status === 'CRITICAL');
  if (criticalStockItems.length > 0) {
    const daysUntilStockout = Math.min(...criticalStockItems.map(i => Math.floor(i.currentStock / (FACTORY_BASELINE.dailyCapacity / 1))));
    simulated.criticalDecisions.push({
      id: 'production_pacing',
      priority: 'CRITICAL',
      title: 'Production Pacing Decision',
      question: `Critical materials run out in ~${daysUntilStockout} days at full capacity. Should we slow production?`,
      context: `Running full capacity risks stockout and idle workers. Slowing down extends timeline but ensures continuous production.`,
      options: [
        { id: 'full_speed', label: 'Run full capacity, risk stockout', impact: 'Maximum early output', risk: 'Potential idle days later' },
        { id: 'paced_50', label: 'Reduce to 50% capacity', impact: 'Stretch materials', risk: 'Longer timeline' },
        { id: 'paced_75', label: 'Reduce to 75% capacity', impact: 'Balance approach', risk: 'Moderate delay' },
        { id: 'front_load', label: 'Full speed, then idle, then resume', impact: 'Complex scheduling', risk: 'Worker morale' }
      ],
      recommendation: daysUntilStockout < 3 ? 'paced_75' : 'full_speed'
    });
  }

  // Decision 5: Quality tradeoffs (if quality issues present)
  if (params.qualityIssueRate > 5 || params.recallRisk) {
    simulated.criticalDecisions.push({
      id: 'quality_tradeoff',
      priority: 'CRITICAL',
      title: 'Quality vs Speed Tradeoff',
      question: `Current defect rate: ${params.qualityIssueRate}%. How do we balance quality and delivery?`,
      context: params.recallRisk ? `RECALL RISK: ${params.unitsAtRisk} units may need inspection/rework.` : 'Elevated defect rate affects net output.',
      options: [
        { id: 'full_qc', label: '100% inspection (slow but safe)', impact: '-30% throughput', risk: 'Deadline pressure' },
        { id: 'sample_qc', label: 'Statistical sampling', impact: 'Normal throughput', risk: 'Some defects ship' },
        { id: 'quarantine_batch', label: 'Quarantine suspected batches', impact: 'Reduce available inventory', risk: 'Material shortage' },
        { id: 'ship_replace', label: 'Ship now, offer replacements', impact: 'Meet deadline', risk: 'Customer satisfaction' }
      ],
      recommendation: params.recallRisk ? 'quarantine_batch' : 'sample_qc'
    });
  }

  return simulated;
}

/**
 * Build enhanced AI prompt with scenario context
 */
function buildScenarioAwarePrompt(baseData, scenario) {
  if (!scenario) {
    return null; // No scenario, use default prompt
  }

  const sim = scenario.simulatedData;

  const prompt = `You are an AI manufacturing operations advisor for SoundPod Pro wireless earbuds.

## ACTIVE SCENARIO: ${scenario.name}
${scenario.description}

## CRITICAL SITUATION SUMMARY
- **Total Demand**: ${sim.capacityAnalysis.totalDemand} units
- **Deadline**: ${sim.capacityAnalysis.earliestDeadline} days
- **Capacity Utilization**: ${sim.capacityAnalysis.capacityUtilization}%
- **Can Meet Normally**: ${sim.capacityAnalysis.canMeetWithNormalOps ? 'YES' : 'NO'}
- **Can Meet with Overtime**: ${sim.capacityAnalysis.canMeetWithOvertime ? 'YES' : 'NO'}

## INJECTED ORDERS
${JSON.stringify(sim.injectedOrders, null, 2)}

## INVENTORY STATUS (Items with Issues)
${sim.inventoryStatus.filter(i => i.status !== 'OK').map(i =>
  `- ${i.name} (${i.sku}): ${i.levelPercent}% of safety stock, ${i.shortage} units short`
).join('\n')}

## MATERIAL REQUIREMENTS
${sim.materialRequirements.map(m =>
  `- ${m.name}: Need ${m.orderQuantity} units, Normal: ${m.normalLeadDays}d/$${m.normalCost.toFixed(2)}, Rush: ${m.rushLeadDays}d/$${m.rushCost.toFixed(2)}`
).join('\n')}

## LABOR SITUATION
- Current Workers: ${sim.laborAnalysis.currentProductionWorkers}
- Overtime Hours Needed: ${sim.laborAnalysis.overtimeHoursNeeded}
- Overtime Possible: ${sim.laborAnalysis.overtimePossible ? 'YES' : 'NO'}
- Temp Workers Available: ${sim.laborAnalysis.tempWorkersAvailable ? sim.laborAnalysis.maxTempWorkers : 'None'}

## COST PROJECTIONS
1. **Normal Ops**: $${sim.costProjections.scenario1_normal.total.toFixed(2)} - ${sim.costProjections.scenario1_normal.meetsDeadline ? 'Meets deadline' : `${sim.costProjections.scenario1_normal.estimatedCompletionDays - sim.capacityAnalysis.earliestDeadline} days late`}
2. **Max Overtime**: $${sim.costProjections.scenario2_overtime.total.toFixed(2)} - ${sim.costProjections.scenario2_overtime.meetsDeadline ? 'Meets deadline' : 'Still late'}
3. **Rush Everything**: $${sim.costProjections.scenario3_rush.total.toFixed(2)} - Meets deadline

## YOUR TASK
As the AI advisor, you must:
1. Analyze this situation comprehensively
2. Present the CRITICAL DECISIONS to the human operator
3. For each decision, explain the trade-offs clearly
4. Recommend actions but emphasize the human makes final calls
5. Consider downstream effects of each choice
6. Flag any risks or concerns the human should know about

CRITICAL DECISIONS TO PRESENT:
${sim.criticalDecisions.map(d => `
### ${d.title} [${d.priority}]
**Question**: ${d.question}
**Context**: ${d.context}
**Options**: ${d.options.map(o => `${o.label} (${o.impact})`).join(', ')}
**Your Recommendation**: ${d.recommendation}
`).join('\n')}

Respond in JSON format:
{
  "analysis": {
    "salesHealth": "good/warning/critical",
    "qualityHealth": "good/warning/critical",
    "inventoryHealth": "good/warning/critical",
    "productionHealth": "good/warning/critical",
    "overallRisk": "low/medium/high/critical"
  },
  "situationBrief": "2-3 sentence executive summary of the situation",
  "findings": ["key finding 1", "key finding 2", ...],
  "criticalDecisions": [
    {
      "id": "decision_id",
      "title": "Decision Title",
      "question": "What the human needs to decide",
      "options": [
        {"id": "opt1", "label": "Option 1", "pros": ["pro1"], "cons": ["con1"], "cost": 0, "risk": "low/medium/high"}
      ],
      "recommendation": "recommended_option_id",
      "reasoning": "Why this is recommended",
      "urgency": "immediate/today/this_week"
    }
  ],
  "recommendedActions": [
    {
      "action": "DEMAND_PLANNING or MATERIAL_REPLENISHMENT or QUALITY_ESCALATION or ORDER_FULFILLMENT",
      "priority": "critical/high/medium",
      "reason": "why this is needed",
      "contingentOn": "which decision this depends on"
    }
  ],
  "riskAssessment": {
    "primaryRisks": ["risk 1", "risk 2"],
    "mitigations": ["mitigation 1", "mitigation 2"]
  },
  "humanInputNeeded": "Specific question or guidance you need from the human operator"
}`;

  return prompt;
}

module.exports = {
  FACTORY_BASELINE,
  COMPONENTS,
  BUILT_IN_PRESETS,
  getAllPresets,
  getPreset,
  saveCustomPreset,
  deleteCustomPreset,
  activateScenario,
  getActiveScenario,
  clearActiveScenario,
  generateSimulatedData,
  buildScenarioAwarePrompt
};
