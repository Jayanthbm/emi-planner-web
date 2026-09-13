import React from 'react';
import { TrendingDown, Calendar, Receipt, Zap } from 'lucide-react';
import { formatINR, formatCompactINR, formatTenure } from '../utils/formatters';
import { format } from 'date-fns';

export function MobileKpiCards({ result, loanConfig, scenarioName }) {
  const {
    standardEmi,
    originalTenureMonths,
    originalEndDate,
    totalInterestOriginal,
    actualMonths,
    actualEndDate,
    totalInterestPaid,
    totalPrincipalPaid,
    totalExtraPaid,
    totalAmountPaid,
    interestSaved,
    monthsSaved,
  } = result;

  const totalOriginalAmount = loanConfig.principal + totalInterestOriginal;
  const totalPaid = totalAmountPaid || (totalPrincipalPaid + totalInterestPaid);

  const interestSavedPct = totalInterestOriginal > 0
    ? Math.round((interestSaved / totalInterestOriginal) * 100)
    : 0;

  const tenureReductionPct = originalTenureMonths > 0
    ? Math.round((monthsSaved / originalTenureMonths) * 100)
    : 0;

  // Compact single-row layout for mobile
  return (
    <div className="card mobile-card">
      <div className="card-header">
        <h2 className="card-title">{scenarioName} — Key Metrics</h2>
        <p className="card-subtitle">Impact of your prepayment strategy</p>
      </div>

      <div className="mobile-kpi-list">
        {/* Interest Saved */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon success-bg">
            <TrendingDown size={18} className="text-success" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Interest Saved</span>
            <span className="text-base font-bold text-success">{formatINR(interestSaved)}</span>
            <span className="text-xs text-muted">
              {interestSavedPct > 0 && `-${interestSavedPct}%`} • Paid {formatINR(totalInterestPaid)} vs {formatINR(totalInterestOriginal)} original
            </span>
          </div>
        </div>

        {/* Tenure Reduced */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon accent-bg">
            <Zap size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Tenure Reduced</span>
            <span className="text-base font-bold text-accent">{formatTenure(monthsSaved)}</span>
            <span className="text-xs text-muted">
              Closes in {formatTenure(actualMonths)} ({actualMonths} mos) vs {formatTenure(originalTenureMonths)}
            </span>
          </div>
        </div>

        {/* Debt-Free Date */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon info-bg">
            <Calendar size={18} className="text-info" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Debt-Free By</span>
            <span className="text-base font-bold">{format(actualEndDate, 'MMM yyyy')}</span>
            <span className="text-xs text-muted">Originally {format(originalEndDate, 'MMM yyyy')}</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon neutral-bg">
            <Receipt size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Total Amount Payable</span>
            <span className="text-base font-bold">{formatINR(totalPaid)}</span>
            <span className="text-xs text-muted">
              Principal {formatCompactINR(loanConfig.principal)} + Interest {formatCompactINR(totalInterestPaid)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
