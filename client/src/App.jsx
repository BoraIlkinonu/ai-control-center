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

  /* ============================================
     ENHANCED ARTIFACT VISUALIZATION
     ============================================ */

  .artifact-card {
    background: #1a1a2e;
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid #2a2a4a;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
  }

  .artifact-card:hover {
    background: #1e1e3a;
  }

  .artifact-card.expanded {
    background: #1e2a3e;
  }

  .artifact-card.email { border-left-color: #3b82f6; }
  .artifact-card.po { border-left-color: #10b981; }
  .artifact-card.invoice { border-left-color: #f59e0b; }
  .artifact-card.audit { border-left-color: #8b5cf6; }
  .artifact-card.shipment { border-left-color: #ec4899; }
  .artifact-card.notification { border-left-color: #ef4444; }

  .artifact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
  }

  .artifact-icon {
    font-size: 1.2rem;
    margin-right: 10px;
  }

  .artifact-title {
    flex: 1;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .artifact-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #888;
  }

  .artifact-type-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .artifact-type-badge.email { background: #1e3a5f; color: #3b82f6; }
  .artifact-type-badge.po { background: #1a3d2a; color: #10b981; }
  .artifact-type-badge.invoice { background: #3d2914; color: #f59e0b; }
  .artifact-type-badge.audit { background: #2a1a4a; color: #8b5cf6; }
  .artifact-type-badge.shipment { background: #3d1a2a; color: #ec4899; }

  .artifact-expand-icon {
    transition: transform 0.2s;
    color: #666;
  }

  .artifact-card.expanded .artifact-expand-icon {
    transform: rotate(180deg);
  }

  .artifact-details {
    padding: 0 12px 12px 12px;
    border-top: 1px solid #2a2a4a;
    font-size: 0.8rem;
  }

  .artifact-detail-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #1a1a2e;
  }

  .artifact-detail-row:last-child {
    border-bottom: none;
  }

  .artifact-detail-label {
    color: #888;
  }

  .artifact-detail-value {
    color: #e0e0e0;
    text-align: right;
  }

  .artifact-body {
    background: #12121a;
    padding: 10px;
    border-radius: 6px;
    margin-top: 8px;
    font-size: 0.8rem;
    color: #aaa;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
  }

  .artifact-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  .artifact-btn {
    padding: 4px 10px;
    font-size: 0.7rem;
    border-radius: 4px;
    background: #2a2a4a;
    border: none;
    color: #e0e0e0;
    cursor: pointer;
  }

  .artifact-btn:hover {
    background: #3a3a5a;
  }

  .artifact-btn.primary {
    background: #1e3a5f;
    color: #00d4ff;
  }

  /* Artifact Detail Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #2a2a4a;
  }

  .modal-title {
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .modal-close {
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .modal-close:hover {
    color: #fff;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .modal-section {
    margin-bottom: 20px;
  }

  .modal-section h4 {
    font-size: 0.85rem;
    color: #00d4ff;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .modal-field {
    background: #1a1a2e;
    padding: 10px;
    border-radius: 6px;
  }

  .modal-field-label {
    font-size: 0.7rem;
    color: #888;
    margin-bottom: 4px;
  }

  .modal-field-value {
    font-size: 0.9rem;
    color: #e0e0e0;
  }

  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #2a2a4a;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  /* Activity Timeline */
  .activity-timeline {
    padding: 12px;
  }

  .timeline-filters {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .timeline-filter {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    color: #888;
  }

  .timeline-filter.active {
    background: #1e3a5f;
    border-color: #00d4ff;
    color: #00d4ff;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    border-left: 2px solid #2a2a4a;
    margin-left: 8px;
    padding-left: 16px;
    position: relative;
  }

  .timeline-item::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 12px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2a2a4a;
  }

  .timeline-item.email::before { background: #3b82f6; }
  .timeline-item.po::before { background: #10b981; }
  .timeline-item.invoice::before { background: #f59e0b; }
  .timeline-item.audit::before { background: #8b5cf6; }

  .timeline-content {
    flex: 1;
  }

  .timeline-time {
    font-size: 0.7rem;
    color: #666;
  }

  /* ============================================
     VISUAL SIMULATION TAB
     ============================================ */

  .simulation-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .factory-floor {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    padding: 16px;
    background: #1a1a2e;
    border-radius: 8px;
  }

  .station-card {
    background: #12121a;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    border: 2px solid transparent;
    transition: all 0.3s;
  }

  .station-card.active {
    border-color: #00d4ff;
    animation: stationPulse 1.5s infinite;
  }

  .station-card.idle {
    opacity: 0.6;
  }

  .station-card.blocked {
    border-color: #ff6b6b;
  }

  @keyframes stationPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
    50% { box-shadow: 0 0 20px 5px rgba(0, 212, 255, 0.2); }
  }

  .station-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .station-name {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .station-status {
    font-size: 0.65rem;
    color: #888;
    text-transform: uppercase;
  }

  .station-throughput {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4ade80;
    margin-top: 8px;
  }

  .station-workers {
    font-size: 0.7rem;
    color: #888;
    margin-top: 4px;
  }

  /* Order Timeline / Gantt */
  .order-timeline {
    background: #1a1a2e;
    border-radius: 8px;
    padding: 16px;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .timeline-legend {
    display: flex;
    gap: 12px;
    font-size: 0.75rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .legend-dot.on-track { background: #4ade80; }
  .legend-dot.at-risk { background: #ffa500; }
  .legend-dot.overdue { background: #ff6b6b; }

  .gantt-container {
    overflow-x: auto;
  }

  .gantt-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #12121a;
  }

  .gantt-label {
    width: 120px;
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gantt-bar-container {
    flex: 1;
    height: 24px;
    background: #12121a;
    border-radius: 4px;
    position: relative;
  }

  .gantt-bar {
    height: 100%;
    border-radius: 4px;
    position: absolute;
    left: 0;
    display: flex;
    align-items: center;
    padding-left: 8px;
    font-size: 0.7rem;
    color: #000;
    font-weight: 600;
  }

  .gantt-bar.on-track { background: linear-gradient(90deg, #4ade80, #22c55e); }
  .gantt-bar.at-risk { background: linear-gradient(90deg, #ffa500, #f59e0b); }
  .gantt-bar.overdue { background: linear-gradient(90deg, #ff6b6b, #dc2626); }

  .gantt-deadline {
    position: absolute;
    height: 100%;
    width: 2px;
    background: #ff6b6b;
  }

  /* Material Flow Diagram */
  .material-flow {
    background: #1a1a2e;
    border-radius: 8px;
    padding: 16px;
  }

  .flow-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    overflow-x: auto;
    padding: 16px 0;
  }

  .flow-node {
    background: #12121a;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    min-width: 120px;
    border: 2px solid #2a2a4a;
  }

  .flow-node.active {
    border-color: #00d4ff;
  }

  .flow-node.bottleneck {
    border-color: #ff6b6b;
    background: #2a1414;
  }

  .flow-node-icon {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .flow-node-label {
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .flow-node-value {
    font-size: 0.9rem;
    color: #4ade80;
  }

  .flow-arrow {
    font-size: 1.5rem;
    color: #2a2a4a;
    flex-shrink: 0;
  }

  .flow-arrow.active {
    color: #00d4ff;
    animation: flowPulse 1s infinite;
  }

  @keyframes flowPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* ============================================
     SIMULATION LOOP CONTROLS
     ============================================ */

  .sim-loop-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    color: #e0e0e0;
  }

  .sim-loop-toggle.active {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border-color: #ff6b6b;
  }

  .sim-loop-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: #3d1414;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #ff6b6b;
  }

  .sim-loop-indicator .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff6b6b;
    animation: pulse 1s infinite;
  }

  .sim-controls-panel {
    position: absolute;
    top: 100%;
    right: 0;
    background: #12121a;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;
    min-width: 280px;
    z-index: 100;
  }

  .sim-control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .sim-control-label {
    font-size: 0.85rem;
    color: #888;
  }

  .sim-slider {
    width: 120px;
  }

  .sim-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #2a2a4a;
  }

  .sim-stat {
    text-align: center;
  }

  .sim-stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #00d4ff;
  }

  .sim-stat-label {
    font-size: 0.7rem;
    color: #888;
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
  const [expandedArtifact, setExpandedArtifact] = useState(null)
  const [modalArtifact, setModalArtifact] = useState(null)
  const [artifactFilter, setArtifactFilter] = useState('all')
  const [aiResponse, setAiResponse] = useState(null)
  const [simulationLoop, setSimulationLoop] = useState({ active: false, iteration: 0, history: [] })
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
      } else if (msg.type === 'ai_response') {
        setAiResponse(msg.data)
      } else if (msg.type === 'simulation_event') {
        setSimulationLoop(prev => ({
          ...prev,
          iteration: msg.data.iteration,
          history: [...prev.history.slice(-20), msg.data]
        }))
      } else if (msg.type === 'simulation_status') {
        setSimulationLoop(prev => ({
          ...prev,
          active: msg.data.running,
          ...msg.data
        }))
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

  const isWsReady = () => ws && ws.readyState === WebSocket.OPEN

  const startPipeline = () => {
    if (!isWsReady()) {
      console.warn('WebSocket not ready, cannot start pipeline')
      return
    }
    ws.send(JSON.stringify({ type: 'start' }))
  }

  const toggleAutoPilot = () => {
    if (!isWsReady()) return
    const newState = !state.autoPilot
    ws.send(JSON.stringify({ type: 'autopilot', enabled: newState }))
  }

  const approve = () => {
    if (!isWsReady()) return
    ws.send(JSON.stringify({
      type: 'approve',
      actions: selectedActions,
      message: userInput
    }))
    setUserInput('')
  }

  const reject = () => {
    if (!isWsReady()) return
    ws.send(JSON.stringify({ type: 'reject' }))
  }

  const askQuestion = () => {
    if (!isWsReady()) return
    if (userInput.trim()) {
      ws.send(JSON.stringify({ type: 'ask', question: userInput }))
      setUserInput('')
    }
  }

  const reset = () => {
    if (!isWsReady()) return
    ws.send(JSON.stringify({ type: 'reset' }))
    setAiResponse(null)
  }

  // Simulation loop controls
  const startSimulationLoop = () => {
    console.log('startSimulationLoop called, ws ready:', isWsReady())
    if (!isWsReady()) {
      console.warn('WebSocket not ready for simulation loop')
      return
    }
    console.log('Sending start_simulation_loop message')
    ws.send(JSON.stringify({
      type: 'start_simulation_loop',
      options: {
        intervalMin: 5000,
        intervalMax: 20000,
        scenarioPool: 'all',
        autoApprove: state.autoPilot
      }
    }))
  }

  const stopSimulationLoop = () => {
    if (!isWsReady()) return
    ws.send(JSON.stringify({ type: 'stop_simulation_loop' }))
  }

  // Artifact helper functions
  const toggleArtifactExpand = (artifactId) => {
    setExpandedArtifact(prev => prev === artifactId ? null : artifactId)
  }

  const openArtifactModal = (artifact, type) => {
    setModalArtifact({ ...artifact, type })
  }

  const closeArtifactModal = () => {
    setModalArtifact(null)
  }

  // Get all artifacts combined and sorted
  const getAllArtifacts = () => {
    const artifacts = []

    services.emails?.forEach(email => {
      artifacts.push({ ...email, type: 'email', timestamp: email.timestamp })
    })

    services.erp?.purchaseOrders?.forEach(po => {
      artifacts.push({ ...po, type: 'po', timestamp: po.createdAt })
    })

    services.erp?.invoices?.forEach(inv => {
      artifacts.push({ ...inv, type: 'invoice', timestamp: inv.createdAt })
    })

    services.qms?.audits?.forEach(audit => {
      artifacts.push({ ...audit, type: 'audit', timestamp: audit.scheduledDate })
    })

    services.notifications?.forEach(notif => {
      artifacts.push({ ...notif, type: 'notification', timestamp: notif.timestamp })
    })

    // Sort by timestamp descending
    return artifacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  const filterArtifacts = (artifacts) => {
    if (artifactFilter === 'all') return artifacts
    return artifacts.filter(a => a.type === artifactFilter)
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

  // Render Artifact Card (expandable)
  const renderArtifactCard = (artifact, index) => {
    const isExpanded = expandedArtifact === `${artifact.type}-${index}`
    const artifactId = `${artifact.type}-${index}`

    const getIcon = () => {
      switch (artifact.type) {
        case 'email': return '📧'
        case 'po': return '📦'
        case 'invoice': return '🧾'
        case 'audit': return '🔍'
        case 'shipment': return '🚚'
        case 'notification': return '🔔'
        default: return '📄'
      }
    }

    const getTitle = () => {
      switch (artifact.type) {
        case 'email': return artifact.subject
        case 'po': return `${artifact.poNumber} - ${artifact.supplierName}`
        case 'invoice': return `${artifact.invoiceNumber} - ${artifact.customerName}`
        case 'audit': return `${artifact.type} Audit - ${artifact.supplierId}`
        case 'notification': return artifact.title
        default: return 'Artifact'
      }
    }

    return (
      <div
        key={artifactId}
        className={`artifact-card ${artifact.type} ${isExpanded ? 'expanded' : ''}`}
        onClick={() => toggleArtifactExpand(artifactId)}
      >
        <div className="artifact-header">
          <span className="artifact-icon">{getIcon()}</span>
          <span className="artifact-title">{getTitle()}</span>
          <div className="artifact-meta">
            <span className={`artifact-type-badge ${artifact.type}`}>{artifact.type}</span>
            <span>{formatTime(artifact.timestamp)}</span>
            <span className="artifact-expand-icon">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="artifact-details">
            {artifact.type === 'email' && (
              <>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">To:</span>
                  <span className="artifact-detail-value">{artifact.to?.join(', ')}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">From:</span>
                  <span className="artifact-detail-value">{artifact.from}</span>
                </div>
                {artifact.body && (
                  <div className="artifact-body">{artifact.body}</div>
                )}
              </>
            )}

            {artifact.type === 'po' && (
              <>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Amount:</span>
                  <span className="artifact-detail-value">${artifact.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Status:</span>
                  <span className="artifact-detail-value">{artifact.status}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Items:</span>
                  <span className="artifact-detail-value">{artifact.items?.length || 0} line items</span>
                </div>
              </>
            )}

            {artifact.type === 'invoice' && (
              <>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Amount:</span>
                  <span className="artifact-detail-value">${artifact.amount?.toLocaleString()}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Order:</span>
                  <span className="artifact-detail-value">{artifact.orderId}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Status:</span>
                  <span className="artifact-detail-value">{artifact.status}</span>
                </div>
              </>
            )}

            {artifact.type === 'audit' && (
              <>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Type:</span>
                  <span className="artifact-detail-value">{artifact.auditType}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Status:</span>
                  <span className="artifact-detail-value">{artifact.status}</span>
                </div>
                <div className="artifact-detail-row">
                  <span className="artifact-detail-label">Scheduled:</span>
                  <span className="artifact-detail-value">{new Date(artifact.scheduledDate).toLocaleDateString()}</span>
                </div>
              </>
            )}

            <div className="artifact-actions">
              <button
                className="artifact-btn primary"
                onClick={(e) => { e.stopPropagation(); openArtifactModal(artifact, artifact.type); }}
              >
                View Full Details
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render Artifact Modal
  const renderArtifactModal = () => {
    if (!modalArtifact) return null

    return (
      <div className="modal-overlay" onClick={closeArtifactModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              {modalArtifact.type === 'email' && '📧'}
              {modalArtifact.type === 'po' && '📦'}
              {modalArtifact.type === 'invoice' && '🧾'}
              {modalArtifact.type === 'audit' && '🔍'}
              <span style={{ textTransform: 'uppercase' }}>{modalArtifact.type}</span> Details
            </div>
            <button className="modal-close" onClick={closeArtifactModal}>×</button>
          </div>

          <div className="modal-body">
            {modalArtifact.type === 'email' && (
              <>
                <div className="modal-section">
                  <h4>Email Information</h4>
                  <div className="modal-grid">
                    <div className="modal-field">
                      <div className="modal-field-label">Subject</div>
                      <div className="modal-field-value">{modalArtifact.subject}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">Sent</div>
                      <div className="modal-field-value">{new Date(modalArtifact.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">From</div>
                      <div className="modal-field-value">{modalArtifact.from}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">To</div>
                      <div className="modal-field-value">{modalArtifact.to?.join(', ')}</div>
                    </div>
                  </div>
                </div>
                {modalArtifact.body && (
                  <div className="modal-section">
                    <h4>Message Body</h4>
                    <div className="artifact-body" style={{ maxHeight: '300px' }}>{modalArtifact.body}</div>
                  </div>
                )}
              </>
            )}

            {modalArtifact.type === 'po' && (
              <>
                <div className="modal-section">
                  <h4>Purchase Order</h4>
                  <div className="modal-grid">
                    <div className="modal-field">
                      <div className="modal-field-label">PO Number</div>
                      <div className="modal-field-value">{modalArtifact.poNumber}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">Status</div>
                      <div className="modal-field-value">{modalArtifact.status}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">Supplier</div>
                      <div className="modal-field-value">{modalArtifact.supplierName}</div>
                    </div>
                    <div className="modal-field">
                      <div className="modal-field-label">Total Amount</div>
                      <div className="modal-field-value" style={{ color: '#4ade80', fontWeight: 700 }}>
                        ${modalArtifact.totalAmount?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                {modalArtifact.items?.length > 0 && (
                  <div className="modal-section">
                    <h4>Line Items ({modalArtifact.items.length})</h4>
                    {modalArtifact.items.map((item, idx) => (
                      <div key={idx} className="artifact-detail-row">
                        <span className="artifact-detail-label">{item.sku || item.name}</span>
                        <span className="artifact-detail-value">
                          {item.quantity} × ${item.unitPrice} = ${(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {modalArtifact.type === 'invoice' && (
              <div className="modal-section">
                <h4>Invoice Details</h4>
                <div className="modal-grid">
                  <div className="modal-field">
                    <div className="modal-field-label">Invoice Number</div>
                    <div className="modal-field-value">{modalArtifact.invoiceNumber}</div>
                  </div>
                  <div className="modal-field">
                    <div className="modal-field-label">Customer</div>
                    <div className="modal-field-value">{modalArtifact.customerName}</div>
                  </div>
                  <div className="modal-field">
                    <div className="modal-field-label">Amount</div>
                    <div className="modal-field-value" style={{ color: '#4ade80', fontWeight: 700 }}>
                      ${modalArtifact.amount?.toLocaleString()}
                    </div>
                  </div>
                  <div className="modal-field">
                    <div className="modal-field-label">Status</div>
                    <div className="modal-field-value">{modalArtifact.status}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeArtifactModal}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  // Render Visual Simulation Tab
  const renderSimulationView = () => {
    const stations = [
      { id: 'smt', name: 'SMT Assembly', icon: '🔧', status: state.status === 'running' ? 'active' : 'idle', throughput: 42, workers: 20 },
      { id: 'driver', name: 'Driver Assembly', icon: '🔊', status: state.status === 'running' ? 'active' : 'idle', throughput: 38, workers: 15 },
      { id: 'housing', name: 'Housing', icon: '📦', status: 'idle', throughput: 40, workers: 18 },
      { id: 'pairing', name: 'Pairing', icon: '📡', status: state.status === 'running' ? 'active' : 'idle', throughput: 45, workers: 12 },
      { id: 'qc', name: 'Quality Control', icon: '✅', status: 'idle', throughput: 44, workers: 10 },
      { id: 'packaging', name: 'Packaging', icon: '🎁', status: 'idle', throughput: 50, workers: 15 }
    ]

    const orders = activeScenario?.simulatedData?.injectedOrders || [
      { id: 'ORD-001', customer: 'TechMart', quantity: 500, progress: 65, deadline: 5, status: 'on-track' },
      { id: 'ORD-002', customer: 'ElectroHub', quantity: 300, progress: 40, deadline: 3, status: 'at-risk' },
      { id: 'ORD-003', customer: 'GadgetWorld', quantity: 1000, progress: 20, deadline: 10, status: 'on-track' }
    ]

    const flowNodes = [
      { id: 'inventory', label: 'Inventory', icon: '📦', value: '2,450 units', active: true },
      { id: 'production', label: 'Production', icon: '🏭', value: '500/day', active: state.status === 'running' },
      { id: 'qc', label: 'QC', icon: '✅', value: '97% pass', active: false },
      { id: 'shipping', label: 'Shipping', icon: '🚚', value: '3 pending', active: false }
    ]

    return (
      <div className="simulation-tab">
        {/* Factory Floor */}
        <div>
          <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '12px' }}>FACTORY FLOOR STATUS</h3>
          <div className="factory-floor">
            {stations.map(station => (
              <div key={station.id} className={`station-card ${station.status}`}>
                <div className="station-icon">{station.icon}</div>
                <div className="station-name">{station.name}</div>
                <div className="station-status">{station.status}</div>
                <div className="station-throughput">{station.throughput}/hr</div>
                <div className="station-workers">👷 {station.workers}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="order-timeline">
          <div className="timeline-header">
            <h3 style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>ORDER TIMELINE</h3>
            <div className="timeline-legend">
              <div className="legend-item"><div className="legend-dot on-track"></div> On Track</div>
              <div className="legend-item"><div className="legend-dot at-risk"></div> At Risk</div>
              <div className="legend-item"><div className="legend-dot overdue"></div> Overdue</div>
            </div>
          </div>
          <div className="gantt-container">
            {orders.map(order => (
              <div key={order.id} className="gantt-row">
                <div className="gantt-label">
                  <strong>{order.id}</strong><br/>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>{order.customer}</span>
                </div>
                <div className="gantt-bar-container">
                  <div
                    className={`gantt-bar ${order.status}`}
                    style={{ width: `${order.progress}%` }}
                  >
                    {order.progress}%
                  </div>
                  <div className="gantt-deadline" style={{ left: `${(order.deadline / 14) * 100}%` }} title={`Deadline: ${order.deadline} days`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Flow */}
        <div className="material-flow">
          <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '12px' }}>MATERIAL FLOW</h3>
          <div className="flow-container">
            {flowNodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div className={`flow-node ${node.active ? 'active' : ''}`}>
                  <div className="flow-node-icon">{node.icon}</div>
                  <div className="flow-node-label">{node.label}</div>
                  <div className="flow-node-value">{node.value}</div>
                </div>
                {idx < flowNodes.length - 1 && (
                  <div className={`flow-arrow ${node.active ? 'active' : ''}`}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    )
  }

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

        {/* Center Panel - Terminal / Services / Simulation */}
        <div className="panel">
          <div className="panel-header">
            <span>
              {activeTab === 'terminal' ? 'Live Terminal' :
               activeTab === 'services' ? 'Service Activity' : 'Visual Simulation'}
            </span>
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
              <button
                className={`panel-tab ${activeTab === 'simulation' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulation')}
              >
                Simulation
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
            ) : activeTab === 'services' ? (
              <div className="activity-timeline">
                {/* Filter buttons */}
                <div className="timeline-filters">
                  <button
                    className={`timeline-filter ${artifactFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setArtifactFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`timeline-filter ${artifactFilter === 'email' ? 'active' : ''}`}
                    onClick={() => setArtifactFilter('email')}
                  >
                    📧 Emails
                  </button>
                  <button
                    className={`timeline-filter ${artifactFilter === 'po' ? 'active' : ''}`}
                    onClick={() => setArtifactFilter('po')}
                  >
                    📦 POs
                  </button>
                  <button
                    className={`timeline-filter ${artifactFilter === 'invoice' ? 'active' : ''}`}
                    onClick={() => setArtifactFilter('invoice')}
                  >
                    🧾 Invoices
                  </button>
                  <button
                    className={`timeline-filter ${artifactFilter === 'audit' ? 'active' : ''}`}
                    onClick={() => setArtifactFilter('audit')}
                  >
                    🔍 Audits
                  </button>
                </div>

                {/* Artifact list */}
                {filterArtifacts(getAllArtifacts()).length === 0 ? (
                  <div className="idle-state">
                    <div className="idle-icon">📋</div>
                    <p className="idle-text">No service activity yet. Start the AI Agent to generate artifacts.</p>
                  </div>
                ) : (
                  filterArtifacts(getAllArtifacts()).slice(0, 20).map((artifact, idx) =>
                    renderArtifactCard(artifact, idx)
                  )
                )}
              </div>
            ) : (
              renderSimulationView()
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

            {/* AI Response to Questions */}
            {aiResponse && (
              <div className="ai-section">
                <h3>AI Response</h3>
                <div className="ai-question" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #1a3d2a 100%)' }}>
                  <div className="ai-question-text">
                    🤖 {aiResponse.answer || aiResponse}
                  </div>
                  <button
                    className="artifact-btn"
                    style={{ marginTop: '10px' }}
                    onClick={() => setAiResponse(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {state.autoPilot && state.status === 'running' ? (
              <div className="ai-question">
                <div className="ai-question-text">
                  🤖 <strong>AUTO-PILOT ACTIVE</strong><br/><br/>
                  AI is automatically approving recommendations and executing workflows without human intervention.
                </div>
              </div>
            ) : !decision && !aiResponse ? (
              <div className="idle-state">
                <div className="idle-icon">🤖</div>
                <p className="idle-text">AI decisions will appear here. Ask a question below!</p>
              </div>
            ) : decision && (
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
            {simulationLoop.active && (
              <div className="sim-loop-indicator">
                <span className="pulse-dot"></span>
                Loop #{simulationLoop.iteration}
              </div>
            )}
            {activeScenario && (
              <div className="scenario-indicator">
                ⚡ {activeScenario.name}
              </div>
            )}
            {/* Simulation Loop Toggle */}
            <div
              className={`sim-loop-toggle ${simulationLoop.active ? 'active' : ''}`}
              onClick={simulationLoop.active ? stopSimulationLoop : startSimulationLoop}
              style={{ cursor: 'pointer' }}
            >
              <span>{simulationLoop.active ? '⏹ Stop Loop' : '🔄 Start Loop'}</span>
            </div>
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
            {state.status === 'idle' && !simulationLoop.active && (
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

        {/* Artifact Modal */}
        {renderArtifactModal()}
      </div>
    </>
  )
}

export default App
