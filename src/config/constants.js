export const API_BASE = 'https://www.toews-api.com';

export const REST = {
    unoccupiedUnits: API_BASE + '/unoccupied-units',
    tenants: API_BASE + '/tenant',
    getTenant: API_BASE + '/tenant',
    saveTenant: API_BASE + '/tenant',
    moveIn: API_BASE + '/move-in',
    moveOut: API_BASE + '/move-out',
    properties: API_BASE + '/property',
    propertyById: API_BASE + '/property/',
    saveProperty: API_BASE + '/property/',
    saveUnitMonthly: API_BASE + '/unit/monthly/',
    setPayment: API_BASE + '/payment',
    savePaymentRecord: API_BASE + '/save-payment',
    deletePaymentRecord: API_BASE + '/delete-payment',
    getPayments: API_BASE + '/get-payments',
    getPaymentEntryData: API_BASE + '/payment-entry',
    getLedgerCard: API_BASE + '/ledger-card/',
    getPropertyLedgerCards: API_BASE + '/ledger-cards-property/',
    getRentRecap: API_BASE + '/rent-recap',
    getRentRecapAll: API_BASE + '/rent-recap-all',
};

export const FEES = [
    { 'scep': 'SCEP' },
    { 'rsd': 'RSD' },
    { 'trash': 'Trash' },
    { 'parking': 'Parking' },
    { 'cap_imp': 'Cap Imp' }
]

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
];
