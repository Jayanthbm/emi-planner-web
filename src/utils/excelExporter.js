import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { calculateAmortizationSchedule } from './emiCalculator';
import { formatINR, formatTenure } from './formatters';

export async function exportToExcel(loanConfig, scenarios) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EMI & Prepayment Planner';
  workbook.created = new Date();

  // Color palette for headers
  const primaryColor = 'FF1E293B'; // Slate 800
  const accentColor = 'FF2563EB'; // Blue 600

  for (const scenario of scenarios) {
    const result = calculateAmortizationSchedule(loanConfig, scenario.payments);
    const sheetName = scenario.name.replace(/[*?:/\\\[\]]/g, '').slice(0, 30);
    const worksheet = workbook.addWorksheet(sheetName);

    // Columns
    worksheet.columns = [
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Standard EMI (₹)', key: 'emi', width: 18 },
      { header: 'Amount Paid (₹)', key: 'paid', width: 18 },
      { header: 'Interest Paid (₹)', key: 'interest', width: 18 },
      { header: 'Principal Paid (₹)', key: 'principal', width: 18 },
      { header: 'Extra Paid (₹)', key: 'extra', width: 18 },
      { header: 'Remaining Balance (₹)', key: 'balance', width: 22 },
      { header: 'Months Left', key: 'monthsLeft', width: 14 },
      { header: '', key: 'spacer', width: 4 },
      { header: 'Metric', key: 'summaryMetric', width: 26 },
      { header: 'Value', key: 'summaryValue', width: 24 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    for (let col = 1; col <= 9; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: primaryColor },
      };
    }

    headerRow.getCell(11).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: accentColor },
    };
    headerRow.getCell(12).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: accentColor },
    };

    // Add schedule rows
    const totalRows = result.schedule.length;
    result.schedule.forEach((row, idx) => {
      const worksheetRow = worksheet.addRow({
        month: row.monthNumber,
        date: row.dateStr,
        emi: Math.round(row.standardEmi),
        paid: Math.round(row.amountPaid),
        interest: Math.round(row.interestPaid),
        principal: Math.round(row.principalPaid),
        extra: Math.round(row.extraPaid),
        balance: Math.max(0, Math.round(row.remainingBalance)),
        monthsLeft: totalRows - idx - 1,
      });

      worksheetRow.alignment = { vertical: 'middle' };
      worksheetRow.getCell(1).alignment = { horizontal: 'center' };
      worksheetRow.getCell(2).alignment = { horizontal: 'center' };
      worksheetRow.getCell(9).alignment = { horizontal: 'center' };

      // Alternating row backgrounds
      if (idx % 2 === 1) {
        for (let col = 1; col <= 9; col++) {
          worksheetRow.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      }
    });

    // Summary Block on the right (columns K and L)
    const summaryData = [
      ['Scenario Name', scenario.name],
      ['Original Loan Amount', formatINR(loanConfig.principal)],
      ['Annual Interest Rate', `${loanConfig.annualRate}%`],
      ['Original Tenure', `${loanConfig.tenureMonths} Months (${formatTenure(loanConfig.tenureMonths)})`],
      ['Standard Monthly EMI', formatINR(result.standardEmi)],
      ['Original Total Interest', formatINR(result.totalInterestOriginal)],
      ['Original Maturity Date', format(result.originalEndDate, 'MMM yyyy')],
      ['---', '---'],
      ['Actual Months Taken', `${result.actualMonths} Months (${formatTenure(result.actualMonths)})`],
      ['Actual Total Interest Paid', formatINR(result.totalInterestPaid)],
      ['Actual Total Principal Paid', formatINR(result.totalPrincipalPaid)],
      ['Actual Extra Paid', formatINR(result.totalExtraPaid)],
      ['Actual Loan Payoff Date', format(result.actualEndDate, 'MMM yyyy')],
      ['---', '---'],
      ['Interest Saved', formatINR(result.interestSaved)],
      ['Tenure Reduced By', `${result.monthsSaved} Months (${formatTenure(result.monthsSaved)})`],
    ];

    summaryData.forEach((item, index) => {
      const rowNum = index + 2;
      const row = worksheet.getRow(rowNum);
      row.getCell(11).value = item[0];
      row.getCell(12).value = item[1];

      row.getCell(11).font = { bold: item[0].includes('Saved') || item[0].includes('Reduced') };
      row.getCell(12).font = { bold: true };

      if (item[0].includes('Saved') || item[0].includes('Reduced')) {
        row.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        row.getCell(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      }
    });

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `EMI_Prepayment_Plan_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
}
