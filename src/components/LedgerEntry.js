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
function LedgerEntry({ unit, ledgerMonth, ledgerYear, ledgerData = {} }) {
    const { tenant_rent_amount, tenant_monthly_fees } = unit;
    const { due_rent, due_fees } = ledgerData;
    const [ledgerId, setLedgerId] = useState();
    const [dueRent, setDueRent] = useState(unit.tenant_rent_amount || 0);
    const [dueFees, setDueFees] = useState(unit.tenant_monthly_fees || {});
    const [totalDue, setTotalDue] = useState('');
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
            const tenantIds = [tenant_id];
            getPayments(ledgerYear, ledgerMonth, tenantIds)
                .then(res => {
                    const updatedLedger = res[0];
                    setPayments(updatedLedger.payments);
                    setRefreshPayments(false);
                });
        }
    }, [refreshPayments])

    const getFeesForUnit = (fee_data = {}) => {
        const due = {};
        FEES.forEach(feeObj => {
            const fee = Object.keys(feeObj)[0];
            due[fee] = fee_data[fee] || 0;
        });
        return due;
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
            <tr><td colSpan="3"><table className="table">
                {payments.map((pmt, key) => {
                    return (
                        <PaymentEntry key={key}
                            tenantId={tenant_id}
                            tenantRentAmount={due_rent}
                            tenantMonthlyFees={due_fees}
                            ledgerMonth={ledgerMonth}
                            ledgerYear={ledgerYear}
                            ledgerId={ledgerId}
                            paymentNdx={key}
                            paymentData={pmt}
                            setRefreshPayments={setRefreshPayments}
                        />
                    );
                })}
                <PaymentEntry
                    tenantId={tenant_id}
                    tenantRentAmount={tenant_rent_amount}
                    tenantMonthlyFees={tenant_monthly_fees}
                    ledgerMonth={ledgerMonth}
                    ledgerYear={ledgerYear}
                    ledgerId={ledgerId}
                    paymentNdx={payments.length}
                    paymentData={{}}
                    setRefreshPayments={setRefreshPayments}
                    newEntry={true}
                />

            </table></td></tr>
        </tbody>
    </>
    )
}

export default LedgerEntry;
