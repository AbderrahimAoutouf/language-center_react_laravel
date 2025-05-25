import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from '../../api/axios';
import { BsFillEyeFill, BsFillPencilFill } from 'react-icons/bs';
import { MdDelete, MdSearch, MdClear } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function TableParent() {
  const [nameFilter, setNameFilter] = useState('');
  const [parentData, setParentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { user } = UseStateContext();
  
  // Determine route prefix based on user role
  const routePrefix = user?.role === 'admin' 
    ? '' 
    : user?.role === 'director' 
      ? '/director' 
      : '/secretary';

  // Improved table styling
  const tableCustomStyles = {
    header: {
      style: {
        minHeight: '56px',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#e0e0e0',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        padding: '16px',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        color: '#495057',
        transition: 'all 0.2s ease',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        padding: '16px',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#f5f5f5',
        },
      },
    },
    rows: {
      style: {
        backgroundColor: 'white',
        '&:hover': {
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        transition: 'all 0.2s ease',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: '#e0e0e0',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f8f9fa',
        transition: '0.2s',
      },
    },
    pagination: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#e0e0e0',
      },
      pageButtonsStyle: {
        borderRadius: '50%',
        height: '40px',
        width: '40px',
        padding: '8px',
        margin: '0px 4px',
        cursor: 'pointer',
        transition: '0.2s',
      },
    },
  };

  const LoadingComponent = () => (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          rotate: { 
            repeat: Infinity, 
            duration: 1.5,
            ease: "linear"
          },
          scale: {
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut"
          }
        }}
        style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #D60A0B' 
        }}
      />
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-muted"
      >
        Loading parent data...
      </motion.p>
    </div>
  );

  // Action buttons component with animations
  const ActionButtons = ({ row }) => (
    <div className="d-flex justify-content-center gap-2">
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
        <Link to={`${routePrefix}/parent/${row.id}`} className="text-decoration-none">
          <button className="btn btn-sm btn-outline-success" title="View details">
            <BsFillEyeFill />
          </button>
        </Link>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
        <Link to={`${routePrefix}/parent/edit/${row.id}`} className="text-decoration-none">
          <button className="btn btn-sm btn-outline-warning" title="Edit parent">
            <BsFillPencilFill />
          </button>
        </Link>
      </motion.div>
    </div>
  );

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      width: '60px',
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true,
      center: true,
      cell: row => (
        <span className={`badge ${row.gender === 'Male' ? 'bg-info' : 'bg-danger'} text-white`}>
          {row.gender}
        </span>
      ),
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: 'E-mail',
      selector: row => row.email,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Phone',
      selector: row => row.phone,
      sortable: true,
    },
    {
      name: "Children",
      selector: row => row.nb_enfants,
      sortable: true,
      center: true,
      cell: row => (
        <span className="badge bg-secondary">{row.nb_enfants}</span>
      ),
    },
    {
      name: 'Action',
      cell: row => <ActionButtons row={row} />,
      button: true,
      width: '120px',
    },
  ];

  // Fetch parent data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('api/parents');
        
        if (response.data && response.data.data) {
          const formattedData = response.data.data.map(item => ({
            id: item.id,
            name: `${item.nom} ${item.prenom}`,
            cin: item.cin,
            date_naissance: item.date_naissance,
            email: item.email,
            gender: item.sexe,
            address: item.adresse,
            phone: item.telephone,
            nb_enfants: item.nb_enfant_inscrit,
          }));
          
          setParentData(formattedData);
          setRecords(formattedData);
        }
      } catch (error) {
        console.error('Error fetching parent data:', error);
        toast.error('Failed to load parent data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search input
  useEffect(() => {
    if (nameFilter.trim() === '') {
      setRecords(parentData);
    } else {
      const filtered = parentData.filter(item => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
      setRecords(filtered);
    }
  }, [nameFilter, parentData]);

  // Clear search input
  const clearSearch = () => setNameFilter('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3 shadow-sm p-4"
    >
      <h4 className="mb-4 text-primary fw-bold">Parent Management</h4>
      
      {/* Search input with animation */}
      <motion.div 
        initial={{ width: '25%' }}
        whileHover={{ width: '35%' }}
        transition={{ duration: 0.3 }}
        className="mb-4 position-relative"
      >
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <MdSearch size={20} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 shadow-none"
            placeholder="Search by parent name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          {nameFilter && (
            <button 
              className="btn btn-outline-secondary border-start-0" 
              type="button"
              onClick={clearSearch}
            >
              <MdClear size={18} />
            </button>
          )}
        </div>
        
        {nameFilter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-muted small"
          >
            Found {records.length} {records.length === 1 ? 'result' : 'results'} for "{nameFilter}"
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DataTable
            columns={columns}
            data={records}
            fixedHeader
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
            customStyles={tableCustomStyles}
            highlightOnHover
            pointerOnHover
            progressPending={loading}
            progressComponent={<LoadingComponent />}
            noDataComponent={
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 text-center text-muted"
              >
                No parent records found
              </motion.div>
            }
            subHeaderComponent={
              records.length > 0 && (
                <div className="d-flex justify-content-end w-100 mb-2">
                  <span className="badge bg-primary">
                    Total: {records.length} {records.length === 1 ? 'parent' : 'parents'}
                  </span>
                </div>
              )
            }
            subHeader={records.length > 0}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}