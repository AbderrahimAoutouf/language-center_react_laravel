import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

import centreLogo from '../../images/EnglishCastle_HQ.png';
import dashboard from '../../images/icons/dashboard.svg';
import enseignant from '../../images/icons/enseignant.svg';
import etudiant from '../../images/icons/etudiant.svg';
import groupes from '../../images/icons/groupes.svg';
import presence from '../../images/icons/presence.svg';
import parents from '../../images/icons/parents.svg';
import paiements from '../../images/icons/paiements.svg';
import results from '../../images/icons/results.svg';
import disco from '../../images/icons/logout.svg';
import holidays from '../../images/icons/holidays.svg';


import { UseStateContext } from '../../context/ContextProvider';

export default function SidebarSec() {
  const { logout } = UseStateContext();
  const [openSidebar, setOpenSidebar] = useState(window.innerWidth >= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setOpenSidebar(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => setOpenSidebar(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    logout();
    window.location.href = '/';
  };

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Nav.Item>
        <NavLink
          className={({ isActive }) =>
            `nav-link d-flex align-items-center py-3 ${isActive ? 'active-link' : ''}`
          }
          to={to}
        >
          <div className="icon-container me-3">
            <img src={icon} alt={label} />
          </div>
          <span className={`nav-text ${openSidebar ? 'visible' : 'hidden'}`}>{label}</span>
        </NavLink>
      </Nav.Item>
    );
  };

  const CategoryHeader = ({ label }) => (
    <div className="category-header px-3 text-uppercase text-white-50 fw-bold small mt-3">
      {openSidebar && label}
    </div>
  );

  return (
    <div className={`sidebar-wrapper ${openSidebar ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-container bg-primary h-100 d-flex flex-column">
        {/* Logo + Toggle */}
        <div className="logo-container d-flex justify-content-between align-items-center px-3 py-2">
          {openSidebar && (
            <Link to="/secretary/dashboard">
              <img src={centreLogo} className="logo" alt="Centre Logo" />
            </Link>
          )}
          <button
            onClick={handleToggleSidebar}
            className="toggle-btn bg-transparent border-0"
            aria-label={openSidebar ? 'Close sidebar' : 'Open sidebar'}
          >
            {openSidebar ? (
              <XMarkIcon className="text-white" width={24} />
            ) : (
              <Bars3BottomLeftIcon className="text-white" width={24} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav overflow-auto flex-grow-1">
          <Nav className="flex-column">

            <CategoryHeader label="Gestion des personnes" />
            <NavItem to="/secretary/student" icon={etudiant} label="Students" />
            <NavItem to="/secretary/parent" icon={parents} label="Parents" />

            <CategoryHeader label="Pédagogie" />
            <NavItem to="/secretary/class" icon={groupes} label="Classes" />

            <CategoryHeader label="Suivi administratif" />
            <NavItem to="/secretary/attendance" icon={presence} label="Attendance" />
            {/*<NavItem to="/secretary/results" icon={results} label="Results" />*/}
            {/* <NavItem to="/secretary/holidays" icon={holidays} label="Holidays" /> */}
            
            {/* Paiement dropdown */}
            <CategoryHeader label="Paiement" />
            {openSidebar ? (
              <Nav.Item>
                <div className="nav-link dropdown-toggle d-flex align-items-center py-3" data-bs-toggle="collapse" data-bs-target="#dropFees">
                  <div className="icon-container me-3">
                    <img src={paiements} alt="Paiement" />
                  </div>
                  <span className="nav-text">Paiement</span>
                </div>
                <ul className="collapse ps-4" id="dropFees">
                  <NavItem to="/secretary/fees/student" icon={paiements} label="Student Earnings" />
                </ul>
              </Nav.Item>
            ) : (
              <Nav.Item>
                <div className="nav-link d-flex align-items-center py-3" onClick={handleToggleSidebar}>
                  <img src={paiements} alt="Paiement" />
                </div>
              </Nav.Item>
            )}

            <CategoryHeader label="Système" />
            <NavItem to="/secretary/dashboard" icon={dashboard} label="Dashboard" />

            <Nav.Item>
              <div
                onClick={handleLogout}
                className="nav-link d-flex align-items-center py-3 logout-link"
                role="button"
              >
                <div className="icon-container me-3">
                  <img src={disco} alt="Logout" />
                </div>
                <span className={`nav-text ${openSidebar ? 'visible' : 'hidden'}`}>Logout</span>
              </div>
            </Nav.Item>

          </Nav>
        </div>
      </div>
    </div>
  );
}
