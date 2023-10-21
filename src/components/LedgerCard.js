import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLedgerCard } from '../utils/apis.js';
import { processLedgerData } from './LedgerCardUtils.js';

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
                        <th>Rent Amount</th>
                        {Object.keys(ledgerData[0].fees).map(item => <th key={item}>{item.toUpperCase()}</th>)}
                        <th>Total Due</th>
                        <th>Check Number</th>
                        <th>Check Date</th>
                        <th>Paid</th>
                        {Object.keys(ledgerData[0].disbursements).map(item => <th key={item}>{item}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {ledgerData.map((entry, key) => (
                        <tr key={key}>
                            <td>{entry.payment_month}</td>
                            <td>{entry.rent}</td>
                            {Object.keys(entry.fees).map(item => <td key={item}>{entry.fees[item]}</td>)}
                            <td>{entry.total_due_fmt}</td>
                            <td>{entry.check_number}</td>
                            <td>{entry.check_date}</td>
                            <td>{entry.paid}</td>
                            {Object.keys(entry.disbursements).map(item => <td key={item}>{entry.disbursements[item]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default LedgerCard;
