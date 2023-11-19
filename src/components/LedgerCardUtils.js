import { format$ } from "../utils/helpers";
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
    console.log('====> feeHeadings', feeHeadings);
    const table_data = [];
    rows.forEach(row => {
        const { property_id, unit_id, unit_fees, first_name, last_name, ledger_month, check_number, check_date, check_amount, due_rent, paid_rent, due_fees, paid_fees } = row;

        const row_data = { property_id, unit_id, unit_fees, ledger_month, due_rent, paid_rent, dueFees: {}, paidFees: {}, totalDue: due_rent, totalPaid: paid_rent, check_number, check_amount, check_date };
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            if (unit_fees[feeKey]) {
                const due = 1 * due_fees[feeKey];
                const paid = 1 * paid_fees[feeKey];
                row_data.dueFees[feeKey] = due;
                row_data.totalDue += due;
                row_data.paidFees[feeKey] = paid;
                row_data.totalPaid += paid;
            }
        })

        /*

        const rent_fmt = format$(rent_amount);
        const check_amount_fmt = format$(check_amount);
        const name_fmt = `${first_name} ${last_name}`;
        const total_due = rent_amount + Object.values(row.due_this_month).reduce((acc, curr) => acc + curr, 0);
        const total_paid = check_amount;

        row_data.rent = rent_fmt;
        feeHeadings.forEach(feeHeading => {
            row_data.fees[feeHeading] = format$(row.due_this_month[feeHeading]);
        });
        row_data.total_due = total_due;
        row_data.total_due_fmt = format$(total_due);
        row_data.tenant_name = name_fmt;
        row_data.check_number = check_number;
        row_data.check_date = check_date;
        row_data.paid = check_amount_fmt;
        disbursementHeadings.forEach(disbursementHeading => {
            row_data.disbursements[disbursementHeading] = format$(row.disbursements[disbursementHeading]);
        });
        row_data.total_paid = total_paid;
        row_data.total_paid_fmt = format$(total_paid);
*/
        table_data.push(row_data);
    });
    return table_data;
}