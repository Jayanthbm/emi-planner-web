import React from 'react';
import { Landmark, FileSpreadsheet } from 'lucide-react';

export function Header({ onExportExcel }) {
  return (
    <header className="app-header desktop-header">
      <div className="brand-title-wrap">
        <div className="brand-icon">
          <Landmark size={24} />
        </div>
        <div>
          <h1 className="app-title">EMI & Prepayment Planner</h1>
          <p className="app-subtitle">
            Simulate stepped prepayment strategies and maximize interest savings
          </p>
        </div>
      </div>

      <button className="btn btn-secondary export-btn-main" onClick={onExportExcel}>
        <FileSpreadsheet size={16} className="text-success" />
        Export All Scenarios to Excel
      </button>
    </header>
  );
}
