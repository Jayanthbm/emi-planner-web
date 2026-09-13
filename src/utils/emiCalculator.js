import { addMonths, format, parseISO, isAfter, isEqual } from 'date-fns';

/**
 * Standard Monthly EMI Calculation
 * Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateStandardEMI(principal, annualRate, tenureMonths) {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Find applicable payment for a given month date
 */
export function getApplicablePayment(date, payments) {
  if (!payments || payments.length === 0) return 0;
  // Sort payments by date ascending
  const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let applicableAmount = sorted[0].amount;
  for (const payment of sorted) {
    const pDate = typeof payment.date === 'string' ? parseISO(payment.date) : payment.date;
    if (isAfter(date, pDate) || isEqual(date, pDate)) {
      applicableAmount = Number(payment.amount);
    }
  }
  return applicableAmount;
}

/**
 * Generate full amortization schedule for a loan scenario
 */
export function calculateAmortizationSchedule(loanConfig, paymentSchedule) {
  const { principal, annualRate, tenureMonths, startDate } = loanConfig;
  const monthlyRate = annualRate / 100 / 12;
  const standardEmi = calculateStandardEMI(principal, annualRate, tenureMonths);
  const totalInterestOriginal = standardEmi * tenureMonths - principal;
  const originalEndDate = addMonths(parseISO(startDate), tenureMonths);

  let remainingBalance = principal;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let totalExtraPaid = 0;
  let month = 0;
  const schedule = [];

  const start = parseISO(startDate);

  while (remainingBalance > 0.01 && month < 600) {
    // Safety cap 50 yrs
    month++;
    const currentDate = addMonths(start, month);
    const applicablePayment = getApplicablePayment(currentDate, paymentSchedule);

    // Interest for this month
    const interest = remainingBalance * monthlyRate;

    // Determine actual payment & principal payment
    let payment = applicablePayment > 0 ? applicablePayment : standardEmi;
    let principalPaid = 0;
    let extraPaid = 0;

    if (remainingBalance + interest <= payment) {
      // Final payoff
      payment = remainingBalance + interest;
      principalPaid = remainingBalance;
      extraPaid = Math.max(0, payment - standardEmi);
      remainingBalance = 0;
    } else {
      principalPaid = payment - interest;
      extraPaid = Math.max(0, payment - standardEmi);
      remainingBalance -= principalPaid;
    }

    totalInterestPaid += interest;
    totalPrincipalPaid += principalPaid;
    totalExtraPaid += extraPaid;

    schedule.push({
      monthNumber: month,
      date: currentDate,
      dateStr: format(currentDate, 'MMM yyyy'),
      standardEmi,
      amountPaid: payment,
      interestPaid: interest,
      principalPaid,
      extraPaid,
      remainingBalance: Math.max(0, remainingBalance),
      totalInterestPaidSoFar: totalInterestPaid,
      totalPrincipalPaidSoFar: totalPrincipalPaid,
    });
  }

  const actualMonths = schedule.length;
  const actualEndDate = schedule.length > 0 ? schedule[schedule.length - 1].date : start;
  const interestSaved = Math.max(0, totalInterestOriginal - totalInterestPaid);
  const monthsSaved = Math.max(0, tenureMonths - actualMonths);

  return {
    standardEmi,
    originalTenureMonths: tenureMonths,
    originalEndDate,
    totalInterestOriginal,
    actualMonths,
    actualEndDate,
    totalInterestPaid,
    totalPrincipalPaid,
    totalExtraPaid,
    totalAmountPaid: totalPrincipalPaid + totalInterestPaid,
    interestSaved,
    monthsSaved,
    schedule,
  };
}

/**
 * Predefined default scenarios matching check_emi.js
 */
export const DEFAULT_SCENARIOS = [
  {
    id: 'base',
    name: 'Base Loan',
    description: 'Standard monthly EMI with no extra prepayments',
    payments: [{ date: '2024-01-01', amount: 43391 }],
  },
  {
    id: 'planned',
    name: 'Planned Prepayment',
    description: 'Standard EMI with step-up to ₹50,000 from Year 3',
    payments: [
      { date: '2024-01-01', amount: 43391 },
      { date: '2026-01-01', amount: 50000 },
    ],
  },
  {
    id: 'new_plan',
    name: 'Aggressive Step-Up',
    description: 'Annual 10% step-up starting from Year 3',
    payments: [
      { date: '2024-01-01', amount: 43391 },
      { date: '2026-01-01', amount: 50000 },
      { date: '2027-01-01', amount: 55000 },
      { date: '2028-01-01', amount: 60000 },
    ],
  },
];
