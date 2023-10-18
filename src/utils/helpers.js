export const format$ = amt => {
    const raw = parseFloat(amt);
    const formatted = raw.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return formatted;
}