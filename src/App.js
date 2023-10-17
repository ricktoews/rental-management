import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PropertyEdit from './components/PropertyEdit';
import Properties from './components/Properties';
import PropertyDropdown from './components/PropertyDropdown';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/property" element={<Properties />} />
          <Route path="/property-edit" element={<PropertyEdit />} />
          <Route path="/properties" element={<PropertyDropdown />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
