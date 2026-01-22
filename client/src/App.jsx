import React, { useState, useEffect, useRef } from 'react'

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: #0a0a0f;
    color: #e0e0e0;
    min-height: 100vh;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 12px;
    gap: 12px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  .nav-tabs {
    display: flex;
    gap: 4px;
    background: #f0f0f0;
    padding: 4px;
    border-radius: 8px;
  }

  .nav-tab {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .nav-tab:hover {
    background: #e0e0e0;
  }

  .nav-tab.active {
    background: #1a1a2e;
    color: #fff;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .scenario-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .autopilot-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    color: #e0e0e0;
  }

  .autopilot-toggle.active {
    background: linear-gradient(135deg, #7b2cbf 0%, #a855f7 100%);
    border-color: #a855f7;
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    background: #2a2a4a;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;
  }

  .toggle-switch.active {
    background: #4ade80;
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.3s;
  }

  .toggle-switch.active::after {
    left: 22px;
  }

  .status-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-idle { background: #2a2a4a; color: #888; }
  .status-running { background: #1e3a5f; color: #00d4ff; animation: pulse 1.5s infinite; }
  .status-waiting_approval { background: #3d2914; color: #ffa500; animation: pulse 1s infinite; }
  .status-completed { background: #1a3d1a; color: #4ade80; }
  .status-error { background: #3d1414; color: #ff6b6b; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .main-content {
    display: grid;
    grid-template-columns: 280px 1fr 380px;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  .panel {
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #2a2a4a;
    font-weight: 600;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.9rem;
  }

  .panel-tabs {
    display: flex;
    gap: 4px;
  }

  .panel-tab {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    cursor: pointer;
    background: #1a1a2e;
    border: none;
    color: #888;
  }

  .panel-tab.active {
    background: #2a2a4a;
    color: #fff;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  /* Pipeline Panel */
  .pipeline-step {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 6px;
    background: #1a1a2e;
    border-radius: 8px;
    border-left: 3px solid #2a2a4a;
    transition: all 0.3s;
  }

  .pipeline-step.pending { border-left-color: #444; }
  .pipeline-step.running { border-left-color: #00d4ff; background: #1e3a5f; }
  .pipeline-step.completed { border-left-color: #4ade80; }
  .pipeline-step.error { border-left-color: #ff6b6b; }

  .step-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .step-icon.pending { background: #2a2a4a; }
  .step-icon.running { background: #00d4ff; color: #000; }
  .step-icon.completed { background: #4ade80; color: #000; }
  .step-icon.error { background: #ff6b6b; color: #000; }

  .step-info { flex: 1; }
  .step-name { font-weight: 500; font-size: 0.85rem; }
  .step-status { font-size: 0.7rem; color: #888; text-transform: uppercase; }

  /* Terminal Panel */
  .terminal {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    line-height: 1.5;
  }

  .log-entry {
    padding: 3px 0;
    display: flex;
    gap: 8px;
  }

  .log-time {
    color: #555;
    min-width: 70px;
    font-size: 11px;
  }

  .log-message { flex: 1; }
  .log-message.info { color: #e0e0e0; }
  .log-message.success { color: #4ade80; }
  .log-message.error { color: #ff6b6b; }
  .log-message.warning { color: #ffa500; }
  .log-message.ai { color: #a78bfa; }
  .log-message.user { color: #00d4ff; }
  .log-message.step { color: #f472b6; font-weight: 600; }
  .log-message.waiting { color: #fbbf24; animation: pulse 1s infinite; }

  /* Service Activity */
  .service-item {
    padding: 8px 10px;
    margin-bottom: 6px;
    background: #1a1a2e;
    border-radius: 6px;
    font-size: 0.8rem;
    border-left: 3px solid #2a2a4a;
  }

  .service-item.email { border-left-color: #3b82f6; }
  .service-item.erp { border-left-color: #10b981; }
  .service-item.crm { border-left-color: #f59e0b; }
  .service-item.shipping { border-left-color: #8b5cf6; }
  .service-item.notification { border-left-color: #ef4444; }

  .service-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .service-type {
    font-weight: 600;
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  .service-time {
    color: #666;
    font-size: 0.7rem;
  }

  .service-content {
    color: #aaa;
  }

  /* AI Decision Panel */
  .ai-section {
    margin-bottom: 16px;
  }

  .ai-section h3 {
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .ai-card {
    background: #1a1a2e;
    border-radius: 8px;
    padding: 12px;
  }

  .health-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .health-item {
    padding: 6px 10px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
  }

  .health-item.good { background: #1a3d1a; }
  .health-item.warning { background: #3d2914; }
  .health-item.critical { background: #3d1414; }

  .finding {
    padding: 8px 10px;
    margin-bottom: 6px;
    background: #1e1e2e;
    border-radius: 6px;
    border-left: 3px solid #a78bfa;
    font-size: 0.85rem;
  }

  .action-item {
    padding: 10px;
    margin-bottom: 6px;
    background: #1e1e2e;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .action-info { flex: 1; }
  .action-name { font-weight: 600; color: #fff; font-size: 0.85rem; }
  .action-reason { font-size: 0.75rem; color: #888; margin-top: 2px; }

  .priority-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.65rem;
    text-transform: uppercase;
  }

  .priority-critical { background: #3d1414; color: #ff6b6b; }
  .priority-high { background: #3d2914; color: #ffa500; }
  .priority-medium { background: #1e3a5f; color: #00d4ff; }

  .ai-question {
    padding: 12px;
    background: linear-gradient(135deg, #2a1a4a 0%, #1a2a4a 100%);
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #4a3a6a;
  }

  .ai-question-text {
    font-size: 0.9rem;
    color: #e0e0e0;
    line-height: 1.4;
  }

  .button-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
  }

  button:hover { transform: translateY(-1px); }
  button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-primary {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: #000;
  }

  .btn-danger {
    background: linear-gradient(135deg, #ff6b6b 0%, #dc2626 100%);
    color: #fff;
  }

  .btn-secondary {
    background: #2a2a4a;
    color: #e0e0e0;
  }

  .btn-start {
    background: linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%);
    color: #fff;
    padding: 10px 24px;
  }

  .chat-input {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #2a2a4a;
  }

  .chat-input input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    background: #1a1a2e;
    color: #e0e0e0;
    font-size: 0.85rem;
  }

  .chat-input input:focus {
    outline: none;
    border-color: #00d4ff;
  }

  .idle-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    gap: 12px;
  }

  .idle-icon {
    font-size: 3rem;
  }

  .idle-text {
    color: #666;
    max-width: 250px;
    line-height: 1.5;
    font-size: 0.85rem;
  }

  /* Bottom service panels */
  .bottom-panels {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    height: 200px;
  }

  .mini-panel {
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    overflow: hidden;
  }

  .mini-panel-header {
    padding: 8px 12px;
    border-bottom: 1px solid #2a2a4a;
    font-weight: 600;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mini-panel-content {
    padding: 8px;
    overflow-y: auto;
    height: calc(100% - 36px);
    font-size: 0.75rem;
  }

  .mini-item {
    padding: 6px 8px;
    margin-bottom: 4px;
    background: #1a1a2e;
    border-radius: 4px;
  }

  .mini-item-header {
    display: flex;
    justify-content: space-between;
    color: #888;
    font-size: 0.7rem;
    margin-bottom: 2px;
  }

  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    background: #2a2a4a;
  }

  .badge.success { background: #1a3d1a; color: #4ade80; }
  .badge.warning { background: #3d2914; color: #ffa500; }

  /* ============================================
     SCENARIOS PAGE STYLES
     ============================================ */

  .scenarios-page {
    flex: 1;
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 12px;
    min-height: 0;
  }

  .presets-panel {
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .preset-card {
    padding: 12px;
    margin: 8px;
    background: #1a1a2e;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .preset-card:hover {
    border-color: #3a3a5a;
  }

  .preset-card.active {
    border-color: #00d4ff;
    background: #1e3a5f;
  }

  .preset-card.builtin {
    border-left: 3px solid #7b2cbf;
  }

  .preset-card.custom {
    border-left: 3px solid #4ade80;
  }

  .preset-name {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 0.8rem;
    color: #888;
    line-height: 1.4;
  }

  .preset-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-top: 8px;
  }

  .preset-badge.builtin {
    background: #2a1a4a;
    color: #a78bfa;
  }

  .preset-badge.custom {
    background: #1a3d1a;
    color: #4ade80;
  }

  .scenario-details {
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .details-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .details-section {
    margin-bottom: 20px;
  }

  .details-section h3 {
    font-size: 0.9rem;
    color: #00d4ff;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2a2a4a;
  }

  .param-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .param-item {
    background: #1a1a2e;
    padding: 12px;
    border-radius: 8px;
  }

  .param-label {
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 4px;
  }

  .param-value {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .param-value.critical { color: #ff6b6b; }
  .param-value.warning { color: #ffa500; }
  .param-value.good { color: #4ade80; }

  .inventory-bar {
    height: 8px;
    background: #2a2a4a;
    border-radius: 4px;
    margin-top: 6px;
    overflow: hidden;
  }

  .inventory-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .inventory-fill.critical { background: #ff6b6b; }
  .inventory-fill.low { background: #ffa500; }
  .inventory-fill.ok { background: #4ade80; }

  .decision-card {
    background: #1a1a2e;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border-left: 3px solid #ff6b6b;
  }

  .decision-card.HIGH { border-left-color: #ffa500; }
  .decision-card.CRITICAL { border-left-color: #ff6b6b; }

  .decision-title {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .decision-question {
    font-size: 0.85rem;
    color: #aaa;
    margin-bottom: 8px;
  }

  .decision-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .decision-option {
    padding: 4px 10px;
    background: #2a2a4a;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .decision-option.recommended {
    background: #1a3d1a;
    color: #4ade80;
  }

  .cost-comparison {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .cost-card {
    background: #1a1a2e;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
  }

  .cost-card.recommended {
    border: 2px solid #4ade80;
  }

  .cost-card-title {
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 8px;
  }

  .cost-card-value {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .cost-card-note {
    font-size: 0.7rem;
    color: #666;
  }

  .scenario-actions {
    padding: 12px 16px;
    border-top: 1px solid #2a2a4a;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .btn-activate {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: #fff;
    padding: 10px 24px;
  }

  .btn-deactivate {
    background: #2a2a4a;
    color: #e0e0e0;
  }

  /* Critical Decisions Panel in main view */
  .critical-decisions-panel {
    background: linear-gradient(135deg, #2a1414 0%, #1a1a2e 100%);
    border: 1px solid #4a2a2a;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .critical-decisions-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #ff6b6b;
    font-weight: 600;
  }
`

function App() {
  const [state, setState] = useState({
    status: 'idle',
    steps: [],
    logs: [],
    pendingDecision: null,
    autoPilot: false
  })
  const [selectedActions, setSelectedActions] = useState([])
  const [userInput, setUserInput] = useState('')
  const [ws, setWs] = useState(null)
  const [services, setServices] = useState({ emails: [], erp: {}, crm: {}, qms: {}, notifications: [] })
  const [activeTab, setActiveTab] = useState('terminal')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [presets, setPresets] = useState({ builtIn: [], custom: [] })
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [activeScenario, setActiveScenario] = useState(null)
  const terminalRef = useRef(null)

  const API_BASE = `http://${window.location.hostname}:3001`

  useEffect(() => {
    const websocket = new WebSocket(`ws://${window.location.hostname}:3001`)

    websocket.onopen = () => {
      console.log('Connected to server')
    }

    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'state') {
        setState(msg.data)
        if (msg.data.pendingDecision?.aiResult?.recommendedActions) {
          setSelectedActions(
            msg.data.pendingDecision.aiResult.recommendedActions.map(a => a.action)
          )
        }
      } else if (msg.type === 'log') {
        setState(prev => ({
          ...prev,
          logs: [...prev.logs, msg.data]
        }))
      } else if (msg.type === 'services') {
        setServices(msg.data)
      } else if (msg.type === 'scenario_activated') {
        setActiveScenario(msg.data)
      } else if (msg.type === 'scenario_deactivated') {
        setActiveScenario(null)
      }
    }

    setWs(websocket)

    // Poll for service updates
    const pollServices = setInterval(() => {
      fetch(`${API_BASE}/api/services`)
        .then(r => r.json())
        .then(setServices)
        .catch(() => {})
    }, 2000)

    // Load presets
    loadPresets()
    loadActiveScenario()

    return () => {
      websocket.close()
      clearInterval(pollServices)
    }
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [state.logs])

  const loadPresets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/presets`)
      const data = await res.json()
      setPresets(data)
    } catch (e) {
      console.error('Failed to load presets:', e)
    }
  }

  const loadActiveScenario = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/active`)
      const data = await res.json()
      if (data && data.name) {
        setActiveScenario(data)
      }
    } catch (e) {
      console.error('Failed to load active scenario:', e)
    }
  }

  const activateScenario = async (presetId) => {
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/activate/${presetId}`, { method: 'POST' })
      const data = await res.json()
      setActiveScenario(data)
      setSelectedPreset(data)
    } catch (e) {
      console.error('Failed to activate scenario:', e)
    }
  }

  const deactivateScenario = async () => {
    try {
      await fetch(`${API_BASE}/api/scenarios/deactivate`, { method: 'POST' })
      setActiveScenario(null)
    } catch (e) {
      console.error('Failed to deactivate scenario:', e)
    }
  }

  const startPipeline = () => {
    ws?.send(JSON.stringify({ type: 'start' }))
  }

  const toggleAutoPilot = () => {
    const newState = !state.autoPilot
    ws?.send(JSON.stringify({ type: 'autopilot', enabled: newState }))
  }

  const approve = () => {
    ws?.send(JSON.stringify({
      type: 'approve',
      actions: selectedActions,
      message: userInput
    }))
    setUserInput('')
  }

  const reject = () => {
    ws?.send(JSON.stringify({ type: 'reject' }))
  }

  const askQuestion = () => {
    if (userInput.trim()) {
      ws?.send(JSON.stringify({ type: 'ask', question: userInput }))
      setUserInput('')
    }
  }

  const reset = () => {
    ws?.send(JSON.stringify({ type: 'reset' }))
  }

  const toggleAction = (action) => {
    setSelectedActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    )
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const decision = state.pendingDecision
  const aiResult = decision?.aiResult

  // Render Scenarios Page
  const renderScenariosPage = () => {
    const preset = selectedPreset || (presets.builtIn.length > 0 ? presets.builtIn[0] : null)
    const sim = preset?.simulatedData || (activeScenario?.simulatedData)

    return (
      <div className="scenarios-page">
        {/* Presets Panel */}
        <div className="presets-panel">
          <div className="panel-header">
            Scenario Presets
          </div>
          <div className="panel-content">
            <h4 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>BUILT-IN SCENARIOS</h4>
            {presets.builtIn.map(p => (
              <div
                key={p.id}
                className={`preset-card builtin ${selectedPreset?.id === p.id ? 'active' : ''} ${activeScenario?.id === p.id ? 'active' : ''}`}
                onClick={() => setSelectedPreset(p)}
              >
                <div className="preset-name">{p.name}</div>
                <div className="preset-description">{p.description}</div>
                <span className="preset-badge builtin">Built-in</span>
                {activeScenario?.id === p.id && <span className="preset-badge" style={{ background: '#3d1414', color: '#ff6b6b', marginLeft: '8px' }}>ACTIVE</span>}
              </div>
            ))}

            {presets.custom.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px', marginTop: '16px' }}>CUSTOM SCENARIOS</h4>
                {presets.custom.map(p => (
                  <div
                    key={p.id}
                    className={`preset-card custom ${selectedPreset?.id === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedPreset(p)}
                  >
                    <div className="preset-name">{p.name}</div>
                    <div className="preset-description">{p.description}</div>
                    <span className="preset-badge custom">Custom</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Scenario Details Panel */}
        <div className="scenario-details">
          <div className="panel-header">
            {preset ? preset.name : 'Select a Scenario'}
            {activeScenario && (
              <span className="scenario-indicator">
                SCENARIO ACTIVE
              </span>
            )}
          </div>
          <div className="details-content">
            {preset ? (
              <>
                <div className="details-section">
                  <h3>Scenario Overview</h3>
                  <p style={{ color: '#aaa', marginBottom: '12px' }}>{preset.description}</p>

                  {preset.parameters?.injectOrder && (
                    <div className="param-grid">
                      <div className="param-item">
                        <div className="param-label">Order Quantity</div>
                        <div className="param-value critical">{preset.parameters.orderQuantity.toLocaleString()} units</div>
                      </div>
                      <div className="param-item">
                        <div className="param-label">Deadline</div>
                        <div className="param-value warning">{preset.parameters.orderDeadlineDays} days</div>
                      </div>
                      <div className="param-item">
                        <div className="param-label">Priority</div>
                        <div className="param-value" style={{ textTransform: 'uppercase' }}>{preset.parameters.orderPriority}</div>
                      </div>
                      <div className="param-item">
                        <div className="param-label">Customer Type</div>
                        <div className="param-value">{preset.parameters.customerType?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {sim && (
                  <>
                    <div className="details-section">
                      <h3>Capacity Analysis</h3>
                      <div className="param-grid">
                        <div className="param-item">
                          <div className="param-label">Total Demand</div>
                          <div className="param-value">{sim.capacityAnalysis?.totalDemand?.toLocaleString()} units</div>
                        </div>
                        <div className="param-item">
                          <div className="param-label">Capacity Utilization</div>
                          <div className={`param-value ${sim.capacityAnalysis?.capacityUtilization > 100 ? 'critical' : sim.capacityAnalysis?.capacityUtilization > 80 ? 'warning' : 'good'}`}>
                            {sim.capacityAnalysis?.capacityUtilization}%
                          </div>
                        </div>
                        <div className="param-item">
                          <div className="param-label">Can Meet with Normal Ops</div>
                          <div className={`param-value ${sim.capacityAnalysis?.canMeetWithNormalOps ? 'good' : 'critical'}`}>
                            {sim.capacityAnalysis?.canMeetWithNormalOps ? 'YES' : 'NO'}
                          </div>
                        </div>
                        <div className="param-item">
                          <div className="param-label">Can Meet with Overtime</div>
                          <div className={`param-value ${sim.capacityAnalysis?.canMeetWithOvertime ? 'good' : 'critical'}`}>
                            {sim.capacityAnalysis?.canMeetWithOvertime ? 'YES' : 'NO'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h3>Inventory Status</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {sim.inventoryStatus?.slice(0, 9).map(item => (
                          <div key={item.sku} className="param-item" style={{ padding: '8px' }}>
                            <div className="param-label">{item.name}</div>
                            <div className={`param-value ${item.status === 'CRITICAL' ? 'critical' : item.status === 'LOW' ? 'warning' : 'good'}`} style={{ fontSize: '0.9rem' }}>
                              {item.levelPercent}%
                            </div>
                            <div className="inventory-bar">
                              <div
                                className={`inventory-fill ${item.status === 'CRITICAL' ? 'critical' : item.status === 'LOW' ? 'low' : 'ok'}`}
                                style={{ width: `${Math.min(item.levelPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {sim.criticalDecisions?.length > 0 && (
                      <div className="details-section">
                        <h3>Critical Decisions ({sim.criticalDecisions.length})</h3>
                        {sim.criticalDecisions.map(d => (
                          <div key={d.id} className={`decision-card ${d.priority}`}>
                            <div className="decision-title">
                              <span className={`priority-badge priority-${d.priority.toLowerCase()}`}>{d.priority}</span>
                              {d.title}
                            </div>
                            <div className="decision-question">{d.question}</div>
                            <div className="decision-options">
                              {d.options.map(opt => (
                                <span
                                  key={opt.id}
                                  className={`decision-option ${opt.id === d.recommendation ? 'recommended' : ''}`}
                                >
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {sim.costProjections && (
                      <div className="details-section">
                        <h3>Cost Projections</h3>
                        <div className="cost-comparison">
                          <div className="cost-card">
                            <div className="cost-card-title">Normal Operations</div>
                            <div className="cost-card-value">${sim.costProjections.scenario1_normal?.total?.toLocaleString()}</div>
                            <div className="cost-card-note">
                              {sim.costProjections.scenario1_normal?.meetsDeadline ? 'Meets deadline' : 'May miss deadline'}
                            </div>
                          </div>
                          <div className="cost-card">
                            <div className="cost-card-title">Maximum Overtime</div>
                            <div className="cost-card-value">${sim.costProjections.scenario2_overtime?.total?.toLocaleString()}</div>
                            <div className="cost-card-note">
                              {sim.costProjections.scenario2_overtime?.meetsDeadline ? 'Meets deadline' : 'May miss deadline'}
                            </div>
                          </div>
                          <div className="cost-card recommended">
                            <div className="cost-card-title">Rush Everything</div>
                            <div className="cost-card-value">${sim.costProjections.scenario3_rush?.total?.toLocaleString()}</div>
                            <div className="cost-card-note">Guaranteed to meet deadline</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="idle-state">
                <div className="idle-icon">📋</div>
                <p className="idle-text">Select a scenario preset from the left panel to view details</p>
              </div>
            )}
          </div>

          <div className="scenario-actions">
            {activeScenario ? (
              <button className="btn-deactivate" onClick={deactivateScenario}>
                Deactivate Scenario
              </button>
            ) : (
              preset && (
                <button className="btn-activate" onClick={() => activateScenario(preset.id)}>
                  Activate Scenario
                </button>
              )
            )}
            <button className="btn-secondary" onClick={() => setCurrentPage('dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Dashboard Page
  const renderDashboardPage = () => (
    <>
      {/* Main Content */}
      <div className="main-content">
        {/* Pipeline Panel */}
        <div className="panel">
          <div className="panel-header">Pipeline</div>
          <div className="panel-content">
            {state.steps.length === 0 ? (
              <div className="idle-state">
                <div className="idle-icon">🔄</div>
                <p className="idle-text">Pipeline steps will appear here</p>
              </div>
            ) : (
              state.steps.map((step, idx) => (
                <div key={step.id} className={`pipeline-step ${step.status}`}>
                  <div className={`step-icon ${step.status}`}>
                    {step.status === 'completed' ? '✓' :
                     step.status === 'running' ? '⟳' :
                     step.status === 'error' ? '✗' : (idx + 1)}
                  </div>
                  <div className="step-info">
                    <div className="step-name">{step.name}</div>
                    <div className="step-status">{step.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Panel - Terminal / Services */}
        <div className="panel">
          <div className="panel-header">
            <span>{activeTab === 'terminal' ? 'Live Terminal' : 'Service Activity'}</span>
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activeTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminal')}
              >
                Terminal
              </button>
              <button
                className={`panel-tab ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
            </div>
          </div>
          <div className="panel-content" ref={activeTab === 'terminal' ? terminalRef : null}>
            {activeTab === 'terminal' ? (
              <div className="terminal">
                {state.logs.length === 0 ? (
                  <div className="idle-state">
                    <div className="idle-icon">📟</div>
                    <p className="idle-text">Real-time logs will appear here</p>
                  </div>
                ) : (
                  state.logs.map((log, idx) => (
                    <div key={idx} className="log-entry">
                      <span className="log-time">{formatTime(log.timestamp)}</span>
                      <span className={`log-message ${log.type}`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                {services.emails?.slice(0, 10).map((email, idx) => (
                  <div key={idx} className="service-item email">
                    <div className="service-header">
                      <span className="service-type">Email</span>
                      <span className="service-time">{formatTime(email.timestamp)}</span>
                    </div>
                    <div className="service-content">
                      <strong>{email.subject}</strong><br/>
                      To: {email.to?.join(', ')}
                    </div>
                  </div>
                ))}
                {services.erp?.purchaseOrders?.slice(0, 5).map((po, idx) => (
                  <div key={idx} className="service-item erp">
                    <div className="service-header">
                      <span className="service-type">ERP - PO</span>
                      <span className="service-time">{formatTime(po.createdAt)}</span>
                    </div>
                    <div className="service-content">
                      {po.poNumber} - ${po.totalAmount} - {po.supplierName}
                    </div>
                  </div>
                ))}
                {services.notifications?.slice(0, 5).map((notif, idx) => (
                  <div key={idx} className="service-item notification">
                    <div className="service-header">
                      <span className="service-type">Notification</span>
                      <span className="service-time">{formatTime(notif.timestamp)}</span>
                    </div>
                    <div className="service-content">
                      <strong>{notif.title}</strong>: {notif.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Decision Panel */}
        <div className="panel">
          <div className="panel-header">AI Decision Center</div>
          <div className="panel-content">
            {/* Show scenario critical decisions if available */}
            {aiResult?.scenario?.simulatedData?.criticalDecisions?.length > 0 && (
              <div className="critical-decisions-panel">
                <div className="critical-decisions-header">
                  ⚠️ {aiResult.scenario.simulatedData.criticalDecisions.length} Critical Decisions Require Your Input
                </div>
                {aiResult.scenario.simulatedData.criticalDecisions.slice(0, 2).map(d => (
                  <div key={d.id} style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{d.question}</div>
                  </div>
                ))}
              </div>
            )}

            {state.autoPilot && state.status === 'running' ? (
              <div className="ai-question">
                <div className="ai-question-text">
                  🤖 <strong>AUTO-PILOT ACTIVE</strong><br/><br/>
                  AI is automatically approving recommendations and executing workflows without human intervention.
                </div>
              </div>
            ) : !decision ? (
              <div className="idle-state">
                <div className="idle-icon">🤖</div>
                <p className="idle-text">AI decisions will appear here</p>
              </div>
            ) : (
              <>
                {aiResult?.analysis && (
                  <div className="ai-section">
                    <h3>System Health</h3>
                    <div className="ai-card">
                      <div className="health-grid">
                        {Object.entries(aiResult.analysis).filter(([key]) => key.includes('Health')).map(([key, value]) => (
                          <div key={key} className={`health-item ${value}`}>
                            <span>{key.replace('Health', '')}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {aiResult?.findings?.length > 0 && (
                  <div className="ai-section">
                    <h3>Findings</h3>
                    <div className="ai-card">
                      {aiResult.findings.map((finding, idx) => (
                        <div key={idx} className="finding">{finding}</div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult?.question && (
                  <div className="ai-question">
                    <div className="ai-question-text">
                      🤖 {aiResult.question}
                    </div>
                  </div>
                )}

                {aiResult?.recommendedActions?.length > 0 && (
                  <div className="ai-section">
                    <h3>Recommended Actions</h3>
                    {aiResult.recommendedActions.map((action, idx) => (
                      <div key={idx} className="action-item">
                        <input
                          type="checkbox"
                          className="action-checkbox"
                          checked={selectedActions.includes(action.action)}
                          onChange={() => toggleAction(action.action)}
                        />
                        <div className="action-info">
                          <div className="action-name">{action.action.replace(/_/g, ' ')}</div>
                          <div className="action-reason">{action.reason}</div>
                        </div>
                        <span className={`priority-badge priority-${action.priority}`}>
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="button-row">
                  <button
                    className="btn-primary"
                    onClick={approve}
                    disabled={selectedActions.length === 0}
                  >
                    ✓ Approve
                  </button>
                  <button className="btn-danger" onClick={reject}>
                    ✗ Reject
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask AI a question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            />
            <button className="btn-secondary" onClick={askQuestion}>
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Service Panels */}
      <div className="bottom-panels">
        <div className="mini-panel">
          <div className="mini-panel-header">Emails ({services.emails?.length || 0})</div>
          <div className="mini-panel-content">
            {services.emails?.slice(0, 5).map((email, idx) => (
              <div key={idx} className="mini-item">
                <div className="mini-item-header">
                  <span>{email.to?.[0]?.split('@')[0]}</span>
                  <span className="badge success">sent</span>
                </div>
                <div>{email.subject?.substring(0, 30)}...</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mini-panel">
          <div className="mini-panel-header">Purchase Orders ({services.erp?.purchaseOrders?.length || 0})</div>
          <div className="mini-panel-content">
            {services.erp?.purchaseOrders?.slice(0, 5).map((po, idx) => (
              <div key={idx} className="mini-item">
                <div className="mini-item-header">
                  <span>{po.poNumber}</span>
                  <span className="badge">${po.totalAmount}</span>
                </div>
                <div>{po.supplierName}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mini-panel">
          <div className="mini-panel-header">Invoices ({services.erp?.invoices?.length || 0})</div>
          <div className="mini-panel-content">
            {services.erp?.invoices?.slice(0, 5).map((inv, idx) => (
              <div key={idx} className="mini-item">
                <div className="mini-item-header">
                  <span>{inv.invoiceNumber}</span>
                  <span className="badge success">${inv.amount}</span>
                </div>
                <div>{inv.customerName}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mini-panel">
          <div className="mini-panel-header">Audits ({services.qms?.audits?.length || 0})</div>
          <div className="mini-panel-content">
            {services.qms?.audits?.slice(0, 5).map((audit, idx) => (
              <div key={idx} className="mini-item">
                <div className="mini-item-header">
                  <span>{audit.supplierId}</span>
                  <span className="badge warning">{audit.status}</span>
                </div>
                <div>{audit.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <img src="/logo.png" alt="KIG" className="header-logo" />
            <div className="nav-tabs">
              <button
                className={`nav-tab ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-tab ${currentPage === 'scenarios' ? 'active' : ''}`}
                onClick={() => setCurrentPage('scenarios')}
              >
                Scenarios
              </button>
            </div>
          </div>
          <div className="header-controls">
            {activeScenario && (
              <div className="scenario-indicator">
                ⚡ {activeScenario.name}
              </div>
            )}
            <div className={`autopilot-toggle ${state.autoPilot ? 'active' : ''}`}>
              <span>Auto-Pilot</span>
              <div
                className={`toggle-switch ${state.autoPilot ? 'active' : ''}`}
                onClick={toggleAutoPilot}
              />
            </div>
            <span className={`status-badge status-${state.status}`}>
              {state.status.replace('_', ' ')}
            </span>
            {state.status === 'idle' && (
              <button className="btn-start" onClick={startPipeline}>
                Start AI Agent
              </button>
            )}
            {(state.status === 'completed' || state.status === 'error') && (
              <button className="btn-secondary" onClick={reset}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        {currentPage === 'dashboard' ? renderDashboardPage() : renderScenariosPage()}
      </div>
    </>
  )
}

export default App
