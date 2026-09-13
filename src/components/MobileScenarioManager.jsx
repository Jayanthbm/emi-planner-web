import React, { useState } from 'react';
import { Plus, Trash2, Copy, Edit2, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function MobileScenarioManager({
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
    <div className="card mobile-card">
      <div className="card-header flex-between">
        <div>
          <h2 className="card-title">Prepayment Strategy</h2>
        </div>
        <div className="mobile-scenario-actions flex-align-center gap-1">
          <button
            className="btn btn-secondary btn-icon-only"
            onClick={() => onDuplicateScenario(activeScenario.id)}
            title="Duplicate Scenario"
            aria-label="Duplicate Scenario"
          >
            <Copy size={16} />
          </button>
          <button
            className="btn btn-primary btn-icon-only"
            onClick={onAddScenario}
            title="New Strategy"
            aria-label="New Strategy"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Scenario Tabs (Number Badges 1, 2, 3) */}
      <div className="scenario-tabs-number-bar">
        {scenarios.map((s, idx) => (
          <button
            key={s.id}
            className={`scenario-num-tab ${s.id === activeScenarioId ? 'active' : ''}`}
            onClick={() => {
              onSelectScenario(s.id);
              setNameInput(s.name);
              setEditingName(false);
            }}
            title={s.name}
          >
            Plan {idx + 1}
          </button>
        ))}
      </div>

      {/* Active Scenario Title & Mapping Legend */}
      <div className="scenario-body">
        <div className="mobile-active-scenario-card">
          <div className="mobile-plan-badge-row">
            <span className="badge badge-accent badge-xs">
              Plan {scenarios.findIndex((s) => s.id === activeScenarioId) + 1}
            </span>
          </div>

          <div className="mobile-plan-title-row flex-between">
            {editingName ? (
              <div className="inline-edit-group flex-1">
                <input
                  type="text"
                  className="input-field input-field-sm"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-primary btn-xs" onClick={handleSaveName}>Save</button>
                <button className="btn btn-secondary btn-xs" onClick={() => setEditingName(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <h3 className="scenario-name-heading" onClick={() => {
                  setNameInput(activeScenario.name);
                  setEditingName(true);
                }}>
                  {activeScenario.name}
                </h3>
                <div className="mobile-plan-action-icons flex-align-center gap-1">
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => {
                      setNameInput(activeScenario.name);
                      setEditingName(true);
                    }}
                    title="Edit name"
                    aria-label="Edit name"
                  >
                    <Edit2 size={16} />
                  </button>
                  {scenarios.length > 1 && (
                    <button
                      className="btn btn-danger-outline btn-icon-only"
                      onClick={() => onDeleteScenario(activeScenario.id)}
                      title="Delete Scenario"
                      aria-label="Delete Scenario"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mobile-plan-steps-row">
            <span className="text-xs text-muted font-medium">
              {activeScenario.payments.length} step{activeScenario.payments.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Stepped Payments */}
        <div className="stepped-payments-container">
          <div className="flex-between section-subheader">
            <span className="text-xs font-semibold text-muted text-uppercase tracking-wider">
              Payment Timeline
            </span>
            <button
              className="btn btn-accent-outline btn-icon-only"
              onClick={handleAddPaymentStep}
              title="Add Payment Step"
              aria-label="Add Payment Step"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="stepped-timeline-list">
            {activeScenario.payments.map((p, idx) => {
              const diffFromEmi = p.amount - standardEmi;
              return (
                <div key={idx} className="timeline-step-row">
                  <div className="timeline-step-badge">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="timeline-step-inputs">
                    <div className="step-field">
                      <label className="text-xs text-muted">From</label>
                      <input
                        type="date"
                        className="input-field input-field-sm"
                        value={p.date}
                        onChange={(e) => handleUpdatePayment(idx, 'date', e.target.value)}
                      />
                    </div>
                    <div className="step-field">
                      <label className="text-xs text-muted">Monthly Amount</label>
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
                  </div>
                  <div className="timeline-step-actions">
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeletePayment(idx)}
                      disabled={activeScenario.payments.length <= 1}
                      title="Remove step"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="timeline-tip">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs text-muted">
              Any amount paid above the base EMI reduces principal, accelerating closure and cutting interest.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
