import React from 'react';

const LedgerMonthDropdown = ({ adjustLedgerMonth, ledgerMonth, ledgerYear, totalDue }) => {
    const { setPaymentLedgerMonth, setPaymentLedgerYear } = adjustLedgerMonth;

    const handleLedgerMonthChange = e => {
        // Extract month and year from the selected value
        const [selectedMonth, selectedYear] = e.target.value.split(',').map(Number);
        // Call the handler to set the selected month and year
        setPaymentLedgerMonth(selectedMonth);
        setPaymentLedgerYear(selectedYear);
    }

    // Helper function to format the month number into a string (e.g., 1 -> 'January', 2 -> 'February', etc.)
    const getMonthName = (month) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month - 1]; // month is 1-based, array is 0-based
    };

    // Generate the last 12 months including the ledgerMonth/ledgerYear
    const generateMonths = (ledgerMonth, ledgerYear) => {
        const months = [];

        for (let i = 11; i >= 0; i--) {
            // Create a new date object for each month, going back by i months
            const date = new Date(ledgerYear, ledgerMonth - 1); // -1 since months are 0-indexed in JS Date
            date.setMonth(date.getMonth() - i);

            const year = date.getFullYear();
            const month = date.getMonth() + 1; // getMonth() is 0-indexed, so we add 1

            months.push({ month, year });
        }

        return months;
    };

    const months = generateMonths(ledgerMonth, ledgerYear);

    return (
        <>Due <select onChange={handleLedgerMonthChange} defaultValue={`${ledgerMonth},${ledgerYear}`}>
            {months.map(({ month, year }) => (
                <option key={`${month}-${year}`} value={`${month},${year}`}>
                    {`${getMonthName(month)}, ${year}`}
                </option>
            ))}
        </select>: {totalDue}</>
    );
};

export default LedgerMonthDropdown;
