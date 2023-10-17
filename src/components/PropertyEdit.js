import React, { useState } from 'react';

function PropertyEdit() {
    // Define state variables
    const [propertyId, setPropertyId] = useState(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [scepPayment, setScepPayment] = useState(false);
    const [rfdPayment, setRfdPayment] = useState(false);
    const [trashPayment, setTrashPayment] = useState(false);
    const [parkingPayment, setParkingPayment] = useState(false);

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform submission logic here (e.g., API call)
    };

    return (
        <div>
            <h2>Property Edit</h2>
            <form onSubmit={handleSubmit}>
                {/* Property Name */}
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Property Address */}
                <div>
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                {/* City, State, and Zip Code */}
                <div>
                    <label htmlFor="city">City:</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="state">State:</label>
                    <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="zipCode">Zip Code:</label>
                    <input
                        type="text"
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                    />
                </div>

                {/* Payment Options */}
                <div>
                    <label>Payment Options:</label>
                    <div>
                        <input
                            type="checkbox"
                            id="scepPayment"
                            checked={scepPayment}
                            onChange={() => setScepPayment(!scepPayment)}
                        />
                        <label htmlFor="scepPayment">SCEP</label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="rfdPayment"
                            checked={rfdPayment}
                            onChange={() => setRfdPayment(!rfdPayment)}
                        />
                        <label htmlFor="rfdPayment">RFD</label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="trashPayment"
                            checked={trashPayment}
                            onChange={() => setTrashPayment(!trashPayment)}
                        />
                        <label htmlFor="trashPayment">Trash</label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="parkingPayment"
                            checked={parkingPayment}
                            onChange={() => setParkingPayment(!parkingPayment)}
                        />
                        <label htmlFor="parkingPayment">Parking</label>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default PropertyEdit;
