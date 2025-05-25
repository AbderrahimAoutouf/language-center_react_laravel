import React, { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import { Form, Row, Col, Table, Button, Card, Alert } from 'react-bootstrap';
import * as Yup from 'yup';
import axios from "../../api/axios";
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { motion } from 'framer-motion';

export default function AddFeesT() {
    const navigate = useNavigate();
    const { setNotification, setVariant } = UseStateContext();

    // Dynamic year generation
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from(
            { length: 10 }, 
            (_, index) => currentYear - 5 + index
        );
    }, []);

    // Months array for more readable code
    const monthOptions = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const formik = useFormik({
        initialValues: {
            name: '',
            month: '',
            year: '',
            amount: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Please select a teacher'),
            month: Yup.string().required('Please select a month'),
            year: Yup.string().required('Please select a year'),
            amount: Yup.string()
                .required('Please enter the amount')
                .matches(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
        }),
        onSubmit: async (values) => {
            try {
                const sendData = {
                    teacher_id: values.name,
                    salary: values.amount,
                    month: values.month,
                    year: values.year,
                };

                await axios.post('/api/salary', sendData);
                
                setNotification('Salary has been added successfully');
                setVariant('success');
                
                setTimeout(() => {
                    setNotification('');
                    setVariant('');
                }, 3000);
                
                navigate('/fees/teacher');
            } catch (error) {
                setNotification('Error adding salary. Please try again.');
                setVariant('danger');
            }
        },
    });

    // State management
    const [teacherData, setTeacherData] = useState([]);
    const [hoursData, setHoursData] = useState([]);
    const [hourlyRateData, setHourlyRateData] = useState([]);
    const [contractType, setContractType] = useState('hourly');
    const [monthlySalary, setMonthlySalary] = useState(0);

    // Fetch teacher data on component mount
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get('/api/teachers');
                setTeacherData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    // Fetch teacher details and hours when relevant fields change
    useEffect(() => {
        const fetchTeacherDetails = async () => {
            if (!formik.values.name) return;

            try {
                const dateData = {
                    month: formik.values.month,
                    year: formik.values.year,
                };

                const teacherFound = teacherData.find(
                    teacher => teacher.id == formik.values.name
                );

                if (!teacherFound) return;

                // Set basic teacher information
                setHourlyRateData(teacherFound.hourly_rate);
                setContractType(teacherFound.contract_type);
                setMonthlySalary(teacherFound.monthly_salary);

                // Auto-calculate amount based on contract type
                if (teacherFound.contract_type === 'monthly') {
                    formik.setFieldValue('amount', teacherFound.monthly_salary);
                } else {
                    // For hourly contract, fetch hours
                    const response = await axios.post(
                        `/api/hours/${formik.values.name}`, 
                        dateData
                    );
                    setHoursData(response.data);
                }
            } catch (error) {
                console.error('Error fetching teacher details:', error);
            }
        };

        fetchTeacherDetails();
    }, [formik.values.name, formik.values.month, formik.values.year, teacherData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container-fluid p-4"
        >
            <Card className="shadow-sm">
                <Card.Header as="h4" className="bg-primary text-white">
                    Teacher Salary Entry
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Row className="g-3">
                            {/* Teacher Name Dropdown */}
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label htmlFor='name'>Teacher Name*</Form.Label>
                                    <Form.Select
                                        id='name'
                                        className={`form-control ${formik.errors.name && formik.touched.name ? 'is-invalid' : ''}`}
                                        {...formik.getFieldProps('name')}
                                    >
                                        <option value=''>Select Teacher</option>
                                        {teacherData.map((teacher) => (
                                            <option 
                                                key={teacher?.id} 
                                                value={teacher?.id}
                                            >
                                                {teacher?.first_name} {teacher?.last_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {formik.touched.name && formik.errors.name && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.name}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Month Dropdown */}
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label htmlFor='month'>Month*</Form.Label>
                                    <Form.Select
                                        id='month'
                                        className={`form-control ${formik.errors.month && formik.touched.month ? 'is-invalid' : ''}`}
                                        {...formik.getFieldProps('month')}
                                    >
                                        <option value=''>Select Month</option>
                                        {monthOptions.map((month) => (
                                            <option 
                                                key={month.value} 
                                                value={month.value}
                                            >
                                                {month.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {formik.touched.month && formik.errors.month && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.month}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Year Dropdown */}
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label htmlFor='year'>Year*</Form.Label>
                                    <Form.Select
                                        id='year'
                                        className={`form-control ${formik.errors.year && formik.touched.year ? 'is-invalid' : ''}`}
                                        {...formik.getFieldProps('year')}
                                    >
                                        <option value=''>Select Year</option>
                                        {yearOptions.map((year) => (
                                            <option 
                                                key={year} 
                                                value={year}
                                            >
                                                {year}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {formik.touched.year && formik.errors.year && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.year}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Amount Input */}
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label htmlFor='amount'>Amount*</Form.Label>
                                    <Form.Control
                                        id='amount'
                                        type='text'
                                        {...formik.getFieldProps('amount')}
                                        className={`form-control ${formik.errors.amount && formik.touched.amount ? 'is-invalid' : ''}`}
                                        placeholder="Enter salary amount"
                                    />
                                    {formik.touched.amount && formik.errors.amount && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.amount}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Submit Button */}
                        <div className="mt-3 d-flex justify-content-end">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    type='submit' 
                                    variant="success"
                                    disabled={!formik.isValid}
                                >
                                    Submit Salary Entry
                                </Button>
                            </motion.div>
                        </div>
                    </Form>

                    {/* Payment Details Table */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className='mt-4'
                    >
                        <Table striped bordered hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th colSpan={2} className="text-center">
                                        Payment Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Contract Type</th>
                                    <td>
                                        {contractType === 'monthly' 
                                            ? 'Monthly (Permanent)' 
                                            : 'Hourly'}
                                    </td>
                                </tr>
                                {contractType === 'hourly' ? (
                                    <>
                                        <tr>
                                            <th>Worked Hours</th>
                                            <td>{hoursData || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <th>Hourly Rate</th>
                                            <td>{hourlyRateData || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <th>Calculated Monthly Salary</th>
                                            <td>
                                                {hoursData && hourlyRateData 
                                                    ? (hoursData * hourlyRateData).toFixed(2)
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <th>Fixed Monthly Salary</th>
                                            <td>{monthlySalary}</td>
                                        </tr>
                                        <tr>
                                            <th>Absences</th>
                                            <td>Check attendance records</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </Table>
                    </motion.div>
                </Card.Body>
            </Card>
        </motion.div>
    );
}