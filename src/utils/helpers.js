import { MONTH_NAMES } from "../config/constants";

export const format$ = amt => {
    const raw = parseFloat(amt);
    const formatted = raw.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return formatted;
}

export function getDefaultCheckDate(year, month) {
	let fmtCheckDate = '';
	if (year === undefined || month === undefined) return fmtCheckDate;

    const checkDate = new Date(year, month - 1, 1);
    fmtCheckDate = checkDate.toISOString().substring(0, 10);
    return fmtCheckDate;
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

export const generateMonthOptions = () => {
    // Generate options starting from the next month
    return MONTH_NAMES.map((month, index) => {
        return <option key={index} value={index + 1}>{month}</option>;
    });
};

export const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startingYear = 2023;
    const YEARS = [];
    for (let year = startingYear; year <= currentYear + 1; year++) {
        YEARS.push(year);
    }
    // Generate options starting from the next month
    return YEARS.map((year, index) => {
        const selected = (year === currentYear) ? 'selected' : '';
        return <option key={index} value={year}>{year}</option>;
    });
};

