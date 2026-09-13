import React from 'react';
import { format } from 'date-fns';
import { calculateAmortizationSchedule } from '../utils/emiCalculator';
import { formatINR, formatCompactINR, formatTenure } from '../utils/formatters';
import { Award, Check } from 'lucide-react';

export function ScenarioComparison({ loanConfig, scenarios, activeScenarioId, onSelectScenario }) {
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
    <div className="card scenario-comparison-card">
      <div className="card-header flex-between">
        <div>
          <h2 className="card-title">Strategy Comparison</h2>
          <p className="card-subtitle">Side-by-side analysis of all prepayment strategies</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-responsive desktop-comparison-table">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Actual Tenure</th>
              <th>Tenure Saved</th>
              <th>Total Interest</th>
              <th>Interest Saved</th>
              <th>Payoff Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {scenarioResults.map(({ scenario, result }) => {
              const isActive = scenario.id === activeScenarioId;
              const isBest = scenario.id === bestScenarioId && scenarios.length > 1;

              return (
                <tr key={scenario.id} className={isActive ? 'row-active' : ''}>
                  <td className="font-medium">
                    <div className="flex-align-center gap-1">
                      <span>{scenario.name}</span>
                      {isBest && (
                        <span className="badge badge-success badge-sm">
                          <Award size={11} /> Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold">{formatTenure(result.actualMonths)}</span>
                    <span className="text-xs text-muted block">({result.actualMonths} mos)</span>
                  </td>
                  <td>
                    {result.monthsSaved > 0 ? (
                      <span className="text-accent font-semibold">
                        -{formatTenure(result.monthsSaved)}
                      </span>
                    ) : (
                      <span className="text-muted">0 mos</span>
                    )}
                  </td>
                  <td>
                    <span className="font-semibold">{formatINR(result.totalInterestPaid)}</span>
                  </td>
                  <td>
                    {result.interestSaved > 0 ? (
                      <span className="text-success font-semibold">
                        {formatINR(result.interestSaved)}
                      </span>
                    ) : (
                      <span className="text-muted">₹0</span>
                    )}
                  </td>
                  <td>
                    <span className="font-medium">{format(result.actualEndDate, 'MMM yyyy')}</span>
                  </td>
                  <td>
                    {isActive ? (
                      <span className="badge badge-accent">Active</span>
                    ) : (
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => onSelectScenario(scenario.id)}
                      >
                        Select
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View for Comparison */}
      <div className="mobile-comparison-cards">
        {scenarioResults.map(({ scenario, result }) => {
          const isActive = scenario.id === activeScenarioId;
          const isBest = scenario.id === bestScenarioId && scenarios.length > 1;

          return (
            <div
              key={scenario.id}
              className={`comparison-mobile-card ${isActive ? 'active-plan' : ''}`}
              onClick={() => onSelectScenario(scenario.id)}
            >
              <div className="flex-between comp-mobile-header">
                <div className="flex-align-center gap-1">
                  <span className="comp-plan-name">{scenario.name}</span>
                  {isBest && (
                    <span className="badge badge-success badge-xs">
                      <Award size={10} /> Best
                    </span>
                  )}
                </div>
                {isActive ? (
                  <span className="badge badge-accent badge-xs">
                    <Check size={11} /> Active
                  </span>
                ) : (
                  <button className="btn btn-secondary btn-xs select-plan-btn">Select</button>
                )}
              </div>

              <div className="comp-mobile-grid">
                <div className="comp-metric">
                  <span className="comp-metric-label">Tenure</span>
                  <span className="comp-metric-val">{formatTenure(result.actualMonths)}</span>
                  {result.monthsSaved > 0 && (
                    <span className="comp-metric-sub text-accent">-{formatTenure(result.monthsSaved)}</span>
                  )}
                </div>
                <div className="comp-metric">
                  <span className="comp-metric-label">Interest Saved</span>
                  <span className="comp-metric-val text-success">
                    {result.interestSaved > 0 ? formatCompactINR(result.interestSaved) : '₹0'}
                  </span>
                  <span className="comp-metric-sub text-muted">Paid: {formatCompactINR(result.totalInterestPaid)}</span>
                </div>
                <div className="comp-metric">
                  <span className="comp-metric-label">Payoff Date</span>
                  <span className="comp-metric-val">{format(result.actualEndDate, 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
