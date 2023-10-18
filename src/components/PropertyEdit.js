import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPropertyById, savePropertyDetails } from '../utils/apis';
import { format$ } from '../utils/helpers';

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

const Money = styled.td`
text-align: right;
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
    let propertyMonthlyTotal = 0;
    let columns;

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
                        <CenteredTh>Unit</CenteredTh>
                        <CenteredTh>Tenant</CenteredTh>
                        <CenteredTh>Rent</CenteredTh>
                        { hasFee('scep') && <CenteredTh>SCEP</CenteredTh> }
                        { hasFee('rfd') && <CenteredTh>RFD</CenteredTh> }
                        { hasFee('trash') && <CenteredTh>Trash</CenteredTh> }
                        { hasFee('parking') && <CenteredTh>Parking</CenteredTh> }
                        <CenteredTh>Monthly Total</CenteredTh>
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit, idx) => {
                        columns = 3;
                        let monthlyTotal = unit.rent_amount;
                        if (hasFee('scep')) {monthlyTotal += propertyFees.scep; columns++;}
                        if (hasFee('rfd')) {monthlyTotal += propertyFees.rfd; columns++;}
                        if (hasFee('trash')) {monthlyTotal += propertyFees.trash; columns++;}
                        if (hasFee('parking')) {monthlyTotal += propertyFees.parking; columns++;}

                        propertyMonthlyTotal += monthlyTotal;
                        return (
                        <tr key={idx}>
                            <td>{unit.unit_number}</td>
                            <td>{unit.first_name} {unit.last_name}</td>
                            <Money>{format$(unit.rent_amount)}</Money>
                            { hasFee('scep') && <Money>{format$(propertyFees.scep)}</Money> }
                            { hasFee('rfd') && <Money>{format$(propertyFees.rfd)}</Money> }
                            { hasFee('trash') && <Money>{format$(propertyFees.trash)}</Money> }
                            { hasFee('parking') && <Money>{format$(propertyFees.parking)}</Money> }
                            <Money>{format$(monthlyTotal)}</Money>
                        </tr>
                    )})}
                    <tr>
                        <td colSpan={columns} style={{textAlign: 'right'}}>Property Total:</td>
                        <Money>{format$(propertyMonthlyTotal)}</Money>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default PropertyEdit;
