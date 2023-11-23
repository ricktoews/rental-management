import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLedgerCard } from '../utils/apis.js';
import { processLedgerData } from './LedgerCardUtils.js';
import { FEES, MONTH_NAMES } from '../config/constants';

function LedgerCard() {
    const { unitId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);
    const [address, setAddress] = useState('');
    const [tenantName, setTenantName] = useState('');

    useEffect(() => {
        // Fetch ledger card data when the component loads
        if (unitId) {
            getLedgerCard(unitId)
                .then((data) => {
                    const processed = processLedgerData(data);
                    console.log('====> processed', processed);
                    setLedgerData(processed)
                    setAddress(data[0].address);
                    setTenantName(processed[0].tenant_name);
                })
                .catch((error) => {
                    console.error('Error fetching ledger data:', error);
                });
        }
    }, [unitId]);

    // Check if ledgerData is empty, and return null if it is
    if (ledgerData.length === 0) {
        return null;
    }
    return (
        <div>
            <Link to={`/property/edit/${ledgerData[0].property_id}`}>Return to Property Page</Link>

            <h1>Ledger Card for {address}, Unit {unitId}<br />{tenantName}</h1>
            <table className="table">
                <thead>
                    <tr className="table-success">
                        <th>Payment Month</th>
                        <th></th>
                        <th>Rent</th>
                        {FEES.map(feeObj => {
                            const feeLabel = Object.values(feeObj)[0];
                            return <td key={feeLabel}>{feeLabel}</td>
                        })}
                        <th>Total</th>
                    </tr>
                </thead>
                {ledgerData.map((entry, key) => {
                    console.log('====> ledger entry (due rent)', entry.totalDue, entry);
                    return (
                        <tbody>
                            <tr key={key}>
                                <td>{MONTH_NAMES[entry.ledger_month]}</td>
                                <td>DUE</td>
                                <td>{entry.due_rent}</td>
                                {FEES.map(feeObj => {
                                    const feeKey = Object.keys(feeObj)[0];
                                    return <td key={feeKey}>{entry.dueFees[feeKey]}</td>
                                })}
                                <td>{entry.totalDue}</td>
                            </tr>
                            <tr key={key}>
                                <td></td>
                                <td>PAID</td>
                                <td>{entry.paid_rent}</td>
                                {FEES.map(feeObj => {
                                    const feeKey = Object.keys(feeObj)[0];
                                    return <td key={feeKey}>{entry.paidFees[feeKey]}</td>
                                })}
                                <td>{entry.totalPaid}</td>
                            </tr>
                            <tr key={key}>
                                <td></td>
                                <td>Payment</td>
                                <td>Check # {entry.check_number}</td>
                                <td>Check date: {entry.check_date}</td>
                                <td>Check amount: {entry.check_amount}</td>
                            </tr>
                        </tbody>
                    )
                })}
            </table>

        </div>
    );
}

export default LedgerCard;
