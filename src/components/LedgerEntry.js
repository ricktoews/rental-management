import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { format$, getDefaultCheckDate, getFirstDayOfNextMonth } from "../utils/helpers";
import PaymentEntry from "./PaymentEntry";
import { saveLedgerEntry, getPayments } from '../utils/apis';
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

// unit includes the tenant rent and fees owned, from the tenants table.
function LedgerEntry({ unit, ledgerData = {} }) {
    const { tenant_rent_amount, tenant_monthly_fees } = unit;
    const { ledger_month, ledger_year } = ledgerData;
    const { due_rent, due_fees } = ledgerData;
    const defaultCheckDate = getDefaultCheckDate(ledger_year, ledger_month);
    const [ledgerId, setLedgerId] = useState();
    const [paymentNdx, setPaymentNdx] = useState();
    const [dueRent, setDueRent] = useState(unit.tenant_rent_amount || 0);
    const [dueFees, setDueFees] = useState(unit.tenant_monthly_fees || {});
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
    const [paymentUpdated, setPaymentUpdated] = useState(false);
    const [refreshPayments, setRefreshPayments] = useState(false);

    const [balance, setBalance] = useState(0);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        setLedgerId(ledgerData.ledger_id);
        const due = getFeesForUnit(unit.tenant_monthly_fees);

        let _totalDue = 1 * dueRent;

        FEES.forEach(feeObj => {
            const feeKey = Object.keys(feeObj)[0];
            _totalDue += (1 * due[feeKey] || 0);
        })
        _totalDue = _totalDue.toFixed(2); // ad hoc to fix the check amount. 
        setDueFees(due);
        setTotalDue(_totalDue);
        setBalance(_totalDue);
    }, [ledgerData.ledger_id]);

    useEffect(() => {
        if (ledgerData.payments) {
            setPayments(ledgerData.payments);

        }
    }, [ledgerData.payments]);

    useEffect(() => {
        if (refreshPayments) {
            const ledgerYear = ledgerData.ledger_year;
            const ledgerMonth = ledgerData.ledger_month;
            const tenantIds = [ledgerData.tenant_id];
            getPayments(ledgerYear, ledgerMonth, tenantIds)
                .then(res => {
                    const updatedLedger = res[0];
                    console.log('====> refreshPayments; getPayments', updatedLedger)
                    setPayments(updatedLedger.payments);
                    setRefreshPayments(false);
                });
        }
    }, [refreshPayments])

    useEffect(() => {
        if (paymentUpdated) {
            setPaymentUpdated(false);
        }
    }, [paymentUpdated])

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
    /*
    
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
            if (ledgerData.ledger_id) {
                setPayments([]);
                const due = getFeesForUnit(due_fees);
                setDueFees(due);
                const paid = getFeesForUnit(ledgerData.paid_fees);
                let _totalDue = 1 * due_rent;
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
    
                setPayments(ledgerData.payments);
            } else {
    
                setCheckNumber('');
                setTotalPaid(0);
                setPayments([]);
            }
    
        }, [ledgerData.ledger_id])
        */
    /*
        useEffect(() => {
            if (isDirty && checkDataUpdate && checkNumber && checkAmount && checkDate) {
                handleSaveLedger();
                setCheckDataUpdate(false);
                setIsDirty(false);
            }
        }, [checkDataUpdate]);
    */
    /*
        const handleSaveLedger = () => {
            if (!checkNumber || !checkAmount) return;
    
            console.log('====> handleSaveLedger ledgerId', ledgerId, 'Payment Ndx', paymentNdx, 'checkAmount', checkAmount);
            //        console.log('====> handleSaveLedger due', dueFees, 'paid', paidFees);
            const payload = {
                tenant_id,
                ledger_month,
                ledger_year,
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
    */
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
            <tr><td colSpan="3"><table className="table">
                {payments.map((pmt, key) => {
                    return (
                        <PaymentEntry key={key}
                            tenantRentAmount={due_rent}
                            tenantMonthlyFees={due_fees}
                            ledgerMonth={ledger_month}
                            ledgerYear={ledger_year}
                            ledgerId={ledgerId}
                            paymentNdx={key}
                            paymentData={pmt}
                            setPaymentUpdated={setPaymentUpdated}
                            setRefreshPayments={setRefreshPayments}
                        />
                    );
                })}
                <PaymentEntry
                    tenantRentAmount={tenant_rent_amount}
                    tenantMonthlyFees={tenant_monthly_fees}
                    ledgerMonth={ledger_month}
                    ledgerYear={ledger_year}
                    ledgerId={ledgerId}
                    paymentNdx={payments.length}
                    paymentData={{}}
                    setPaymentUpdated={setPaymentUpdated}
                    setRefreshPayments={setRefreshPayments}
                    newEntry={true}
                />

            </table></td></tr>
        </tbody>
    </>
    )
}

export default LedgerEntry;
