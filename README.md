# AI Manufacturing Control Center

A human-in-the-loop AI agent system for manufacturing operations management. Features real-time decision making, mock enterprise integrations, and autonomous workflow execution.

![KIG Logo](client/public/logo.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [User Guide](#user-guide)
- [Scenario Simulation](#scenario-simulation)
- [Visual Simulation Tab](#visual-simulation-tab)
- [Artifact Visualization](#artifact-visualization)
- [Continuous Simulation Loop](#continuous-simulation-loop)
- [API Reference](#api-reference)
- [Mock Services](#mock-services)
- [Troubleshooting](#troubleshooting)

---

## Overview

The AI Manufacturing Control Center is a web-based application that demonstrates agentic AI capabilities in an enterprise manufacturing context. It uses Google's Gemini 2.0 Flash to analyze production data and make autonomous decisions, while providing humans with full visibility and control.

### Use Cases

- **Training**: Teach operators how AI-assisted decision making works
- **Demo**: Showcase agentic AI capabilities to stakeholders
- **Prototyping**: Test AI-driven workflows before production deployment
- **Portfolio**: Demonstrate full-stack AI application development

---

## Features

| Feature | Description |
|---------|-------------|
| **Human-in-the-Loop** | AI waits for human approval before executing actions |
| **Auto-Pilot Mode** | Toggle to let AI run fully autonomously |
| **Scenario Simulation** | Test different manufacturing scenarios with built-in presets |
| **Critical Decision Support** | AI identifies critical decisions and presents trade-offs |
| **Real-Time Terminal** | Live logs of all operations and AI communications |
| **Mock Enterprise Services** | Simulated Email, ERP, CRM, HR, Shipping, Payments |
| **Visual Pipeline** | See workflow progress step-by-step |
| **AI Chat** | Ask questions about the data anytime |
| **Service Monitoring** | Track all mock API calls (emails, POs, invoices) |
| **Visual Simulation Tab** | Real-time factory floor, timeline, and material flow visualization |
| **Expandable Artifacts** | Click to expand emails, POs, invoices with full details |
| **Artifact Detail Modal** | Full-screen modal view of any artifact |
| **Continuous Simulation Loop** | Game-like random event simulation with auto-advancing scenarios |

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-control-center.git
cd ai-control-center

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### Configuration

Set your Gemini API key in `server/server.js` line 31:
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here';
```

Or set as environment variable:
```bash
# Windows
set GEMINI_API_KEY=AIzaSy...

# Linux/Mac
export GEMINI_API_KEY=AIzaSy...
```

### Running

**Option 1: Use the start script (Windows)**
```
start.bat
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd client
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                              │
│                         http://localhost:3000                           │
│  ┌─────────────┬─────────────────────┬────────────────────────────┐    │
│  │  Pipeline   │    Live Terminal    │    AI Decision Panel       │    │
│  │  Viewer     │    (WebSocket)      │    + Human Approval        │    │
│  └─────────────┴─────────────────────┴────────────────────────────┘    │
│  ┌─────────────┬─────────────────────┬─────────────┬──────────────┐    │
│  │   Emails    │   Purchase Orders   │   Invoices  │    Audits    │    │
│  └─────────────┴─────────────────────┴─────────────┴──────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ WebSocket + REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js)                              │
│                         http://localhost:3001                           │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Pipeline Engine │  │  Gemini AI API   │  │    Mock Services     │  │
│  │                  │  │                  │  │                      │  │
│  │  - Data Collect  │  │  - Analysis      │  │  - EmailService      │  │
│  │  - AI Analysis   │  │  - Decisions     │  │  - ERPService        │  │
│  │  - Execution     │  │  - Reports       │  │  - CRMService        │  │
│  │  - Reporting     │  │                  │  │  - ShippingService   │  │
│  └──────────────────┘  └──────────────────┘  │  - PaymentGateway    │  │
│                                              │  - HRService         │  │
│                                              │  - SupplierPortal    │  │
│                                              └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER (CSV Files)                         │
│                                                                         │
│  transactions/                    master/                               │
│  ├── sales_orders.csv            ├── employees.csv                     │
│  ├── inventory_transactions.csv  ├── customers.csv                     │
│  ├── defect_logs.csv             ├── suppliers.csv                     │
│  └── work_orders.csv             └── bom.csv                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 18 + Vite | User interface |
| Backend | Node.js + Express | API server |
| Real-time | WebSocket (ws) | Live updates |
| AI | Gemini 2.0 Flash | Analysis & decisions |
| Data | CSV files | Manufacturing data |
| Mock Services | In-memory JS | Simulated integrations |

---

## User Guide

### Starting the System

1. Start server and client (see Quick Start)
2. Open http://localhost:3000 in browser
3. You'll see the Control Center dashboard

### Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [LOGO]                          [Auto-Pilot ○] [IDLE] [Start]          │
├────────────┬──────────────────────────────┬──────────────────────────────┤
│            │                              │                              │
│  PIPELINE  │         TERMINAL            │      AI DECISIONS            │
│            │                              │                              │
│  Steps     │  Real-time logs             │  Health status               │
│  shown     │  and AI messages            │  Findings                    │
│  here      │                              │  Recommended actions         │
│            │                              │  Approve/Reject buttons      │
│            │                              │  Chat input                  │
│            │                              │                              │
├────────────┴──────────────────────────────┴──────────────────────────────┤
│  Emails        │  Purchase Orders   │  Invoices       │  Audits         │
│  Recent        │  Recent POs        │  Recent         │  Scheduled      │
│  emails sent   │  created           │  invoices       │  audits         │
└────────────────┴────────────────────┴─────────────────┴─────────────────┘
```

### Workflow Modes

#### Manual Mode (Default)

1. Click **"Start AI Agent"**
2. System collects data from CSV files
3. AI analyzes data and shows recommendations
4. **You review** the AI's findings and recommended actions
5. Check/uncheck actions you want to execute
6. Click **"Approve"** or **"Reject"**
7. Approved workflows execute with mock services
8. AI generates final report

#### Auto-Pilot Mode

1. Toggle **"Auto-Pilot"** switch ON (turns purple)
2. Click **"Start AI Agent"**
3. AI automatically approves all its own recommendations
4. Workflows execute without human intervention
5. Watch the terminal for real-time progress

### Asking Questions

Use the chat input at the bottom of the AI Decision Panel:

- "Why did you recommend quality escalation?"
- "What are the top defect categories?"
- "Should we increase production?"
- "Explain the sales trends"

### Pipeline Steps

| Step | Description | Duration |
|------|-------------|----------|
| **Collect Data** | Reads CSV files | ~1 sec |
| **AI Analysis** | Gemini analyzes data | ~3-5 sec |
| **Execute Workflows** | Runs approved actions | ~5-15 sec |
| **AI Report** | Generates summary | ~3-5 sec |

### Available Workflows

| Workflow | Trigger Conditions | Actions |
|----------|-------------------|---------|
| **DEMAND_PLANNING** | Sales trends indicate growth | Update CRM, request overtime from HR |
| **MATERIAL_REPLENISHMENT** | Inventory below thresholds | Create POs, email suppliers, update inventory |
| **QUALITY_ESCALATION** | High defect rates | Alert suppliers, schedule audits, update scores |
| **ORDER_FULFILLMENT** | Pending orders exist | Create shipments, generate invoices, process payments |

---

## Scenario Simulation

The Scenario Simulation system allows you to test different manufacturing situations without modifying the original data files. The system simulates data additions and calculates capacity, inventory, labor, and cost impacts.

### Accessing Scenarios

1. Click the **"Scenarios"** tab in the navigation bar
2. Browse available presets or create custom scenarios
3. Click **"Activate"** on a scenario to enable it
4. Return to **"Dashboard"** and run the AI Agent
5. The AI will analyze the scenario and provide critical decision guidance

### Factory Baseline Parameters

The simulation uses these factory constants:

| Parameter | Value | Description |
|-----------|-------|-------------|
| Daily Capacity | 500 units | Normal daily production |
| Max Capacity | 750 units | Maximum with overtime/shifts |
| Production Workers | 120 | Workers on production line |
| Shifts Per Day | 2 | Normal shift count |
| Max Shifts | 3 | Maximum possible shifts |
| Hours Per Shift | 8 | Standard shift length |
| Worker Hourly Rate | $25 | Normal hourly wage |
| Overtime Multiplier | 1.5x | Overtime pay rate |
| Temp Worker Rate | $35/hr | Temporary worker cost |
| Normal Lead Time | 7 days | Standard material delivery |
| Expedited Lead Time | 2 days | Rush material delivery |
| Expedited Premium | 2.5x | Rush order cost multiplier |
| Safety Stock | 5 days | Normal safety inventory |
| Critical Stock | 2 days | Minimum inventory threshold |

### Built-in Scenario Presets

#### 1. Normal Operations
- **Scenario**: Baseline factory operation
- **Order Volume**: 500 units
- **Deadline**: 5 days
- **Purpose**: Test standard workflow without stress conditions

#### 2. Urgent Large Order
- **Scenario**: Customer requests 5,000 units in 10 days
- **Challenge**: 10x normal capacity required
- **Critical Decisions**:
  - Overtime authorization (how many hours?)
  - Temp worker hiring (how many?)
  - Expedited materials (which components?)
  - Partial delivery negotiation

#### 3. Supply Chain Crisis
- **Scenario**: Key supplier (Bluetooth chips) delayed 3 weeks
- **Challenge**: Production may halt without components
- **Critical Decisions**:
  - Alternative supplier qualification
  - Expedited shipping costs
  - Production line resequencing
  - Customer communication strategy

#### 4. Quality Crisis
- **Scenario**: Defect rate spikes to 15% (normal: 3-5%)
- **Challenge**: Rework costs and delivery delays
- **Critical Decisions**:
  - Root cause investigation scope
  - Production line slowdown vs. stop
  - Supplier audit scheduling
  - Customer notification threshold

#### 5. Seasonal Peak (Q4)
- **Scenario**: Holiday rush with 8,000 units over 30 days
- **Challenge**: Sustained high-volume production
- **Critical Decisions**:
  - Hiring plan (permanent vs. temp)
  - Inventory pre-build strategy
  - Supplier capacity reservations
  - Shift schedule optimization

#### 6. Cost Optimization
- **Scenario**: 10% margin reduction mandate
- **Challenge**: Reduce costs without quality impact
- **Critical Decisions**:
  - Supplier renegotiation targets
  - Process efficiency improvements
  - Inventory carrying cost reduction
  - Labor optimization strategies

### Scenario Analysis Output

When a scenario is active, the AI provides:

1. **Capacity Analysis**
   - Units required vs. available capacity
   - Days needed at normal vs. max production
   - Utilization percentage

2. **Material Requirements**
   - Components needed per BOM
   - Current stock vs. required stock
   - Lead time impact (normal vs. rush)

3. **Labor Analysis**
   - Overtime hours required
   - Temp workers needed
   - Total additional labor cost

4. **Cost Projections**
   - Normal production cost
   - Overtime scenario cost
   - Rush/expedited scenario cost

5. **Critical Decisions**
   - Decision type and urgency level
   - Available options with trade-offs
   - AI recommendation with reasoning

### Critical Decision Types

| Type | Description | Example |
|------|-------------|---------|
| **CAPACITY** | Production capacity decisions | Add shift? Hire temps? |
| **PROCUREMENT** | Material sourcing decisions | Rush order? Alt supplier? |
| **LABOR** | Workforce decisions | Overtime hours? New hires? |
| **QUALITY** | Quality control decisions | Increase inspection? Stop line? |
| **DELIVERY** | Customer delivery decisions | Partial ship? Negotiate deadline? |
| **COST** | Financial trade-off decisions | Premium materials? Expedite? |

### Human-in-the-Loop Decision Process

When the AI identifies a critical decision:

1. **Presentation**: AI explains the situation and stakes
2. **Options**: Multiple choices presented with pros/cons
3. **Recommendation**: AI suggests best option with reasoning
4. **Human Choice**: Operator selects preferred option
5. **Execution**: Workflows execute based on human decision
6. **Feedback**: Results shown in terminal and reports

---

## Visual Simulation Tab

The Visual Simulation tab provides real-time graphical representation of factory operations during scenario execution.

### Accessing the Simulation View

1. Click the **"Simulation"** tab in the center panel (alongside Terminal and Services)
2. The view updates in real-time as scenarios execute
3. Data reflects the active scenario's parameters

### Visual Components

#### Factory Floor View

A visual representation of production stations showing:

```
┌─────────────────────────────────────────────────────────────────┐
│  FACTORY FLOOR                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Assembly │ │ Quality  │ │ Packaging│ │ Shipping │           │
│  │ Station  │ │ Control  │ │ Station  │ │ Dock     │           │
│  │ ████░░░░ │ │ ██████░░ │ │ ████████ │ │ ██░░░░░░ │           │
│  │ 45%      │ │ 75%      │ │ 100%     │ │ 25%      │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  Workers: 95/120    Efficiency: 87%    Throughput: 312/day     │
└─────────────────────────────────────────────────────────────────┘
```

- **Station Progress Bars**: Color-coded utilization (green = optimal, yellow = stressed, red = blocked)
- **Worker Allocation**: Shows current workers vs. available
- **Efficiency Metric**: Real-time machine efficiency percentage
- **Daily Throughput**: Actual vs. target production rate

#### Order Timeline View

A Gantt-style timeline showing order progress:

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDER TIMELINE                                                 │
│                                                                 │
│  ORD-001 ████████████░░░░░░░░░░░░░░░░ 45% │ Due: Jan 25        │
│  ORD-002 ██████████████████░░░░░░░░░░ 65% │ Due: Jan 28        │
│  ORD-003 ████████████████████████████ 100%│ COMPLETED          │
│                                                                 │
│  [Today]────────────────────────────────────────────[Deadline]  │
└─────────────────────────────────────────────────────────────────┘
```

- **Progress Bars**: Visual completion status per order
- **Deadline Markers**: Color-coded urgency (green = on track, red = at risk)
- **Capacity Overlay**: Shows when capacity is exceeded

#### Material Flow Diagram

Animated flow showing materials through production:

```
┌─────────────────────────────────────────────────────────────────┐
│  MATERIAL FLOW                                                  │
│                                                                 │
│  [Inventory] ──→ [Production] ──→ [QC] ──→ [Shipping]          │
│   ████████        ████████░░░      ████     ██░░░░░░           │
│   125 units       87 in-progress   45 pass  23 ready           │
│                                                                 │
│  Component Status:                                              │
│  • Bluetooth Chips: ████████░░ 245/300 (ADEQUATE)              │
│  • Batteries:       ██████░░░░ 180/300 (LOW)                   │
│  • Enclosures:      ██████████ 320/300 (GOOD)                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Pipeline Stages**: Visual flow from inventory to shipping
- **Component Status**: Stock levels with color indicators
- **Bottleneck Highlighting**: Red indicators when flow is blocked

---

## Artifact Visualization

The system provides enhanced visualization for all generated artifacts (emails, purchase orders, invoices, audits).

### Expandable Artifact Cards

Click any artifact in the bottom panels to expand it in-place:

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ EMAIL: Quality Alert - BTH-200 Component Issues              │
├─────────────────────────────────────────────────────────────────┤
│ To: supplier@chiptech.com                                       │
│ Subject: Quality Alert - BTH-200 Component Issues               │
│ Sent: 2025-01-22 14:32:15                                       │
│                                                                 │
│ Body:                                                           │
│ Dear Supplier,                                                  │
│                                                                 │
│ We have identified quality issues with recent shipment of       │
│ BTH-200 Bluetooth chips. Defect rate has increased to 8.5%.     │
│                                                                 │
│ Please schedule a call to discuss corrective actions.           │
│                                                                 │
│ [View Full Details]                          [Collapse ▲]      │
└─────────────────────────────────────────────────────────────────┘
```

### Artifact Filtering

Filter artifacts by type using the filter buttons:

- **All**: Show all artifacts
- **Emails**: Show only email communications
- **POs**: Show only purchase orders
- **Invoices**: Show only invoices
- **Audits**: Show only scheduled audits

### Detail Modal

Click "View Full Details" on any artifact to open a full-screen modal with:

- **Header**: Type icon, title, and timestamp
- **Full Content**: Complete artifact details
- **Metadata**: Creation time, status, related entities
- **Actions**: Copy, export, or dismiss

### Artifact Types

| Type | Icon | Description |
|------|------|-------------|
| **Email** | ✉️ | Outbound communications to suppliers, customers |
| **Purchase Order** | 📦 | Orders sent to suppliers for materials |
| **Invoice** | 💰 | Bills generated for customer orders |
| **Audit** | 📋 | Scheduled quality audits for suppliers |
| **Notification** | 🔔 | Internal system notifications |

---

## Continuous Simulation Loop

The Continuous Simulation Loop provides a game-like experience where random manufacturing events fire continuously, allowing you to observe AI decision-making over extended periods.

### Starting the Simulation Loop

1. Click **"Start Loop"** button in the header (next to Auto-Pilot toggle)
2. The loop will begin generating random scenarios
3. Events fire every 5-20 seconds (randomized)
4. Watch the terminal and AI Decision Panel for activity

### Loop Controls

| Control | Action |
|---------|--------|
| **Start Loop** | Begin continuous simulation |
| **Stop Loop** | Stop and show summary statistics |
| **Pause** | Pause without losing state |
| **Resume** | Continue from paused state |

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULATION LOOP FLOW                         │
│                                                                 │
│   ┌──────────────┐                                              │
│   │ Pick Random  │                                              │
│   │  Scenario    │◄─────────────────────────────────┐           │
│   └──────┬───────┘                                  │           │
│          │                                          │           │
│          ▼                                          │           │
│   ┌──────────────┐                                  │           │
│   │  Randomize   │  • Order quantity ±30%           │           │
│   │  Parameters  │  • Deadline ±25%                 │           │
│   └──────┬───────┘  • Quality rate 2-15%            │           │
│          │          • Worker availability ±15%      │           │
│          ▼                                          │           │
│   ┌──────────────┐                                  │           │
│   │   Activate   │                                  │           │
│   │   Scenario   │                                  │           │
│   └──────┬───────┘                                  │           │
│          │                                          │           │
│          ▼                                          │           │
│   ┌──────────────┐                                  │           │
│   │  Run AI      │  With auto-pilot or              │           │
│   │  Pipeline    │  human decision                  │           │
│   └──────┬───────┘                                  │           │
│          │                                          │           │
│          ▼                                          │           │
│   ┌──────────────┐                                  │           │
│   │  Broadcast   │  WebSocket updates               │           │
│   │  Results     │  to all clients                  │           │
│   └──────┬───────┘                                  │           │
│          │                                          │           │
│          │         Wait 5-20 seconds                │           │
│          └──────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario Pool

The loop randomly selects from all built-in scenarios:

- Normal Operations
- Urgent Large Order
- Supply Chain Crisis
- Quality Crisis
- Seasonal Peak
- Cost Optimization

### Parameter Randomization

Each scenario iteration randomizes parameters within bounds:

| Parameter | Variation | Example |
|-----------|-----------|---------|
| Order Quantity | ±30% | 5000 → 3500-6500 |
| Deadline Days | ±25% | 10 → 7-13 days |
| Quality Issue Rate | 2-15% | Random each iteration |
| Supplier Reliability | 60-95% | Random each iteration |
| Workers Available | ±15% | 100 → 85-115 |
| Machine Efficiency | 80-98% | Random each iteration |

### Data Isolation

The simulation loop uses isolated temporary data:

- **Original CSV files**: Never modified
- **Temp database**: Created fresh for each loop session
- **Cleanup**: Automatic on loop stop or server restart
- **History**: Last 50 events retained for analysis

### Loop Status Monitoring

The header shows current loop status:

```
[🔄 Loop Active: Iteration #15] [Stop Loop]
```

Terminal logs show:
```
[LOOP #15] Starting scenario: Urgent Large Order
[LOOP #15] Parameters: 4,250 units, 8 days deadline
[LOOP #15] AI analyzing situation...
[LOOP #15] Completed - 3 actions executed
Next simulation event in 12.5s...
```

### Use Cases for Simulation Loop

1. **Training**: Let operators observe AI decision patterns
2. **Stress Testing**: See how the system handles varied conditions
3. **Demo Mode**: Continuous activity for trade shows/presentations
4. **Algorithm Tuning**: Observe AI recommendations across many scenarios

---

## API Reference

### REST Endpoints

#### GET /api/state
Returns current pipeline state.

```json
{
  "status": "idle|running|waiting_approval|completed",
  "steps": [...],
  "logs": [...],
  "pendingDecision": {...},
  "autoPilot": false
}
```

#### POST /api/start
Starts the pipeline execution.

#### GET /api/services
Returns all mock service data.

```json
{
  "emails": [...],
  "erp": { "purchaseOrders": [...], "invoices": [...] },
  "crm": { "activities": [...] },
  "qms": { "audits": [...] },
  "notifications": [...]
}
```

#### GET /api/services/emails
Returns email inbox.

#### GET /api/services/erp/pos
Returns purchase orders.

#### GET /api/services/erp/invoices
Returns invoices.

#### GET /api/services/qms/audits
Returns scheduled audits.

### Scenario Endpoints

#### GET /api/scenarios/presets
Returns all available scenario presets (built-in and custom).

```json
{
  "normal_operations": {
    "id": "normal_operations",
    "name": "Normal Operations",
    "description": "Baseline factory operation",
    "category": "baseline",
    "isBuiltIn": true,
    "parameters": {...}
  },
  ...
}
```

#### GET /api/scenarios/presets/:id
Returns a specific scenario preset by ID.

#### POST /api/scenarios/presets
Saves a custom scenario preset.

```json
{
  "id": "my_custom_scenario",
  "name": "My Custom Scenario",
  "description": "Custom test case",
  "parameters": {
    "orderVolume": 3000,
    "deadlineDays": 14,
    ...
  }
}
```

#### DELETE /api/scenarios/presets/:id
Deletes a custom scenario preset (cannot delete built-in presets).

#### GET /api/scenarios/active
Returns the currently active scenario and simulated data.

```json
{
  "active": true,
  "scenario": {...},
  "simulatedData": {
    "capacityAnalysis": {...},
    "materialRequirements": [...],
    "laborAnalysis": {...},
    "costProjections": {...},
    "criticalDecisions": [...]
  }
}
```

#### POST /api/scenarios/activate/:id
Activates a scenario preset by ID.

#### POST /api/scenarios/deactivate
Deactivates the current scenario, returning to normal operations.

#### GET /api/scenarios/factory
Returns factory baseline parameters.

### WebSocket Messages

#### Client → Server

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `start` | - | Start pipeline |
| `approve` | `{ actions: [...], message: "..." }` | Approve selected actions |
| `reject` | - | Reject all recommendations |
| `ask` | `{ question: "..." }` | Ask AI a question |
| `autopilot` | `{ enabled: true/false }` | Toggle auto-pilot |
| `reset` | - | Reset pipeline state |
| `get_services` | - | Request service data |
| `start_simulation_loop` | `{ options: {...} }` | Start continuous simulation loop |
| `stop_simulation_loop` | - | Stop simulation loop |
| `pause_simulation_loop` | - | Pause simulation loop |
| `resume_simulation_loop` | - | Resume paused loop |

#### Server → Client

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `state` | `{ ...pipelineState }` | Full state update |
| `log` | `{ timestamp, message, type }` | New log entry |
| `services` | `{ ...serviceData }` | Service data update |
| `ai_response` | `"answer text"` | Response to question |
| `simulation_status` | `{ running, paused, iteration }` | Loop status update |
| `simulation_event` | `{ eventId, scenario, status }` | Loop event notification |
| `scenario_activated` | `{ ...scenarioData }` | Scenario activated by loop |
| `scenario_deactivated` | - | Scenario cleared |

---

## Mock Services

All external integrations are simulated with in-memory mock services.

### EmailService

Simulates SendGrid/Mailgun-like email API.

```javascript
await EmailService.send({
  to: 'supplier@example.com',
  subject: 'Purchase Order',
  template: 'po-created',
  data: { poNumber: 'PO-001', totalAmount: 1500 }
});
```

**Templates**: `po-created`, `quality-alert`, `shipment-notification`, `invoice`

### ERPService

Simulates SAP/Oracle-like ERP system.

```javascript
// Create Purchase Order
const po = await ERPService.createPurchaseOrder({
  supplierName: 'ChipTech Co',
  items: [{ sku: 'BT-5300', quantity: 500 }],
  totalAmount: 1250
});

// Create Invoice
const invoice = await ERPService.createInvoice({
  customerId: 'CUST-001',
  amount: 499.99
});

// Update Inventory
await ERPService.updateInventory('BT-5300', 500, 'receipt');
```

### CRMService

Simulates Salesforce/HubSpot-like CRM.

```javascript
// Log activity
await CRMService.createActivity('CUST-001', {
  type: 'Order Fulfillment',
  details: 'Order shipped'
});

// Create opportunity
await CRMService.createOpportunity({
  customerId: 'CUST-001',
  value: 5000,
  stage: 'Negotiation'
});
```

### ShippingService

Simulates FedEx/UPS-like shipping API.

```javascript
const shipment = await ShippingService.createShipment({
  orderId: 'ORD-001',
  customerEmail: 'customer@example.com',
  items: [{ sku: 'SOUNDPOD-PRO', quantity: 2 }]
});
// Returns tracking number, carrier, ETA
```

### PaymentGateway

Simulates Stripe-like payment processing.

```javascript
const charge = await PaymentGateway.chargeCard({
  amount: 99.99,
  paymentMethod: 'card_****4242'
});
// 95% success rate simulation
```

### HRService

Simulates Workday/BambooHR-like HR system.

```javascript
const request = await HRService.requestOvertime({
  department: 'Production',
  hours: 40,
  reason: 'Increased demand'
});
// Auto-approves if <= 20 hours
```

### SupplierPortal

Simulates supplier management portal.

```javascript
// Send quality alert
await SupplierPortal.sendQualityAlert('SUP-001', {
  category: 'Component Quality',
  severity: 'High'
});

// Schedule audit
await SupplierPortal.scheduleAudit('SUP-001', {
  type: 'Quality Audit',
  date: '2025-02-01'
});
```

---

## Troubleshooting

### "Failed to parse AI response"

**Cause**: Gemini API returned invalid JSON or failed.

**Solution**:
- Check your API key is valid
- Check Gemini API quota (free tier: 60 req/min)
- System will fall back to local analysis automatically

### "WebSocket connection failed"

**Cause**: Backend server not running.

**Solution**:
```bash
cd server
node server.js
```

### "ENOENT: no such file or directory"

**Cause**: CSV data files not found.

**Solution**: Ensure data exists at configured `DATA_PATH` location.

### Emails/POs not showing in bottom panels

**Cause**: No workflows executed yet.

**Solution**: Run the pipeline and approve some actions. Service data populates after execution.

### Auto-pilot not working

**Cause**: Toggle state not syncing.

**Solution**: Click the toggle switch directly, not the label. Check terminal for "Auto-pilot ENABLED" log.

---

## Cloud Deployment (Test Users Only)

Fully automated deployment to Google Cloud - restricted to whitelisted test users only.

### Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
2. Google account with billing enabled
3. Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)

### One-Command Deploy

```powershell
# 1. Edit deploy\deploy-gcp.ps1 with your details:
$PROJECT_ID = "ai-control-center-demo"
$GEMINI_API_KEY = "AIzaSy..."
$TEST_USERS = @("you@gmail.com", "teammate@gmail.com")

# 2. Run (handles everything automatically)
.\deploy\deploy-gcp.ps1
```

The script automatically:
- Creates GCP project (if needed)
- Enables required APIs
- Builds and deploys containers
- Configures test user access
- Outputs your URLs

### Access Control

- **No public access** - only whitelisted Google accounts
- Users login with their Google account
- Perfect for demos and internal testing

### What Gets Deployed

```
Google Cloud Run
├── AI Control Center (port 3001)
│   ├── React Frontend
│   ├── Node.js Backend
│   └── WebSocket Server
│
└── n8n (port 5678)
    └── Workflow Automation
```

### Estimated Costs

| Service | Cost |
|---------|------|
| Cloud Run (both services) | ~$0-30/mo |

*Scales to zero when not in use. Pay only for actual usage.*

---

## Logger Module

The system includes a centralized logging module for detailed debugging and monitoring.

### Usage

```javascript
const { createLogger, configure, setBroadcast } = require('./logger');

// Create a component-specific logger
const log = createLogger('MyComponent');

// Log at different levels
log.debug('Detailed debug info', { key: 'value' });
log.info('Information message');
log.warn('Warning message', { issue: 'description' });
log.error('Error occurred', { error: err.message });

// Timing utility
const timer = log.time('operation');
// ... do work ...
timer.end('Operation finished');  // Logs with duration

// Group related logs
const group = log.group('batch-operation');
group.add('info', 'Step 1 complete');
group.add('info', 'Step 2 complete');
group.end();  // Logs group summary
```

### Configuration

```javascript
const { configure, LOG_LEVELS } = require('./logger');

configure({
  level: LOG_LEVELS.DEBUG,    // Minimum level to log
  console: true,              // Output to console
  file: true,                 // Write to file
  filePath: './logs/app.log', // Log file path
  maxFileSize: 5 * 1024 * 1024, // 5MB max file size
  colors: true                // ANSI colors in console
});
```

### Log Levels

| Level | Value | Description |
|-------|-------|-------------|
| DEBUG | 0 | Detailed debugging information |
| INFO | 1 | General information messages |
| WARN | 2 | Warning conditions |
| ERROR | 3 | Error conditions |
| NONE | 4 | Disable all logging |

### WebSocket Integration

Connect the logger to broadcast logs in real-time:

```javascript
const { setBroadcast } = require('./logger');

// After WebSocket server is ready
setBroadcast((message) => {
  connectedClients.forEach(client => {
    client.send(JSON.stringify(message));
  });
});
```

### REST Endpoint

Get recent logs via API:

```javascript
// GET /api/logs?count=100&level=ERROR&component=Pipeline
app.get('/api/logs', (req, res) => {
  const { count, level, component, search } = req.query;
  const logs = getRecentLogs(parseInt(count) || 100, { level, component, search });
  res.json(logs);
});
```

---

## File Structure

```
ai-control-center/
├── README.md                 # This file
├── .gitignore               # Git ignore rules
├── start.bat                 # Windows startup script
├── deploy/                   # Cloud deployment files
│   ├── Dockerfile           # Combined container build
│   ├── docker-compose.yml   # Local testing with n8n
│   └── deploy-gcp.ps1       # Automated GCP deployment
├── server/
│   ├── package.json          # Backend dependencies
│   ├── server.js             # Main server (Express + WebSocket)
│   ├── mock-services.js      # Simulated enterprise services
│   ├── scenarios.js          # Scenario simulation engine
│   ├── simulation-loop.js    # Continuous simulation loop controller
│   └── logger.js             # Centralized logging module
└── client/
    ├── package.json          # Frontend dependencies
    ├── vite.config.js        # Vite configuration
    ├── index.html            # HTML entry point
    ├── public/
    │   └── logo.png          # Application logo
    └── src/
        ├── main.jsx          # React entry point
        └── App.jsx           # Main React component (Dashboard + Scenarios + Simulation)
```

---

## License

MIT License - Free for personal and commercial use.

---

## Credits

- **AI**: Google Gemini 2.0 Flash
- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express, WebSocket
- **Data**: Synthetic manufacturing data for SoundPod Pro
