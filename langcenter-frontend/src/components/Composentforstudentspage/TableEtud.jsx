import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillEyeFill, BsFillPencilFill, BsDownload, BsSearch, BsFilterCircle } from 'react-icons/bs';
import { MdDelete, MdToggleOn, MdToggleOff, MdOutlineClass } from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';
import { Ellipsis } from 'react-awesome-spinners';
import { UseStateContext } from '../../context/ContextProvider';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Form from 'react-bootstrap/Form';
import { Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';
import * as XLSX from 'xlsx';
import imgStudent from '../../images/student.png';
import { toast } from 'react-toastify';
import AddClass from './AddClass';
import ParentModal from './ParentModal';

const TableEtud = () => {
    const [selectedID, setSelectedID] = useState(null);
    const [parentModalShow, setParentModalShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [levels, setLevels] = useState([]);
    const { user, setNotification, setVariant } = UseStateContext();
    const [pending, setPending] = useState(true);
    const [data, setData] = useState([]);
    
    // Filters
    const [nameFilter, setNameFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const navigate = useNavigate();

    // Define base path based on user role
    const basePath = useMemo(() => {
        if (user?.role === 'admin') return '';
        else if (user?.role === 'director') return '/director';
        else return '/secretary';
    }, [user?.role]);

    // Enhanced table styles
    const tableCustomStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #dee2e6',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#495057',
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
            },
            activeSortStyle: {
                color: '#D60A0B',
                fontWeight: 'bold',
                '&:hover:not(:focus)': {
                    color: '#D60A0B',
                },
            },
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
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
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
                fontSize: '14px',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
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

    // Fetch students and levels data
    const fetchData = async () => {
        try {
            setPending(true);
            const [studentsRes, levelsRes] = await Promise.all([
                axios.get('/api/etudiants'),
                axios.get('/api/levels')
            ]);

            const formattedData = studentsRes.data.data.map(student => ({
                id: student.id,
                avatar: student.avatar || imgStudent,
                name: `${student.prenom} ${student.nom}`,
                gender: student.sexe,
                class: student.classes?.map(c => c.name).join(', ') || 'No class',
                classNames: student.classes?.map(c => c.name) || [],
                parents: student.parent ? `${student.parent.nom} ${student.parent.prenom}` : '_________',
                parent_id: student.parent?.id,
                status: student.status !== undefined ? student.status : true,
                level: student.level?.id,
                levelName: student.level?.name || 'No level',
                avance: student.avance || 0 

            }));

            setData(formattedData);
            setLevels(levelsRes.data);
            setPending(false);
            
            // Show success notification
            toast.success('Student data loaded successfully');
            setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        } catch (error) {
            console.error('Error fetching data:', error);
            setNotification('Failed to load data');
            setVariant('danger');
            setPending(false);
            
            // Show error notification
            toast.error('Failed to load student data');
            setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        }
    };

    useEffect(() => {
        fetchData();
    }, [setNotification, setVariant]);

    // Filter function
    const filteredData = useMemo(() => data.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase());
        const classMatch = classFilter === '' || 
            (item.class && item.class.toLowerCase().includes(classFilter.toLowerCase()));
        const statusMatch = statusFilter === 'all' || 
            (statusFilter === 'active' && item.status) || 
            (statusFilter === 'inactive' && !item.status);
        const levelMatch = levelFilter === '' || 
            (item.levelName && item.levelName.toLowerCase().includes(levelFilter.toLowerCase()));
            
        return nameMatch && classMatch && statusMatch && levelMatch;
    }), [data, nameFilter, classFilter, statusFilter, levelFilter]);

    // Delete student
    const deleteRow = async (id) => {
        try {
            await axios.delete(`/api/etudiants/${id}`);
            
            // Optimistic UI update
            setData(prev => prev.filter(item => item.id !== id));
            
            setNotification('Student deleted successfully');
            setVariant('danger');
        setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        } catch (error) {
            console.error('Delete error:', error);
            setNotification('Delete failed');
            setVariant('danger');
            setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        }
    };

    // Handle confirmation before delete
    const handleDeleteConfirmation = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            deleteRow(id);
        }
    };

    // Export functions
    const handleExportCSV = () => {
        try {
            const exportData = filteredData.map(({ avatar, parent_id, ...rest }) => rest);
            
            const parser = new Parser({ 
                fields: ['id', 'name', 'gender', 'class', 'parents', 'levelName', 'avance', 'status'] 
            });
            const csv = parser.parse(exportData);
            saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `students_export_${new Date().toISOString().slice(0,10)}.csv`);
            
            toast.success('CSV exported successfully');
            setNotification('CSV exported successfully');
            setVariant('success');
        } catch (err) {
            console.error(err);
            toast.error('Export failed');
            setNotification('Export failed');
            setVariant('danger');
        }
    };
      
    const handleExportExcel = () => {
        try {
            // Prepare data for export by cleaning up and formatting
            const exportData = filteredData.map(student => ({
                ID: student.id,
                Name: student.name,
                Gender: student.gender,
                Class: student.class,
                Level: student.levelName,
                Parent: student.parents,
                Avance: student.avance ? `${student.avance} DH` : '0 DH',
                Status: student.status ? 'Active' : 'Inactive'
            }));
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Students');
            XLSX.writeFile(wb, `students_${new Date().toISOString().slice(0,10)}.xlsx`);
            
            toast.success('Excel exported successfully');
            setNotification('Excel exported successfully');
            setVariant('success');
        } catch (err) {
            console.error(err);
            toast.error('Export failed');
            setNotification('Export failed');
            setVariant('danger');
        }
    };

    // Update student level
    const handleChangeLevel = async (e, id) => {
        const levelId = e.target.value;
        try {
            await axios.post('/api/assignLevel', {
                student_id: id,
                level_id: levelId
            });
            
            // Find the level name for UI update
            const levelName = levels.find(level => level.id.toString() === levelId)?.name || 'Unknown Level';
            
            // Optimistic UI update
            setData(prev => prev.map(item => 
                item.id === id ? { ...item, level: levelId, levelName } : item
            ));
            
            toast.success('Level updated successfully');
        } catch (error) {
            console.error('Level update error:', error);
            toast.error('Failed to update level');
        }
    };

    // Toggle student status
    const toggleStatus = async (id, currentStatus) => {
        try {
            await axios.patch(`/api/etudiants/${id}/status`, {
                status: !currentStatus
            });
            
            // Update local state
            setData(prev => prev.map(item => 
                item.id === id ? { ...item, status: !currentStatus } : item
            ));
            
            toast.success(`Student marked as ${!currentStatus ? 'active' : 'inactive'}`);
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update status');
        }
    };

    // Show parent details
    const handleShowParent = (parentId) => {
        if (parentId) {
            setSelectedID(parentId);
            setParentModalShow(true);
        } else {
            toast.info('No parent information available');
        }
    };

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

    // Column definitions
    const columns = [
      /*  {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '70px'
        },*/
        {
            name: 'Student',
            cell: row => (
                <div className="d-flex align-items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }}>
                        <img 
                            src={row.avatar}
                            alt={row.name}
                            className="rounded-circle"
                            style={{ 
                                width: '45px', 
                                height: '45px',
                                objectFit: 'cover',
                                border: '2px solid #e9ecef'
                            }}
                            onError={(e) => {
                                e.target.src = imgStudent;
                            }}
                            title={row.name}
                        />
                    </motion.div>
                    <div>
                        <div className="fw-bold">{row.name}</div>
                        <small className="text-muted">{row.levelName}</small>
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
                    {row.classNames?.length > 0 ? (
                        <div className="d-flex flex-wrap">
                            {row.classNames.map((cls, index) => (
                                <ClassBadge key={`${row.id}-${index}`} className={cls} />
                            ))}
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Add to class</Tooltip>}
                            >
                                <motion.button 
                                    className="btn btn-sm btn-outline-primary rounded-circle ms-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(row); 
                                        setShowModal(true);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdOutlineClass size={14} />
                                </motion.button>
                            </OverlayTrigger>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <span className="text-muted me-2">No class</span>
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Add to class</Tooltip>}
                            >
                                <motion.button 
                                    className="btn btn-sm btn-outline-primary rounded-circle"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(row); 
                                        setShowModal(true);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdOutlineClass size={14} />
                                </motion.button>
                            </OverlayTrigger>
                        </div>
                    )}
                </div>
            ),
            grow: 2,
            sortable: true,
            sortFunction: (a, b) => a.class.localeCompare(b.class),
        },
        {
    name: 'Avance',
    cell: row => (
        <div className="text-center">
            <span className={`badge ${row.avance > 0 ? 'bg-success' : 'bg-secondary'}`}>
                {row.avance ? `${row.avance} DH` : '0 DH'}
            </span>
        </div>
    ),
    width: '120px',
    center: true,
    sortable: true,
    sortFunction: (a, b) => (a.avance || 0) - (b.avance || 0),
},
        {
            name: 'Parent',
            cell: row => (
                <motion.button 
                    className={`btn btn-sm ${row.parents === "_________" ? 'text-danger' : 'text-primary'}`}
                    onClick={() => handleShowParent(row.parent_id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {row.parents}
                </motion.button>
            ),
            grow: 1,
            sortable: true,
        },
        {
            name: 'Level',
            cell: row => (
                <Form.Select 
                    value={row.level || ""}
                    onChange={(e) => handleChangeLevel(e, row.id)}
                    size="sm"
                    className="border-primary"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                </Form.Select>
            ),
            width: '150px'
        },
        {
            name: 'Status',
            cell: row => (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(row.id, row.status);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="btn btn-light d-flex align-items-center gap-2" style={{
                        border: row.status ? '1px solid green' : '1px solid gray',
                        borderRadius: '20px',
                        backgroundColor: row.status ? '#e9fbe9' : '#f0f0f0',
                        padding: '0.25rem 0.75rem',
                    }}>
                        {row.status ? (
                            <>
                                <MdToggleOn color="green" size={22} />
                                <span style={{ fontWeight: '500', color: 'green' }}>Active</span>
                            </>
                        ) : (
                            <>
                                <MdToggleOff color="gray" size={22} />
                                <span style={{ fontWeight: '500', color: 'gray' }}>Inactive</span>
                            </>
                        )}
                    </div>
                </motion.div>
            ),
            width: '140px',
            sortable: true,
            sortFunction: (a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1),
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                    <motion.div whileHover={{ scale: 1.1 }}>
                        <Link to={`${basePath}/student/${row.id}`}>
                            <button 
                                className="btn btn-sm btn-outline-primary" 
                                data-tooltip-id="action-tooltip"
                                data-tooltip-content="View Details"
                            >
                                <BsFillEyeFill />
                            </button>
                        </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }}>
                        <Link to={`${basePath}/student/editStudent/${row.id}`}>
                            <button 
                                className="btn btn-sm btn-outline-warning"
                                data-tooltip-id="action-tooltip"
                                data-tooltip-content="Edit Student"
                            >
                                <BsFillPencilFill />
                            </button>
                        </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }}>
                        <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteConfirmation(row.id)}
                            title="Delete Student"
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

    return (
        <motion.div 
            className="student-table-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card shadow-sm"
            >
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                        <FaUserGraduate size={24} className="text-danger me-2" />
                        <h5 className="m-0">Student Management</h5>
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
                        <Link to={`${basePath}/student/addStudent`}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-danger"
                            >
                                Add Student
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
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            <BsSearch />
                                        </span>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Search by name"
                                            value={nameFilter}
                                            onChange={(e) => setNameFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small mb-1">Class</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            <MdOutlineClass />
                                        </span>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Search by class"
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small mb-1">Level</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Search by level"
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small mb-1">Status</label>
                                    <select 
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
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
                        paginationResetDefaultPage={resetPaginationToggle}
                        progressPending={pending}
                        progressComponent={
                            <div className="py-5 text-center">
                                <Ellipsis size={64} color="#D60A0B" />
                                <p className="mt-3">Loading student data...</p>
                            </div>
                        }
                        customStyles={tableCustomStyles}
                        highlightOnHover={true}
                        pointerOnHover={true}
                        responsive={true}
                        striped={false}
                        noDataComponent={
                            <div className="p-4 text-center">
                                <FaUserGraduate size={50} className="text-secondary mb-2" />
                                <h5>No students found</h5>
                                <p className="text-muted">Try adjusting your search or filters</p>
                            </div>
                        }
                        onRowClicked={(row) => navigate(`${basePath}/student/${row.id}`)}
                    />
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <AddClass 
                        showModal={showModal} 
                        handleClose={() => {
                            setShowModal(false);
                            setSelectedItem(null);
                        }} 
                        selectedItem={selectedItem}
                        onSuccess={fetchData}
                    />
                )}
            </AnimatePresence>
            
            <ParentModal 
                show={parentModalShow} 
                onHide={() => setParentModalShow(false)} 
                parentId={selectedID}
            />
        </motion.div>
    );
};

export default TableEtud;