import React from 'react';
import { TrendingDown, Calendar, Receipt, Zap, Clock, Wallet, Percent } from 'lucide-react';
import { formatINR, formatCompactINR, formatTenure } from '../utils/formatters';
import { safeFormatDate } from '../utils/emiCalculator';
import { format } from 'date-fns';

export function MobileKpiCards({ result, loanConfig, scenarioName }) {
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
    <div className="card mobile-card">
      <div className="card-header">
        <h2 className="card-title">{scenarioName} — Key Metrics</h2>
        <p className="card-subtitle">Progress & Strategy Impact</p>
      </div>

      <div className="mobile-kpi-list">
        {/* 1: Total Amount Paid (Till Date) */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon neutral-bg">
            <Wallet size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Total Amount Paid (Till Date)</span>
            <span className="text-base font-bold">{formatINR(amountPaidTillDate)}</span>
            <span className="text-xs text-muted">
              Till today • Principal: {formatCompactINR(principalPaidTillDate)} + Int: {formatCompactINR(interestPaidTillDate)}
            </span>
          </div>
        </div>

        {/* 2: Years Paid (Elapsed) */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon accent-bg">
            <Clock size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Years Paid</span>
            <span className="text-base font-bold text-accent">{formatTenure(elapsedMonths)}</span>
            <span className="text-xs text-muted">
              {elapsedMonths} of {actualMonths} months elapsed
            </span>
          </div>
        </div>

        {/* 3: Total Interest Paid (Till Date) */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon neutral-bg">
            <Percent size={18} className="text-warning" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Total Interest Paid (Till Date)</span>
            <span className="text-base font-bold text-warning">{formatINR(interestPaidTillDate)}</span>
            <span className="text-xs text-muted">
              Till today • Out of {formatCompactINR(totalInterestPaid)} total interest
            </span>
          </div>
        </div>

        {/* 4: Loan Start (Month Year) */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon info-bg">
            <Calendar size={18} className="text-info" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Loan Start (Month Year)</span>
            <span className="text-base font-bold">{loanStartDateStr}</span>
            <span className="text-xs text-muted">First EMI Date</span>
          </div>
        </div>

        <div className="mobile-kpi-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>

        {/* Reordered 1: Total Amount To Be Paid */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon neutral-bg">
            <Receipt size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Total Amount To Be Paid</span>
            <span className="text-base font-bold">{formatINR(totalPaid)}</span>
            <span className="text-xs text-muted block">
              Principal: {formatINR(loanConfig.principal)} ({formatCompactINR(loanConfig.principal)})
            </span>
            <span className="text-xs text-muted block">
              Interest: {formatINR(totalInterestPaid)} ({formatCompactINR(totalInterestPaid)})
            </span>
          </div>
        </div>

        {/* Reordered 2: Tenure Reduction */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon accent-bg">
            <Zap size={18} className="text-accent" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Tenure Reduction</span>
            <span className="text-base font-bold text-accent">{formatTenure(monthsSaved)}</span>
            <span className="text-xs text-muted">
              Closes in {formatTenure(actualMonths)} ({actualMonths} mos) vs {formatTenure(originalTenureMonths)}
            </span>
          </div>
        </div>

        {/* Reordered 3: Total Interest Saved */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon success-bg">
            <TrendingDown size={18} className="text-success" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Total Interest Saved</span>
            <span className="text-base font-bold text-success">{formatINR(interestSaved)}</span>
            <span className="text-xs text-muted">
              {interestSavedPct > 0 && `-${interestSavedPct}%`} • Paid {formatINR(totalInterestPaid)} vs {formatINR(totalInterestOriginal)} original
            </span>
          </div>
        </div>

        {/* Reordered 4: Debt-Free Milestone */}
        <div className="mobile-kpi-item">
          <div className="mobile-kpi-icon info-bg">
            <Calendar size={18} className="text-info" />
          </div>
          <div className="mobile-kpi-content">
            <span className="text-xs text-muted">Debt-Free Milestone</span>
            <span className="text-base font-bold">{safeFormatDate(actualEndDate, 'MMM yyyy')}</span>
            <span className="text-xs text-muted">Originally {safeFormatDate(originalEndDate, 'MMM yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
