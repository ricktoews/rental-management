export const format$ = amt => {
    const raw = parseFloat(amt);
    const formatted = raw.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return formatted;
}

export function getFirstDayOfNextMonth() {
    // Get the current date
    const currentDate = new Date();

    // Calculate the next month
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);

    // Set the day of the month to 1 to get the first day
    nextMonth.setDate(1);

    // Format the date as yyyy-mm-dd
    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
    const day = String(nextMonth.getDate()).padStart(2, '0'); // Add leading zero if needed

    return `${year}-${month}-${day}`;
}
