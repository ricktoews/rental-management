import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hamburger from './components/Hamburger';
import PropertyEdit from './components/PropertyEdit';
import Properties from './components/Properties';
import PropertyDropdown from './components/PropertyDropdown';
import LedgerCard from './components/LedgerCard';
import RentRecap from './components/RentRecap';
import TenantDetails from './components/TenantDetails';

function App() {
  const [menuState, setMenuState] = useState(false);
  const [hamburgerClass, setHamburgerClass] = useState('hamburger-nav');

  const navContainerRef = useRef(null);
  const hamburgerIconRef = useRef(null);

  useEffect(() => {
    const handleClick = e => {
      const el = e.target;
      if (navContainerRef.current.contains(el)) {
        console.log('handleClick clicked in nav menu; leave open');
        setMenuState(true);
      } else {
        // Close outside of nav container. Close menu unless clicked on hamburger icon.
        if (!hamburgerIconRef?.current?.contains(el)) {
          setMenuState(false);
        }
      }
    }

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    }
  }, []);

  useEffect(() => {

    if (menuState === true) {
      navContainerRef.current.classList.add('show-nav-menu');
      navContainerRef.current.classList.remove('hide-nav-menu');
    } else {
      navContainerRef.current.classList.remove('show-nav-menu');
      navContainerRef.current.classList.add('hide-nav-menu');
    }

  }, [menuState]);

  const hamburgerClick = () => {
    console.log('hamburger clicked', hamburgerClass);
    if (hamburgerClass === 'hamburger-nav') {
      setHamburgerClass('hamburger-nav hamburger-on');
    } else {
      setHamburgerClass('hamburger-nav');
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    console.log('toggleMenu', !menuState);
    setMenuState(!menuState);
  }

  const checkMenuClick = e => {
    const el = e.target;
    const currentEl = e.currentTarget;
    if (el === currentEl) {
      setMenuState(false);
    }
  }

  return (
    <Router>
      <div className="App">
        <div ref={navContainerRef} onClick={checkMenuClick} className="nav-container">
          <nav>
            <ul>
              <li><Link to="/" onClick={toggleMenu}>Properties</Link></li>
              <li><Link to="/property-edit" onClick={toggleMenu}>Units</Link></li>
              <li><Link to="/tenants" onClick={toggleMenu}>Tenants</Link></li>
            </ul>
          </nav>
        </div>
        <div className="fixed-header">
          <header>
            {/*<Hamburger onClick={toggleMenu} />*/}
            Rental Management
          </header>
        </div>
        <div className="container app-content">
          <Routes>
            <Route path="/" element={<Properties />} />
            <Route path="/property/edit/:propertyId" element={<PropertyEdit />} />
            <Route path="/ledger-card/:unitId" element={<LedgerCard />} />
            <Route path="/rent-recap/:propertyId/:ledgerMonth" element={<RentRecap />} />
            <Route path="/properties" element={<PropertyDropdown />} />
            <Route path="/tenant-details/:tenant_id" element={<TenantDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
