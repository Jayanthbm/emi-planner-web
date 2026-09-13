import React from 'react';
import { format } from 'date-fns';
import { calculateAmortizationSchedule } from '../utils/emiCalculator';
import { formatINR, formatTenure } from '../utils/formatters';
import { Award } from 'lucide-react';

export function MobileScenarioComparison({ loanConfig, scenarios, activeScenarioId, onSelectScenario }) {
  const scenarioResults = scenarios.map((scenario) => ({
    scenario,
    result: calculateAmortizationSchedule(loanConfig, scenario.payments),
  }));

  let maxSaved = -1;
  let bestScenarioId = null;
  scenarioResults.forEach(({ scenario, result }) => {
    if (result.interestSaved > maxSaved) {
      maxSaved = result.interestSaved;
      bestScenarioId = scenario.id;
    }
  });

  return (
    <div className="card mobile-card">
      <div className="card-header">
        <h2 className="card-title">Scenario Comparison</h2>
      </div>

      <div className="mobile-comparison-list">
        {scenarioResults.map(({ scenario, result }) => {
          const isActive = scenario.id === activeScenarioId;
          const isBest = scenario.id === bestScenarioId && scenarios.length > 1;

          return (
            <div
              key={scenario.id}
              className={`mobile-comparison-item ${isActive ? 'row-active' : ''}`}
            >
              <div className="mobile-comp-header">
                <div className="flex-align-center gap-1">
                  <span className="font-semibold">{scenario.name}</span>
                  {isBest && (
                    <span className="badge badge-success badge-sm" title="Highest interest savings">
                      <Award size={12} /> Best
                    </span>
                  )}
                  {isActive && (
                    <span className="badge badge-accent badge-sm">Active</span>
                  )}
                </div>
                {!isActive && (
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => onSelectScenario(scenario.id)}
                  >
                    Select
                  </button>
                )}
              </div>

              <div className="mobile-comp-grid">
                <div className="mobile-comp-stat">
                  <span className="text-xs text-muted">Tenure</span>
                  <span className="font-semibold text-sm">{formatTenure(result.actualMonths)}</span>
                  <span className="text-xs text-muted">({result.actualMonths} mos)</span>
                </div>
                <div className="mobile-comp-stat">
                  <span className="text-xs text-muted">Saved</span>
                  {result.monthsSaved > 0 ? (
                    <span className="text-accent font-semibold text-sm">-{formatTenure(result.monthsSaved)}</span>
                  ) : (
                    <span className="text-muted text-xs">0 mos</span>
                  )}
                </div>
                <div className="mobile-comp-stat">
                  <span className="text-xs text-muted">Interest</span>
                  <span className="font-semibold text-sm">{formatINR(result.totalInterestPaid)}</span>
                </div>
                <div className="mobile-comp-stat">
                  <span className="text-xs text-muted">Saved</span>
                  {result.interestSaved > 0 ? (
                    <span className="text-success font-semibold text-sm">{formatINR(result.interestSaved)}</span>
                  ) : (
                    <span className="text-muted text-xs">₹0</span>
                  )}
                </div>
                <div className="mobile-comp-stat">
                  <span className="text-xs text-muted">Payoff</span>
                  <span className="font-medium text-sm">{format(result.actualEndDate, 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
