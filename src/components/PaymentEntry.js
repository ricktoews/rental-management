import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { format$, getDefaultCheckDate } from "../utils/helpers";
import { savePaymentRecord, deletePaymentRecord } from "../utils/apis";
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
    width: 125px;
`;

const CheckDateInput = styled(StyledInput)`
    width: 100px;
`;

function PaymentEntry({ tenantId, tenantRentAmount, tenantMonthlyFees, ledgerMonth, ledgerYear, ledgerId, paymentNdx, paymentData, setRefreshPayments }) {
    const pmtNo = paymentNdx + 1;
    const defaultCheckDate = getDefaultCheckDate(ledgerYear, ledgerMonth);
    const [dueRent, setDueRent] = useState(tenantRentAmount);
    const [dueFees, setDueFees] = useState();
    const [paidRent, setPaidRent] = useState(paymentData?.disbursement?.rent || '');
    const [lateFee, setLateFee] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paidFees, setPaidFees] = useState({});
    const [checkAmount, setCheckAmount] = useState(paymentData?.check_amount || '');
    const [checkNumber, setCheckNumber] = useState(paymentData?.check_number || '');
    const [checkDate, setCheckDate] = useState(defaultCheckDate);
    const [checkDataUpdate, setCheckDataUpdate] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [totalDue, setTotalDue] = useState('');
    const [totalPaid, setTotalPaid] = useState('');
    const [paymentDataEntered, setPaymentDataEntered] = useState(false);
    const calcTotalPaid = () => {
        let total = 1 * paidRent + 1 * lateFee;
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            total += (paidFees.hasOwnProperty(feeKey) ? 1 * paidFees[feeKey] : 0);
        })
        //        const total = (1 * rent + 1 * scep + 1 * rsd + 1 * trash + 1 * parking).toFixed(2);
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
        const due = getFeesForUnit(tenantMonthlyFees);

        let _totalDue = 1 * dueRent;

        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            _totalDue += (1 * due[feeKey] || 0);
        })

        _totalDue = _totalDue.toFixed(2); // ad hoc to fix the check amount. 
        setPaidRent(dueRent);
        setDueFees(due);
        setPaidFees(due);
        setTotalDue(_totalDue);
        //        setTotalPaid(0);
        if (pmtNo === 1) {
            setCheckAmount(_totalDue);
        }
    }, []);

    useEffect(() => {
        if (typeof paymentData === 'object' && Object.keys(paymentData).length > 0) {
            const due = getFeesForUnit(tenantMonthlyFees);
            setDueFees(due);
            const paid = getFeesForUnit(paymentData.paid_fees);
            let _totalDue = 1 * tenantRentAmount;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalDue += (due[feeKey] || 0);
            })
            let _totalPaid = 1 * paymentData.paid_rent + 1 * paymentData.late_fee;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalPaid += (paid[feeKey] || 0);
            })

            setPaidRent(1 * paymentData.paid_rent);
            setLateFee(1 * paymentData.late_fee);
            setDueFees(due);
            setPaidFees(paid);
            setCheckNumber(paymentData.check_number);
            // This needs to get updated
            setCheckAmount(paymentData.check_amount);
            setCheckDate(paymentData.check_date);
            setTotalDue(_totalDue);
            setTotalPaid(_totalPaid);
            setPaymentNotes(paymentData.notes);
            setPaymentDataEntered(true);
        } else {
            setCheckNumber('');
            setTotalPaid(0);
        }
    }, [paymentData])

    const handleSavePayment = async () => {
        if (!checkNumber || !checkAmount || Number.isNaN(checkAmount)) return;

        let _totalDue = 1 * tenantRentAmount;

        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            _totalDue += (1 * tenantMonthlyFees[feeKey] || 0);
        })

        const payload = {
            ledger_id: ledgerId,
            tenant_id: tenantId,
            ledger_year: ledgerYear,
            ledger_month: ledgerMonth,
            due_rent: tenantRentAmount,
            due_fees: tenantMonthlyFees,
            due_total: _totalDue,

            payment_ndx: paymentNdx,
            check_number: checkNumber,
            check_amount: 1 * checkAmount,
            check_date: checkDate,
            paid_rent: 1 * paidRent,
            late_fee: 1 * lateFee,
            paid_fees: paidFees,
            notes: paymentNotes
        };

        await savePaymentRecord(payload);
        setRefreshPayments(true);
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

    const handleLateFee = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setLateFee(el.value);
    }

    const handlePaymentNotes = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setPaymentNotes(el.value);
    }

    // I don't like this. It's a serious pain to have to deal with each breakdown (SCEP, RSD, &c.) in each place.
    const fillInCheckDisbursement = () => {
        setPaidRent(dueRent);
        setPaidFees(dueFees);
    }

    const handleCheckAmount = e => {
        const el = e.currentTarget;
        setIsDirty(true);
        setCheckAmount(el.value);

        if (el.value == totalDue) {
            fillInCheckDisbursement();
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
        if (isDirty) {
            setCheckDataUpdate(true);
        }
    }

    const handleSaveButton = async e => {
        console.log('====> handleSaveButton');
        await handleSavePayment();
        setCheckDataUpdate(false);
        setIsDirty(false);
        setRefreshPayments(true);
    }

    const handleDeletePayment = async ndx => {
        const payload = {
            ledger_id: ledgerId,
            payment_ndx: ndx
        }
        await deletePaymentRecord(payload);
        setRefreshPayments(true);
    }

    const recalcPaid = e => {
        calcTotalPaid();
        handleSaveIfDirty(e);
    }

    return <tbody data-paymentblock={paymentNdx}>
        <tr className="table-success">
            <td>
                {checkNumber && <button onClick={e => { handleDeletePayment(paymentNdx) }} style={{ marginRight: '10px' }} className="btn btn-warning">Delete</button>}
                Payment {pmtNo}: $<PaymentInput data-check="amount" onBlur={handleSaveIfDirty} onChange={handleCheckAmount} value={checkAmount} /></td>
            <td>Check # <CheckNoInput data-check="number" onBlur={handleSaveIfDirty} onChange={handleCheckNumber} value={checkNumber} /></td>
            <td>Date <CheckDateInput data-check="date" onBlur={handleSaveIfDirty} onChange={handleCheckDate} value={checkDate} />
                <button onClick={handleSaveButton} style={{ marginLeft: '10px' }} className="btn btn-warning">Save</button>
            </td>
        </tr>
        <tr>
            <td colSpan="3">
                <table className="table">
                    <tbody>
                        <tr>
                            <td>Rent</td>
                            <td>Late fee</td>
                            {FEES.map((feeObj, key) => {
                                const feeKey = Object.keys(feeObj)[0];
                                const feeValue = Object.values(feeObj)[0];
                                if (tenantMonthlyFees[feeKey] > 0) {
                                    return <td key={key}>{feeValue}</td>
                                } else {
                                    return null;
                                }
                            })}
                        </tr>
                        <tr>
                            <td>$<PaymentInput data-monthly="paid-rent" onBlur={recalcPaid} onChange={handlePaidRent} value={paidRent} /></td>
                            <td>$<PaymentInput data-monthly="paid-rent" onBlur={recalcPaid} onChange={handleLateFee} value={lateFee} /></td>
                            {FEES.map((feeObj, key) => {
                                const feeKey = Object.keys(feeObj)[0];
                                const feeValue = Object.values(feeObj)[0];
                                if (tenantMonthlyFees[feeKey] > 0) {
                                    return <td key={key}>$<PaymentInput data-monthly={feeKey} onBlur={recalcPaid} onChange={handlePaidFees} value={paidFees[feeKey] || ''} /></td>
                                } else {
                                    return null;
                                }
                            })}

                        </tr>
                    </tbody>
                </table>

            </td>
        </tr>
        <tr className="table-success">
            <td colSpan="3">Notes</td>
        </tr>
        <tr>
            <td colSpan="3">
                <textarea onChange={handlePaymentNotes} onBlur={handleSaveIfDirty} value={paymentNotes} />
            </td>
        </tr>
    </tbody>
}

export default PaymentEntry;
