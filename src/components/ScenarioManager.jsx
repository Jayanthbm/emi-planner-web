import React, { useState } from 'react';
import { Plus, Trash2, Copy, Sparkles, Calendar, IndianRupee } from 'lucide-react';
import { formatINR, formatCompactINR } from '../utils/formatters';

export function ScenarioManager({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onUpdateScenario,
  onAddScenario,
  onDuplicateScenario,
  onDeleteScenario,
  standardEmi,
}) {
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeScenario?.name || '');

  const handleAddPaymentStep = () => {
    const lastPayment = activeScenario.payments[activeScenario.payments.length - 1];
    const newAmount = lastPayment ? lastPayment.amount + 5000 : standardEmi;
    
    let nextDate = '2026-01-01';
    if (lastPayment && lastPayment.date) {
      const year = new Date(lastPayment.date).getFullYear() + 1;
      nextDate = `${year}-01-01`;
    }

    const updatedPayments = [
      ...activeScenario.payments,
      { date: nextDate, amount: newAmount },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    onUpdateScenario(activeScenario.id, { payments: updatedPayments });
  };

  const handleUpdatePayment = (index, field, value) => {
    const updatedPayments = [...activeScenario.payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    };
    updatedPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdateScenario(activeScenario.id, { payments: updatedPayments });
  };

  const handleDeletePayment = (index) => {
    if (activeScenario.payments.length <= 1) return;
    const updatedPayments = activeScenario.payments.filter((_, i) => i !== index);
    onUpdateScenario(activeScenario.id, { payments: updatedPayments });
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateScenario(activeScenario.id, { name: nameInput.trim() });
    }
    setEditingName(false);
  };

  return (
    <div className="card scenario-manager-card">
      <div className="card-header flex-between">
        <div>
          <h2 className="card-title">Prepayment Strategy</h2>
          <p className="card-subtitle">Manage multiple plans and stepped payment timelines</p>
        </div>
        <div className="scenario-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onDuplicateScenario(activeScenario.id)}
            title="Duplicate this strategy"
          >
            <Copy size={13} /> Duplicate
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onAddScenario}
            title="Create new strategy"
          >
            <Plus size={13} /> New Plan
          </button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="scenario-tabs-container">
        <div className="scenario-tabs">
          {scenarios.map((s) => (
            <button
              key={s.id}
              className={`scenario-tab ${s.id === activeScenarioId ? 'active' : ''}`}
              onClick={() => {
                onSelectScenario(s.id);
                setNameInput(s.name);
                setEditingName(false);
              }}
            >
              <span className="tab-name">{s.name}</span>
              <span className="tab-steps-count">{s.payments.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario Details */}
      <div className="scenario-body">
        <div className="flex-between scenario-meta-bar">
          <div className="scenario-title-area">
            {editingName ? (
              <div className="inline-edit-group">
                <input
                  type="text"
                  className="input-field input-field-sm"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-primary btn-xs" onClick={handleSaveName}>
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-align-center gap-2">
                <h3
                  className="scenario-name-heading"
                  onClick={() => {
                    setNameInput(activeScenario.name);
                    setEditingName(true);
                  }}
                >
                  {activeScenario.name}
                </h3>
                <button
                  className="btn-text text-muted"
                  onClick={() => {
                    setNameInput(activeScenario.name);
                    setEditingName(true);
                  }}
                >
                  Rename
                </button>
              </div>
            )}
          </div>

          {scenarios.length > 1 && (
            <button
              className="btn btn-danger-outline btn-xs"
              onClick={() => onDeleteScenario(activeScenario.id)}
              title="Delete scenario"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>

        {/* Stepped Payments Table */}
        <div className="stepped-payments-container">
          <div className="flex-between section-subheader">
            <span className="text-xs font-semibold text-muted text-uppercase tracking-wider">
              Stepped Payment Timeline
            </span>
            <button className="btn btn-accent-outline btn-xs" onClick={handleAddPaymentStep}>
              <Plus size={13} /> Add Step
            </button>
          </div>

          <div className="stepped-timeline-list">
            {activeScenario.payments.map((p, idx) => {
              const diffFromEmi = p.amount - standardEmi;

              return (
                <div key={idx} className="timeline-step-row">
                  <div className="timeline-step-badge">
                    <span className="step-num">{idx + 1}</span>
                  </div>

                  <div className="timeline-step-inputs">
                    <div className="step-field step-field-date">
                      <label className="field-micro-label">From</label>
                      <input
                        type="date"
                        className="input-field input-field-sm"
                        value={p.date}
                        onChange={(e) => handleUpdatePayment(idx, 'date', e.target.value)}
                      />
                    </div>

                    <div className="step-field step-field-amount">
                      <label className="field-micro-label">Monthly</label>
                      <div className="input-with-icon">
                        <span className="icon-prefix">₹</span>
                        <input
                          type="number"
                          className="input-field input-field-sm"
                          value={p.amount || ''}
                          onChange={(e) => handleUpdatePayment(idx, 'amount', e.target.value)}
                          step="1000"
                        />
                      </div>
                    </div>

                    <div className="step-field step-info-pill">
                      <label className="field-micro-label">Extra/mo</label>
                      <span className={`badge badge-sm ${diffFromEmi >= 0 ? 'badge-success' : 'badge-warning'}`}>
                        {diffFromEmi >= 0 ? '+' : ''}{formatCompactINR(diffFromEmi)}
                      </span>
                    </div>
                  </div>

                  <div className="timeline-step-actions">
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeletePayment(idx)}
                      disabled={activeScenario.payments.length <= 1}
                      title={activeScenario.payments.length <= 1 ? 'Must keep at least 1 step' : 'Remove step'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
