import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyLedgerCards } from '../utils/apis.js';
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

function PropertyLedgerCards() {
    const { propertyId } = useParams();
    const [propertyLedgerData, setPropertyLedgerData] = useState([]);
    const [ledgerData, setLedgerData] = useState([]);
    console.log('====> PropertyLedgrCards', propertyId);
    useEffect(() => {
        // Fetch ledger card data when the component loads
        if (propertyId) {
            getPropertyLedgerCards(propertyId)
                .then((data) => {
                    setPropertyLedgerData(data);
                    //                    setLedgerData(data)
                })
                .catch((error) => {
                    console.error('Error fetching ledger data:', error);
                });
        }
    }, [propertyId]);

    // Check if ledgerData is empty, and return null if it is
    if (propertyLedgerData.length === 0) {
        return null;
    }

    return (
        <div>
            <Link to={`/property/edit/${propertyId}`}>Return to Property Page</Link>

            <h1>Property: {propertyLedgerData[0].address}</h1>
            {propertyLedgerData.map((ledgerData, key) => {
                let balance = ledgerData.starting_balance;

                return (
                    <section key={key}>
                        <h2>Ledger Card for {ledgerData.first_name} {ledgerData.last_name}</h2>
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

                    </section>
                )
            })}

        </div>
    );
}

export default PropertyLedgerCards;
