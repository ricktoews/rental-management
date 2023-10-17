import React from 'react';

const PropertyDetails = ({ units }) => {
    // Check if the units array exists and has elements
    if (!units || units.length === 0) {
        return <div>No data available</div>;
    }

    // Extract property_address from the first unit
    const { property_address } = units[0];

    return (
        <div>
            <h2>Property Address: {property_address}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Unit Number</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Rent</th>
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit, index) => (
                        <tr key={index}>
                            <td>{unit.unit_number}</td>
                            <td>{unit.first_name}</td>
                            <td>{unit.last_name}</td>
                            <td>${unit.rent_amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PropertyDetails;
