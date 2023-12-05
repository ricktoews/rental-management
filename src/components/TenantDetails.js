import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenant, getTenants, saveTenant } from '../utils/apis';

const TenantDetails = () => {
    const { tenant_id } = useParams();
    const [address, setAddress] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [startingBalance, setStartingBalance] = useState(0);

    useEffect(() => {
        getTenant(tenant_id)
            .then(res => {
                const tenantData = res;
                console.log('====> tenant', tenant_id, tenantData);
                setAddress(tenantData.address || '');
                setUnitNumber(tenantData.unit_number);
                setFirstName(tenantData.first_name);
                setLastName(tenantData.last_name);
                setEmail(tenantData.email || '');
                setPhone(tenantData.phone || '');
                setStartingBalance(tenantData.starting_balance || 0);
            })
    }, []);

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
            case 'startingBalance':
                setStartingBalance(1 * value);
        }
    }

    const handleButton = async e => {
        const details = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            starting_balance: startingBalance
        };
        const result = await saveTenant(tenant_id, details);
    }

    return (
        <div>
            <h2>Tenant Details</h2>
            <table>
                <tbody>
                    <tr>
                        <td>Address, Unit</td><td>{address}, {unitNumber}</td>
                    </tr>
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
