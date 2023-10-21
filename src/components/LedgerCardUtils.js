import { format$ } from "../utils/helpers";

export const getFeeHeadings = firstRowFees => {
    const headings = Object.keys(firstRowFees);
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
    const feeHeadings = getFeeHeadings(rows[0].fees);
    const disbursementHeadings = getFeeHeadings(rows[0].disbursements);
    const table_data = [];
    rows.forEach(row => {
        const { property_id, unit_id, rent_amount, first_name, last_name, payment_month, check_number, check_date, check_amount } = row;
        const rent_fmt = format$(rent_amount);
        const check_amount_fmt = format$(check_amount);
        const name_fmt = `${first_name} ${last_name}`;

        const total_due = rent_amount + Object.values(row.fees).reduce((acc, curr) => acc + curr, 0);
        const total_paid = check_amount;

        const row_data = { property_id, unit_id, fees: {}, disbursements: {} };
        row_data.rent = rent_fmt;
        feeHeadings.forEach(feeHeading => {
            row_data.fees[feeHeading] = format$(row.fees[feeHeading]);
        });
        row_data.total_due = total_due;
        row_data.total_due_fmt = format$(total_due);
        row_data.tenant_name = name_fmt;
        row_data.payment_month = payment_month;
        row_data.check_number = check_number;
        row_data.check_date = check_date;
        row_data.paid = check_amount_fmt;
        disbursementHeadings.forEach(disbursementHeading => {
            row_data.disbursements[disbursementHeading] = format$(row.disbursements[disbursementHeading]);
        });
        row_data.total_paid = total_paid;
        row_data.total_paid_fmt = format$(total_paid);

        table_data.push(row_data);
    });
    return table_data;
}