import React, { useState, useEffect, useCallback } from "react";
import { Container, Card, InputGroup, FormControl, Row, Col, Button as BootstrapButton } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { BsFillEyeFill, BsFillPencilFill, BsSearch, BsPlus } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';
import { UseStateContext } from "../../context/ContextProvider";
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Index() {
    // Table styles with improved aesthetics
    const tableCustomStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: '#dee2e6',
            },
        },
        headCells: {
            style: {
                fontSize: '16px',
                fontWeight: '600',
                padding: '16px',
                color: '#495057',
                borderBottomColor: '#dee2e6',
            },
        },
        rows: {
            style: {
                fontSize: '15px',
                '&:hover': {
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                },
                animation: 'fadeIn 0.5s',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#f1f3f5',
                transition: 'all 0.3s',
            },
        },
        cells: {
            style: {
                padding: '16px',
                fontSize: '15px',
            },
        },
        pagination: {
            style: {
                fontSize: '14px',
                color: '#6c757d',
            },
            pageButtonsStyle: {
                borderRadius: '50%',
                height: '40px',
                width: '40px',
                padding: '8px',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s',
            },
        },
    };

    const { user, setNotification, setVariant } = UseStateContext();
    const [pending, setPending] = useState(true);
    const [data, setData] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();
    
    // Determine path prefix based on user role
    let x = "";
    if (user && user.role === 'admin') {
        x = "";
    } else if (user && user.role === 'director') {
        x = "/director";
    } else {
        x = "/secretary";
    }

    // Fetch levels data
    const fetchLevels = useCallback(async () => {
        setPending(true);
        try {
            const response = await axios.get("/api/levels");
            setData(
                response?.data?.map((item) => ({
                    id: item.id,
                    name: item.name,
                }))
            );
            setPending(false);
        } catch (err) {
            console.error("Error fetching levels:", err);
            toast.error("Failed to load data. Please try again.");
            setPending(false);
        }
    }, []);
    
    useEffect(() => {
        fetchLevels();
    }, [fetchLevels, refreshKey]);

    // Table columns configuration
    const col = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="fw-medium">{row.name}</div>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link to={`${x}/levels/${row.id}`}>
                            <BootstrapButton variant="outline-success" size="sm" className="rounded-circle">
                                <BsFillEyeFill />
                            </BootstrapButton>
                        </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link to={`${x}/levels/edit/${row.id}`}>
                            <BootstrapButton variant="outline-warning" size="sm" className="rounded-circle">
                                <BsFillPencilFill />
                            </BootstrapButton>
                        </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <BootstrapButton 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-circle"
                            onClick={() => confirmDelete(row.id, row.name)}
                        >
                            <MdDelete />
                        </BootstrapButton>
                    </motion.div>
                </div>
            ),
            width: '180px',
            center: true,
        }
    ];

    // Delete confirmation and action
    const confirmDelete = (id, name) => {
        MySwal.fire({
            title: 'Are you sure?',
            html: `You are about to delete level: <strong>${name}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            backdrop: 'rgba(0,0,0,0.4)',
            customClass: {
                confirmButton: 'btn btn-danger mx-2',
                cancelButton: 'btn btn-secondary mx-2',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                deleteRow(id);
            }
        });
    };

    const deleteRow = async (id) => {
        try {
            await axios.delete(`/api/levels/${id}`);
            
            // Show success toast
            toast.success("Level deleted successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setNotification("Level deleted successfully");
            setVariant("success");
            setTimeout(() => {
                setNotification('');
                setVariant('');
              }, 3000);
            
            // Update the data state to reflect the deletion
            setData(prev => prev.filter(item => item.id !== id));
            
        } catch (err) {
            console.error('Delete error:', err);
            
            // Show error toast
            toast.error("Failed to delete level", {
                position: "top-right",
                autoClose: 4000,
            });
            
            setNotification("Level deletion failed");
            setVariant("danger");
            setTimeout(() => {
                setNotification('');
                setVariant('');
              }, 3000);
        }
    };

    // Filter data based on search input
    const filteredData = data.filter((item) => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        setNameFilter(e.target.value);
    };

    // Animation variants for components
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="py-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <ToastContainer />
            
            <Container fluid>
                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold text-primary">Manage Levels</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-4 align-items-center">
                                <Col md={6}>
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <InputGroup>
                                            <InputGroup.Text className="bg-light">
                                                <BsSearch />
                                            </InputGroup.Text>
                                            <FormControl
                                                placeholder="Search by level name..."
                                                value={nameFilter}
                                                onChange={handleSearchChange}
                                                className="py-2"
                                            />
                                        </InputGroup>
                                    </motion.div>
                                </Col>
                                <Col md={6} className="text-md-end mt-3 mt-md-0">
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }} 
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link to={`${x}/levels/add`}>
                                            <BootstrapButton variant="primary" className="d-flex align-items-center">
                                                <BsPlus size={20} className="me-1" />
                                                <span>Add New Level</span>
                                            </BootstrapButton>
                                        </Link>
                                    </motion.div>
                                </Col>
                            </Row>
                            
                            <motion.div variants={itemVariants}>
                                <DataTable
                                    columns={col}
                                    data={filteredData}
                                    pagination
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                    fixedHeader
                                    fixedHeaderScrollHeight="500px"
                                    highlightOnHover
                                    pointerOnHover
                                    responsive
                                    progressPending={pending}
                                    progressComponent={
                                        <div className="my-5 text-center">
                                            <Ellipsis size={64} color="#4f46e5" sizeUnit="px" />
                                            <p className="mt-3 text-muted">Loading data...</p>
                                        </div>
                                    }
                                    customStyles={tableCustomStyles}
                                    noDataComponent={
                                        <div className="py-4">
                                            <p className="text-center text-muted mb-0">No levels found</p>
                                        </div>
                                    }
                                />
                            </motion.div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Container>
        </motion.div>
    );
}