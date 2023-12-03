import React, { useEffect, useState } from 'react';
// Import Bootstrap CSS if you haven't already

import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPropertyById, savePropertyDetails, saveUnitMonthlyFees, setPayment, getPayments } from '../utils/apis';
import { format$, getFirstDayOfNextMonth, generateMonthOptions } from '../utils/helpers';
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
    const nextMonth = (new Date().getMonth() + 1) % 12 + 1;
    const [address, setAddress] = useState('');
    const [ledgerMonth, setLedgerMonth] = useState(nextMonth);
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

                    const _feeCharged = {};
                    Object.keys(propertyFees).forEach(item => {
                        if (res.property_fees[item]) {
                            _feeCharged[item] = true;
                        }
                    });
                    const unitFeesArray = res.units.filter(item => item.unit_fees).map(item => item.unit_fees);
                    unitFeesArray.forEach(unitFees => {
                        Object.keys(unitFees).forEach(item => {
                            if (unitFees[item]) {
                                _feeCharged[item] = true;
                            }
                        });
                    })
                    setFeeCharged(_feeCharged);
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
            getPayments(ledgerMonth, tenantIds)
                .then(res => {
                    console.log('====> data for month', ledgerMonth, res);
                    setLedgerData(res);
                });
        }
    }, [ledgerMonth, units])

    const handleFeeChange = e => {
        const field = e.currentTarget;
        const feeProperty = field.dataset.fee;
        const value = 1 * field.value || 0;
        setPropertyFees({ ...propertyFees, [feeProperty]: value });
        setTriggerSave(true);
    }

    return (
        <div>
            <Link to="/">Return to Property List</Link>

            <h2>{address}</h2>

            {/* Property Fees Table */}
            <PropertyTable className="property-fees table">
                <thead>
                    <tr className="table-success">
                        {FEES.map((feeObj, key) => {
                            const feeLabel = Object.values(feeObj)[0];
                            return <CenteredTh key={key}>{feeLabel}</CenteredTh>
                        })}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {FEES.map((feeObj, key) => {
                            const feeKey = Object.keys(feeObj)[0];
                            const feeLabel = Object.values(feeObj)[0];
                            return <td key={key}>$<FeeInput data-fee={feeKey} onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees[feeKey] || ''} /></td>
                        })}
                    </tr>
                </tbody>
            </PropertyTable>

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
            </div>

            {/* Units Table */}
            <table className="unit-payments table table-striped">
                {units.map((unit, idx) => {
                    const ledgerRecord = ledgerData.find(item => item.unit_id == unit.unit_id);
                    return <LedgerEntry key={idx}
                        unit={unit}
                        month={ledgerMonth}
                        ledgerData={ledgerRecord}
                        propertyFees={propertyFees}
                        feeCharged={feeCharged}
                        defaultCheckDate={defaultCheckDate}
                        propertyMonthlyTotal={propertyMonthlyTotal}
                        paymentsReceivedTotal={paymentsReceivedTotal}
                    />;

                })}
                <tbody>
                    <tr>
                        <td colSpan={columns} style={{ textAlign: 'right' }}>Property Total:</td>
                        <Money>{format$(propertyMonthlyTotal)}</Money>
                        <td></td>
                        <td style={{ textAlign: 'right' }}>Received:</td>
                        <Money>{format$(paymentsReceivedTotal)}</Money>
                        <td></td>
                    </tr>
                </tbody>

            </table>
        </div>
    );
}

export default PropertyEdit;
