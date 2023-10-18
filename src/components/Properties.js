import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../utils/apis';
import styled from 'styled-components';

const PropertyButton = styled.div`
  cursor: pointer;
  background-color: purple;
  color: white;
  padding: 10px 20px;
  border-radius: 20px; // Rounded ends
  margin: 10px 0; // Vertical spacing between buttons

  // Optional: Add hover effect for better UX
  &:hover {
    background-color: darkviolet;
  }
`;

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProperties()
    .then(res => {
      setProperties(res);
    })
  }, []);

  const handleClick = (event) => {
    const propertyId = event.currentTarget.getAttribute('data-id');
    navigate(`/property/edit/${propertyId}`);
  };

  return (
    <div className="property-list">
      {properties.map(property => (
        <PropertyButton 
          key={property.property_id}
          data-id={property.property_id}
          onClick={handleClick}
        >
          {property.address}
        </PropertyButton>
      ))}
    </div>
  );
};

export default Properties;
