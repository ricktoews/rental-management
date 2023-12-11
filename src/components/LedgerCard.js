import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLedgerCard } from '../utils/apis.js';
import { processLedgerData } from './LedgerCardUtils.js';
import { FEES, MONTH_NAMES } from '../config/constants';

function LedgerCard() {
    const { tenantId } = useParams();
    console.log('====> LedgerCard', tenantId);
    const [ledgerData, setLedgerData] = useState([]);
    const [address, setAddress] = useState('');
    const [tenantName, setTenantName] = useState('');

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
                    <tr>
                        <td>{ledgerData.first_name}</td>
                        <td>{ledgerData.last_name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Starting balance</td>
                        <td>{ledgerData.starting_balance}</td>
                    </tr>
                </tbody>
                {ledgerData.ledger_months.map((entry, key) => {
                    const balance1 = balance + entry.due_total;
                    const balance2 = balance1 - entry.paid_total;
                    balance = balance2;
                    return (
                        <tbody key={key}>
                            <tr>
                                <td>{ledgerData.first_name}</td>
                                <td>{ledgerData.last_name}</td>
                                <td>{entry.check_date}</td>
                                <td>{entry.due_total}</td>
                                <td></td>
                                <td></td>
                                <td>{balance1}</td>
                            </tr>
                            <tr>
                                <td>{ledgerData.first_name}</td>
                                <td>{ledgerData.last_name}</td>
                                <td>{entry.check_date}</td>
                                <td></td>
                                <td>{entry.paid_total}</td>
                                <td>{entry.check_number}</td>
                                <td>{balance2}</td>
                            </tr>
                        </tbody>
                    )
                })}
            </table>

        </div>
    );
}

export default LedgerCard;
