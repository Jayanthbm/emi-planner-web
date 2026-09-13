import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { LoanInputs } from './components/LoanInputs';
import { ScenarioManager } from './components/ScenarioManager';
import { KpiCards } from './components/KpiCards';
import { ScenarioComparison } from './components/ScenarioComparison';
import { ScheduleTable } from './components/ScheduleTable';
import { MobileLoanInputs } from './components/MobileLoanInputs';
import { MobileScenarioManager } from './components/MobileScenarioManager';
import { MobileKpiCards } from './components/MobileKpiCards';
import { MobileScenarioComparison } from './components/MobileScenarioComparison';
import {
  calculateStandardEMI,
  calculateAmortizationSchedule,
  DEFAULT_SCENARIOS,
} from './utils/emiCalculator';
import { exportToExcel } from './utils/excelExporter';

const MOBILE_BREAKPOINT = 768;

const DEFAULT_LOAN = {
  principal: 5000000, // ₹50 Lakhs
  annualRate: 8.5, // 8.5% p.a.
  tenureMonths: 240, // 20 years
  startDate: '2024-01-01',
};

const STORAGE_KEYS = {
  LOAN: 'emi_planner_loan_config',
  SCENARIOS: 'emi_planner_scenarios',
  ACTIVE_ID: 'emi_planner_active_id',
};

export function App() {
  // Load initial states from localStorage if available
  const [loanConfig, setLoanConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOAN);
      return saved ? JSON.parse(saved) : DEFAULT_LOAN;
    } catch {
      return DEFAULT_LOAN;
    }
  });

  const [scenarios, setScenarios] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
      return saved ? JSON.parse(saved) : DEFAULT_SCENARIOS;
    } catch {
      return DEFAULT_SCENARIOS;
    }
  });

  const [activeScenarioId, setActiveScenarioId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      return saved && scenarios.some((s) => s.id === saved) ? saved : scenarios[0].id;
    } catch {
      return scenarios[0].id;
    }
  });

  // Detect mobile/desktop view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOAN, JSON.stringify(loanConfig));
  }, [loanConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeScenarioId);
  }, [activeScenarioId]);

  // Active scenario and result
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const standardEmi = calculateStandardEMI(
    loanConfig.principal,
    loanConfig.annualRate,
    loanConfig.tenureMonths
  );
  const activeScheduleResult = calculateAmortizationSchedule(loanConfig, activeScenario.payments);

  // Scenario Handlers
  const handleUpdateScenario = (id, updates) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddScenario = () => {
    const newId = `plan_${Date.now()}`;
    const newPlan = {
      id: newId,
      name: `Custom Plan ${scenarios.length + 1}`,
      description: 'Custom prepayment strategy',
      payments: [{ date: loanConfig.startDate, amount: Math.round(standardEmi + 5000) }],
    };
    setScenarios((prev) => [...prev, newPlan]);
    setActiveScenarioId(newId);
  };

  const handleDuplicateScenario = (id) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;
    const newId = `plan_${Date.now()}`;
    const duplicated = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      payments: JSON.parse(JSON.stringify(target.payments)),
    };
    setScenarios((prev) => [...prev, duplicated]);
    setActiveScenarioId(newId);
  };

  const handleDeleteScenario = (id) => {
    if (scenarios.length <= 1) return;
    const filtered = scenarios.filter((s) => s.id !== id);
    setScenarios(filtered);
    if (activeScenarioId === id) {
      setActiveScenarioId(filtered[0].id);
    }
  };

  const handleResetLoan = () => {
    setLoanConfig(DEFAULT_LOAN);
    setScenarios(DEFAULT_SCENARIOS);
    setActiveScenarioId(DEFAULT_SCENARIOS[0].id);
  };

  const handleExportExcel = async () => {
    await exportToExcel(loanConfig, scenarios);
  };

  return (
    <div className="app-container">
      {/* Separate Desktop & Mobile Headers */}
      <Header onExportExcel={handleExportExcel} />
      <MobileHeader onExportExcel={handleExportExcel} />

      {/* Desktop-Only Full Planner Interface */}
      <div className="desktop-only-content">
        {/* Main Configuration Grid: Loan Parameters + Prepayment Strategy */}
        <section className="top-grid">
          <LoanInputs
            config={loanConfig}
            onChange={setLoanConfig}
            onReset={handleResetLoan}
          />
          <ScenarioManager
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={setActiveScenarioId}
            onUpdateScenario={handleUpdateScenario}
            onAddScenario={handleAddScenario}
            onDuplicateScenario={handleDuplicateScenario}
            onDeleteScenario={handleDeleteScenario}
            standardEmi={standardEmi}
          />
        </section>

        {/* Key Metrics / KPI Overview */}
        <section>
          <KpiCards
            result={activeScheduleResult}
            loanConfig={loanConfig}
            scenarioName={activeScenario.name}
          />
        </section>

        {/* Multi-Scenario Comparison Matrix */}
        <section>
          <ScenarioComparison
            loanConfig={loanConfig}
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={setActiveScenarioId}
          />
        </section>

        {/* Month-by-Month Amortization Schedule */}
        <section>
          <ScheduleTable
            scheduleResult={activeScheduleResult}
            scenarioName={activeScenario.name}
            onExportExcel={handleExportExcel}
          />
        </section>
      </div>

      {/* Mobile-Only Content */}
      <div className="mobile-only-content">
        <section className="mobile-section">
          <MobileLoanInputs
            config={loanConfig}
            onChange={setLoanConfig}
            onReset={handleResetLoan}
          />
        </section>

        <section className="mobile-section">
          <MobileScenarioManager
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={setActiveScenarioId}
            onUpdateScenario={handleUpdateScenario}
            onAddScenario={handleAddScenario}
            onDuplicateScenario={handleDuplicateScenario}
            onDeleteScenario={handleDeleteScenario}
            standardEmi={standardEmi}
          />
        </section>

        <section className="mobile-section">
          <MobileKpiCards
            result={activeScheduleResult}
            loanConfig={loanConfig}
            scenarioName={activeScenario.name}
          />
        </section>

        <section className="mobile-section">
          <MobileScenarioComparison
            loanConfig={loanConfig}
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={setActiveScenarioId}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p className="text-xs text-muted">
          Loan Amortization Engine • Calculations run strictly in-browser • Prepayments apply directly to outstanding principal
        </p>
      </footer>
    </div>
  );
}

export default App;
