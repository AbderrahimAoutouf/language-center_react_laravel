
import React, { useState,useEffect } from 'react';
import { useFormik } from 'formik';
import { Form, Row, Col,Table, Tab,Button} from 'react-bootstrap';
import * as Yup from 'yup';
import axios from "../../api/axios"
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
export default function AddFeesT()
{
    const navigate = useNavigate();
    const { setNotification, setVariant } = UseStateContext();
    const formik = useFormik({
        initialValues: {
            name: '',
            month: '',
            year: '',
            amount:'',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('select teacher'),
            month: Yup.string().required('select month'),
            year: Yup.string().required('select year'),
            amount: Yup.string().required('enter amount'),
        }),
          onSubmit: (values) => {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            console.log(values);
            const sendData = {
                teacher_id:values.name,
                salary:values.amount,
                month: values.month,
                year:values.year,
            }
            axios.post('/api/salary',sendData);
            setNotification('Salary has been added successfully');
                setVariant('success');
                setTimeout(() => {
                    setNotification('');
                    setVariant('');
                }, 3000);
                navigate('/fees/teacher');
          },
        });
        //get teacher name from database
        const [teacherData, setTeacherData] = useState([]);
        const [hoursData, setHoursData] = useState([]);
        const [amountData, setAmountData] = useState([]);
        const [hourlyRateData, setHourlyRateData] = useState([]);
        const [contractType, setContractType] = useState('hourly');
        const [monthlySalary, setMonthlySalary] = useState(0);
        useEffect(
            () => {
                const getTeacherData = async() => {
                    const response = await axios.get('/api/teachers');
                    setTeacherData(response.data.data);
                };
                getTeacherData()
                
            }
            ,[])
            useEffect(() => {
                const dateData = {
                    month: formik.values.month,
                    year: formik.values.year,
                }
                
                const getHoursData = async() => {
                    const response = await axios.post(`/api/hours/${formik.values.name}`, dateData);
                    setHoursData(response.data);
                };
                
                const getTeacherDetails = async() => {
                    if (formik.values.name) {
                        const teacherFound = teacherData.find(teacher => teacher.id == formik.values.name);
                        if (teacherFound) {
                            setHourlyRateData(teacherFound.hourly_rate);
                            setContractType(teacherFound.contract_type);
                            setMonthlySalary(teacherFound.monthly_salary);
                            
                            // Auto-calculate amount based on contract type
                            if (teacherFound.contract_type === 'monthly') {
                                formik.setFieldValue('amount', teacherFound.monthly_salary);
                            } else {
                                // For hourly contract, get hours first
                                getHoursData();
                            }
                        }
                    }
                };
                
                getTeacherDetails();
            }, [formik.values.name, formik.values.month, formik.values.year]);
            
            return(
        <div>
            <Form onSubmit={formik.handleSubmit}>
            <Row md={4} className='mb-3'>
                <Col>
                        <Form.Label htmlFor='name'>Teacher Name*</Form.Label>
                            <Form.Select
                            id='name'
                            className={`form-control ${formik.errors.name  && formik.touched.name ? 'is-invalid' : ''}`}
                            {...formik.getFieldProps('name')}
                            >
                            <option value=''>Select Teacher</option>
                            {
                            teacherData.map((teacher) => (
                                <option key={teacher?.id} value={teacher?.id}>
                                    {teacher?.first_name} {teacher?.last_name}
                                </option>
                            ))

                            }
                            {formik.touched.name&& formik.errors.name && (
                            <div className='invalid-feedback'>{formik.errors.name}</div>
                            )}
                            </Form.Select>
                </Col> 
                <Col>
                        <Form.Label htmlFor='month'>Month*</Form.Label>
                            <Form.Select
                            id='month'
                            className={`form-control ${formik.errors.month  && formik.touched.month ? 'is-invalid' : ''}`}
                            {...formik.getFieldProps('month')}
                            >
                            <option value=''>Select Month</option>
                            <option value='1'>January</option>
                            <option value='2'>February</option>
                            <option value='3'>March</option>
                            <option value='4'>April</option>
                            <option value='5'>May</option>
                            <option value='6'>June</option>
                            <option value='7'>July</option>
                            <option value='8'>August</option>
                            <option value='9'>September</option>
                            <option value='10'>October</option>
                            <option value='11'>November</option>
                            <option value='12'>December</option>
                            {formik.touched.month&& formik.errors.month && (
                            <div className='invalid-feedback'>{formik.errors.month}</div>
                            )}
                            </Form.Select>
                </Col>
                <Col>
                        <Form.Label htmlFor='year'>Year*</Form.Label>
                            <Form.Select
                            id='year'
                            className={`form-control ${formik.errors.year  && formik.touched.year ? 'is-invalid' : ''}`}
                            {...formik.getFieldProps('year')}
                            >
                            <option value=''>Select Year</option>
                            <option value='2021'>2021</option>
                            <option value='2022'>2022</option>
                            <option value='2023'>2023</option>
                            <option value='2024'>2024</option>  
                            {formik.touched.year&& formik.errors.year && (
                            <div className='invalid-feedback'>{formik.errors.year}</div>
                            )}
                            </Form.Select>
                </Col>

                <Col>
                        <Form.Label htmlFor='amount'>Amount*</Form.Label>
                                
                            <Form.Control
                            id='amount'
                            type='text'
                            {...formik.getFieldProps('amount')}
                            className={`form-control ${formik.errors.amount && formik.touched.amount ? 'is-invalid' : ''}`}
                            />
                            {formik.touched.amount && formik.errors.amount && (
                            <div className='invalid-feedback'>{formik.errors.amount}</div>
                            )}
                </Col>
            </Row>
                         <Button type='submit' className='btn btn-success'>
                            Checkout
                        </Button>

            </Form>
            <div className='d-flex flex-row-reverse me-5'>  
                {/* payment table containe paid amount grand total ,worked hours */}
                <Table striped bordered hover className='w-25'>
    <thead>
        <tr>
            <th>Contract Type</th>
            <td>{contractType === 'monthly' ? 'Monthly (Permanent)' : 'Hourly'}</td>
        </tr>
    </thead>
    <tbody>
        {contractType === 'hourly' ? (
            <>
                <tr>
                    <th>Worked hours</th>
                    <td>{hoursData}</td>
                </tr>
                <tr>
                    <th>Hourly rate</th>
                    <td>{hourlyRateData}</td>
                </tr>
                <tr>
                    <th>Monthly salary</th>
                    <td>{hoursData * hourlyRateData}</td>
                </tr>
            </>
        ) : (
            <>
                <tr>
                    <th>Fixed monthly salary</th>
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
            </div>
        </div>
    )
}