import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTenants, getProperties, getPaymentEntryData } from '../utils/apis';
import LedgerEntry from './LedgerEntry';
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
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const nextMonth = (new Date().getMonth() + 1) % 12 + 1;
  const [ledgerMonth, setLedgerMonth] = useState(nextMonth);
  const [ledgerRecord, setLedgerRecord] = useState({});
  const [paymentEntryData, setPaymentEntryData] = useState({});
  const navigate = useNavigate();

  const tenantInputRef = useRef();
  const tenantDropdownRef = useRef();

  useEffect(() => {
    getProperties()
      .then(res => {
        setProperties(res);
      })
    getTenants()
      .then(res => {
        setTenants(res);
      })
  }, []);

  const handleClick = (event) => {
    const propertyId = event.currentTarget.getAttribute('data-id');
    navigate(`/property/edit/${propertyId}`);
  };

  const handleTenantSearch = event => {
    const el = event.currentTarget;
    const value = el.value || '';
    if (value.length >= 1) {
      const _filteredTenants = tenants.filter(item => item.last_name.substring(0, value.length) == value)
      setFilteredTenants(_filteredTenants);
    }
  }

  const handleTenantClick = event => {
    const el = event.currentTarget;
    const tenantId = el.dataset.id;
    getPaymentEntryData(tenantId, ledgerMonth)
      .then(res => {
        setPaymentEntryData({
          unit: { unit_id: res.unit_id, unit_number: res.unit_number, unit_fees: res.unit_fees, rent_amount: res.unit_rent, tenant_id: res.tenant_id, last_name: res.last_name, first_name: res.first_name },
          ledgerMonth: res.ledger_month,
          ledgerRecord: ledgerRecord,
          propertyFees: res.property_fees,
        })
      });

  }

  const tenantSearchStyle = {
    width: '100px'
  };

  return (
    <div className="rental-home">

      <div style={{ position: 'relative' }} className="tenant-dropdown-container">
        <label style={{ width: '60px' }}>Tenant:</label> <input type="text" style={tenantSearchStyle} onChange={handleTenantSearch} />
        <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: '64px', width: '200px', height: '100px', padding: '5px', border: '1px solid #ccc', background: '#fff', overflowY: 'auto' }} className="tenant-dropdown-wrapper">
          {filteredTenants.map((item, key) => {
            return <div key={key} data-id={item.tenant_id} onClick={handleTenantClick} style={{ cursor: 'pointer', borderBottom: '1px solid #ccc' }}>{item.last_name}, {item.first_name}</div>
          })}
        </div>
        {/* Units Table */}
        {paymentEntryData.ledgerMonth && <table className="unit-payments table table-striped">
          <LedgerEntry
            unit={paymentEntryData.unit}
            month={paymentEntryData.ledgerMonth}
            ledgerData={paymentEntryData.ledgerRecord}
            propertyFees={paymentEntryData.propertyFees}
            feeCharged={paymentEntryData.feeCharged}
            defaultCheckDate={paymentEntryData.defaultCheckDate}
            propertyMonthlyTotal={paymentEntryData.propertyMonthlyTotal}
            paymentsReceivedTotal={paymentEntryData.paymentsReceivedTotal}
          />
        </table>}

      </div>

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
    </div>
  );
};

export default Properties;
