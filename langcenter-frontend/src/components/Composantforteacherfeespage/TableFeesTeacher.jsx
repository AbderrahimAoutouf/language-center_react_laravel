import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill, BsTrash } from 'react-icons/bs';
import { UseStateContext } from '../../context/ContextProvider';
import { 
    Button, 
    Form, 
    Row, 
    Col, 
    Modal, 
    Card 
} from "react-bootstrap";
import axios from "../../api/axios";
import { motion } from 'framer-motion';

export default function TableFeesTeacher() {
    // Custom table styles with improved readability
    const tableCustomStyles = {
        headCells: {
            style: {
                fontSize: '16px',
                fontWeight: '700',
                textTransform: 'uppercase',
                backgroundColor: '#f8f9fa',
                color: '#495057',
                borderBottom: '2px solid #dee2e6',
                justifyContent: 'center',
            },
        },
        cells: {
            style: {
                fontSize: '14px',
                color: '#212529',
                justifyContent: 'center',
            },
        },
        rows: {
            style: {
                '&:nth-of-type(even)': {
                    backgroundColor: '#f1f3f5',
                },
                '&:hover': {
                    backgroundColor: '#e9ecef',
                    transition: 'background-color 0.2s ease-in-out',
                },
            },
        },
    };

    // Context and state management
    const { user, setNotification, setVariant } = UseStateContext();
    const [feesData, setFeesData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalShow, setDeleteModalShow] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);

    // Determine route based on user role
    const getRoutePrefix = useMemo(() => {
        if (!user) return '';
        switch (user.role) {
            case 'admin': return '';
            case 'director': return '/director';
            case 'secretary': return '/secretary';
            default: return '';
        }
    }, [user]);

    // Fetch fees data
    useEffect(() => {
        const fetchFeesData = async () => {
            try {
                const response = await axios.get('/api/salary');
                const processedData = response.data.data.map((row) => ({
                    id: row.id,
                    name: row.teacher_name,
                    hours: row.hours || 'N/A',
                    amount: row.salary,
                    year: row.year,
                    month: row.month,
                    date: row.date,
                }));
                setFeesData(processedData);
                setFilteredData(processedData);
            } catch (error) {
                console.error('Error fetching fees data:', error);
                setNotification('Failed to load fees data');
                setVariant('danger');
            }
        };
        fetchFeesData();
    }, [setNotification, setVariant]);

    // Search functionality
    useEffect(() => {
        const filterData = () => {
            if (!searchTerm) {
                setFilteredData(feesData);
                return;
            }

            const newData = feesData.filter(row =>
                row.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(newData);
        };

        filterData();
    }, [searchTerm, feesData]);

    // Delete row handler
    const handleDeleteRow = async (id) => {
        try {
            await axios.delete(`/api/salary/${id}`);
            
            // Update local state
            const updatedData = feesData.filter((row) => row.id !== id);
            setFeesData(updatedData);
            
            // Show notification
            setNotification('Salary has been deleted successfully');
            setVariant('danger');
            
            // Close modal
            setDeleteModalShow(false);
        } catch (error) {
            console.error('Error deleting salary:', error);
            setNotification('Failed to delete salary entry');
            setVariant('danger');
        }
    };

    // Column definitions
    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            width: '80px',
        },
        {
            name: "Full Name",
            selector: row => row.name,
            sortable: true,
        },
        {
            name: "Worked Hours",
            selector: row => row.hours,
            sortable: true,
        },
        {
            name: "Year",
            selector: row => row.year,
            sortable: true,
            width: '100px',
        },
        {
            name: "Month",
            selector: row => row.month,
            sortable: true,
            width: '100px',
        },
        {
            name: "Amount",
            selector: row => row.amount,
            sortable: true,
        },
        {
            name: "Payment Date",
            selector: row => row.date,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex justify-content-center align-items-center">
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="me-2"
                    >
                        <Link 
                            to={`${getRoutePrefix}/fees/teacher/edit/${row.id}`}
                            className="text-warning"
                        >
                            <BsFillPencilFill />
                        </Link>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <button 
                            onClick={() => {
                                setSelectedRowId(row.id);
                                setDeleteModalShow(true);
                            }}
                            className="btn btn-link text-danger p-0"
                        >
                            <BsTrash />
                        </button>
                    </motion.div>
                </div>
            ),
            width: '120px',
            center: true,
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container-fluid p-4"
        >
            <Card className="shadow-sm">
                <Card.Header as="h4" className="bg-primary text-white">
                    Teachers Salary Entries
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Control 
                                type="text" 
                                placeholder="Search by Teacher Name" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={6} className="text-end">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to={`${getRoutePrefix}/fees/teacher/add`}>
                                    <Button variant="success">
                                        Add New Entry
                                    </Button>
                                </Link>
                            </motion.div>
                        </Col>
                    </Row>

                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={tableCustomStyles}
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30, 50]}
                    />
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal 
                show={deleteModalShow} 
                onHide={() => setDeleteModalShow(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this salary entry?
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setDeleteModalShow(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => handleDeleteRow(selectedRowId)}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
}