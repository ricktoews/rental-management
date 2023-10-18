import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPropertyById, savePropertyDetails } from '../utils/apis';

const CenteredTh = styled.th`
    text-align: center;
`;

const StyledInput = styled.input`
    border-radius: 4px;
    margin: 4px 0;
    border: 1px solid #ccc;
`;

const FeeInput = styled(StyledInput)`
    width: 50px;
    text-align: right;
`;

const UnitInput = styled(StyledInput)`
    width: 75px;
`;

const RentInput = styled(StyledInput)`
    width: 100px;
`;

const PropertyTable = styled.table`
    margin-bottom: 20px;
`;

function PropertyEdit() {
    let { propertyId } = useParams();
    const [address, setAddress] = useState('');
    const [propertyFees, setPropertyFees] = useState({});
    const [units, setUnits] = useState([]);
    const [triggerSave, setTriggerSave] = useState(false);

    useEffect(() => {
        if (propertyId) {
            getPropertyById(propertyId)
            .then(res => {
                setAddress(res.property_address);
                setPropertyFees(res.property_fees || {});
                setUnits(res.units);
            })
        }
    }, [propertyId]);

    useEffect(() => {
        if (triggerSave) {
            console.log('====> Save property fees', propertyId, propertyFees);
            const detailsData = { monthly_fees: propertyFees };
            savePropertyDetails(propertyId, detailsData);
            setTriggerSave(false);
        }
    }, [triggerSave]);

    const hasFee = (feeType) => {
        return propertyFees[feeType] > 0;
    }

    const handleFeeChange = e => {
        const field = e.currentTarget;
        const feeProperty = field.dataset.fee;
        const value = 1*field.value || 0;
        setPropertyFees({...propertyFees, [feeProperty]: value});
        setTriggerSave(true);
    }

    return (
        <div>
            <Link to="/">Return to Property List</Link>

            <h2>{address}</h2>

            {/* Property Fees Table */}
            <PropertyTable border="1">
                <thead>
                    <tr>
                        <CenteredTh>SCEP</CenteredTh>
                        <CenteredTh>RFD</CenteredTh>
                        <CenteredTh>Trash</CenteredTh>
                        <CenteredTh>Parking</CenteredTh>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>$<FeeInput data-fee="scep" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.scep || ''} /></td>
                        <td>$<FeeInput data-fee="rfd" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.rfd || ''} /></td>
                        <td>$<FeeInput data-fee="trash" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.trash || ''} /></td>
                        <td>$<FeeInput data-fee="parking" onBlur={handleFeeChange} type="number" step="0.01" defaultValue={propertyFees.parking || ''} /></td>
                    </tr>
                </tbody>
            </PropertyTable>

            {/* Units Table */}
            <table border="1">
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th>Tenant</th>
                        <th>Rent</th>
                        { hasFee('scep') && <th>SCEP</th> }
                        { hasFee('rfd') && <th>RFD</th> }
                        { hasFee('trash') && <th>Trash</th> }
                        { hasFee('parking') && <th>Parking</th> }
                        <th>Monthly Total</th>
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit, idx) => {
                        let monthlyTotal = unit.rent_amount;
                        if (hasFee('scep')) monthlyTotal += propertyFees.scep;
                        if (hasFee('rfd')) monthlyTotal += propertyFees.rfd;
                        if (hasFee('trash')) monthlyTotal += propertyFees.trash;
                        if (hasFee('parking')) monthlyTotal += propertyFees.parking;
                        return (
                        <tr key={idx}>
                            <td>{unit.unit_number}</td>
                            <td>{unit.first_name} {unit.last_name}</td>
                            <td>${unit.rent_amount}</td>
                            { hasFee('scep') && <td>${propertyFees.scep}</td> }
                            { hasFee('rfd') && <td>${propertyFees.rfd}</td> }
                            { hasFee('trash') && <td>${propertyFees.trash}</td> }
                            { hasFee('parking') && <td>${propertyFees.parking}</td> }
                            <td>${monthlyTotal.toFixed(2)}</td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    );
}

export default PropertyEdit;
