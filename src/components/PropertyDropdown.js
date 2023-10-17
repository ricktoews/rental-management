import React, { useState, useEffect } from 'react';
import { REST } from '../config/constants';
import PropertyDetails from './PropertyDetails';

function PropertyDropdown() {
    // State to hold the list of properties and the selected property
    const [properties, setProperties] = useState([]);
    const [propertyId, setPropertyId] = useState();
    const [propertyDetails, setPropertyDetails] = useState();
    const [selectedProperty, setSelectedProperty] = useState('');

    useEffect(() => {
        // Fetch the property data from the API
        fetch(REST.properties)
            .then((response) => response.json())
            .then((data) => {
                // Set the list of properties in the state
                setProperties(data);
            })
            .catch((error) => {
                console.error('Error fetching properties:', error);
            });
    }, []);

    useEffect(() => {
        if (propertyId) {
            (async () => {
                console.log('====> changed propertyId', propertyId);
                const res = await fetch(REST.propertyById + propertyId)
                    .then((response) => response.json())
                    .then((data) => {
                        // Set the list of properties in the state
                        setPropertyDetails(data);
                        console.log(data);
                    })
                    .catch((error) => {
                        console.error('Error fetching property by ID:', error);
                    });
            })();
        }

    }, [propertyId]);

    // Event handler for when a property is selected
    const handlePropertyChange = (event) => {
        setPropertyId(event.target.value);
        setSelectedProperty(event.target.value);
    };

    return (
        <div>
            <label htmlFor="propertyDropdown">Select a Property:</label>
            <select
                id="propertyDropdown"
                value={selectedProperty}
                onChange={handlePropertyChange}
            >
                <option value="">Select a property</option>
                {properties.map((property) => (
                    <option key={property.property_id} value={property.property_id}>
                        {property.address}
                    </option>
                ))}
            </select>
            {propertyDetails && <PropertyDetails units={propertyDetails} />}
        </div>
    );
}

export default PropertyDropdown;
