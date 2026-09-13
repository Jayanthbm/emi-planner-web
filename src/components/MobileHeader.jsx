import React from 'react';
import { Landmark, FileSpreadsheet } from 'lucide-react';

export function MobileHeader({ onExportExcel }) {
  return (
    <header className="mobile-header">
      <div className="mobile-brand-bar">
        <div className="mobile-brand-icon">
          <Landmark size={20} />
        </div>
        <div className="mobile-title-wrap">
          <h1 className="mobile-app-title">EMI Planner</h1>
          <p className="mobile-app-subtitle">Amortization & Prepayments</p>
        </div>
      </div>

      <button className="mobile-export-btn" onClick={onExportExcel}>
        <FileSpreadsheet size={16} className="text-success" />
        <span>Export All Scenarios to Excel</span>
      </button>
    </header>
  );
}
