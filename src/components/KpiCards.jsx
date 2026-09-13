import React from 'react';
import { TrendingDown, Calendar, Receipt, Zap, ArrowDownRight, Clock } from 'lucide-react';
import { formatINR, formatCompactINR, formatTenure } from '../utils/formatters';
import { format } from 'date-fns';

export function KpiCards({ result, loanConfig, scenarioName }) {
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

  return (
    <div className="kpi-grid">
      {/* KPI 1: Interest Saved */}
      <div className="kpi-card highlight-card">
        <div className="kpi-icon-wrapper success-bg">
          <TrendingDown size={22} className="text-success" />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Total Interest Saved</span>
          <div className="kpi-value-row">
            <span className="kpi-value text-success">{formatINR(interestSaved)}</span>
            {interestSavedPct > 0 && (
              <span className="badge badge-success">-{interestSavedPct}%</span>
            )}
          </div>
          <span className="kpi-footnote">
            Paid {formatINR(totalInterestPaid)} vs {formatINR(totalInterestOriginal)} original
          </span>
        </div>
      </div>

      {/* KPI 2: Tenure Reduced */}
      <div className="kpi-card">
        <div className="kpi-icon-wrapper accent-bg">
          <Zap size={22} className="text-accent" />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Tenure Reduction</span>
          <div className="kpi-value-row">
            <span className="kpi-value text-accent">{formatTenure(monthsSaved)}</span>
            {tenureReductionPct > 0 && (
              <span className="badge badge-accent">-{tenureReductionPct}% time</span>
            )}
          </div>
          <span className="kpi-footnote">
            Closes in {formatTenure(actualMonths)} ({actualMonths} mos) instead of {formatTenure(originalTenureMonths)}
          </span>
        </div>
      </div>

      {/* KPI 3: Debt-Free Date */}
      <div className="kpi-card">
        <div className="kpi-icon-wrapper info-bg">
          <Calendar size={22} className="text-info" />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Debt-Free Milestone</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{format(actualEndDate, 'MMM yyyy')}</span>
          </div>
          <span className="kpi-footnote">
            Originally scheduled for {format(originalEndDate, 'MMM yyyy')}
          </span>
        </div>
      </div>

      {/* KPI 4: Total Amount to be Paid */}
      <div className="kpi-card">
        <div className="kpi-icon-wrapper neutral-bg">
          <Receipt size={22} className="text-accent" />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Total Amount To Be Paid</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{formatINR(totalPaid)}</span>
          </div>
          <span className="kpi-footnote">
            Principal {formatCompactINR(loanConfig.principal)} + Interest {formatCompactINR(totalInterestPaid)}
          </span>
        </div>
      </div>
    </div>
  );
}
