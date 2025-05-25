import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { 
  BsPencilFill, 
  BsTrashFill, 
  BsPlusCircleFill, 
  BsSearch, 
  BsFilterLeft 
} from 'react-icons/bs';
import { Card, Form, Row, Col, Modal, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { UseStateContext } from '../../context/ContextProvider';
import axios from '../../api/axios';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function ExpenseManagement() {
  // State Management
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Context 
  const { 
    user, 
    setNotification, 
    setVariant 
  } = UseStateContext();

  // Dynamic Route Prefix
  const routePrefix = useMemo(() => {
    if (!user) return '';
    switch (user.role) {
      case 'director': return '/director';
      case 'secretary': return '/secretary';
      default: return '';
    }
  }, [user]);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get('/api/expenses');
      const formattedExpenses = response.data.data.map(expense => ({
        id: expense.id,
        name: expense.expense_name,
        amount: parseFloat(expense.expense_amount).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        }),
        description: expense.expense_description,
        paymentType: expense.type_of_payment,
        discount: expense.discount ? 
          parseFloat(expense.discount).toLocaleString('en-US', {
            style: 'percent',
            minimumFractionDigits: 2
          }) 
          : 'N/A',
        totalAmount: parseFloat(expense.total_amount).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        }),
        personName: expense.person_name,
        source: expense.from,
        date: new Date(expense.created_at).toLocaleDateString(),
        updatedAt: new Date(expense.updated_at).toLocaleDateString()
      }));
      
      setData(formattedExpenses);
      setFilteredData(formattedExpenses);
    } catch (error) {
      setNotification('Failed to load expenses');
      setVariant('danger');
      console.error('Expenses fetch error:', error);
    }
  }, [setNotification, setVariant]);

  // Initial Data Fetch
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Filtering Logic
  useEffect(() => {
    const { name, dateFrom, dateTo } = filters;
    
    const filtered = data.filter(expense => {
      const nameMatch = expense.name.toLowerCase().includes(name.toLowerCase());
      
      const expenseDate = new Date(expense.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      const dateMatch = (!fromDate || expenseDate >= fromDate) && 
                        (!toDate || expenseDate <= toDate);
      
      return nameMatch && dateMatch;
    });
    
    setFilteredData(filtered);
  }, [filters, data]);

  // Delete Expense Handler
  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      await axios.delete(`/api/expenses/${selectedExpense}`);
      
      setData(prev => prev.filter(expense => expense.id !== selectedExpense));
      
      setNotification('Expense deleted successfully');
      setVariant('success');
    } catch (error) {
      setNotification('Failed to delete expense');
      setVariant('danger');
      console.error('Delete expense error:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedExpense(null);
    }
  };

  // Table Columns Configuration
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 2
    },
    {
      name: 'Amount',
      selector: row => row.amount,
      sortable: true
    },
    {
      name: 'Payment Type',
      selector: row => row.paymentType,
      sortable: true
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex justify-content-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link 
              to={`${routePrefix}/fees/expenses/edit/${row.id}`}
              className="text-warning"
            >
              <BsPencilFill />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="link"
              className="text-danger p-0"
              onClick={() => {
                setSelectedExpense(row.id);
                setIsDeleteModalOpen(true);
              }}
            >
              <BsTrashFill />
            </Button>
          </motion.div>
        </div>
      ),
      width: '120px',
      center: true
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container-fluid p-4"
    >
      <Card className="shadow-sm">
        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Expense Management</h4>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to={`${routePrefix}/fees/expenses/add`}>
              <Button variant="success" className="d-flex align-items-center gap-2">
                <BsPlusCircleFill /> Add Expense
              </Button>
            </Link>
          </motion.div>
        </Card.Header>
        
        <Card.Body>
          {/* Filtering Section */}
          <Row className="mb-3 align-items-center">
            <Col md={4} className="position-relative">
              <Form.Control 
                type="text" 
                placeholder="Search by Name"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({
                  ...prev, 
                  name: e.target.value
                }))}
                className="pl-4"
              />
              <BsSearch 
                className="position-absolute top-50 translate-middle-y text-muted" 
                style={{ left: '10px' }} 
              />
            </Col>
            <Col md={4}>
              <Form.Control 
                type="date" 
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({
                  ...prev, 
                  dateFrom: e.target.value
                }))}
                placeholder="From Date"
              />
            </Col>
            <Col md={4}>
              <Form.Control 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({
                  ...prev, 
                  dateTo: e.target.value
                }))}
                placeholder="To Date"
              />
            </Col>
          </Row>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={isDeleteModalOpen} 
        onHide={() => setIsDeleteModalOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this expense? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteExpense}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}