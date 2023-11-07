import React, { useEffect, useState } from 'react';
// Import Bootstrap CSS if you haven't already

import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPropertyById, savePropertyDetails, saveUnitMonthlyFees, setPayment, getPayments } from '../utils/apis';
import { format$, getFirstDayOfNextMonth } from '../utils/helpers';
import LedgerEntry from './LedgerEntry';

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
    const nextMonth = (new Date().getMonth() + 2) % 12;
    const [address, setAddress] = useState('');
    const [ledgerMonth, setledgerMonth] = useState(nextMonth);
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
                    setAddress(res.property_address);
                    setPropertyFees(res.property_fees || {});
                    setUnits(res.units);

                    const _feeCharged = {};
                    Object.keys(res.property_fees).forEach(item => {
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
                    setLedgerData(res);
                });
        }
    }, [ledgerMonth, units])

    const generateMonthOptions = () => {
        const months = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        // Generate options starting from the next month
        return months.map((month, index) => {
            return <option key={index} value={index + 1}>{month}</option>;
        });
    };

    const handleFeeChange = e => {
        const field = e.currentTarget;
        const feeProperty = field.dataset.fee;
        const value = 1 * field.value || 0;
        setPropertyFees({ ...propertyFees, [feeProperty]: value });
        setTriggerSave(true);
    }
    /*
        const handleUnitFees = e => {
            const el = e.currentTarget;
            const parentTr = el.closest('tr');
            if (parentTr) {
                const unit_id = parseInt(parentTr.dataset.unit_id, 10);
                const inputEls = Array.from(parentTr.querySelectorAll('input'));
                const monthly_fees = {};
                let rent_amount;
                inputEls.forEach(item => {
                    const data = item.dataset;
                    if (data.monthly) {
                        if (data.monthly === 'rent') {
                            rent_amount = parseFloat(item.value);
                        } else {
                            monthly_fees[data.monthly] = parseFloat(item.value);
                        }
                    }
                });
                const unit_record = units.find(unit => unit.unit_id === unit_id);
                unit_record.unit_fees = monthly_fees;
                const payload = { rent_amount, monthly_fees };
                setUnits([...units]);
                saveUnitMonthlyFees(unit_id, payload);
            }
        }
    */
    /*
        const handlePayment = e => {
            const el = e.currentTarget;
            const parentTr = el.closest('tr');
            if (parentTr) {
                const tenant_id = parentTr.dataset.tenant_id;
                const inputEls = Array.from(parentTr.querySelectorAll('input'));
                const disbursement = {};
                let check_number, check_date, check_amount;
                inputEls.forEach(item => {
                    const data = item.dataset;
                    if (data.monthly) {
                        disbursement[data.monthly] = parseFloat(item.value);
                    }
                    else if (data.check) {
                        if (data.check === 'number') {
                            check_number = item.value;
                        }
                        else if (data.check === 'date') {
                            check_date = item.value;
                        }
                        else if (data.check === 'amount') {
                            check_amount = item.value;
                        }
                    }
                });
                if (check_number) {
                    const payload = { tenant_id, ledger_month: ledgerMonth, check_number, check_amount, check_date, disbursement };
                    setPayment(payload);
                }
            }
    
        }
    */
    return (
        <div>
            <Link to="/">Return to Property List</Link>

            <h2>{address}</h2>

            {/* Property Fees Table */}
            <PropertyTable className="property-fees table">
                <thead>
                    <tr className="table-success">
                        <CenteredTh>SCEP</CenteredTh>
                        <CenteredTh>RFD</CenteredTh>
                        <CenteredTh>Trash</CenteredTh>
                        <CenteredTh>Parking</CenteredTh>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {/* SCEP for this property, if applicable */}
                        <td>$<FeeInput data-fee="scep" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.scep || ''} /></td>

                        {/* RFD for this property, if applicable */}
                        <td>$<FeeInput data-fee="rfd" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.rfd || ''} /></td>

                        {/* Trash for this property, if applicable */}
                        <td>$<FeeInput data-fee="trash" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.trash || ''} /></td>

                        {/* Parking for this property, if applicable */}
                        <td>$<FeeInput data-fee="parking" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.parking || ''} /></td>
                    </tr>
                </tbody>
            </PropertyTable>

            {/* Payment Month Dropdown */}
            <div className="month-selector">
                <label htmlFor="ledgerMonth">Payment Month:</label>
                <select
                    id="ledgerMonth"
                    value={ledgerMonth}
                    onChange={(e) => setledgerMonth(e.target.value)}
                >
                    {generateMonthOptions()}
                </select>
            </div>

            {/* Units Table */}
            <table className="unit-payments table table-striped">
                {/* 
                <thead>
                    <tr className="table-success">
                        <CenteredTh>Unit</CenteredTh>
                        <CenteredTh>Rent</CenteredTh>
                        {feeCharged.scep && <CenteredTh>SCEP</CenteredTh>}
                        {feeCharged.rfd && <CenteredTh>RFD</CenteredTh>}
                        {feeCharged.trash && <CenteredTh>Trash</CenteredTh>}
                        {feeCharged.parking && <CenteredTh>Parking</CenteredTh>}
                        <CenteredTh>Monthly Total</CenteredTh>
                        <CenteredTh>Tenant</CenteredTh>
                        <CenteredTh>Check Number</CenteredTh>
                        <CenteredTh>Check Amount</CenteredTh>
                        <CenteredTh>Check Date</CenteredTh>
                    </tr>
                </thead>
                */}
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
