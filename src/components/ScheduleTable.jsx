import React, { useState, useMemo } from 'react';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Filter, Download, List, LayoutGrid } from 'lucide-react';

export function ScheduleTable({ scheduleResult, scenarioName, onExportExcel }) {
  const [filterYear, setFilterYear] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const { schedule } = scheduleResult;

  const availableYears = useMemo(() => {
    const years = new Set();
    schedule.forEach((row) => {
      const yr = new Date(row.date).getFullYear();
      years.add(yr);
    });
    return Array.from(years).sort();
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (filterYear === 'all') return schedule;
    return schedule.filter((row) => new Date(row.date).getFullYear() === parseInt(filterYear, 10));
  }, [schedule, filterYear]);

  const totalPages = filterYear === 'all' ? Math.ceil(filteredSchedule.length / pageSize) : 1;
  const displayedSchedule =
    filterYear === 'all'
      ? filteredSchedule.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : filteredSchedule;

  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="card schedule-card">
      <div className="card-header flex-between">
        <div>
          <h2 className="card-title">Amortization Schedule</h2>
          <p className="card-subtitle">
            Month-by-month payment, interest, and principal breakdown
          </p>
        </div>
        <div className="schedule-header-actions">
          <div className="flex-align-center gap-1 filter-wrap">
            <Filter size={13} className="text-muted" />
            <select
              className="select-field select-field-sm"
              value={filterYear}
              onChange={handleYearChange}
            >
              <option value="all">All ({schedule.length} Mos)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-sm export-btn" onClick={onExportExcel}>
            <Download size={13} /> Export Excel
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-responsive desktop-schedule-table">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Mo #</th>
              <th>Date</th>
              <th>Standard EMI</th>
              <th>Amount Paid</th>
              <th>Interest</th>
              <th>Principal</th>
              <th>Extra Paid</th>
              <th>Balance</th>
              <th>Months Left</th>
            </tr>
          </thead>
          <tbody>
            {displayedSchedule.map((row) => {
              const isExtra = row.extraPaid > 0;
              const isFinal = row.remainingBalance === 0;

              return (
                <tr key={row.monthNumber} className={isFinal ? 'row-final' : isExtra ? 'row-accelerated' : ''}>
                  <td className="text-center font-mono text-muted">{row.monthNumber}</td>
                  <td className="font-medium text-center">{row.dateStr}</td>
                  <td className="text-right text-muted">{formatINR(row.standardEmi)}</td>
                  <td className="text-right font-semibold">{formatINR(row.amountPaid)}</td>
                  <td className="text-right text-danger">{formatINR(row.interestPaid)}</td>
                  <td className="text-right text-success">{formatINR(row.principalPaid)}</td>
                  <td className="text-right">
                    {row.extraPaid > 0 ? (
                      <span className="text-accent font-semibold">+{formatINR(row.extraPaid)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-right font-semibold">{formatINR(row.remainingBalance)}</td>
                  <td className="text-center text-muted">{schedule.length - row.monthNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Feed View */}
      <div className="mobile-schedule-cards">
        {displayedSchedule.map((row) => {
          const isExtra = row.extraPaid > 0;
          const isFinal = row.remainingBalance === 0;

          return (
            <div
              key={row.monthNumber}
              className={`schedule-mobile-row ${isFinal ? 'final-month' : isExtra ? 'extra-month' : ''}`}
            >
              <div className="flex-between schedule-mobile-row-top">
                <div className="flex-align-center gap-2">
                  <span className="mo-badge">#{row.monthNumber}</span>
                  <span className="mo-date">{row.dateStr}</span>
                </div>
                <div className="mo-payment">
                  <span className="mo-paid-val">{formatINR(row.amountPaid)}</span>
                  {isExtra && <span className="badge badge-accent badge-xs">+{formatCompactINR(row.extraPaid)} extra</span>}
                </div>
              </div>

              <div className="schedule-mobile-row-details">
                <div className="detail-item">
                  <span className="detail-label">Principal</span>
                  <span className="detail-val text-success">{formatINR(row.principalPaid)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Interest</span>
                  <span className="detail-val text-danger">{formatINR(row.interestPaid)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Balance</span>
                  <span className="detail-val font-semibold">{formatINR(row.remainingBalance)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {filterYear === 'all' && totalPages > 1 && (
        <div className="pagination-bar flex-between">
          <span className="text-xs text-muted">
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, schedule.length)} of {schedule.length}
          </span>
          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={13} />
            </button>
            <span className="page-indicator text-xs">
              {currentPage}/{totalPages}
            </span>
            <button
              className="btn btn-secondary btn-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
