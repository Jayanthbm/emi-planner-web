# Implementation Plan: EMI & Prepayment Planner Web App (React + Vite)

Build an interactive React + Vite web application for loan amortization and stepped prepayment planning, based on the calculation logic in `/Users/jayanthbharadwajm/development/utils/check_emi.js`.

> [!NOTE]
> Existing file `/Users/jayanthbharadwajm/development/utils/check_emi.js` will remain completely untouched. This plan is fully standalone and can be executed anywhere on your system.

---

## Step 0: Project Initialization (Run in your chosen directory)

```bash
# 1. Create Vite React project
npm create vite@latest emi-planner-web -- --template react

# 2. Enter project folder
cd emi-planner-web

# 3. Install core dependencies
npm install date-fns exceljs file-saver lucide-react

# 4. Start development server
npm run dev
```

---

## Project Structure

```
emi-planner-web/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── components/
    │   ├── LoanInputs.jsx         # Principal, Rate, Tenure, Start Date
    │   ├── ScenarioManager.jsx    # Scenario tabs & Stepped Payment timeline editor
    │   ├── KpiCards.jsx           # Interest saved, Tenure reduction badges
    │   ├── ScenarioComparison.jsx # Side-by-side scenario matrix
    │   └── ScheduleTable.jsx      # Month-by-month amortization schedule
    └── utils/
        ├── emiCalculator.js       # Core math engine (ported from /Users/jayanthbharadwajm/development/utils/check_emi.js)
        ├── excelExporter.js       # ExcelJS browser export utility
        └── formatters.js          # Currency (INR format) and tenure formatters
```

---

## Core Logic & Formulas (Reference: `/Users/jayanthbharadwajm/development/utils/check_emi.js`)

### 1. Loan Math & Amortization Algorithm
```javascript
// Monthly interest rate
const monthlyRate = annualRate / 100 / 12;

// Standard Monthly EMI
const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);

// Original Total Interest
const totalInterestOriginal = emi * tenureMonths - principal;

// Stepped Payment Resolver
function getApplicablePayment(date, payments) {
  let applicableAmount = payments[0].amount;
  for (const payment of payments) {
    if (isAfter(date, parseISO(payment.date)) || isEqual(date, parseISO(payment.date))) {
      applicableAmount = payment.amount;
    }
  }
  return applicableAmount;
}
```

---

## Core Features & Components

### 1. Loan Parameters Component (`LoanInputs.jsx`)
- Inputs with real-time feedback and Indian Currency formatting:
  - **Loan Principal (₹)** (Default: `35,00,000`)
  - **Annual Interest Rate (%)** (Default: `10.5%`)
  - **Tenure (Months / Years toggle)** (Default: `180 months` / `15 years`)
  - **Start Date** (Default: `2021-11-09`)
- Real-time display of standard monthly EMI, total interest, and original maturity date.

### 2. Scenario & Prepayment Planner (`ScenarioManager.jsx`)
- Manage multiple payment strategies (*"How I Paid & How I'm Planning"*):
  - Defaults preloaded with the 3 scenarios from `/Users/jayanthbharadwajm/development/utils/check_emi.js`:
    - **Base**: `[{ date: "2021-11-09", amount: 40000 }]`
    - **Planned**: `[{ date: "2021-11-09", amount: 40000 }, { date: "2026-01-01", amount: 50000 }]`
    - **new_plan**: `[{ date: "2021-11-09", amount: 40000 }, { date: "2026-01-01", amount: 50000 }, { date: "2027-01-01", amount: 60000 }, { date: "2028-01-01", amount: 70000 }]`
  - Add / Duplicate / Rename / Delete custom scenarios.
  - Stepped monthly payments editor:
    - Add payment step: `Effective Date` + `Monthly Payment Amount (₹)`.
    - Auto-sorted chronologically.
    - Quick actions (e.g., duplicate step, step-up +₹5k/yr).
- Auto-saves user custom scenarios to `localStorage`.

### 3. Comparison Dashboard & KPI Cards (`KpiCards.jsx` & `ScenarioComparison.jsx`)
- **Key Metrics**:
  - Original vs Preclosed Tenure (e.g., *15 yrs 0 mos* ➔ *9 yrs 2 mos*).
  - Time Saved (e.g., *5 yrs 10 mos earlier*).
  - Total Interest Paid vs Interest Saved (e.g., *₹16.4 Lakhs saved*).
  - Effective preclosure date badge.
- **Side-by-Side Comparison Matrix**: Compare all active scenarios against the base loan.

### 4. Interactive Amortization Table (`ScheduleTable.jsx`)
- Month-by-month table:
  - Columns: Month, Standard EMI, Amount Paid, Interest Paid, Principal Paid, Extra Paid, Remaining Balance, Months Left.
  - Year filter / pagination for fast browsing.

### 5. Excel Export (`excelExporter.js`)
- Uses `exceljs` and `file-saver` directly in browser.
- Exports a multi-tab `.xlsx` file mirroring `/Users/jayanthbharadwajm/development/utils/check_emi.js`:
  - Exact column widths, frozen headers, and summary blocks (Columns J–M).

---

## Verification Plan

### Automated / Calculation Check
- Verify calculation consistency against `/Users/jayanthbharadwajm/development/utils/check_emi.js`:
  - Principal: `₹35,00,000`, Rate: `10.5%`, Tenure: `180m`, Start: `2021-11-09`.
  - Base (₹40,000), Planned (₹40k/₹50k), new_plan (₹40k/₹50k/₹60k/₹70k).
  - Matches total months taken, final closing date, and total interest paid down to the rupee.

### UI / Manual Check
- Responsive design across desktop and mobile.
- Add/remove dynamic payment steps and confirm instantaneous table & card recalculations.
- Test Excel export download in Excel / Numbers.
