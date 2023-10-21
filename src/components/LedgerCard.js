import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLedgerCard } from '../utils/apis.js';
import { format$ } from '../utils/helpers.js';

function LedgerCard() {
  const { unitId } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Fetch ledger card data when the component loads
    if (unitId) {
        getLedgerCard(unitId)
        .then((data) => {
          setLedgerData(data)
          setAddress(data[0].address);
        })
        .catch((error) => {
          console.error('Error fetching ledger data:', error);
        });
      }
  }, [unitId]);

  return (
    <div>
        <h1>Ledger Card for {address}, Unit {unitId}</h1>
        <table className="table">
        <thead>
            <tr>
            <th>Rent Amount</th>
            <th>Fees</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Payment Month</th>
            <th>Check Number</th>
            <th>Check Date</th>
            <th>Check Amount</th>
            </tr>
        </thead>
        <tbody>
            {ledgerData.map((entry, key) => (
            <tr key={key}>
                <td>{format$(entry.rent_amount)}</td>
                <td>{JSON.stringify(entry.fees)}</td>
                <td>{entry.first_name}</td>
                <td>{entry.last_name}</td>
                <td>{entry.payment_month}</td>
                <td>{entry.check_number}</td>
                <td>{entry.check_date}</td>
                <td>{format$(entry.check_amount)}</td>
            </tr>
            ))}
        </tbody>
        </table>

    </div>
  );
}

export default LedgerCard;
