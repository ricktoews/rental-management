import { REST } from '../config/constants';

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
