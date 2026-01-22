const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Import mock services
const {
  EmailService,
  SMSService,
  CRMService,
  ERPService,
  SupplierPortal,
  ShippingService,
  PaymentGateway,
  HRService,
  NotificationService,
  WebhookService,
  getAllServiceData
} = require('./mock-services');

// Import scenario engine
const {
  FACTORY_BASELINE,
  COMPONENTS,
  getAllPresets,
  getPreset,
  saveCustomPreset,
  deleteCustomPreset,
  activateScenario,
  getActiveScenario,
  clearActiveScenario,
  buildScenarioAwarePrompt
} = require('./scenarios');

// Import simulation loop controller
const {
  startLoop,
  stopLoop,
  pauseLoop,
  resumeLoop,
  getLoopStatus,
  getLoopHistory
} = require('./simulation-loop');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBKE96eysMe-YuJTFPWRXwrdSU4XZo13g8';
const DATA_PATH = 'D:/n8n/data';
const N8N_API_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || ''; // Set this after creating API key in n8n

// n8n workflow IDs (update these after importing workflows)
const WORKFLOW_IDS = {
  DEMAND_PLANNING: '', // Will be set after import
  MATERIAL_REPLENISHMENT: '',
  QUALITY_ESCALATION: '',
  ORDER_FULFILLMENT: ''
};

// State management
let pipelineState = {
  status: 'idle', // idle, running, waiting_approval, completed
  currentStep: null,
  steps: [],
  logs: [],
  pendingDecision: null,
  executionResults: [],
  aiContext: null,
  autoPilot: false, // Auto-approve AI decisions
  serviceActivity: [] // Track all service calls
};

let connectedClients = new Set();

// Broadcast to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  });
}

// Add log entry
function log(message, type = 'info') {
  const entry = {
    timestamp: new Date().toISOString(),
    message,
    type
  };
  pipelineState.logs.push(entry);
  broadcast({ type: 'log', data: entry });
}

// Update pipeline state
function updateState(updates) {
  pipelineState = { ...pipelineState, ...updates };
  broadcast({ type: 'state', data: pipelineState });
}

// Read CSV file
function readCSV(filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(DATA_PATH, filename);
    const results = [];

    if (!fs.existsSync(filepath)) {
      resolve([]);
      return;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length && i < 200; i++) {
      const values = lines[i].split(',');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx]?.trim() || '';
      });
      results.push(obj);
    }
    resolve(results);
  });
}

// Call n8n workflow
async function callN8nWorkflow(workflowId, data = {}) {
  if (!workflowId) {
    log('Workflow ID not configured - simulating execution', 'warning');
    return { simulated: true };
  }

  try {
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    log(`n8n call failed: ${error.message} - using simulation`, 'warning');
    return { simulated: true, error: error.message };
  }
}

// Call Gemini API
async function callGemini(prompt) {
  try {
    log('Calling Gemini API...', 'ai');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      log(`Gemini API error: ${response.status} - ${errorText}`, 'error');
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      log(`Gemini error: ${data.error.message}`, 'error');
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      log('Gemini returned empty response', 'warning');
      return '{}';
    }

    // Clean up response
    let cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to extract JSON if there's extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    log('Gemini response received', 'ai');
    return cleaned;
  } catch (error) {
    log(`Gemini API failed: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================
// WORKFLOW EXECUTION WITH MOCK SERVICES
// ============================================

async function executeDemandPlanning(context) {
  const workflow = 'DEMAND_PLANNING';
  const results = { workflow, source: 'mock-services', actions: [] };

  // Step 1: Analyze sales data
  log('📊 Analyzing sales trends...', 'info');
  const salesAnalysis = {
    totalOrders: context.sales?.length || 0,
    avgOrderValue: context.metrics?.sales?.revenue / (context.metrics?.sales?.total || 1),
    trend: 'increasing'
  };
  results.salesAnalysis = salesAnalysis;

  // Step 2: Update CRM with demand forecast
  log('📝 Updating CRM with demand forecast...', 'info');
  const crmActivity = await CRMService.createActivity('SYSTEM', {
    type: 'Demand Forecast',
    details: `Forecasted 15% increase in demand for next month`,
    source: 'AI Analysis'
  });
  results.actions.push({ service: 'CRM', action: 'Activity Created', id: crmActivity.id });

  // Step 3: Request overtime from HR if needed
  if (salesAnalysis.trend === 'increasing') {
    log('👥 Requesting overtime approval from HR...', 'info');
    const overtimeRequest = await HRService.requestOvertime({
      department: 'Production',
      hours: 40,
      reason: 'Increased demand forecast - AI recommended',
      startDate: new Date().toISOString()
    });
    results.actions.push({ service: 'HR', action: 'Overtime Requested', status: overtimeRequest.status });
    results.overtimeApproved = overtimeRequest.status === 'Approved';
  }

  // Step 4: Send notification
  await NotificationService.push({
    type: 'demand-planning',
    title: 'Demand Planning Complete',
    message: `Analyzed ${salesAnalysis.totalOrders} orders. Overtime ${results.overtimeApproved ? 'approved' : 'pending'}.`,
    priority: 'medium'
  });

  log(`✅ Demand Planning complete - ${results.actions.length} service calls made`, 'success');
  return results;
}

async function executeMaterialReplenishment(context) {
  const workflow = 'MATERIAL_REPLENISHMENT';
  const results = { workflow, source: 'mock-services', actions: [], purchaseOrders: [] };

  // Step 1: Identify shortages
  log('📦 Checking inventory levels...', 'info');
  const shortages = [
    { sku: 'BT-5300', name: 'Bluetooth Chip', quantity: 500, supplier: 'ChipTech Co', unitCost: 2.50 },
    { sku: 'BAT-055', name: 'Lithium Battery', quantity: 1000, supplier: 'PowerCell Inc', unitCost: 0.90 },
    { sku: 'DRV-10MM', name: 'Driver Unit', quantity: 750, supplier: 'AudioParts Ltd', unitCost: 1.80 }
  ];

  // Step 2: Create Purchase Orders
  for (const item of shortages) {
    log(`📋 Creating PO for ${item.name}...`, 'info');
    const po = await ERPService.createPurchaseOrder({
      supplierName: item.supplier,
      supplierEmail: `${item.supplier.toLowerCase().replace(/ /g, '')}@example.com`,
      items: [{ sku: item.sku, name: item.name, quantity: item.quantity, unitCost: item.unitCost }],
      totalAmount: item.quantity * item.unitCost
    });
    results.purchaseOrders.push(po);
    results.actions.push({ service: 'ERP', action: 'PO Created', poNumber: po.poNumber, amount: po.totalAmount });
  }

  // Step 3: Update inventory reservations
  log('📊 Updating inventory system...', 'info');
  for (const item of shortages) {
    await ERPService.updateInventory(item.sku, item.quantity, 'expected');
  }
  results.actions.push({ service: 'ERP', action: 'Inventory Updated', items: shortages.length });

  // Step 4: Send summary notification
  const totalPOValue = results.purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  await NotificationService.push({
    type: 'material-replenishment',
    title: 'Material Replenishment Complete',
    message: `Created ${results.purchaseOrders.length} POs totaling $${totalPOValue.toFixed(2)}`,
    priority: 'high'
  });

  log(`✅ Material Replenishment complete - ${results.purchaseOrders.length} POs created`, 'success');
  return results;
}

async function executeQualityEscalation(context) {
  const workflow = 'QUALITY_ESCALATION';
  const results = { workflow, source: 'mock-services', actions: [], alerts: [], audits: [] };

  // Step 1: Analyze defects
  log('🔍 Analyzing defect patterns...', 'info');
  const defectSummary = {
    total: context.defects?.length || 0,
    critical: context.defects?.filter(d => d.severity === 'Critical').length || 0,
    topCategories: ['Bluetooth Connectivity', 'Battery Life', 'Audio Quality']
  };
  results.defectAnalysis = defectSummary;

  // Step 2: Send alerts to affected suppliers
  const affectedSuppliers = ['SUP-001', 'SUP-003'];
  for (const supplierId of affectedSuppliers) {
    log(`⚠️ Sending quality alert to supplier ${supplierId}...`, 'info');
    const alert = await SupplierPortal.sendQualityAlert(supplierId, {
      category: 'Component Quality',
      severity: 'High',
      count: Math.floor(Math.random() * 20) + 5,
      description: 'Increased defect rate detected in supplied components'
    });
    results.alerts.push(alert);
    results.actions.push({ service: 'SupplierPortal', action: 'Alert Sent', supplierId });
  }

  // Step 3: Schedule quality audits
  for (const supplierId of affectedSuppliers) {
    log(`📅 Scheduling audit for supplier ${supplierId}...`, 'info');
    const audit = await SupplierPortal.scheduleAudit(supplierId, {
      type: 'Quality Audit',
      reason: 'Defect rate escalation',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    results.audits.push(audit);
    results.actions.push({ service: 'SupplierPortal', action: 'Audit Scheduled', supplierId });
  }

  // Step 4: Update supplier scores
  for (const supplierId of affectedSuppliers) {
    await SupplierPortal.updateSupplierScore(supplierId, -5, 'Quality escalation penalty');
  }
  results.actions.push({ service: 'SupplierPortal', action: 'Scores Updated', suppliers: affectedSuppliers.length });

  // Step 5: Notify quality team
  await EmailService.send({
    to: 'quality-team@soundpod-manufacturing.com',
    subject: '🚨 Quality Escalation Report',
    body: `Quality escalation completed:\n\n- ${results.alerts.length} supplier alerts sent\n- ${results.audits.length} audits scheduled\n- ${defectSummary.critical} critical defects identified`
  });
  results.actions.push({ service: 'Email', action: 'Report Sent', to: 'Quality Team' });

  await NotificationService.push({
    type: 'quality-escalation',
    title: 'Quality Escalation Complete',
    message: `${results.alerts.length} alerts sent, ${results.audits.length} audits scheduled`,
    priority: 'critical'
  });

  log(`✅ Quality Escalation complete - ${results.actions.length} service calls made`, 'success');
  return results;
}

async function executeOrderFulfillment(context) {
  const workflow = 'ORDER_FULFILLMENT';
  const results = { workflow, source: 'mock-services', actions: [], shipments: [], invoices: [] };

  // Get pending orders
  const pendingOrders = (context.sales || [])
    .filter(o => o.status === 'Processing' || o.status === 'Confirmed')
    .slice(0, 10);

  log(`📦 Processing ${pendingOrders.length} orders...`, 'info');

  for (const order of pendingOrders) {
    // Step 1: Update CRM
    await CRMService.createActivity(order.customer_id, {
      type: 'Order Fulfillment',
      details: `Order ${order.order_id} being fulfilled`,
      orderId: order.order_id
    });

    // Step 2: Create shipment
    log(`🚚 Creating shipment for order ${order.order_id}...`, 'info');
    const shipment = await ShippingService.createShipment({
      orderId: order.order_id,
      customerId: order.customer_id,
      customerEmail: `customer-${order.customer_id}@example.com`,
      items: [{ sku: 'SOUNDPOD-PRO', quantity: order.total_quantity || 1 }],
      address: '123 Customer Street, City, ST 12345'
    });
    results.shipments.push(shipment);
    results.actions.push({ service: 'Shipping', action: 'Shipment Created', tracking: shipment.trackingNumber });

    // Step 3: Create invoice
    log(`💰 Generating invoice for order ${order.order_id}...`, 'info');
    const invoice = await ERPService.createInvoice({
      orderId: order.order_id,
      customerId: order.customer_id,
      customerName: `Customer ${order.customer_id}`,
      customerEmail: `customer-${order.customer_id}@example.com`,
      amount: parseFloat(order.total_amount) || 49.99,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    results.invoices.push(invoice);
    results.actions.push({ service: 'ERP', action: 'Invoice Created', invoiceNumber: invoice.invoiceNumber });
  }

  // Step 4: Process any pending payments (simulate some)
  const paymentsToProcess = results.invoices.slice(0, 3);
  for (const invoice of paymentsToProcess) {
    log(`💳 Processing payment for ${invoice.invoiceNumber}...`, 'info');
    const payment = await PaymentGateway.chargeCard({
      amount: invoice.amount,
      invoiceId: invoice.id,
      paymentMethod: 'card_****4242'
    });
    if (payment.status === 'succeeded') {
      await ERPService.processPayment({
        invoiceId: invoice.id,
        amount: invoice.amount,
        method: 'Credit Card',
        transactionId: payment.id
      });
      results.actions.push({ service: 'Payment', action: 'Payment Processed', amount: invoice.amount });
    }
  }

  // Step 5: Summary notification
  const totalRevenue = results.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  await NotificationService.push({
    type: 'order-fulfillment',
    title: 'Order Fulfillment Complete',
    message: `${results.shipments.length} shipped, ${results.invoices.length} invoiced, $${totalRevenue.toFixed(2)} revenue`,
    priority: 'high'
  });

  // Send summary to finance
  await EmailService.send({
    to: 'finance@soundpod-manufacturing.com',
    subject: '📊 Daily Fulfillment Summary',
    body: `Order Fulfillment Summary:\n\n- Orders Processed: ${pendingOrders.length}\n- Shipments Created: ${results.shipments.length}\n- Invoices Generated: ${results.invoices.length}\n- Total Revenue: $${totalRevenue.toFixed(2)}`
  });

  log(`✅ Order Fulfillment complete - ${results.shipments.length} shipped, $${totalRevenue.toFixed(2)} invoiced`, 'success');
  return results;
}

// Pipeline Steps
const pipelineSteps = [
  {
    id: 'collect_data',
    name: 'Collect Data',
    department: 'SYSTEM',
    execute: async () => {
      log('Reading sales orders...', 'info');
      const sales = await readCSV('transactions/sales_orders.csv');
      log(`Loaded ${sales.length} sales orders`, 'success');

      log('Reading inventory transactions...', 'info');
      const inventory = await readCSV('transactions/inventory_transactions.csv');
      log(`Loaded ${inventory.length} inventory records`, 'success');

      log('Reading defect logs...', 'info');
      const defects = await readCSV('transactions/defect_logs.csv');
      log(`Loaded ${defects.length} defect records`, 'success');

      log('Reading work orders...', 'info');
      const workOrders = await readCSV('transactions/work_orders.csv');
      log(`Loaded ${workOrders.length} work orders`, 'success');

      return { sales, inventory, defects, workOrders };
    }
  },
  {
    id: 'ai_analysis',
    name: 'AI Analysis',
    department: 'AI',
    requiresApproval: true,
    execute: async (context) => {
      log('Sending data to Gemini 2.0 Flash for analysis...', 'ai');

      // Check for active scenario
      const activeScenario = getActiveScenario();

      const metrics = {
        sales: {
          total: context.sales.length,
          pending: context.sales.filter(s => s.status === 'Processing').length,
          revenue: context.sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0)
        },
        defects: {
          total: context.defects.length,
          critical: context.defects.filter(d => d.severity === 'Critical').length,
          categories: [...new Set(context.defects.map(d => d.defect_category))]
        },
        inventory: {
          transactions: context.inventory.length,
          receipts: context.inventory.filter(i => i.transaction_type === 'Receipt').length
        },
        production: {
          workOrders: context.workOrders.length,
          inProgress: context.workOrders.filter(w => w.status === 'In Progress').length
        }
      };

      // If scenario is active, merge simulated data and use enhanced prompt
      if (activeScenario) {
        log(`SCENARIO ACTIVE: ${activeScenario.name}`, 'warning');
        const sim = activeScenario.simulatedData;

        // Add scenario injected orders to metrics
        metrics.scenario = {
          name: activeScenario.name,
          injectedOrders: sim.injectedOrders,
          capacityAnalysis: sim.capacityAnalysis,
          criticalDecisions: sim.criticalDecisions.length
        };

        // Log scenario details
        log(`Scenario: ${sim.capacityAnalysis.totalDemand} units demanded, ${sim.capacityAnalysis.earliestDeadline} days deadline`, 'info');
        log(`Capacity utilization: ${sim.capacityAnalysis.capacityUtilization}%`, sim.capacityAnalysis.capacityUtilization > 100 ? 'warning' : 'info');

        if (sim.criticalDecisions.length > 0) {
          log(`${sim.criticalDecisions.length} critical decisions require human input`, 'warning');
        }
      }

      // Build prompt (scenario-aware or default)
      let prompt;
      if (activeScenario) {
        prompt = buildScenarioAwarePrompt(context, activeScenario);
      } else {
        prompt = `You are an AI manufacturing operations manager for SoundPod Pro wireless earbuds.

CURRENT DATA:
${JSON.stringify(metrics, null, 2)}

SAMPLE DEFECTS:
${JSON.stringify(context.defects.slice(-10), null, 2)}

Analyze this data and recommend actions. Respond in JSON:
{
  "analysis": {
    "salesHealth": "good/warning/critical",
    "qualityHealth": "good/warning/critical",
    "inventoryHealth": "good/warning/critical",
    "productionHealth": "good/warning/critical"
  },
  "findings": ["key finding 1", "key finding 2"],
  "recommendedActions": [
    {
      "action": "DEMAND_PLANNING or MATERIAL_REPLENISHMENT or QUALITY_ESCALATION or ORDER_FULFILLMENT",
      "priority": "critical/high/medium",
      "reason": "why this is needed"
    }
  ],
  "question": "A specific question to ask the human operator for guidance"
}`;
      }

      let aiResult;

      try {
        const response = await callGemini(prompt);
        log(`Raw AI response: ${response.substring(0, 200)}...`, 'info');
        aiResult = JSON.parse(response);

        // If scenario active, enhance with scenario data
        if (activeScenario) {
          aiResult.scenario = {
            name: activeScenario.name,
            simulatedData: activeScenario.simulatedData
          };
        }
      } catch (e) {
        log(`AI parse error: ${e.message}`, 'error');

        // Provide sensible defaults based on actual data
        const hasDefects = context.defects.length > 50;
        const hasPendingOrders = context.sales.filter(s => s.status === 'Processing').length > 10;

        aiResult = {
          analysis: {
            salesHealth: hasPendingOrders ? 'warning' : 'good',
            qualityHealth: hasDefects ? 'warning' : 'good',
            inventoryHealth: 'good',
            productionHealth: 'good'
          },
          findings: [
            `Analyzed ${context.sales.length} sales orders`,
            `Found ${context.defects.length} defect records`,
            hasDefects ? 'Elevated defect levels detected' : 'Quality metrics nominal',
            hasPendingOrders ? 'Pending orders require attention' : 'Order backlog normal'
          ],
          recommendedActions: [
            ...(hasPendingOrders ? [{
              action: 'ORDER_FULFILLMENT',
              priority: 'high',
              reason: `${context.sales.filter(s => s.status === 'Processing').length} orders pending fulfillment`
            }] : []),
            ...(hasDefects ? [{
              action: 'QUALITY_ESCALATION',
              priority: 'medium',
              reason: `${context.defects.length} defects require analysis`
            }] : [])
          ],
          question: 'AI analysis completed with fallback logic. Which actions would you like to proceed with?'
        };

        // Add scenario data even on fallback
        if (activeScenario) {
          aiResult.scenario = {
            name: activeScenario.name,
            simulatedData: activeScenario.simulatedData
          };
          aiResult.criticalDecisions = activeScenario.simulatedData.criticalDecisions;
          aiResult.findings = [
            ...aiResult.findings,
            `SCENARIO: ${activeScenario.simulatedData.capacityAnalysis.totalDemand} units demanded`,
            `Capacity utilization: ${activeScenario.simulatedData.capacityAnalysis.capacityUtilization}%`,
            `${activeScenario.simulatedData.criticalDecisions.length} critical decisions pending`
          ];
        }
      }

      log('AI analysis complete', 'ai');
      log(`AI recommends: ${(aiResult.recommendedActions || []).map(a => a.action).join(', ') || 'none'}`, 'ai');

      if (aiResult.criticalDecisions?.length > 0) {
        log(`CRITICAL: ${aiResult.criticalDecisions.length} decisions require your input`, 'warning');
      }

      return { aiResult, metrics, activeScenario };
    }
  },
  {
    id: 'execute_workflows',
    name: 'Execute Workflows',
    department: 'SYSTEM',
    execute: async (context, approvedActions) => {
      const results = [];

      for (const action of approvedActions) {
        log(`Executing: ${action}...`, 'info');

        // Try to call n8n workflow, fall back to simulation
        const workflowId = WORKFLOW_IDS[action];
        let result;

        if (workflowId) {
          log(`Calling n8n workflow ${workflowId}...`, 'info');
          const n8nResult = await callN8nWorkflow(workflowId, context);
          result = { workflow: action, n8nResult, source: 'n8n' };
        } else {
          // Execute with mock services (realistic simulation)
          log(`Executing ${action} with mock services...`, 'info');

          switch (action) {
            case 'DEMAND_PLANNING':
              result = await executeDemandPlanning(context);
              break;
            case 'MATERIAL_REPLENISHMENT':
              result = await executeMaterialReplenishment(context);
              break;
            case 'QUALITY_ESCALATION':
              result = await executeQualityEscalation(context);
              break;
            case 'ORDER_FULFILLMENT':
              result = await executeOrderFulfillment(context);
              break;
            default:
              result = { workflow: action, status: 'completed', source: 'mock-services' };
          }
        }

        results.push(result);
        log(`Completed: ${action}`, 'success');
      }

      return { executionResults: results };
    }
  },
  {
    id: 'ai_report',
    name: 'AI Final Report',
    department: 'AI',
    execute: async (context) => {
      log('Generating final report...', 'ai');

      const prompt = `You executed the following manufacturing workflows:
${JSON.stringify(context.executionResults, null, 2)}

Generate a brief executive summary report in JSON:
{
  "summary": "2-3 sentence overview",
  "outcomes": ["outcome 1", "outcome 2"],
  "nextSteps": ["recommendation 1", "recommendation 2"],
  "overallStatus": "healthy/needs-attention/critical"
}`;

      const response = await callGemini(prompt);
      let report;

      try {
        report = JSON.parse(response);
      } catch (e) {
        report = { summary: 'Workflow execution completed', outcomes: [], nextSteps: [] };
      }

      log('Final report generated', 'success');
      return { finalReport: report };
    }
  }
];

// Run pipeline
async function runPipeline() {
  updateState({
    status: 'running',
    currentStep: null,
    steps: pipelineSteps.map(s => ({ id: s.id, name: s.name, status: 'pending' })),
    logs: [],
    executionResults: [],
    pendingDecision: null
  });

  let context = {};

  for (let i = 0; i < pipelineSteps.length; i++) {
    const step = pipelineSteps[i];

    // Update current step
    const steps = pipelineState.steps.map((s, idx) => ({
      ...s,
      status: idx < i ? 'completed' : idx === i ? 'running' : 'pending'
    }));
    updateState({ currentStep: step.id, steps });

    log(`Starting: ${step.name}`, 'step');

    try {
      // Execute step
      if (step.id === 'execute_workflows') {
        // Wait for approved actions from previous decision
        const approvedActions = pipelineState.approvedActions || [];
        const result = await step.execute(context, approvedActions);
        context = { ...context, ...result };
      } else {
        const result = await step.execute(context);
        context = { ...context, ...result };
      }

      // Check if approval required
      if (step.requiresApproval && context.aiResult) {
        // AUTO-PILOT MODE: Automatically approve all AI recommendations
        if (pipelineState.autoPilot) {
          log('🤖 AUTO-PILOT: Automatically approving AI recommendations...', 'ai');
          const autoActions = (context.aiResult.recommendedActions || []).map(a => a.action);
          pipelineState.approvedActions = autoActions;
          pipelineState.aiContext = context;
          log(`🤖 AUTO-PILOT: Approved ${autoActions.length} actions: ${autoActions.join(', ')}`, 'ai');
          // Continue to next step automatically
        } else {
          // MANUAL MODE: Wait for human approval
          log('Waiting for your decision...', 'waiting');

          updateState({
            status: 'waiting_approval',
            pendingDecision: {
              stepId: step.id,
              aiResult: context.aiResult,
              metrics: context.metrics
            },
            aiContext: context
          });

          // Wait for user decision
          return; // Pipeline will resume when user approves
        }
      }

      // Mark step complete
      steps[i].status = 'completed';
      updateState({ steps });

    } catch (error) {
      log(`Error: ${error.message}`, 'error');
      steps[i].status = 'error';
      updateState({ steps, status: 'error' });
      return;
    }
  }

  updateState({ status: 'completed', currentStep: null });
  log('Pipeline completed!', 'success');
}

// Resume pipeline after approval
async function resumePipeline(approvedActions, userMessage) {
  log(`User approved: ${approvedActions.join(', ')}`, 'user');
  if (userMessage) {
    log(`User message: ${userMessage}`, 'user');
  }

  updateState({
    status: 'running',
    pendingDecision: null,
    approvedActions
  });

  let context = pipelineState.aiContext || {};

  // Find where we left off
  const currentIdx = pipelineSteps.findIndex(s => s.id === 'execute_workflows');

  for (let i = currentIdx; i < pipelineSteps.length; i++) {
    const step = pipelineSteps[i];

    const steps = pipelineState.steps.map((s, idx) => ({
      ...s,
      status: idx < i ? 'completed' : idx === i ? 'running' : 'pending'
    }));
    updateState({ currentStep: step.id, steps });

    log(`Starting: ${step.name}`, 'step');

    try {
      if (step.id === 'execute_workflows') {
        const result = await step.execute(context, approvedActions);
        context = { ...context, ...result };
      } else {
        const result = await step.execute(context);
        context = { ...context, ...result };
      }

      steps[i].status = 'completed';
      updateState({ steps });

    } catch (error) {
      log(`Error: ${error.message}`, 'error');
      steps[i].status = 'error';
      updateState({ steps, status: 'error' });
      return;
    }
  }

  updateState({ status: 'completed', currentStep: null });
  log('Pipeline completed!', 'success');
}

// Ask AI a question
async function askAI(question) {
  log(`You asked: ${question}`, 'user');
  log('AI is thinking...', 'ai');

  const context = pipelineState.aiContext || {};

  const prompt = `You are an AI manufacturing assistant. The user asked: "${question}"

Current context:
${JSON.stringify(context.metrics || {}, null, 2)}

AI's previous analysis:
${JSON.stringify(context.aiResult || {}, null, 2)}

Answer the user's question concisely and helpfully. If they're asking about the data or your recommendations, explain your reasoning.`;

  const response = await callGemini(prompt);
  log(`AI: ${response}`, 'ai');

  return response;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log('Client connected');

  // Send current state
  ws.send(JSON.stringify({ type: 'state', data: pipelineState }));

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);

      switch (msg.type) {
        case 'start':
          runPipeline();
          break;

        case 'approve':
          resumePipeline(msg.actions, msg.message);
          break;

        case 'reject':
          log('User rejected AI recommendations', 'user');
          updateState({ status: 'idle', pendingDecision: null });
          break;

        case 'ask':
          const answer = await askAI(msg.question);
          ws.send(JSON.stringify({ type: 'ai_response', data: answer }));
          break;

        case 'reset':
          updateState({
            status: 'idle',
            currentStep: null,
            steps: [],
            logs: [],
            pendingDecision: null,
            executionResults: [],
            aiContext: null
          });
          break;

        case 'autopilot':
          pipelineState.autoPilot = msg.enabled;
          log(`Auto-pilot ${msg.enabled ? 'ENABLED' : 'DISABLED'}`, msg.enabled ? 'ai' : 'info');
          broadcast({ type: 'state', data: pipelineState });
          break;

        case 'get_services':
          ws.send(JSON.stringify({ type: 'services', data: getAllServiceData() }));
          break;

        // Simulation Loop Controls
        case 'start_simulation_loop':
          console.log('Received start_simulation_loop request:', msg.options);
          const startResult = startLoop(
            msg.options || {},
            broadcast,
            async (autoApprove, scenario) => {
              // Run a simplified pipeline for simulation
              if (scenario) {
                pipelineState.autoPilot = autoApprove;
                await runPipeline();
              }
            }
          );
          ws.send(JSON.stringify({ type: 'simulation_status', data: startResult }));
          break;

        case 'stop_simulation_loop':
          const stopResult = stopLoop(broadcast);
          ws.send(JSON.stringify({ type: 'simulation_status', data: stopResult }));
          break;

        case 'pause_simulation_loop':
          const pauseResult = pauseLoop(broadcast);
          ws.send(JSON.stringify({ type: 'simulation_status', data: pauseResult }));
          break;

        case 'resume_simulation_loop':
          const resumeResult = resumeLoop(broadcast, runPipeline);
          ws.send(JSON.stringify({ type: 'simulation_status', data: resumeResult }));
          break;

        case 'get_loop_status':
          ws.send(JSON.stringify({ type: 'simulation_status', data: getLoopStatus() }));
          break;
      }
    } catch (e) {
      console.error('Message error:', e);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log('Client disconnected');
  });
});

// REST endpoints
app.get('/api/state', (req, res) => {
  res.json(pipelineState);
});

app.post('/api/start', (req, res) => {
  runPipeline();
  res.json({ status: 'started' });
});

// Mock services data endpoints
app.get('/api/services', (req, res) => {
  res.json(getAllServiceData());
});

app.get('/api/services/emails', (req, res) => {
  res.json(EmailService.getInbox());
});

app.get('/api/services/crm', (req, res) => {
  res.json(CRMService.getActivities());
});

app.get('/api/services/erp/pos', (req, res) => {
  res.json(ERPService.getPurchaseOrders());
});

app.get('/api/services/erp/invoices', (req, res) => {
  res.json(ERPService.getInvoices());
});

app.get('/api/services/qms/audits', (req, res) => {
  res.json(SupplierPortal.getAudits());
});

app.get('/api/services/notifications', (req, res) => {
  res.json(NotificationService.getAll());
});

// ============================================
// SCENARIO MANAGEMENT ENDPOINTS
// ============================================

// Get all presets (built-in + custom)
app.get('/api/scenarios/presets', (req, res) => {
  res.json(getAllPresets());
});

// Get a specific preset
app.get('/api/scenarios/presets/:id', (req, res) => {
  const preset = getPreset(req.params.id);
  if (preset) {
    res.json(preset);
  } else {
    res.status(404).json({ error: 'Preset not found' });
  }
});

// Save a custom preset
app.post('/api/scenarios/presets', (req, res) => {
  try {
    const saved = saveCustomPreset(req.body);
    res.json(saved);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete a custom preset
app.delete('/api/scenarios/presets/:id', (req, res) => {
  const deleted = deleteCustomPreset(req.params.id);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Preset not found or is built-in' });
  }
});

// Get active scenario
app.get('/api/scenarios/active', (req, res) => {
  const active = getActiveScenario();
  res.json(active || { active: false });
});

// Activate a scenario
app.post('/api/scenarios/activate/:id', (req, res) => {
  try {
    const scenario = activateScenario(req.params.id);
    log(`Scenario activated: ${scenario.name}`, 'warning');
    broadcast({ type: 'scenario_activated', data: scenario });
    res.json(scenario);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Deactivate scenario (return to real data)
app.post('/api/scenarios/deactivate', (req, res) => {
  clearActiveScenario();
  log('Scenario deactivated - using real data', 'info');
  broadcast({ type: 'scenario_deactivated' });
  res.json({ success: true });
});

// Get factory baseline parameters
app.get('/api/scenarios/factory', (req, res) => {
  res.json({
    baseline: FACTORY_BASELINE,
    components: COMPONENTS
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`AI Control Center server running on http://localhost:${PORT}`);
  console.log(`WebSocket available on ws://localhost:${PORT}`);
});
