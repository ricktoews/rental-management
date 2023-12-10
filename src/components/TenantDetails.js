import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenant, getUnoccupiedUnits, saveTenant, moveIn, moveOut } from '../utils/apis';
import { FEES } from "../config/constants";

const TenantDetails = () => {
    const { tenant_id } = useParams();
    const [address, setAddress] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [rent, setRent] = useState(0);
    const [fees, setFees] = useState({});
    const [startingBalance, setStartingBalance] = useState(0);
    const [unitId, setUnitId] = useState();
    const [vacantUnits, setVacantUnits] = useState([]);

    const unitSelectionRef = useRef();

    useEffect(() => {
        if (tenant_id === 'new') return;

        getTenant(tenant_id)
            .then(res => {
                const tenantData = res;
                //                const due = getFeesForUnit(tenantData.monthly_fees);
                console.log('====> tenant', tenant_id, tenantData);
                setUnitId(tenantData.unit_id);
                setAddress(tenantData.address || '');
                setUnitNumber(tenantData.unit_number);
                setFirstName(tenantData.first_name);
                setLastName(tenantData.last_name);
                setEmail(tenantData.email || '');
                setPhone(tenantData.phone || '');
                setRent(tenantData.rent_amount || 0);
                setFees(tenantData.monthly_fees || {});
                setStartingBalance(tenantData.starting_balance || 0);

                getUnoccupiedUnits().then(res => {
                    console.log('====> Unoccupied units', res);
                    setVacantUnits(res);
                })
            })
    }, []);

    const getFeesForUnit = (fee_data = {}) => {
        const due = {};
        FEES.forEach(feeObj => {
            const fee = Object.keys(feeObj)[0];
            due[fee] = fee_data[fee] || 0;
        });
        return due;
    }


    const saveTenantDetails = async () => {
        const details = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            rent_amount: rent,
            monthly_fees: JSON.stringify(fees),
            starting_balance: startingBalance
        };
        console.log('====> saveTenantDetails', tenant_id, details);
        const result = await saveTenant(tenant_id, details);
    }

    const handleChange = e => {
        const el = e.currentTarget;
        const field = el.dataset['field'];
        const value = el.value;
        switch (field) {
            case 'firstName':
                setFirstName(value);
                break;
            case 'lastName':
                setLastName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'rent':
                setRent(value);
                break;
            case 'startingBalance':
                setStartingBalance(1 * value);
        }
    }

    const handleFeeChange = e => {
        const el = e.currentTarget;
        const feeKey = el.dataset.monthly;
        const value = el.value;
        const updatedFees = { ...fees };
        updatedFees[feeKey] = value;
        setFees(updatedFees);
    }

    const handleButton = async e => {
        saveTenantDetails();
        /*
                const details = {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone,
                    starting_balance: startingBalance
                };
                console.log('====> handleButton', tenant_id, details);
                const result = await saveTenant(tenant_id, details);
        */
    }

    const handleMoveIn = async e => {
        const selectedUnit = unitSelectionRef.current;
        setUnitId(selectedUnit.value);
        console.log('====> Move In', selectedUnit.value)
        moveIn(tenant_id, selectedUnit.value);
    }

    const handleMoveOut = async e => {
        console.log('====> Move Out');
        setUnitId();
        moveOut(tenant_id);
    }

    return (
        <div>
            <h2>Tenant Details</h2>
            <table>
                <tbody>
                    {!unitNumber ?
                        (<tr>
                            <td>Address, Unit</td>
                            <td><select ref={unitSelectionRef}>
                                {vacantUnits.map((item, key) => <option key={key} value={item.unit_id}>{item.address}, {item.unit_number}</option>)}
                            </select>
                                <button className="btn" onClick={handleMoveIn}>Move In</button>
                            </td>
                        </tr>) :
                        (<tr>
                            <td>Address, Unit</td>
                            <td>{address}, {unitNumber} <button className="btn" onClick={handleMoveOut}>Move Out</button></td>
                        </tr>)
                    }
                    <tr>
                        <td>First name</td>
                        <td><input type="text" data-field="firstName" onChange={handleChange} value={firstName} /></td>
                    </tr>
                    <tr>
                        <td>Last name</td>
                        <td><input type="text" data-field="lastName" onChange={handleChange} value={lastName} /></td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td><input type="text" data-field="email" onChange={handleChange} value={email} /></td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td><input type="text" data-field="phone" onChange={handleChange} value={phone} /></td>
                    </tr>
                    <tr>
                        <td>Monthly Rent</td>
                        <td><input type="text" data-field="rent" onChange={handleChange} value={rent} /></td>
                    </tr>

                    {FEES.map((feeObj, key) => {
                        const feeKey = Object.keys(feeObj)[0];
                        const feeValue = Object.values(feeObj)[0];

                        return <tr key={key}><td>{feeValue} $</td><td><input data-monthly={feeKey} onChange={handleFeeChange} value={fees[feeKey] || ''} /></td></tr>
                    })}

                    <tr>
                        <td>Balance</td>
                        <td><input type="text" data-field="startingBalance" onChange={handleChange} value={startingBalance} /></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><button className="btn" onClick={handleButton}>Save</button></td>
                    </tr>

                </tbody>
            </table>
        </div>
    );
};

export default TenantDetails;
