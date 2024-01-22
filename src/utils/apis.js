import { REST } from '../config/constants';

export const getUnoccupiedUnits = async () => {
    try {
        const response = await fetch(REST.unoccupiedUnits);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("There was a problem fetching the unoccupied units:", error);
        throw error;  // or return some default/fallback data if desired
    }
}

export const getTenants = async () => {
    try {
        const response = await fetch(REST.tenants);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        data = data.filter(item => item.last_name > '');
        return data;
    } catch (error) {
        console.error("There was a problem fetching the tenants:", error);
        throw error;  // or return some default/fallback data if desired
    }
}

export const getTenant = async (tenantId) => {
    try {
        const response = await fetch(`${REST.getTenant}/${tenantId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("There was a problem fetching the tenant:", error);
        throw error;  // or return some default/fallback data if desired
    }
}

export const saveTenant = async (tenantId, details) => {
    let url;
    let method;
    if (tenantId === 'new') {
        url = REST.saveTenant;
        method = 'POST';
    } else {
        url = `${REST.saveTenant}/${tenantId}`;
        method = 'PUT';
    }
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(details),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const moveIn = async (tenantId, unitId) => {
    try {
        const response = await fetch(`${REST.moveIn}/${tenantId}/${unitId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('There was a problem moving in the tenant', error);
        throw error;
    }
}

export const moveOut = async (tenantId) => {
    try {
        const response = await fetch(`${REST.moveOut}/${tenantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('There was a problem moving outs the tenant', error);
        throw error;
    }
}


// Assuming REST is an object with a 'properties' key holding the URL
export const getProperties = async () => {
    try {
        const response = await fetch(REST.properties);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("There was a problem fetching the properties:", error);
        throw error;  // or return some default/fallback data if desired
    }
}

export const getPropertyById = async (id) => {
    const url = REST.propertyById + id;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("There was a problem fetching the property:", error);
        throw error;  // or return some default/fallback data if desired
    }

};

export const savePropertyDetails = async (propertyId, details) => {
    try {
        const response = await fetch(REST.saveProperty + propertyId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(details),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
};

export const saveUnitMonthlyFees = async (unit_id, payload) => {
    try {
        const response = await fetch(REST.saveUnitMonthly + unit_id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const saveLedgerEntry = async (payload) => {
    try {
        const response = await fetch(REST.setPayment, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const deletePaymentRecord = async (payload) => {
    try {
        const response = await fetch(REST.deletePaymentRecord, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const savePaymentRecord = async (payload) => {
    try {
        const response = await fetch(REST.savePaymentRecord, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const getPayments = async (ledger_year, ledger_month, tenant_ids) => {
    const payload = { ledger_year, ledger_month, tenant_ids };
    try {
        const response = await fetch(REST.getPayments, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const getPaymentEntryData = async (tenant_id, ledger_year, ledger_month) => {
    try {
        const response = await fetch(`${REST.getPaymentEntryData}/${tenant_id}/${ledger_year}/${ledger_month}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const getLedgerCard = async (unit_id) => {
    try {
        const response = await fetch(REST.getLedgerCard + unit_id);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }

}

export const getRentRecap = async (property_id, ledger_month, ledger_year) => {
    try {
        const response = await fetch(`${REST.getRentRecap}/${property_id}/${ledger_month}/${ledger_year}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

export const getRentRecapAll = async (ledger_month, ledger_year) => {
    try {
        const response = await fetch(`${REST.getRentRecapAll}/${ledger_month}/${ledger_year}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Re-throwing the error to allow handling it at the call site
    }
}

