import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill, BsDownload, BsFilterCircle } from 'react-icons/bs';
import { MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { FaEye, FaChalkboardTeacher } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { UseStateContext } from '../../context/ContextProvider';
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';
import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';
import * as XLSX from 'xlsx';
import imgTeacher from "../../images/teacher.png";
export default function TableTeacher() {
  const [teacherData, setTeacherData] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [pending, setPending] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const { user, setNotification, setVariant } = UseStateContext();

  const getRolePath = () => {
    if (!user) return "";
    if (user.role === "admin") return "";
    if (user.role === "director") return "/director";
    return "/secretary";
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("api/teachers?populate=*");
        const data = res.data?.data || [];
        setTeacherData(data.map(item => ({
          id: item.id,
          avatar: item.avatar,
          active: item.active ?? false,
          name: `${item.first_name} ${item.last_name}`,
          first_name: item.first_name,
          last_name: item.last_name,
          gender: item.gender,
          classes: item.classes || [],
          classNames: item.classes?.length ? item.classes.map(c => c.name) : [],
          classDisplay: item.classes?.length ? item.classes.map(c => c.name).join(', ') : 'No class',
          subject: item.speciality,
          phone: item.phone,
          hourly_rate: item.hourly_rate,
          contract_type: item.contract_type, 
          monthly_salary: item.monthly_salary, 
        })));
      } catch (err) {
        console.error(err);
        setNotification("Failed to load teacher data", "danger");
        setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
      } finally {
        setPending(false);
      }
    };

    fetchTeachers();
  }, [setNotification, setVariant]);

  const handleExportCSV = () => {
    try {
      const exportData = filteredData.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        gender: teacher.gender,
        classes: teacher.classDisplay,
        subject: teacher.subject,
        phone: teacher.phone,
        payment: teacher.contract_type === 'monthly' ? teacher.monthly_salary : teacher.hourly_rate,
        contract_type: teacher.contract_type,
        active: teacher.active ? 'Active' : 'Inactive'
      }));
      
      const parser = new Parser({ 
        fields: ['id', 'name', 'gender', 'classes', 'subject', 'phone', 'payment', 'contract_type', 'active'] 
      });
      const csv = parser.parse(exportData);
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `teachers_export_${new Date().toISOString().slice(0,10)}.csv`);
      setNotification("CSV exported successfully", "success");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    } catch (error) {
      console.error("CSV Export error:", error);
      setNotification("Export failed", "danger");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredData.map(teacher => ({
        ID: teacher.id,
        Name: teacher.name,
        Gender: teacher.gender,
        Classes: teacher.classDisplay,
        Subject: teacher.subject,
        Phone: teacher.phone,
        Payment: teacher.contract_type === 'monthly' 
          ? `${teacher.monthly_salary} DH (Monthly)` 
          : `${teacher.hourly_rate} DH (Hourly)`,
        Status: teacher.active ? 'Active' : 'Inactive'
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teachers");
      XLSX.writeFile(wb, `teachers_export_${new Date().toISOString().slice(0,10)}.xlsx`);
      setNotification("Excel exported successfully", "success");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    } catch (error) {
      console.error("Excel Export error:", error);
      setNotification("Export failed", "danger");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await axios.patch(`api/teachers/${id}/toggle-active`);
      const updatedStatus = res.data?.data?.active;

      setTeacherData(prev =>
        prev.map(t => t.id === id ? { ...t, active: updatedStatus } : t)
      );

      setNotification(`Teacher status ${updatedStatus ? 'activated' : 'deactivated'}`, updatedStatus ? "success" : "warning");
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification('');
      }, 3000);
    } catch (error) {
      console.error("Status toggle error:", error);
      setNotification("Failed to update status", "danger");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    
    try {
      await axios.delete(`api/teachers/${id}`);
      setTeacherData(prev => prev.filter(t => t.id !== id));
      setNotification("Teacher deleted successfully", "success");
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    } catch (err) {
      setNotification(
        err.response?.status === 400
          ? "Cannot delete: Teacher is assigned to classes."
          : "Delete operation failed",
        "danger"
      );
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  const filteredData = useMemo(() => teacherData.filter(teacher => {
    const nameMatch = teacher.name.toLowerCase().includes(nameFilter.toLowerCase());
    
    // For class filter, check if any of the teacher's classes match
    const classMatch = classFilter === '' || 
      teacher.classNames.some(cls => cls.toLowerCase().includes(classFilter.toLowerCase()));
    
    const subjectMatch = subjectFilter === '' || 
      (teacher.subject && teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase()));
    
    const contractMatch = contractFilter === '' || teacher.contract_type === contractFilter;
    
    return nameMatch && classMatch && subjectMatch && contractMatch;
  }), [teacherData, nameFilter, classFilter, subjectFilter, contractFilter]);

  // Class badge with animation
  const ClassBadge = ({ className }) => (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="badge bg-info me-1 mb-1"
      style={{ fontSize: '0.85rem', fontWeight: 'normal' }}
    >
      {className}
    </motion.span>
  );

  const columns = [
    {
      name: 'Teacher',
      cell: row => (
        <div className="d-flex align-items-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }}>
            <img
              src={row.avatar || imgTeacher}
              alt={row.name}
              className="rounded-circle"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              onError={(e) => e.target.src = imgTeacher}
              title={row.name}
            />
          </motion.div>
          <div>
            <div style={{ fontWeight: '500' }}>{row.name}</div>
            <small className="text-muted">{row.subject || 'No subject'}</small>
          </div>
        </div>
      ),
      grow: 2,
      sortable: true,
      sortFunction: (a, b) => a.name.localeCompare(b.name),
    },
    {
      name: 'Gender',
      cell: row => (
        <span className={`badge ${row.gender === 'male' ? 'bg-primary' : 'bg-danger'}`}>
          {row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : '-'}
        </span>
      ),
      center: true,
      width: '100px',
      sortable: true,
    },
    {
      name: 'Classes',
      cell: row => (
        <div style={{ maxWidth: '250px' }}>
          {row.classNames.length > 0 ? (
            <div className="d-flex flex-wrap">
              {row.classNames.map((cls, index) => (
                <ClassBadge key={`${row.id}-${index}`} className={cls} />
              ))}
            </div>
          ) : (
            <span className="text-muted">No class</span>
          )}
        </div>
      ),
      grow: 2,
      sortable: true,
      sortFunction: (a, b) => a.classDisplay.localeCompare(b.classDisplay),
    },
    {
      name: 'Contact',
      cell: row => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <a href={`tel:${row.phone}`} className="text-decoration-none">
            {row.phone || 'N/A'}
          </a>
        </motion.div>
      ),
      width: '150px'
    },
    {
      name: 'Contract',
      center : true,
      cell: row => (
        <div className="d-flex flex-column align-items-center">
          <span className={`badge ${row.contract_type === 'monthly' ? 'bg-success' : 'bg-warning text-dark'}`}>
            {row.contract_type === 'monthly' ? 'Permanent' : 'Hourly'}
          </span>
          <small className="mt-1">
            {row.contract_type === 'monthly' 
              ? `${row.monthly_salary} DH/month` 
              : `${row.hourly_rate} DH/hour`}
          </small>
        </div>
      ),
      width: '150px',
      sortable: true,
      sortFunction: (a, b) => a.contract_type.localeCompare(b.contract_type),
    },
    {
      name: 'Status',
      cell: row => (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => toggleActive(row.id)}
          className="btn btn-light d-flex align-items-center gap-2"
          style={{
            border: row.active ? '1px solid green' : '1px solid gray',
            borderRadius: '20px',
            backgroundColor: row.active ? '#e9fbe9' : '#f0f0f0',
            padding: '0.25rem 0.75rem',
          }}
        >
          {row.active 
            ? <MdToggleOn color="green" size={22} /> 
            : <MdToggleOff color="gray" size={22} />
          }
          <span style={{ fontWeight: '500', color: row.active ? 'green' : 'gray' }}>
            {row.active ? 'Active' : 'Inactive'}
          </span>
        </motion.button>
      ),
      width: '140px',
      sortable: true,
      sortFunction: (a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2 justify-content-center">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to={`${getRolePath()}/teacher/details/${row.id}`}>
              <button 
                className="btn btn-sm btn-outline-primary" 
                data-tooltip-id="action-tooltip"
                data-tooltip-content="View Details"
              >
                <FaEye />
              </button>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to={`${getRolePath()}/teacher/edit/${row.id}`}>
              <button 
                className="btn btn-sm btn-outline-warning"
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Edit Teacher"
              >
                <BsFillPencilFill />
              </button>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.1 }}>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => deleteTeacher(row.id)}
              title="Delete Teacher"
            >
              <MdDelete />
            </button>
          </motion.div>
        </div>
      ),
      width: '150px',
      center: true,
    }
  ];

  const tableCustomStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#495057',
        paddingTop: '12px',
        paddingBottom: '12px',
        borderBottom: '2px solid #dee2e6',
      }
    },
    rows: {
      style: {
        minHeight: '60px',
        fontSize: '15px',
        '&:nth-of-type(odd)': {
          backgroundColor: '#f9f9f9',
        },
        '&:hover': {
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f5f5f5',
        borderBottomColor: '#e0e0e0',
        outline: '1px solid #e0e0e0',
        transition: 'all 0.2s ease',
      },
    },
    cells: {
      style: {
        paddingTop: '12px',
        paddingBottom: '12px',
      }
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        marginTop: '10px',
      },
      pageButtonsStyle: {
        borderRadius: '50%',
        height: '40px',
        width: '40px',
        padding: '8px',
        margin: '0px 5px',
        cursor: 'pointer',
      },
    },
  };

  // Animation variants for filter section
  const filterVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      marginBottom: '1rem',
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="teacher-table-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card shadow-sm"
      >
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center">
            <FaChalkboardTeacher size={24} className="text-primary me-2" />
            <h5 className="m-0">Teachers Management</h5>
            <span className="badge bg-secondary ms-2">{filteredData.length}</span>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <BsFilterCircle className="me-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </motion.button>
            <Link to={`${getRolePath()}/teacher/add`}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                Add Teacher
              </motion.button>
            </Link>
          </div>
        </div>
        
        <div className="card-body">
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={filterVariants}
                className="row g-3 mb-3 pb-3 border-bottom"
              >
                <div className="col-md-3">
                  <label className="form-label small mb-1">Name</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search by name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Class</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search by class"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Subject</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search by subject"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Contract Type</label>
                  <select
                    className="form-select"
                    value={contractFilter}
                    onChange={(e) => setContractFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="monthly">Permanent</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="d-flex justify-content-end mb-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline-success me-2"
              onClick={handleExportCSV}
            >
              <BsDownload className="me-1" /> CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline-primary"
              onClick={handleExportExcel}
            >
              <BsDownload className="me-1" /> Excel
            </motion.button>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            fixedHeader
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            progressPending={pending}
            progressComponent={
              <div className="py-5 text-center">
                <Ellipsis size={64} color='#0d6efd' sizeUnit='px' />
                <p className="mt-3">Loading teachers data...</p>
              </div>
            }
            customStyles={tableCustomStyles}
            highlightOnHover={true}
            pointerOnHover={true}
            responsive={true}
            striped={false}
            noDataComponent={
              <div className="p-4 text-center">
                <div className="text-muted">No teachers found matching your filters</div>
              </div>
            }
            onRowClicked={(row) => setSelectedTeacher(selectedTeacher?.id === row.id ? null : row)}
          />
        </div>
      </motion.div>

      {/* End of teacher management UI */}
    </div>
  );
}