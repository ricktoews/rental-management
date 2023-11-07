import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { format$, getFirstDayOfNextMonth } from "../utils/helpers";
import { saveLedgerEntry } from '../utils/apis';

const StyledInput = styled.input`
    border-radius: 4px;
    margin: 4px 0;
    border: 1px solid #ccc;
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

function LedgerEntry({ unit, month, ledgerData, feeCharged, propertyFees, defaultCheckDate, propertyMonthlyTotal, paymentsReceivedTotal }) {
    const [dueRent, setDueRent] = useState(unit.rent_amount);
    const [dueSCEP, setDueSCEP] = useState(unit.unit_fees?.scep || '');
    const [dueRFD, setDueRFD] = useState(unit.unit_fees?.rfd || '');
    const [dueTrash, setDueTrash] = useState(unit.unit_fees?.Trash || '');
    const [dueParking, setDueParking] = useState(unit.unit_fees?.Parking || '');
    const [paidRent, setPaidRent] = useState(ledgerData?.disbursement?.rent || '');
    const [paidSCEP, setPaidSCEP] = useState(ledgerData?.disbursement?.scep || '');
    const [paidRFD, setPaidRFD] = useState(ledgerData?.disbursement?.rfd || '');
    const [paidTrash, setPaidTrash] = useState(ledgerData?.disbursement?.trash || '');
    const [paidParking, setPaidParking] = useState(ledgerData?.disbursement?.parking || '');
    const [checkAmount, setCheckAmount] = useState(ledgerData?.check_amount || '');
    const [checkNumber, setCheckNumber] = useState(ledgerData?.check_number || '');
    const [checkDate, setCheckDate] = useState(ledgerData?.check_date || getFirstDayOfNextMonth());
    const [checkDataUpdate, setCheckDataUpdate] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [totalDue, setTotalDue] = useState('');
    const [totalPaid, setTotalPaid] = useState('');

    const calcTotalDue = (rent = 0, scep = 0, rfd = 0, trash = 0, parking = 0) => {
        const total = (1 * rent + 1 * scep + 1 * rfd + 1 * trash + 1 * parking).toFixed(2);
        console.log('====> calcTotalDue', total);
        setTotalDue(total);
    }

    const calcTotalPaid = (rent = 0, scep = 0, rfd = 0, trash = 0, parking = 0) => {
        const total = (1 * rent + 1 * scep + 1 * rfd + 1 * trash + 1 * parking).toFixed(2);
        setTotalPaid(total);
        setCheckAmount(total);
    }

    useEffect(() => {
        if (ledgerData) {
            console.log('====> LedgerEntry, ledgerData', ledgerData, 'unit', unit);
            if (!ledgerData?.due_this_month) {
                // Set due amounts to defaults.
                const { scep, rfd, trash, parking } = (unit.unit_fees || {});
                setDueRent(unit.rent_amount);
                setDueSCEP(scep);
                setDueRFD(rfd);
                setDueTrash(trash);
                setDueParking(parking);
                calcTotalDue(unit.rent_amount, scep, rfd, trash, parking);
            } else {
                // Set due amounts to data from ledger table.
                const { rent, scep, rfd, trash, parking } = ledgerData.due_this_month;
                setDueRent(rent);
                setDueSCEP(scep);
                setDueRFD(rfd);
                setDueTrash(trash);
                setDueParking(parking);
                calcTotalDue(rent, scep, rfd, trash, parking);
            }
            if (!ledgerData?.disbursement) {
                // Set default payment amounts
            } else {
                // Set payment amounts from ledger table.
                const { rent, scep, rfd, trash, parking } = ledgerData.disbursements;
                setPaidRent(rent);
                setPaidSCEP(scep);
                setPaidRFD(rfd);
                setPaidTrash(trash);
                setPaidParking(parking);
                calcTotalPaid(rent, scep, rfd, trash, parking);
            }

            setCheckAmount(ledgerData.check_amount);
            setCheckNumber(ledgerData.check_number);
            setCheckDate(ledgerData.check_date);

        }
        else {
            const rent = unit.rent_amount;
            const scep = unit.unit_fees?.scep || 0;
            const rfd = unit.unit_fees?.rfd || 0;
            const trash = unit.unit_fees?.trash || 0;
            const parking = unit.unit_fees?.parking || 0;
            setTotalDue(rent + scep + rfd + trash + parking);
            setPaidRent(rent);
            setPaidSCEP(scep);
            setPaidRFD(rfd);
            setPaidTrash(trash);
            setPaidParking(parking);
            calcTotalPaid(rent, scep, rfd, trash, parking);
            setCheckAmount(rent + scep + rfd + trash + parking);

        }
    }, [ledgerData]);

    useEffect(() => {
        if (isDirty && checkDataUpdate && checkNumber && checkAmount && checkDate) {
            console.log('====> Check information', checkAmount, checkNumber, checkDate);
            handleSaveLedger();
            setCheckDataUpdate(false);
            setIsDirty(false);
        }
    }, [checkDataUpdate]);

    const handleSaveLedger = () => {
        if (!checkNumber) return;

        const payload = {
            tenant_id,
            ledger_month: month,
            check_number: checkNumber,
            check_amount: 1 * checkAmount,
            check_date: checkDate,
            due_this_month: { rent: 1 * dueRent, scep: 1 * dueSCEP, rfd: 1 * dueRFD, trash: 1 * dueTrash, parking: 1 * dueParking },
            disbursement: { rent: 1 * paidRent, scep: 1 * paidSCEP, rfd: 1 * paidRFD, trash: 1 * paidTrash, parking: 1 * paidParking }

        };
        console.log('====> handleSaveLedger', payload);
        saveLedgerEntry(payload);
    }

    const handleDueRent = e => {
        const el = e.currentTarget;
        setDueRent(el.value);
    }

    const handleDueSCEP = e => {
        const el = e.currentTarget;
        setDueSCEP(el.value);
    }

    const handleDueRFD = e => {
        const el = e.currentTarget;
        setDueRFD(el.value);
    }

    const handleDueTrash = e => {
        const el = e.currentTarget;
        setDueTrash(el.value);
    }

    const handleDueParking = e => {
        const el = e.currentTarget;
        setDueParking(el.value);
    }

    const handlePaidRent = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidRent(el.value);
    }

    const handlePaidSCEP = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidSCEP(el.value);
    }

    const handlePaidRFD = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidRFD(el.value);
    }

    const handlePaidTrash = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidTrash(el.value);
    }

    const handlePaidParking = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaidParking(el.value);
    }

    // I don't like this. It's a serious pain to have to deal with each breakdown (SCEP, RFD, &c.) in each place.
    const fillInCheckDisbursement = () => {
        setPaidRent(dueRent);
        setPaidSCEP(dueSCEP);
        setPaidRFD(dueRFD);
        setPaidTrash(dueTrash);
        setPaidParking(dueParking);
    }
    const clearCheckisbursement = () => {
        setPaidRent(0);
        setPaidSCEP(0);
        setPaidRFD(0);
        setPaidTrash(0);
        setPaidParking(0);
    }

    const handleCheckAmount = e => {
        const el = e.currentTarget;
        setIsDirty(true);
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
        calcTotalDue(dueRent, dueSCEP, dueRFD, dueTrash, dueParking);
    }

    const recalcPaid = e => {
        calcTotalPaid(paidRent, paidSCEP, paidRFD, paidTrash, paidParking);
        handleSaveIfDirty(e);
    }

    const tenant_id = unit.tenant_id;

    return (
        <tbody className="ledger-entry">
            <tr>
                <td>Unit <Link to={`/ledger-card/${unit.unit_id}`}>{unit.unit_number}</Link></td>
                <td colSpan={8}>Tenant: {unit.first_name} {unit.last_name}</td>
            </tr>
            <tr data-unit_id={unit.unit_id}>
                <td></td>
                {/* These amounts should default to values from units but saved to ledger table. */}

                {/* Rent due this month */}
                <td>Due this month:  <b>Rent</b> <input data-monthly="due-rent" onBlur={recalcDue} onChange={handleDueRent} value={dueRent} /></td>

                {/* SCEP due this month (if applicable) */}
                {feeCharged.scep && <td><b>SCEP</b> <input data-monthly="due-scep" onBlur={recalcDue} onChange={handleDueSCEP} value={dueSCEP} /></td>}

                {/* RFD due this month (if applicable) */}
                {feeCharged.rfd && <td><b>RFD</b> <input data-monthly="due-rfd" onBlur={recalcDue} onChange={handleDueRFD} value={dueRFD} /></td>}

                {/* Trash due this month (if applicable) */}
                {feeCharged.trash && <td><b>Trash</b> <input data-monthly="due-trash" onBlur={recalcDue} onChange={handleDueTrash} value={dueTrash} /></td>}

                {/* Parking due this month (if applicable) */}
                {feeCharged.parking && <td><b>Parking</b> <input data-monthly="due-parking" onBlur={recalcDue} onChange={handleDueParking} value={dueParking} /></td>}

                {/* Total due this month (should match check amount in most cases) */}
                <td>Total due: {format$(totalDue)}</td>

                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr data-tenant_id={tenant_id}>
                <td></td>

                {/* Check amount received this month (should match total due this month) */}
                <td><b>Check amount</b> <PaymentInput data-check="amount" onBlur={handleSaveIfDirty} onChange={handleCheckAmount} defaultValue={checkAmount} /></td>

                <td><b>Check #</b> <CheckNoInput data-check="number" onBlur={handleSaveIfDirty} onChange={handleCheckNumber} defaultValue={checkNumber} /></td>

                <td><b>Date</b> <CheckDateInput data-check="date" onBlur={handleSaveIfDirty} onChange={handleCheckDate} defaultValue={checkDate} /></td>

                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr data-tenant_id={tenant_id}>
                <td></td>

                {/* Rent payment received this month */}
                <td>Paid this month: <b>Rent</b> <input data-monthly="paid-rent" onBlur={recalcPaid} onChange={handlePaidRent} value={paidRent} /></td>

                {/* SCEP payment received this month, if applicable */}
                {feeCharged.scep && <td><b>SCEP</b> <input data-monthly='paid-scep' onBlur={recalcPaid} onChange={handlePaidSCEP} value={paidSCEP} /></td>}

                {/* RFD payment received this month, if applicable */}
                {feeCharged.rfd && <td><b>RFD</b> <input data-monthly='paid-rfd' onBlur={recalcPaid} onChange={handlePaidRFD} value={paidRFD} /></td>}

                {/* Trash payment received this month, if applicable */}
                {feeCharged.trash && <td><b>Trash</b> <input data-monthly='paid-trash' onBlur={recalcPaid} onChange={handlePaidTrash} value={paidTrash} /></td>}

                {/* Parking payment received this month, if applicable */}
                {feeCharged.parking && <td><b>Parking</b> <input data-monthly='paid-parking' onBlur={recalcPaid} onChange={handlePaidParking} value={paidParking} /></td>}

                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>

    )
}

export default LedgerEntry;