import { useEffect, useState } from "react";
import styled from 'styled-components';
import { format$, getFirstDayOfNextMonth } from "../utils/helpers";
import { saveLedgerEntry } from '../utils/apis';
import { FEES } from "../config/constants";

const StyledInput = styled.input`
    border-radius: 4px;
    margin: 4px 0;
    border: 1px solid #ccc;
`;

const PaymentInput = styled(StyledInput)`
    width: 75px;
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

function LedgerEntry({ unit, month, ledgerData, feeCharged, propertyFees, defaultCheckDate, propertyMonthlyTotal, paymentsReceivedTotal }) {
    const [dueRent, setDueRent] = useState(unit.rent_amount);
    const [dueFees, setDueFees] = useState({});
    const [paidRent, setPaidRent] = useState(ledgerData?.disbursement?.rent || '');
    const [paidFees, setPaidFees] = useState({});
    const [checkAmount, setCheckAmount] = useState(ledgerData?.check_amount || '');
    const [checkNumber, setCheckNumber] = useState(ledgerData?.check_number || '');
    const [checkDate, setCheckDate] = useState(ledgerData?.check_date || getFirstDayOfNextMonth());
    const [checkDataUpdate, setCheckDataUpdate] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [totalDue, setTotalDue] = useState('');
    const [totalPaid, setTotalPaid] = useState('');
    const [ledgerDataEntered, setLedgerDataEntered] = useState(false);

    const calcTotalDue = () => {
        let total = 1 * dueRent;
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            total += 1 * dueFees[feeKey];
        })
        console.log('====> calcTotalDue', total);
        setTotalDue(total);
    }

    const calcTotalPaid = () => {
        let total = 1 * paidRent;
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            total += (paidFees.hasOwnProperty(feeKey) ? 1 * paidFees[feeKey] : 0);
        })
        //        console.log('====> calcTotalPaid paidFees', paidFees);
        //        const total = (1 * rent + 1 * scep + 1 * rfd + 1 * trash + 1 * parking).toFixed(2);
        setTotalPaid(total);
        setCheckAmount(total);
    }

    const getFeesForUnit = (fee_data = {}) => {
        const due = {};
        FEES.forEach(feeObj => {
            const fee = Object.keys(feeObj)[0];
            due[fee] = fee_data[fee] || 0;
        });
        return due;
    }

    useEffect(() => {
        let due = 0;
        if (unit.unit_fees) {
            due = getFeesForUnit(unit.unit_fees);
        } else {
            due = getFeesForUnit(propertyFees);
        }
        let _totalDue = 1 * dueRent;
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            _totalDue += (due[feeKey] || 0);
        })
        setPaidRent(dueRent);
        setDueFees(due);
        setPaidFees(due);
        setTotalDue(_totalDue);
        setTotalPaid(0);
        setCheckAmount(_totalDue);
    }, []);

    useEffect(() => {
        console.log('====> ledger data changed; check number', ledgerData?.check_number, 'data', ledgerData);
        if (typeof ledgerData === 'object' && Object.keys(ledgerData).length > 0) {
            const due = getFeesForUnit(ledgerData.due_fees);
            setDueFees(due);
            const paid = getFeesForUnit(ledgerData.paid_fees);
            let _totalDue = 1 * ledgerData.due_rent;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalDue += (due[feeKey] || 0);
            })
            let _totalPaid = 1 * ledgerData.paid_rent;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalPaid += (paid[feeKey] || 0);
            })

            setDueRent(1 * ledgerData.due_rent);
            setPaidRent(1 * ledgerData.paid_rent);
            setDueFees(due);
            setPaidFees(paid);
            setCheckNumber(ledgerData.check_number);
            setCheckAmount(ledgerData.check_amount);
            setCheckDate(ledgerData.check_date);
            setTotalDue(_totalDue);
            console.log('====> set total paid to _totalPaid', _totalPaid);
            setTotalPaid(_totalPaid);
            setLedgerDataEntered(true);
        } else {
            setCheckNumber('');
            setTotalPaid(0);
        }
    }, [ledgerData])

    useEffect(() => {
        if (isDirty && checkDataUpdate && checkNumber && checkAmount && checkDate) {
            console.log('====> Check information', checkAmount, checkNumber, checkDate);
            handleSaveLedger();
            setCheckDataUpdate(false);
            setIsDirty(false);
        }
    }, [checkDataUpdate]);

    const handleSaveLedger = () => {
        if (!checkNumber || !checkAmount) return;

        console.log('====> handleSaveLedger checkAmount', checkAmount);
        //        console.log('====> handleSaveLedger due', dueFees, 'paid', paidFees);
        const payload = {
            tenant_id,
            ledger_month: month,
            check_number: checkNumber,
            check_amount: 1 * checkAmount,
            check_date: checkDate,
            due_rent: 1 * dueRent,
            paid_rent: 1 * paidRent,
            due_fees: dueFees,
            paid_fees: paidFees

        };
        console.log('====> handleSaveLedger', payload);
        saveLedgerEntry(payload);
    }

    const handleDueRent = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setDueRent(el.value);
    }

    const handleDueFees = e => {
        const el = e.currentTarget;
        const due = el.value;
        const feeKey = el.dataset.monthly;
        setIsDirty(true);
        setDueFees({ ...dueFees, [feeKey]: due });
        //console.log('====> handleDueFees, fee', due, feeKey);
    }

    const handlePaidFees = e => {
        const el = e.currentTarget;
        if (el.value === '') return;

        const paid = el.value;
        const feeKey = el.dataset.monthly;
        setIsDirty(true);
        setPaidFees({ ...paidFees, [feeKey]: paid });
        console.log('====> handlePaidFees, fee', paid, feeKey);
    }

    const handlePaidRent = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidRent(el.value);
    }


    // I don't like this. It's a serious pain to have to deal with each breakdown (SCEP, RFD, &c.) in each place.
    const fillInCheckDisbursement = () => {
        setPaidRent(dueRent);
        setPaidFees(dueFees);
    }
    const clearCheckisbursement = () => {
        setPaidRent(0);
        setPaidFees({});
    }

    const handleCheckAmount = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        console.log('====> setting check amount to', el.value);
        setCheckAmount(el.value);

        if (el.value == totalDue) {
            fillInCheckDisbursement();
        } else {
            clearCheckisbursement();
        }
    }

    const handleCheckNumber = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        console.log('====> setting check number from check number change', el.value);
        setCheckNumber(el.value);
    }

    const handleCheckDate = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setCheckDate(el.value);
    }

    const handleSaveIfDirty = e => {
        console.log('====> if dirty, save', isDirty);
        if (isDirty) {
            setCheckDataUpdate(true);
        }
    }

    const recalcDue = e => {
        calcTotalDue();
        handleSaveIfDirty(e);
    }

    const recalcPaid = e => {
        calcTotalPaid();
        handleSaveIfDirty(e);
    }

    const tenant_id = unit.tenant_id;

    const style = { color: 'green' };
    return (
        <tbody className={`ledger-entry ${ledgerDataEntered ? 'entered' : ''}`}>
            <tr>
                <td>Unit {unit.unit_number}</td>
                <td colSpan={8}>Tenant: {unit.first_name} {unit.last_name}</td>
            </tr>
            <tr data-unit_id={unit.unit_id}>
                <td></td>
                {/* These amounts should default to values from units but saved to ledger table. */}

                {/* Rent due this month */}
                <td>Due this month:  <b>Rent</b> $<input data-monthly="due-rent" onBlur={recalcDue} onChange={handleDueRent} value={dueRent} /></td>

                {FEES.map((feeObj, key) => {
                    const feeKey = Object.keys(feeObj)[0];
                    const feeValue = Object.values(feeObj)[0];
                    if (propertyFees[feeKey] > 0) {
                        return <td key={key}><b>{feeValue}</b> $<input data-monthly={feeKey} onBlur={recalcDue} onChange={handleDueFees} value={dueFees[feeKey] || ''} /></td>
                    } else {
                        return null;
                    }
                })}

                {/* Total due this month (should match check amount in most cases) */}
                <td>Total due: {format$(totalDue)}</td>

                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr data-tenant_id={tenant_id}>
                <td></td>

                {/* Check amount received this month (should match total due this month) */}
                <td><b>Check amount</b> $<PaymentInput data-check="amount" onBlur={handleSaveIfDirty} onChange={handleCheckAmount} value={checkAmount} /></td>

                <td><b>Check #</b> <CheckNoInput data-check="number" onBlur={handleSaveIfDirty} onChange={handleCheckNumber} value={checkNumber} /></td>

                <td><b>Date</b> <CheckDateInput data-check="date" onBlur={handleSaveIfDirty} onChange={handleCheckDate} value={checkDate} /></td>

                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr data-tenant_id={tenant_id}>
                <td></td>

                {/* Rent payment received this month */}
                <td>Paid this month: <b>Rent</b> $<input data-monthly="paid-rent" onBlur={recalcPaid} onChange={handlePaidRent} value={paidRent} /></td>

                {FEES.map((feeObj, key) => {
                    const feeKey = Object.keys(feeObj)[0];
                    const feeValue = Object.values(feeObj)[0];
                    if (propertyFees[feeKey] > 0) {
                        return <td key={key}><b>{feeValue}</b> $<input data-monthly={feeKey} onBlur={recalcPaid} onChange={handlePaidFees} value={paidFees[feeKey] || ''} /></td>
                    } else {
                        return null;
                    }
                })}


                <td>{totalPaid > 0 && `Total paid: ${format$(totalPaid)}` || null}</td>

                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>

    )
}

export default LedgerEntry;