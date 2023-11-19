export const API_BASE = 'https://www.toews-api.com';

export const REST = {
    properties: API_BASE + '/property',
    propertyById: API_BASE + '/property/',
    saveProperty: API_BASE + '/property/',
    saveUnitMonthly: API_BASE + '/unit/monthly/',
    setPayment: API_BASE + '/payment',
    getPayments: API_BASE + '/get-payments',
    getLedgerCard: API_BASE + '/ledger-card/',
};

export const FEES = [
    { 'scep': 'SCEP' },
    { 'rfd': 'RFD' },
    { 'trash': 'Trash' },
    { 'parking': 'Parking' }
]

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
];