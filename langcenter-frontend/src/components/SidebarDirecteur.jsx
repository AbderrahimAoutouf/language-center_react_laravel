import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

import centreLogo from '../images/EnglishCastle_HQ.png';
import cours from '../images/icons/cours.svg';
import dashboard from '../images/icons/dashboard.svg';
import empTemps from '../images/icons/empTemps.svg';
import enseignant from '../images/icons/enseignant.svg';
import etudiant from '../images/icons/etudiant.svg';
import groupes from '../images/icons/groupes.svg';
import disco from '../images/icons/logout.svg';
import paiements from '../images/icons/paiements.svg';
import parents from '../images/icons/parents.svg';
import presence from '../images/icons/presence.svg';
import salles from '../images/icons/salles.svg';
import holidays from '../images/icons/holidays.svg';

import { UseStateContext } from '../context/ContextProvider';

export default function SidebarDirecteur() {
  const { logout } = UseStateContext();
  const [openSidebar, setOpenSidebar] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setOpenSidebar(window.innerWidth >= 768);
    };
    handleResize();
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
            <Link to="/director/dashboard">
              <img src={centreLogo} className="logo" alt="English Castle" />
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

        {/* Nav Items */}
        <div className="sidebar-nav overflow-auto flex-grow-1">
          <Nav className="flex-column">
              {/* Dashboard + Logout */}
              <CategoryHeader label="Système" />
            <NavItem to="/director/dashboard" icon={dashboard} label="Dashboard" />

            

            {/* Gestion des personnes */}
            <CategoryHeader label="Gestion des personnes" />
            <NavItem to="/director/teacher" icon={enseignant} label="Teachers" />
            <NavItem to="/director/student" icon={etudiant} label="Students" />
            <NavItem to="/director/parent" icon={parents} label="Parents" />

            {/* Pédagogie */}
            <CategoryHeader label="Pédagogie" />
            <NavItem to="/director/class" icon={groupes} label="Classes" />
            <NavItem to="/director/course" icon={cours} label="Courses" />

            {/* Suivi administratif */}
            <CategoryHeader label="Suivi administratif" />
            <NavItem to="/director/attendance" icon={presence} label="Attendance" />
            <NavItem to="/director/fees/teacher" icon={paiements} label="Teacher Fees" />
            <NavItem to="/director/fees/student" icon={paiements} label="Student Payments" />

            {/* Organisation */}
            <CategoryHeader label="Organisation" />
            <NavItem to="/director/classroom" icon={salles} label="Classrooms" />
            <NavItem to="/director/holidays" icon={holidays} label="Holidays" />
            <NavItem to="/director/schedule" icon={empTemps} label="Schedules" />

            {/* Logout */}
            <CategoryHeader label="Logout" />
            

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
