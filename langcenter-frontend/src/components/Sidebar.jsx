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
import results from '../images/icons/results.svg';
import salles from '../images/icons/salles.svg';
import users from '../images/icons/utilisateurs.svg';
import pass from '../images/icons/pass-fill.svg';
import level from '../images/icons/icons8-language-skill.svg';
import income from '../images/icons/icons8-income.svg';
import holidays from '../images/icons/holidays.svg';
import { UseStateContext } from '../context/ContextProvider';

export default function Sidebar() {
  const { logout } = UseStateContext();
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    fees: false
  });
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on mobile view
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpenSidebar(false);
      } else {
        setOpenSidebar(true);
      }
    };

    // Check on mount and add listener
    handleResize();
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar
  const handleToggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  // Toggle dropdown
  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('ACCES_TOKEN');
    logout();
    window.location.href = '/';
  };

  // Create NavItem component for cleaner code
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
          <span className={`nav-text ${openSidebar ? 'visible' : 'hidden'}`}>
            {label}
          </span>
        </NavLink>
      </Nav.Item>
    );
  };

  return (
    <div 
      className={`sidebar-wrapper ${openSidebar ? 'expanded' : 'collapsed'}`}
    >
      <div className="sidebar-container bg-primary h-100 d-flex flex-column">
        <div className="logo-container d-flex justify-content-between align-items-center px-3 py-2">
          {openSidebar && (
            <div className="logo-wrapper">
              <Link to="/dashboard">
                <img src={centreLogo} className="logo" alt="English Castle" />
              </Link>
            </div>
          )}
          
          <button 
            onClick={handleToggleSidebar} 
            className="toggle-btn bg-transparent border-0"
            aria-label={openSidebar ? "Close sidebar" : "Open sidebar"}
          >
            {openSidebar ? (
              <XMarkIcon className="text-white" width={24} />
            ) : (
              <Bars3BottomLeftIcon className="text-white" width={24} />
            )}
          </button>
        </div>

        <div className="sidebar-nav overflow-auto flex-grow-1">
          <Nav className="flex-column">
            {/* Gestion des personnes */}
            <div className="category-header">
              <span className={openSidebar ? 'visible' : 'hidden'}>
                Gestion des personnes
              </span>
            </div>
            
            <NavItem to="/teacher" icon={enseignant} label="Teachers" />
            <NavItem to="/student" icon={etudiant} label="Students" />
            <NavItem to="/parent" icon={parents} label="Parents" />

            {/* Pédagogie */}
            <div className="category-header">
              <span className={openSidebar ? 'visible' : 'hidden'}>
                Pédagogie
              </span>
            </div>
            
            <NavItem to="/class" icon={groupes} label="Classes" />
            <NavItem to="/course" icon={cours} label="Courses" />
            <NavItem to="/tests" icon={pass} label="Tests" />
            <NavItem to="/levels" icon={level} label="Student Level" />

            {/* Suivi administratif */}
            <div className="category-header">
              <span className={openSidebar ? 'visible' : 'hidden'}>
                Suivi administratif
              </span>
            </div>
            
            <NavItem to="/attendance" icon={presence} label="Attendance" />
            
            {/* Dropdown for Expenses */}
            <Nav.Item>
              <div 
                onClick={() => openSidebar && toggleDropdown('fees')} 
                className={`nav-link d-flex align-items-center py-3 dropdown-toggle ${
                  location.pathname.includes('/fees') ? 'active-link' : ''
                }`}
                role="button"
              >
                <div className="icon-container me-3">
                  <img src={paiements} alt="Expenses" />
                </div>
                {openSidebar && (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span>Expenses</span>
                    <i className={`chevron-icon ${openDropdowns.fees ? 'rotate' : ''}`}></i>
                  </div>
                )}
              </div>
              
              {openSidebar && (
                <div className={`dropdown-menu ${openDropdowns.fees ? 'show' : ''}`}>
                  <NavLink 
                    className={({ isActive }) => 
                      `nav-link dropdown-item py-2 ${isActive ? 'active-sublink' : ''}`
                    } 
                    to="/fees/expenses"
                  >
                    Expenses
                  </NavLink>
                  <NavLink 
                    className={({ isActive }) => 
                      `nav-link dropdown-item py-2 ${isActive ? 'active-sublink' : ''}`
                    } 
                    to="/fees/teacher"
                  >
                    Teachers fees
                  </NavLink>
                </div>
              )}
            </Nav.Item>
            
            <NavItem to="/income/student" icon={income} label="Income" />

            {/* Organisation */}
            <div className="category-header">
              <span className={openSidebar ? 'visible' : 'hidden'}>
                Organisation
              </span>
            </div>
            
            <NavItem to="/classroom" icon={salles} label="Classrooms" />
            <NavItem to="/holidays" icon={holidays} label="Holidays" />
            <NavItem to="/schedule" icon={empTemps} label="Schedules" />

            {/* Administration */}
            <div className="category-header">
              <span className={openSidebar ? 'visible' : 'hidden'}>
                Administration
              </span>
            </div>
            
            <NavItem to="/users" icon={users} label="Users" />
            
            <Nav.Item>
              <div 
                onClick={handleLogout} 
                className="nav-link d-flex align-items-center py-3 logout-link"
                role="button"
              >
                <div className="icon-container me-3">
                  <img src={disco} alt="Logout" />
                </div>
                <span className={`nav-text ${openSidebar ? 'visible' : 'hidden'}`}>
                  Logout
                </span>
              </div>
            </Nav.Item>
          </Nav>
        </div>
      </div>
    </div>
  );
}