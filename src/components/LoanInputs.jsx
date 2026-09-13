import React, { useState } from 'react';
import { IndianRupee, Percent, Calendar, Clock, RefreshCw } from 'lucide-react';
import { formatINR, formatCompactINR } from '../utils/formatters';

export function LoanInputs({ config, onChange, onReset }) {
  const [tenureUnit, setTenureUnit] = useState('years');

  const handlePrincipalChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    onChange({ ...config, principal: val });
  };

  const handleRateChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    onChange({ ...config, annualRate: val });
  };

  const handleTenureChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    const months = tenureUnit === 'years' ? Math.round(val * 12) : Math.round(val);
    onChange({ ...config, tenureMonths: months });
  };

  const handleUnitToggle = (unit) => {
    setTenureUnit(unit);
  };

  const handleDateChange = (e) => {
    onChange({ ...config, startDate: e.target.value });
  };

  const tenureDisplayValue =
    tenureUnit === 'years'
      ? (config.tenureMonths / 12).toFixed(config.tenureMonths % 12 === 0 ? 0 : 1)
      : config.tenureMonths;

  return (
    <div className="card loan-inputs-card">
      <div className="card-header flex-between">
        <div>
          <h2 className="card-title">Loan Parameters</h2>
          <p className="card-subtitle">Base terms and initial loan details</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          title="Reset to default loan values"
        >
          <RefreshCw size={13} /> Reset
        </button>
      </div>

      <div className="inputs-grid">
        {/* Loan Principal */}
        <div className="input-group">
          <label className="input-label">
            <span>Principal Amount</span>
            <span className="badge badge-accent">{formatCompactINR(config.principal)}</span>
          </label>
          <div className="input-with-icon">
            <span className="icon-prefix">₹</span>
            <input
              type="number"
              className="input-field"
              value={config.principal || ''}
              onChange={handlePrincipalChange}
              step="50000"
              min="10000"
              placeholder="50,00,000"
            />
          </div>
          <span className="input-helper">{formatINR(config.principal)}</span>
        </div>

        {/* Interest Rate */}
        <div className="input-group">
          <label className="input-label">
            <span>Interest Rate</span>
            <span className="badge badge-neutral">{(config.annualRate / 12).toFixed(2)}% / mo</span>
          </label>
          <div className="input-with-icon">
            <input
              type="number"
              className="input-field"
              value={config.annualRate || ''}
              onChange={handleRateChange}
              step="0.1"
              min="1"
              max="40"
              placeholder="8.5"
            />
            <span className="icon-suffix">% p.a.</span>
          </div>
          <span className="input-helper">Annual percentage rate</span>
        </div>

        {/* Tenure */}
        <div className="input-group">
          <div className="flex-between">
            <label className="input-label">Loan Tenure</label>
            <div className="pill-toggle">
              <button
                type="button"
                className={`pill-btn ${tenureUnit === 'years' ? 'active' : ''}`}
                onClick={() => handleUnitToggle('years')}
              >
                Yrs
              </button>
              <button
                type="button"
                className={`pill-btn ${tenureUnit === 'months' ? 'active' : ''}`}
                onClick={() => handleUnitToggle('months')}
              >
                Mos
              </button>
            </div>
          </div>
          <div className="input-with-icon">
            <Clock size={15} className="icon-prefix text-muted" />
            <input
              type="number"
              className="input-field"
              value={tenureDisplayValue}
              onChange={handleTenureChange}
              step={tenureUnit === 'years' ? '0.5' : '1'}
              min="1"
            />
            <span className="icon-suffix">{tenureUnit}</span>
          </div>
          <span className="input-helper">
            {config.tenureMonths} Months ({Math.floor(config.tenureMonths / 12)}y {config.tenureMonths % 12}m)
          </span>
        </div>

        {/* Start Date */}
        <div className="input-group">
          <label className="input-label">First EMI Date</label>
          <div className="input-with-icon">
            <Calendar size={15} className="icon-prefix text-muted" />
            <input
              type="date"
              className="input-field"
              value={config.startDate}
              onChange={handleDateChange}
            />
          </div>
          <span className="input-helper">Start of amortization</span>
        </div>
      </div>
    </div>
  );
}
