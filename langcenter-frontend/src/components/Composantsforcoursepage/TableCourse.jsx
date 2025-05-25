import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { MdDelete, MdAdd } from 'react-icons/md';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import axios from '../../api/axios';
import { motion } from 'framer-motion';

export default function TableCourse() {
  const [coursData, setCoursData] = useState([]);
  const [records, setRecords] = useState([]);
  const [pending, setPending] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();
  
  let x = '';
  if (user && user.role === 'admin') {
    x = '';
  } else if (user && user.role === 'director') {
    x = '/director';
  } else {
    x = '/secretary';
  }

  // Styles for the DataTable
  const tableCustomStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        paddingLeft: '16px',
        paddingRight: '16px',
        color: '#495057',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        fontSize: '15px',
        '&:nth-of-type(even)': {
          backgroundColor: '#f8f9fa',
        },
        '&:hover': {
          backgroundColor: '#e9ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        transition: 'all 0.2s ease',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setPending(true);
    try {
      const response = await axios.get('/api/cours');
      const newData = response.data.map((course) => ({
        id: course.id,
        course_name: course.title,
        duration: course.duration,
        price: parseFloat(course.price).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'MAD',
        }),
        rawPrice: parseFloat(course.price),
        description: course.description || '—',
      }));
      setCoursData(newData);
      setRecords(newData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setNotification('Failed to load courses');
      setVariant('danger');
    } finally {
      setPending(false);
    }
  };

  // Handle search
  const handleSearchChange = (searchQuery) => {
    setSearchTerm(searchQuery);
    if (searchQuery.trim() === '') {
      setRecords(coursData);
    } else {
      const filteredData = coursData.filter((item) =>
        item.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.duration.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRecords(filteredData);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  // Delete course
  const deleteRow = async () => {
    if (!courseToDelete) return;
    
    try {
      await axios.delete(`/api/cours/${courseToDelete.id}`);
      setNotification('Course deleted successfully');
      setVariant('danger');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      
      // Update the table data after deletion
      const updatedData = coursData.filter(item => item.id !== courseToDelete.id);
      setCoursData(updatedData);
      setRecords(updatedData);
      
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      setNotification('Failed to delete course');
      setVariant('danger');
    }
  };

  // Table columns
  const columns = [
    /*{
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
      width: '70px',
    },*/
    {
      name: 'Course Name',
      selector: (row) => row.course_name,
      sortable: true,
      grow: 2,
      center: true,
    },
    {
      name: 'Duration',
      selector: (row) => row.duration,
      sortable: true,
    },
    {
      name: 'Price',
      selector: (row) => row.price,
      sortable: true,
      sortFunction: (a, b) => a.rawPrice - b.rawPrice,
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link to={`${x}/course/edit/${row.id}`}>
            <motion.button 
              className="btn btn-sm btn-outline-warning"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <BsFillPencilFill />
            </motion.button>
          </Link>
          <motion.button 
            className="btn btn-sm btn-outline-danger"
            onClick={() => confirmDelete(row)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdDelete />
          </motion.button>
        </div>
      ),
      width: '120px',
      button: true,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container-fluid py-4"
    >
      <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-white py-3">
          <div className="row align-items-center">
            <div className="col-md-8 col-lg-7">
              <h2 className="fw-bold mb-0 text-primary">Course Management</h2>
              <p className="text-muted mb-0">
                Manage your courses, add new ones or modify existing ones
              </p>
            </div>
            <div className="col-md-4 col-lg-5 mt-3 mt-md-0">
              <div className="d-flex gap-3 justify-content-md-end">
                <div className="position-relative flex-grow-1">
                  <input
                    type="text"
                    className="form-control form-control-lg pe-5"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  <FaSearch 
                    className="position-absolute" 
                    style={{ 
                      right: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6c757d'
                    }} 
                  />
                </div>
                <Link to={`${x}/course/add`}>
                  <motion.button
                    className="btn btn-primary btn-lg d-flex align-items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdAdd size={20} className="me-1" /> Add
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={records}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 300px)"
            highlightOnHover
            customStyles={tableCustomStyles}
            progressPending={pending}
            progressComponent={
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2">Loading courses...</div>
              </div>
            }
            noDataComponent={
              <div className="text-center my-5">
                <div className="text-muted">No courses found</div>
                {searchTerm && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-outline-secondary mt-2"
                      onClick={() => handleSearchChange('')}
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the course "{courseToDelete?.course_name}"?</p>
                <p className="text-danger fw-semibold">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={deleteRow}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}