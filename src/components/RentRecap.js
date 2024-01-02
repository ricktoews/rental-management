import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRentRecap } from '../utils/apis.js';
import { format$ } from '../utils/helpers.js';
import { processLedgerData } from './LedgerCardUtils.js';
import { MONTH_NAMES } from '../config/constants';

function RentRecap() {
    const { propertyId, ledgerMonth, ledgerYear } = useParams();
    const [address, setAddress] = useState('');
    const [rentRecapData, setRentRecapData] = useState({});
    let balance = 0;
    let totalReceived = 0;

    useEffect(() => {
        // Fetch ledger card data when the component loads
        if (propertyId && ledgerMonth && ledgerYear) {
            getRentRecap(propertyId, ledgerMonth, ledgerYear)
                .then((data) => {
                    setAddress(data.address);
                    setRentRecapData(data);
                })
                .catch((error) => {
                    console.error('Error fetching ledger data:', error);
                });
        }
    }, [propertyId, ledgerMonth, ledgerYear]);

    // Check if ledgerData is empty, and return null if it is
    if (!rentRecapData?.unitData) {
        return null;
    }

    return (
        <div>
            <Link to={`/property/edit/${propertyId}`}>Return to Property Page</Link>

            <h1>Rent Recap for {address}</h1>
            <table className="table">
                <thead>
                    <tr className="table-success">
                        <th>Unit</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th style={{ textAlign: 'right' }}>Current amount</th>
                        <th style={{ textAlign: 'right' }}>Received</th>
                        <th style={{ textAlign: 'center' }}>Check number</th>
                        <th>Check date</th>
                        <th style={{ textAlign: 'right' }}>Balance due</th>
                    </tr>
                </thead>
                <tbody>
                    {rentRecapData.unitData.map((entry, key) => {
                        let balance = entry.starting_balance + entry.due_total;
                        if (entry.payments && entry.payments.length > 0) {
                            return entry.payments.map((ledgerRow, ledgerKey) => {
                                balance -= ledgerRow.check_amount;
                                totalReceived += ledgerRow.check_amount;
                                if (ledgerKey === 0)
                                    return (
                                        <tr key={ledgerKey}>
                                            <td>{entry.unit_number}</td>
                                            <td>{entry.first_name}</td>
                                            <td>{entry.last_name}</td>
                                            <td style={{ textAlign: 'right' }}>{format$(entry.due_total)}</td>
                                            <td style={{ textAlign: 'right' }}>{format$(ledgerRow.check_amount)}</td>
                                            <td style={{ textAlign: 'center' }}>{ledgerRow.check_number}</td>
                                            <td>{ledgerRow.check_date}</td>
                                            <td style={{ textAlign: 'right' }}>{format$(balance)}</td>
                                        </tr>
                                    )
                                else
                                    return (
                                        <tr key={ledgerKey}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ textAlign: 'right' }}></td>
                                            <td style={{ textAlign: 'right' }}>{format$(ledgerRow.check_amount)}</td>
                                            <td style={{ textAlign: 'center' }}>{ledgerRow.check_number}</td>
                                            <td>{ledgerRow.check_date}</td>
                                            <td style={{ textAlign: 'right' }}>{format$(balance)}</td>
                                        </tr>
                                    )
                            })
                        }
                        else {
                            return (
                                <tr key={key}>
                                    <td>{entry.unit_number}</td>
                                    <td>{entry.first_name}</td>
                                    <td>{entry.last_name}</td>
                                    <td style={{ textAlign: 'right' }}>{format$(entry.due_total)}</td>
                                    <td style={{ textAlign: 'right' }}>NOT RECEIVED</td>
                                    <td style={{ textAlign: 'center' }}></td>
                                    <td></td>
                                    <td style={{ textAlign: 'right' }}>{format$(balance)}</td>
                                </tr>
                            )

                        }
                    })}
                    <tr style={{ borderTop: '2px solid green' }}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style={{ textAlign: 'right' }}>Total Received</td>
                        <td style={{ textAlign: 'right' }}>{format$(totalReceived)}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

        </div>
    );
}

export default RentRecap;
