import { readableDateFormat } from "../utils/helpers";
import { FEES } from "../config/constants";

export const getFeeHeadings = firstRowFees => {
    const keys = Object.keys(firstRowFees);
    const headings = keys.filter(key => key !== 'rent' && firstRowFees[key] > 0);

    return headings;
}

export const getFeeAmounts = (feeHeadings, rowFees) => {
    const feeAmounts = {};
    console.log('feeHeadings', feeHeadings, rowFees);
    feeHeadings.forEach(heading => {
        feeAmounts[heading] = rowFees[heading];
    })
    return feeAmounts;
}

export const processLedgerData = rows => {
    const feeHeadings = getFeeHeadings(rows[0].due_fees);
    const table_data = [];
    rows.forEach(row => {
        const { property_id, unit_id, unit_fees, first_name, last_name, ledger_month, check_number, check_date, check_amount, due_rent, paid_rent, due_fees, paid_fees } = row;

        const row_data = { property_id, unit_id, unit_fees, ledger_month, due_rent, paid_rent, dueFees: {}, paidFees: {}, totalDue: 1 * due_rent, totalPaid: 1 * paid_rent, check_number, check_amount, check_date };
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            if (unit_fees && unit_fees[feeKey]) {
                const due = 1 * due_fees[feeKey];
                const paid = 1 * paid_fees[feeKey];
                row_data.dueFees[feeKey] = due;
                row_data.totalDue += due;
                row_data.paidFees[feeKey] = paid;
                row_data.totalPaid += paid;
            }
        })

        table_data.push(row_data);
    });
    return table_data;
}

export const fmtLedgerDate = (year, month) => {
    const ledgerDate = `${year}-${month}-01`;
    return readableDateFormat(ledgerDate);
}