import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { UseStateContext } from '../../context/ContextProvider';
import axios from '../../api/axios';
import { FiSearch } from 'react-icons/fi';
import { IoMdAdd } from 'react-icons/io';
import { FaSort } from 'react-icons/fa';

// Custom loader component
const CustomLoader = () => (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div 
      className="spinner-border text-danger" 
      role="status"
      style={{ width: '3rem', height: '3rem' }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Empty data component
const NoDataComponent = () => (
  <div className="text-center p-5 fade-in">
    <h4 className="text-muted">No classes found</h4>
    <p>Try adjusting your search criteria</p>
  </div>
);

export default function ClassPage() {
  const navigate = useNavigate();
  const { user, setNotification, setVariant } = UseStateContext();
  
  // States
  const [classData, setClassData] = useState([]);
  const [pending, setPending] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    course: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .fade-in { 
        animation: fadeIn 0.5s ease; 
      }
      .btn-icon:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
      }
      .btn-icon:active {
        transform: scale(0.95);
      }
      .row-hover:hover {
        background-color: rgba(245, 245, 245, 0.8);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        transition: all 0.2s ease;
      }
      .tooltip-custom {
        position: absolute;
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .tooltip-visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Determine base URL based on user role
  const baseUrl = user?.role === 'admin' 
    ? '' 
    : user?.role === 'director' 
      ? '/director' 
      : '/secretary';

  // Custom styles for DataTable
  const tableCustomStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '16px',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        fontSize: '15px',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(245, 245, 245, 0.5)',
        },
      },
      className: 'row-hover fade-in',
    },
    cells: {
      style: {
        padding: '16px',
        justifyContent: 'center',
      },
    },
    expanderRow: {
      style: {
        backgroundColor: '#f8f9fa',
      },
    },
  };

  // Fetch class data
  const fetchClassData = useCallback(async () => {
    setPending(true);
    setClassData([]);
    
    try {
      const response = await axios.get("/api/classes");
      
      const formattedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        schoolYear: item.school_year,
        capacity: item.capacity,
        level: item.level,
        startDate: new Date(item.start_date).toLocaleDateString(),
        endDate: new Date(item.end_date).toLocaleDateString(),
        students: item.nb_etudiants,
        course: item.cours.title,
        teacher: item.teacher ? `${item.teacher.first_name} ${item.teacher.last_name}` : 'Not Assigned',
      }));
      
      setClassData(formattedData);
    } catch (error) {
      console.error("Error fetching class data:", error);
      setNotification("Failed to load class data");
      setVariant("danger");
    } finally {
      setPending(false);
    }
  }, [setNotification, setVariant]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  // Handle search input changes
  const handleSearchChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter data based on search inputs
  const filteredData = classData.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(searchFilters.name.toLowerCase());
    const courseMatch = item.course.toLowerCase().includes(searchFilters.course.toLowerCase());
    return nameMatch && courseMatch;
  });

  // Delete class handler
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/classes/${id}`);
      
      // Update the data
      setClassData(prev => prev.filter(item => item.id !== id));
      
      setNotification("Class deleted successfully");
      setVariant("success");
      
      // Reset confirmation dialog
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      setNotification("Failed to delete class");
      setVariant("danger");
    }
  };

  // Initialize delete confirmation
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  // Tooltip functionality (simple implementation without library)
  const showTooltip = (e, content) => {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip) {
      tooltip.textContent = content;
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.classList.add('tooltip-visible');
    }
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible');
    }
  };

  // Expanded row content
  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-light border-top fade-in">
      <div className="row">
        <div className="col-md-6">
          <p><strong>School Year:</strong> {data.schoolYear}</p>
          <p><strong>Capacity:</strong> {data.capacity}</p>
          <p><strong>Level:</strong> {data.level}</p>
        </div>
        <div className="col-md-6">
          <p><strong>Start Date:</strong> {data.startDate}</p>
          <p><strong>End Date:</strong> {data.endDate}</p>
          <p><strong>Students Enrolled:</strong> {data.students}</p>
        </div>
      </div>
    </div>
  );

  // Table columns
  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Teacher',
      selector: row => row.teacher,
      sortable: true,
    },
    {
      name: 'Course',
      selector: row => row.course,
      sortable: true,
    },
    {
      name: 'Level',
      selector: row => row.level,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Students',
      selector: row => row.students,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-light rounded-circle btn-icon"
            onMouseEnter={(e) => showTooltip(e, 'View Details')}
            onMouseLeave={hideTooltip}
            onClick={() => navigate(`${baseUrl}/class/details/${row.id}`)}
          >
            <FaEye className="text-primary" />
          </button>
          
          <button
            className="btn btn-sm btn-light rounded-circle btn-icon"
            onMouseEnter={(e) => showTooltip(e, 'Edit Class')}
            onMouseLeave={hideTooltip}
            onClick={() => navigate(`${baseUrl}/class/edit/${row.id}`)}
          >
            <BsFillPencilFill className="text-warning" />
          </button>
          
          <button
            className="btn btn-sm btn-light rounded-circle btn-icon"
            onMouseEnter={(e) => showTooltip(e, 'Delete Class')}
            onMouseLeave={hideTooltip}
            onClick={() => confirmDelete(row.id)}
          >
            <MdDelete className="text-danger" />
          </button>
        </div>
      ),
      width: '150px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="fade-in">
      {/* Custom tooltip element */}
      <div id="custom-tooltip" className="tooltip-custom"></div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 fade-in">
        <div className="row align-items-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by class name"
                value={searchFilters.name}
                onChange={(e) => handleSearchChange('name', e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by course"
                value={searchFilters.course}
                onChange={(e) => handleSearchChange('course', e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-4 text-md-end">
            <button
              className="btn btn-danger btn-icon"
              onClick={() => navigate(`${baseUrl}/class/add`)}
            >
              <IoMdAdd className="me-1" /> Add New Class
            </button>
          </div>
        </div>
      </div>
      
      {/* Data table */}
      <div className="bg-white rounded-lg shadow-sm fade-in">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          fixedHeader
          highlightOnHover
          pointerOnHover
          progressPending={pending}
          progressComponent={<CustomLoader />}
          customStyles={tableCustomStyles}
          sortIcon={<FaSort className="ms-1 text-muted" />}
          noDataComponent={<NoDataComponent />}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          expandOnRowClicked
          responsive
        />
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop show fade-in"></div>
          <div className="modal show d-block fade-in">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-light">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={cancelDelete}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this class? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => handleDelete(deleteId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}