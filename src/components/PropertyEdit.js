import React, { useEffect, useState } from 'react';
// Import Bootstrap CSS if you haven't already

import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPropertyById, savePropertyDetails, saveUnitMonthlyFees, setPayment, getPayments } from '../utils/apis';
import { format$, getFirstDayOfNextMonth, generateMonthOptions, generateYearOptions } from '../utils/helpers';
import LedgerEntry from './LedgerEntry';
import { FEES } from '../config/constants';

const CenteredTh = styled.th`
    text-align: center;
`;

const StyledInput = styled.input`
    border-radius: 4px;
    margin: 4px 0;
    border: 1px solid #ccc;
`;

const FeeInput = styled(StyledInput)`
    width: 50px;
    text-align: right;
`;

const UnitInput = styled(StyledInput)`
    width: 75px;
`;

const PaymentInput = styled(StyledInput)`
    width: 100px;
    text-align: right;
`;

const CheckNoInput = styled(StyledInput)`
    width: 75px;
`;

const CheckDateInput = styled(StyledInput)`
    width: 100px;
`;


const Money = styled.td`
text-align: right;
`;

const PropertyTable = styled.table`
    margin-bottom: 20px;
`;

const StyledLabel = styled.label`
  margin-right: 10px;
`;


function PropertyEdit() {
    let { propertyId } = useParams();
    const currentMonth = (new Date().getMonth() + 1);
    const nextMonth = (new Date().getMonth() + 1) % 12 + 1;
    const currentYear = new Date().getFullYear();
    const nextYear = new Date().getFullYear() + 1;
    const _recapMonth = (new Date().getMonth()) % 12 + 1;
    const [address, setAddress] = useState('');
    const [ledgerMonth, setLedgerMonth] = useState(currentMonth);
    const [ledgerYear, setLedgerYear] = useState(currentYear);
    const [recapMonth, setRecapMonth] = useState(_recapMonth);
    const [recapYear, setRecapYear] = useState(currentYear);
    const [defaultCheckDate, setDefaultCheckDate] = useState(getFirstDayOfNextMonth());
    const [propertyFees, setPropertyFees] = useState({});
    const [feeCharged, setFeeCharged] = useState({});
    const [units, setUnits] = useState([]);
    const [ledgerData, setLedgerData] = useState([]);
    const [totals, setTotals] = useState({});
    const [triggerSave, setTriggerSave] = useState(false);
    let propertyMonthlyTotal = 0, paymentsReceivedTotal = 0;
    let columns;

    useEffect(() => {
        if (propertyId) {
            getPropertyById(propertyId)
                .then(res => {
                    const propertyFees = res.property_fees || {};
                    setAddress(res.property_address);
                    setPropertyFees(propertyFees);
                    setUnits(res.units);
                })
        }
    }, [propertyId]);

    useEffect(() => {
        if (triggerSave) {
            const detailsData = { monthly_fees: propertyFees };
            savePropertyDetails(propertyId, detailsData);
            setTriggerSave(false);
        }
    }, [triggerSave]);

    useEffect(() => {
        const tenantIds = units.map(item => item.tenant_id);
        if (tenantIds.length > 0) {
            getPayments(ledgerYear, ledgerMonth, tenantIds)
                .then(res => {
                    setLedgerData(res);
                });
        }
    }, [units])

    const handleFeeChange = e => {
        const field = e.currentTarget;
        const feeProperty = field.dataset.fee;
        const value = 1 * field.value || 0;
        setPropertyFees({ ...propertyFees, [feeProperty]: value });
        setTriggerSave(true);
    }

    const handleMonthChange = event => {
        const month = event.target.value;
        setRecapMonth(month);
    }

    const handleYearChange = event => {
        const month = event.target.value;
        setRecapYear(month);
    }

    return (
        <div>
            <Link to="/">Return to Property List</Link>

            <h2>{address}</h2>


            <Link to={`/rent-recap/${propertyId}/${ledgerMonth}/${ledgerYear}`}>Rent Recap</Link>
            <hr />

            {/* Payment Month Dropdown */}
            <div className="month-selector">
                <label htmlFor="ledgerMonth">Payment Month:</label>
                <select
                    id="ledgerMonth"
                    value={ledgerMonth}
                    onChange={(e) => setLedgerMonth(e.target.value)}
                >
                    {generateMonthOptions()}
                </select>
                <label htmlFor="ledgerMonth">Year:</label>
                <select
                    id="ledgerYear"
                    value={ledgerYear}
                    onChange={(e) => setLedgerYear(e.target.value)}
                >
                    {generateYearOptions()}
                </select>

            </div>

            {/* Units Table */}
            {units.length > 0 && <table className="unit-payments table table-striped">
                {units.map((unit, idx) => {
                    const ledgerRecord = ledgerData.find(item => item.unit_id == unit.unit_id);
                    return <LedgerEntry key={idx}
                        unit={unit}
                        month={ledgerMonth}
                        ledgerMonth={ledgerMonth}
                        ledgerYear={ledgerYear}
                        ledgerData={ledgerRecord}
                        propertyFees={propertyFees}
                    />;

                })}

            </table>}
        </div>
    );
}

export default PropertyEdit;
