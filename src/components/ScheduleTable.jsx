import React, { useState, useMemo } from 'react';
import { formatINR } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';

export function ScheduleTable({ scheduleResult, scenarioName, onExportExcel }) {
  const [filterYear, setFilterYear] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24; // Show 2 years per page if not filtering by year

  const { schedule } = scheduleResult;

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set();
    schedule.forEach((row) => {
      const yr = new Date(row.date).getFullYear();
      years.add(yr);
    });
    return Array.from(years).sort();
  }, [schedule]);

  // Filter schedule
  const filteredSchedule = useMemo(() => {
    if (filterYear === 'all') return schedule;
    return schedule.filter((row) => new Date(row.date).getFullYear() === parseInt(filterYear, 10));
  }, [schedule, filterYear]);

  // Pagination for 'all' view
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
            Month-by-month payment, interest, principal, and outstanding loan balance breakdown
          </p>
        </div>
        <div className="schedule-header-actions">
          {/* Year Filter */}
          <div className="flex-align-center gap-1">
            <Filter size={14} className="text-muted" />
            <select
              className="select-field select-field-sm"
              value={filterYear}
              onChange={handleYearChange}
            >
              <option value="all">All Years ({schedule.length} Months)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onExportExcel}>
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Mo #</th>
              <th>Date</th>
              <th>Standard EMI</th>
              <th>Amount Paid</th>
              <th>Interest Paid</th>
              <th>Principal Paid</th>
              <th>Extra Paid</th>
              <th>Remaining Balance</th>
              <th>Months Left</th>
            </tr>
          </thead>
          <tbody>
            {displayedSchedule.map((row) => {
              const isExtra = row.extraPaid > 0;
              const isFinal = row.remainingBalance === 0;

              return (
                <tr key={row.monthNumber} className={isFinal ? 'row-final' : isExtra ? 'row-accelerated' : ''}>
                  <td className="font-mono text-muted">{row.monthNumber}</td>
                  <td className="font-medium">{row.dateStr}</td>
                  <td className="text-muted">{formatINR(row.standardEmi)}</td>
                  <td className="font-semibold">
                    {formatINR(row.amountPaid)}
                  </td>
                  <td className="text-danger">{formatINR(row.interestPaid)}</td>
                  <td className="text-success">{formatINR(row.principalPaid)}</td>
                  <td>
                    {row.extraPaid > 0 ? (
                      <span className="text-accent font-semibold">+{formatINR(row.extraPaid)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="font-semibold">
                    {formatINR(row.remainingBalance)}
                  </td>
                  <td className="text-muted">
                    {schedule.length - row.monthNumber}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filterYear === 'all' && totalPages > 1 && (
        <div className="pagination-bar flex-between">
          <span className="text-xs text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, schedule.length)} of {schedule.length} months
          </span>
          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="page-indicator text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
