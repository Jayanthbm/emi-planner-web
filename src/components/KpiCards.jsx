import React from 'react';
import { TrendingDown, Calendar, Receipt, Zap, Clock, Wallet, Percent } from 'lucide-react';
import { formatINR, formatCompactINR, formatTenure } from '../utils/formatters';
import { safeFormatDate } from '../utils/emiCalculator';
import { format } from 'date-fns';

export function KpiCards({ result, loanConfig, scenarioName }) {
  const {
    originalTenureMonths,
    originalEndDate,
    totalInterestOriginal,
    actualMonths,
    actualEndDate,
    totalInterestPaid,
    totalPrincipalPaid,
    totalAmountPaid,
    interestSaved,
    monthsSaved,
    schedule = [],
  } = result;

  const totalPaid = totalAmountPaid || (totalPrincipalPaid + totalInterestPaid);

  const interestSavedPct = totalInterestOriginal > 0 
    ? Math.round((interestSaved / totalInterestOriginal) * 100) 
    : 0;

  const tenureReductionPct = originalTenureMonths > 0
    ? Math.round((monthsSaved / originalTenureMonths) * 100)
    : 0;

  const loanStartDateStr = safeFormatDate(loanConfig.startDate, 'MMM yyyy');

  // Calculate payments made till current date (today)
  const today = new Date();
  const pastRows = schedule.filter((row) => {
    const rDate = row.date instanceof Date ? row.date : new Date(row.date);
    return (
      rDate < today ||
      (rDate.getFullYear() === today.getFullYear() && rDate.getMonth() <= today.getMonth())
    );
  });

  const elapsedMonths = pastRows.length;
  const amountPaidTillDate = pastRows.reduce((sum, r) => sum + r.amountPaid, 0);
  const interestPaidTillDate = pastRows.reduce((sum, r) => sum + r.interestPaid, 0);
  const principalPaidTillDate = pastRows.reduce((sum, r) => sum + r.principalPaid, 0);

  return (
    <div className="kpi-section-container">
      {/* Group 1: Loan Overview & Progress Till Date */}
      <div className="kpi-group-header">
        <span className="text-xs font-semibold text-muted text-uppercase tracking-wider">
          Progress As Of Today ({format(today, 'MMM yyyy')})
        </span>
      </div>
      <div className="kpi-grid">
        {/* 1: Total Amount Paid (Till Date) */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper neutral-bg">
            <Wallet size={22} className="text-accent" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Amount Paid</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{formatINR(amountPaidTillDate)}</span>
            </div>
            <span className="kpi-footnote">
              Till today • Principal: {formatCompactINR(principalPaidTillDate)} + Int: {formatCompactINR(interestPaidTillDate)}
            </span>
          </div>
        </div>

        {/* 2: Years Paid (Elapsed Time) */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper accent-bg">
            <Clock size={22} className="text-accent" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Years Paid</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{formatTenure(elapsedMonths)}</span>
            </div>
            <span className="kpi-footnote">
              {elapsedMonths} of {actualMonths} months elapsed
            </span>
          </div>
        </div>

        {/* 3: Total Interest Paid (Till Date) */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper neutral-bg">
            <Percent size={22} className="text-warning" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Interest Paid</span>
            <div className="kpi-value-row">
              <span className="kpi-value text-warning">{formatINR(interestPaidTillDate)}</span>
            </div>
            <span className="kpi-footnote">
              Till today • Out of {formatCompactINR(totalInterestPaid)} total interest
            </span>
          </div>
        </div>

        {/* 4: Loan Start (Month Year) */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper info-bg">
            <Calendar size={22} className="text-info" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Loan Start (Month Year)</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{loanStartDateStr}</span>
            </div>
            <span className="kpi-footnote">
              First EMI Date
            </span>
          </div>
        </div>
      </div>

      {/* Group 2: Reordered Strategy Savings & Lifetime Milestones */}
      <div className="kpi-group-header mt-4">
        <span className="text-xs font-semibold text-muted text-uppercase tracking-wider">
          Strategy Savings & Lifetime Milestones
        </span>
      </div>
      <div className="kpi-grid">
        {/* Older 1: Total Amount To Be Paid */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper neutral-bg">
            <Receipt size={22} className="text-accent" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Amount To Be Paid</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{formatINR(totalPaid)}</span>
            </div>
            <span className="kpi-footnote block">
              Principal: {formatINR(loanConfig.principal)} ({formatCompactINR(loanConfig.principal)})
            </span>
            <span className="kpi-footnote block">
              Interest: {formatINR(totalInterestPaid)} ({formatCompactINR(totalInterestPaid)})
            </span>
          </div>
        </div>

        {/* Older 2: Tenure Reduction */}
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

        {/* Older 3: Total Interest Saved */}
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

        {/* Older 4: Debt-Free Milestone */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper info-bg">
            <Calendar size={22} className="text-info" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Debt-Free Milestone</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{safeFormatDate(actualEndDate, 'MMM yyyy')}</span>
            </div>
            <span className="kpi-footnote">
              Originally scheduled for {safeFormatDate(originalEndDate, 'MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
