import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenants } from '../utils/apis';

const TenantDetails = () => {
    const { tenant_id } = useParams();
    const [unitNumber, setUnitNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        getTenants()
            .then(res => {
                const tenantData = res.find(item => item.tenant_id == tenant_id);
                console.log('====> tenant', tenant_id, tenantData);
                setUnitNumber(tenantData.unit_number);
                setFirstName(tenantData.first_name);
                setLastName(tenantData.last_name);
                setEmail(tenantData.email || '');
                setPhone(tenantData.phone || '');
            })
    }, []);

    const handleChange = e => { }

    return (
        <div>
            <h2>Tenant Details</h2>
            <table>
                <tbody>
                    <tr>
                        <td>Unit Number</td><td>{unitNumber}</td>
                    </tr>
                    <tr>
                        <td>First name</td>
                        <td><input type="text" onChange={handleChange} value={firstName} /></td>
                    </tr>
                    <tr>
                        <td>Last name</td>
                        <td><input type="text" onChange={handleChange} value={lastName} /></td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td><input type="text" onChange={handleChange} value={email} /></td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td><input type="text" onChange={handleChange} value={phone} /></td>
                    </tr>
                    <tr>
                        <td>Balance</td>
                        <td><input type="text" onChange={handleChange} value={balance} /></td>
                    </tr>

                </tbody>
            </table>
        </div>
    );
};

export default TenantDetails;
