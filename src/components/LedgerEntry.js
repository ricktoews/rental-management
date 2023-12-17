import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { format$, getDefaultCheckDate, getFirstDayOfNextMonth } from "../utils/helpers";
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
    width: 125px;
`;

const CheckDateInput = styled(StyledInput)`
    width: 100px;
`;

const Money = styled.td`
text-align: right;
`;

function LedgerEntry({ unit, ledgerMonth, ledgerYear, ledgerData }) {
    const defaultCheckDate = getDefaultCheckDate(ledgerYear, ledgerMonth);
    const [ledgerId, setLedgerId] = useState();
    const [paymentNdx, setPaymentNdx] = useState();
    const [dueRent, setDueRent] = useState(unit.tenant_rent_amount);
    const [dueFees, setDueFees] = useState({});
    const [paidRent, setPaidRent] = useState(ledgerData?.disbursement?.rent || '');
    const [lateFee, setLateFee] = useState('');
    const [ledgerNotes, setLedgerNotes] = useState('');
    const [paidFees, setPaidFees] = useState({});
    const [checkAmount, setCheckAmount] = useState(ledgerData?.check_amount || '');
    const [checkNumber, setCheckNumber] = useState(ledgerData?.check_number || '');
    const [checkDate, setCheckDate] = useState(defaultCheckDate);
    const [checkDataUpdate, setCheckDataUpdate] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [totalDue, setTotalDue] = useState('');
    const [totalPaid, setTotalPaid] = useState('');
    const [ledgerDataEntered, setLedgerDataEntered] = useState(false);

    const [payments, setPayments] = useState([]);

    const calcTotalDue = () => {
        let total = 1 * dueRent;
        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            total += 1 * dueFees[feeKey];
        })
        setTotalDue(total);
    }

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

    const addPayment = (newPayment) => {
        setPayments((prevPayments) => [...prevPayments, newPayment]);
    }

    useEffect(() => {
        const due = getFeesForUnit(unit.tenant_monthly_fees);

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
        setTotalPaid(0);
        setCheckAmount(_totalDue);

        const payment = {
            paidRent: 0,
            paidFees: {},
            lateFee: 0,
            checkNumber: '',
            checkAmount: 0,
            checkDate: '',
            ledgerNotes: ''
        }

        addPayment(payment);
    }, []);

    useEffect(() => {
        if (typeof ledgerData === 'object' && Object.keys(ledgerData).length > 0) {
            setPayments([]);
            const due = getFeesForUnit(ledgerData.due_fees);
            setDueFees(due);
            const paid = getFeesForUnit(ledgerData.paid_fees);
            let _totalDue = 1 * ledgerData.due_rent;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalDue += (due[feeKey] || 0);
            })
            let _totalPaid = 1 * ledgerData.paid_rent + 1 * ledgerData.late_fee;
            FEES.forEach(feeObj => {
                const feeKey = Object.keys(feeObj)[0];
                _totalPaid += (paid[feeKey] || 0);
            })
            setLedgerId(ledgerData.ledger_id);
            setDueRent(1 * ledgerData.due_rent);
            setPaidRent(1 * ledgerData.paid_rent);
            setLateFee(1 * ledgerData.late_fee);
            setDueFees(due);
            setPaidFees(paid);
            setCheckNumber(ledgerData.check_number);
            setCheckAmount(ledgerData.check_amount);
            setCheckDate(ledgerData.check_date);
            setTotalDue(_totalDue);
            setTotalPaid(_totalPaid);
            setLedgerNotes(ledgerData.notes);
            setLedgerDataEntered(true);

            const payment = {
                paidRent: ledgerData.paid_rent,
                paidFees: paid,
                lateFee: ledgerData.late_fee,
                checkNumber: ledgerData.check_number,
                checkAmount: ledgerData.check_amount,
                checkDate: ledgerData.check_date,
                ledgerNotes: ledgerData.notes
            }

            addPayment(payment);

            const paymentBlank = {
                paidRent: 0,
                paidFees: {},
                lateFee: 0,
                checkNumber: '',
                checkAmount: 0,
                checkDate: '',
                ledgerNotes: ''
            }
            addPayment(paymentBlank);

        } else {
            setCheckNumber('');
            setTotalPaid(0);

            setPayments([]);
        }
    }, [ledgerData])

    useEffect(() => {
        console.log('====> checkDataUpdate');
        if (isDirty && checkDataUpdate && checkNumber && checkAmount && checkDate) {
            console.log('====> Check information', checkAmount, checkNumber, checkDate);
            handleSaveLedger();
            setCheckDataUpdate(false);
            setIsDirty(false);
        }
    }, [checkDataUpdate]);

    const handleSaveLedger = () => {
        if (!checkNumber || !checkAmount) return;

        console.log('====> handleSaveLedger ledgerId', ledgerId, 'Payment Ndx', paymentNdx, 'checkAmount', checkAmount);
        //        console.log('====> handleSaveLedger due', dueFees, 'paid', paidFees);
        const payload = {
            tenant_id,
            ledger_month: ledgerMonth,
            ledger_year: ledgerYear,
            payment_ndx: paymentNdx,
            check_number: checkNumber,
            check_amount: 1 * checkAmount,
            check_date: checkDate,
            due_rent: 1 * dueRent,
            paid_rent: 1 * paidRent,
            late_fee: 1 * lateFee,
            due_fees: dueFees,
            paid_fees: paidFees,
            notes: ledgerNotes

        };
        console.log('====> handleSaveLedger', payload);
        //        saveLedgerEntry(payload);
    }

    const getPaymentBlockNdx = currentEl => {
        const containingPaymentBlock = currentEl.closest('tbody[data-paymentblock]');
        const dataset = containingPaymentBlock.dataset;
        const ndx = dataset.paymentblock;
        return ndx;
    }

    const handlePaidFees = e => {
        const el = e.currentTarget;
        if (el.value === '') return;

        const paid = el.value;
        const feeKey = el.dataset.monthly;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        setIsDirty(true);
        setPaidFees({ ...paidFees, [feeKey]: paid });
        console.log('====> handlePaidFees, fee', paid, feeKey);
    }

    const handlePaidRent = e => {
        const el = e.currentTarget;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        setIsDirty(true);
        setPaidRent(el.value);
    }

    const handleLateFee = e => {
        const el = e.currentTarget;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        setIsDirty(true);
        setLateFee(el.value);
    }

    const handleLedgerNotes = e => {
        const el = e.currentTarget;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        console.log('====> handleLedgerNotes; payment block', pmtNdx);
        setIsDirty(true);
        setLedgerNotes(el.value);
    }

    // I don't like this. It's a serious pain to have to deal with each breakdown (SCEP, RSD, &c.) in each place.
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
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        setIsDirty(true);
        setCheckAmount(el.value);

        if (el.value == totalDue) {
            fillInCheckDisbursement();
        } else {
            //clearCheckisbursement();
        }
    }

    const handleCheckNumber = e => {
        const el = e.currentTarget;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
        setIsDirty(true);
        console.log('====> setting check number from check number change', el.value);
        setCheckNumber(el.value);
    }

    const handleCheckDate = e => {
        const el = e.currentTarget;
        const pmtNdx = getPaymentBlockNdx(el);
        setPaymentNdx(pmtNdx);
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

    return (<>
        <tbody className="ledger-entry">
            <tr>
                <td colSpan="3"><b>Unit {unit.unit_number}</b>: <Link to={`/tenant-details/${unit.tenant_id}`}>{unit.first_name} {unit.last_name}</Link> <Link to={`/ledger-card/${unit.tenant_id}`}>Ledger Card</Link></td>
            </tr>
            <tr className="table-success">
                <td colSpan="3">Due this month: {format$(totalDue)}</td>
            </tr>
            <tr>
                <td colSpan="3">
                    <table className="table">
                        <tbody style={{ fontSize: '10pt' }}>
                            <tr>
                                <td><b>Rent</b></td>
                                {FEES.map((feeObj, key) => {
                                    const feeKey = Object.keys(feeObj)[0];
                                    const feeValue = Object.values(feeObj)[0];
                                    if (unit.tenant_monthly_fees[feeKey] > 0) {
                                        return <td key={key}><b>{feeValue}</b></td>
                                    } else {
                                        return null;
                                    }
                                })}
                            </tr>
                            <tr>
                                <td>${dueRent}</td>
                                {FEES.map((feeObj, key) => {
                                    const feeKey = Object.keys(feeObj)[0];
                                    const feeValue = Object.values(feeObj)[0];
                                    if (unit.tenant_monthly_fees[feeKey] > 0) {
                                        return <td key={key}>${dueFees[feeKey]}</td>
                                    } else {
                                        return null;
                                    }
                                })}


                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            {payments.map((pmt, key) => {
                const pmtNo = key + 1;
                return (
                    <tbody data-paymentblock={key}>
                        <tr className="table-success" data-tenant_id={tenant_id}>
                            {/* Check amount received this month (should match total due this month) */}
                            <td>Payment {pmtNo}: $<PaymentInput data-check="amount" onBlur={handleSaveIfDirty} onChange={handleCheckAmount} value={pmt.checkAmount} /></td>
                            <td>Check # <CheckNoInput data-check="number" onBlur={handleSaveIfDirty} onChange={handleCheckNumber} value={pmt.checkNumber} /></td>
                            <td>Check Date <CheckDateInput data-check="date" onBlur={handleSaveIfDirty} onChange={handleCheckDate} value={pmt.checkDate} /></td>
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
                                                if (unit.tenant_monthly_fees[feeKey] > 0) {
                                                    return <td key={key}>{feeValue}</td>
                                                } else {
                                                    return null;
                                                }
                                            })}
                                        </tr>
                                        <tr>
                                            <td>$<PaymentInput data-monthly="paid-rent" onBlur={recalcPaid} onChange={handlePaidRent} value={pmt.paidRent} /></td>
                                            <td>$<PaymentInput data-monthly="paid-rent" onBlur={recalcPaid} onChange={handleLateFee} value={pmt.lateFee} /></td>
                                            {FEES.map((feeObj, key) => {
                                                const feeKey = Object.keys(feeObj)[0];
                                                const feeValue = Object.values(feeObj)[0];
                                                if (unit.tenant_monthly_fees[feeKey] > 0) {
                                                    return <td key={key}>$<PaymentInput data-monthly={feeKey} onBlur={recalcPaid} onChange={handlePaidFees} value={pmt.paidFees[feeKey] || ''} /></td>
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
                                <textarea onChange={handleLedgerNotes} onBlur={handleSaveIfDirty} value={pmt.ledgerNotes} />
                            </td>
                        </tr>
                    </tbody>

                );
            })}

        </tbody>
    </>
    )
}

export default LedgerEntry;
