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
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    border: 1px solid #2a2a4a;
  }

  .header h1 {
    font-size: 1.3rem;
    background: linear-gradient(90deg, #00d4ff, #7b2cbf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .autopilot-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
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
  const terminalRef = useRef(null)

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
      }
    }

    setWs(websocket)

    // Poll for service updates
    const pollServices = setInterval(() => {
      fetch(`http://${window.location.hostname}:3001/api/services`)
        .then(r => r.json())
        .then(setServices)
        .catch(() => {})
    }, 2000)

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

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <img src="/logo.png" alt="KIG" className="header-logo" />
          <div className="header-controls">
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
                        <span className="service-type">📧 Email</span>
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
                        <span className="service-type">📦 ERP - PO</span>
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
                        <span className="service-type">🔔 Notification</span>
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
                          {Object.entries(aiResult.analysis).map(([key, value]) => (
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
            <div className="mini-panel-header">📧 Emails ({services.emails?.length || 0})</div>
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
            <div className="mini-panel-header">📋 Purchase Orders ({services.erp?.purchaseOrders?.length || 0})</div>
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
            <div className="mini-panel-header">🧾 Invoices ({services.erp?.invoices?.length || 0})</div>
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
            <div className="mini-panel-header">📅 Audits ({services.qms?.audits?.length || 0})</div>
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
      </div>
    </>
  )
}

export default App
