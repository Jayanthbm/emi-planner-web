import React from 'react';
import { format } from 'date-fns';
import { calculateAmortizationSchedule } from '../utils/emiCalculator';
import { formatINR, formatTenure } from '../utils/formatters';
import { Award } from 'lucide-react';

export function ScenarioComparison({ loanConfig, scenarios, activeScenarioId, onSelectScenario }) {
  const scenarioResults = scenarios.map((scenario) => ({
    scenario,
    result: calculateAmortizationSchedule(loanConfig, scenario.payments),
  }));

  // Find the scenario that saves the most interest
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
          <h2 className="card-title">Scenario Comparison Matrix</h2>
          <p className="card-subtitle">Side-by-side analysis of all prepayment strategies</p>
        </div>
      </div>

      <div className="table-responsive">
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
                        <span className="badge badge-success badge-sm" title="Highest interest savings">
                          <Award size={12} /> Best
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
    </div>
  );
}
