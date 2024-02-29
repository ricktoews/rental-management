import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLedgerCard } from '../utils/apis.js';
import { format$, readableDateFormat } from '../utils/helpers.js';
import { fmtLedgerDate } from './LedgerCardUtils.js';

function LedgerCardPayment(props) {
    const { ledgerData, payment, entry } = props;
    let balance = props.balance;
    const fmtCheckDate = readableDateFormat(payment.check_date);

    return (<>
        <tr>
            <td>{ledgerData.first_name}</td>
            <td>{ledgerData.last_name}</td>
            <td>{fmtCheckDate}</td>
            <td></td>
            <td>{format$(payment.check_amount)}</td>
            <td>{payment.check_number}</td>
            <td>{format$(balance)}</td>
        </tr>
        {entry.notes && (
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td colSpan="4">{payment.notes}</td>
            </tr>
        )}
    </>);
}

function LedgerCard() {
    const { tenantId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);
    const [address, setAddress] = useState('');

    useEffect(() => {
        // Fetch ledger card data when the component loads
        if (tenantId) {
            getLedgerCard(tenantId)
                .then((data) => {
                    setLedgerData(data)
                    setAddress(data.address);
                })
                .catch((error) => {
                    console.error('Error fetching ledger data:', error);
                });
        }
    }, [tenantId]);

    // Check if ledgerData is empty, and return null if it is
    if (ledgerData.length === 0) {
        return null;
    }
    let balance = ledgerData.starting_balance;
    return (
        <div>
            <Link to={`/property/edit/${ledgerData.property_id}`}>Return to Property Page</Link>

            <h1>Ledger Card for {ledgerData.first_name} {ledgerData.last_name}</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Date</th>
                        <th>Current due</th>
                        <th>Received</th>
                        <th>Check number</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    { ledgerData.security_deposit > 0 && (
                    <tr>
                        <td>{ledgerData.first_name}</td>
                        <td>{ledgerData.last_name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Security deposit</td>
                        <td>{format$(ledgerData.security_deposit)}</td>
                    </tr>
                    )}
                    <tr>
                        <td>{ledgerData.first_name}</td>
                        <td>{ledgerData.last_name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Starting balance</td>
                        <td>{format$(ledgerData.starting_balance)}</td>
                    </tr>
                </tbody>
                {ledgerData.ledger_months.map((entry, key) => {
                    balance = balance + entry.due_total;
                    const ledgerDate = fmtLedgerDate(entry.ledger_year, entry.ledger_month);
                    return (
                        <tbody key={key}>
                            <tr>
                                <td>{ledgerData.first_name}</td>
                                <td>{ledgerData.last_name}</td>
                                <td>{ledgerDate}</td>
                                <td>{format$(entry.due_total)}</td>
                                <td></td>
                                <td></td>
                                <td>{format$(balance)}</td>
                            </tr>
                            {entry.payments.map((payment, pmtKey) => {
                                balance -= payment.check_amount;
                                return <LedgerCardPayment key={pmtKey} balance={balance} ledgerData={ledgerData} payment={payment} entry={entry} />
                            })}
                        </tbody>
                    )
                })}
            </table>

        </div>
    );
}

export default LedgerCard;
