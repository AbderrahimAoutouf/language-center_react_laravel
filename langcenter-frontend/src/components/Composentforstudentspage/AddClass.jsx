import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, InputGroup, Spinner } from "react-bootstrap";
import axios from "../../api/axios";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { UseStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaMoneyBillWave, FaPercentage, FaSchool } from "react-icons/fa";
import { MdPayment, MdSwitchAccount } from "react-icons/md";
import { toast } from "react-toastify";

const AddClass = ({ showModal, handleClose, selectedItem, onSuccess }) => {
    const navigate = useNavigate();
    const { user, setNotification, setVariant } = UseStateContext();
    const [classData, setClassData] = useState([]);
    const [total, setTotal] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAdvance, setCurrentAdvance] = useState(0);
    const [isLoadingAdvance, setIsLoadingAdvance] = useState(false);
    const [paymentSummary, setPaymentSummary] = useState({
        subtotal: 0,
        discount: 0,
        total: 0,
        remaining: 0
    });

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };
    
    const slideIn = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.4 } }
    };

    // Define base path based on user role
    const basePath = user?.role === 'admin' ? "" : 
                    user?.role === 'director' ? "/director" : "/secretary";

    // Validation schema
    const validationSchema = yup.object().shape({
        class: yup.string().when('course', {
            is: true,
            then: () => yup.string().required("Please select a class")
        }),
        courseFeesPaid: yup.number()
            .min(0, "Payment amount can't be negative")
            .required("Payment amount is required"),
        negotiatedPrice: yup.number()
            .min(0, "Negotiated price can't be negative")
            .required("Negotiated price is required"),
        discount: yup.string(),
        customDiscount: yup.number()
            .nullable()
            .min(0, "Discount can't be negative")
            .max(100, "Discount can't exceed 100%"),
        course: yup.boolean(),
        payment_method: yup.string()
            .required("Please select a payment method")
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            class: '',
            courseFeesPaid: 0,
            negotiatedPrice: 0,
            discount: '',
            customDiscount: '',
            course: false,
            payment_method: '',
        },
        validationSchema,
        onSubmit: handleSubmit
    });

    // Fetch class data
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get('/api/classes');
                setClassData(res.data);
            } catch (error) {
                console.error("Error fetching classes:", error);
                toast.error("Failed to load classes");
            }
        };
        
        fetchClasses();
    }, []);

    // Fetch student advance when modal opens or selectedItem changes
    useEffect(() => {
        const fetchStudentAdvance = async () => {
            if (showModal && selectedItem?.id) {
                setIsLoadingAdvance(true);
                try {
                    console.log(`Fetching advance for student ID: ${selectedItem.id}`);
                    const response = await axios.get(`/api/etudiants/${selectedItem.id}`);
                    console.log('Student data response:', response.data);
                    
                    // Handle different response structures
                    let studentData = response.data;
                    if (response.data.data) {
                        studentData = response.data.data; // If wrapped in data property
                    }
                    
                    const advance = studentData.avance || 0;
                    console.log('Extracted advance:', advance);
                    
                    setCurrentAdvance(Number(advance));
                    
                    // Automatically set the payment amount to the student's advance
                    formik.setFieldValue('courseFeesPaid', Number(advance));
                    
                    toast.success(`Student advance loaded: $${advance}`);
                } catch (error) {
                    console.error('Error fetching student advance:', error);
                    toast.error('Failed to load student advance');
                    setCurrentAdvance(0);
                    formik.setFieldValue('courseFeesPaid', 0);
                } finally {
                    setIsLoadingAdvance(false);
                }
            }
        };

        fetchStudentAdvance();
    }, [showModal, selectedItem?.id]);

    // Reset form when modal closes
    useEffect(() => {
        if (!showModal) {
            formik.resetForm();
            setCurrentAdvance(0);
            setTotal(0);
        }
    }, [showModal]);

    // Find course fees based on class ID
    const findCoursFees = (classId) => {
        const classFees = classData.find((c) => c.id == classId);
        return classFees ? Number(classFees.cours.price) : 0;
    };

    // Calculate total fees when dependencies change
    useEffect(() => {
        const calculateTotal = () => {
            let calculatedTotal = 0;
            
            // Only calculate course fee
            if (formik.values.course) {
                calculatedTotal += findCoursFees(formik.values.class);
            }
            
            return calculatedTotal;
        };
        
        const newTotal = calculateTotal();
        setTotal(newTotal);
        
        // Update negotiated price when total changes
        let discountPercent = 0;
        if (formik.values.discount === 'custom') {
            discountPercent = formik.values.customDiscount || 0;
        } else {
            discountPercent = formik.values.discount || 0;
        }
        
        const discountAmount = (newTotal * discountPercent) / 100;
        const negotiatedPrice = Math.round(newTotal - discountAmount);
        
        formik.setFieldValue('negotiatedPrice', negotiatedPrice || 0);
        
        // Update payment summary
        const courseFeesPaid = Number(formik.values.courseFeesPaid) || 0;
        setPaymentSummary({
            subtotal: newTotal,
            discount: discountAmount,
            total: negotiatedPrice,
            remaining: negotiatedPrice - courseFeesPaid
        });
    }, [
        formik.values.course, 
        formik.values.class, 
        formik.values.discount, 
        formik.values.customDiscount,
        formik.values.courseFeesPaid,
        classData
    ]);

    // Update discount when negotiated price changes
    useEffect(() => {
        if (total > 0) {
            const negotiatedPrice = Number(formik.values.negotiatedPrice);
            const discountPercent = ((total - negotiatedPrice) / total) * 100;
            
            // Check if discount matches predefined values
            if ([10, 20, 30].includes(Math.round(discountPercent))) {
                formik.setFieldValue('discount', Math.round(discountPercent).toString());
            } else {
                formik.setFieldValue('discount', 'custom');
                formik.setFieldValue('customDiscount', Math.round(discountPercent * 100) / 100);
            }
        }
    }, [formik.values.negotiatedPrice, total]);

    // Handle advance amount button click
    const useAdvanceAmount = () => {
        formik.setFieldValue('courseFeesPaid', currentAdvance);
    };

    // Handle form submission
    async function handleSubmit(values) {
        if (!selectedItem?.id) {
            toast.error("No student selected");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Prepare inscription data
            let inscriptionData = {
                etudiant_id: selectedItem.id,
                negotiated_price: Number(values.negotiatedPrice),
            };
            
            // Add class_id if course is selected
            if (values.course) {
                inscriptionData.class_id = values.class;
            }
            
            console.log('Inscription data:', inscriptionData);
            
            // Create inscription
            const inscriptionResponse = await axios.post(
                '/api/inscrire-classes', 
                inscriptionData
            );
            
            console.log('Inscription response:', inscriptionResponse.data);
            
            // Register payment for the inscription
            if (inscriptionResponse.data && inscriptionResponse.data.id) {
                const paymentData = {
                    payment_amount: Number(values.courseFeesPaid),
                    type: values.payment_method,
                };
                
                console.log('Payment data:', paymentData);
                
                const paymentResponse = await axios.post(
                    `/api/inscrires/${inscriptionResponse.data.id}/register-payment`,
                    paymentData
                );
                
                console.log('Payment response:', paymentResponse.data);
                
                toast.success("Class added successfully!");
                if (onSuccess) onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error("Error adding class:", error);
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || "Failed to add class";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal
            show={showModal}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Form noValidate onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="d-flex align-items-center"
                        >
                            <FaSchool className="me-2" />
                            Add Class for {selectedItem?.lastName} {selectedItem?.firstName}
                        </motion.div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AnimatePresence>
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            className="mb-4"
                        >
                            {/* Student Advance Display */}
                            <div className="p-3 bg-info text-white rounded mb-4">
                                <h6 className="mb-2 d-flex align-items-center justify-content-between">
                                    <span>Student Information</span>
                                    {isLoadingAdvance && <Spinner size="sm" />}
                                </h6>
                                <div className="d-flex justify-content-between align-items-center">
                                    <p className="mb-0">
                                        <strong>Current Advance: ${currentAdvance.toFixed(2)}</strong>
                                    </p>
                                    {currentAdvance > 0 && (
                                        <Button 
                                            size="sm" 
                                            variant="light"
                                            onClick={useAdvanceAmount}
                                            disabled={isLoadingAdvance}
                                        >
                                            Use Advance
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-light rounded mb-4">
                                <h5 className="mb-3 border-bottom pb-2">Course Selection</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Check
                                            type="switch"
                                            id="course-switch"
                                            label={<div className="d-flex align-items-center"><FaSchool className="me-2 text-primary" /> Course</div>}
                                            {...formik.getFieldProps('course')}
                                            className="mb-2"
                                        />
                                    </Col>
                                </Row>
                            </div>
                            
                            {formik.values.course && (
                                <motion.div
                                    variants={slideIn}
                                    initial="hidden"
                                    animate="visible"
                                    className="mb-4 p-3 border rounded"
                                >
                                    <h5 className="mb-3 d-flex align-items-center">
                                        <FaSchool className="me-2 text-primary" /> Course Details
                                    </h5>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Class</Form.Label>
                                            <Form.Select
                                                id="class"
                                                {...formik.getFieldProps('class')}
                                                isInvalid={formik.touched.class && formik.errors.class}
                                            >
                                                <option value="">Select a class</option>
                                                {classData.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name} - {c.cours.title}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {formik.errors.class}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Course Fee</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <FaMoneyBillWave />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    value={`$${findCoursFees(formik.values.class).toFixed(2)}`}
                                                    disabled
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Discount</Form.Label>
                                            <InputGroup>
                                                <Form.Select
                                                    {...formik.getFieldProps('discount')}
                                                    isInvalid={formik.touched.discount && formik.errors.discount}
                                                >
                                                    <option value="">No discount</option>
                                                    <option value="10">10%</option>
                                                    <option value="20">20%</option>
                                                    <option value="30">30%</option>
                                                    <option value="custom">Custom</option>
                                                </Form.Select>
                                                {formik.values.discount === 'custom' && (
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Custom %"
                                                        {...formik.getFieldProps('customDiscount')}
                                                        isInvalid={formik.touched.customDiscount && formik.errors.customDiscount}
                                                    />
                                                )}
                                                <InputGroup.Text>
                                                    <FaPercentage />
                                                </InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.discount || formik.errors.customDiscount}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Negotiated Price</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <FaMoneyBillWave />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    {...formik.getFieldProps('negotiatedPrice')}
                                                    isInvalid={formik.touched.negotiatedPrice && formik.errors.negotiatedPrice}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.negotiatedPrice}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Payment Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <MdPayment />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    {...formik.getFieldProps('courseFeesPaid')}
                                                    isInvalid={formik.touched.courseFeesPaid && formik.errors.courseFeesPaid}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.courseFeesPaid}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                            <Form.Text className="text-muted">
                                                Student's advance amount: ${currentAdvance.toFixed(2)}
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Payment Method</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <MdSwitchAccount />
                                                </InputGroup.Text>
                                                <Form.Select
                                                    {...formik.getFieldProps('payment_method')}
                                                    isInvalid={formik.touched.payment_method && formik.errors.payment_method}
                                                >
                                                    <option value="">Select method</option>
                                                    <option value="cash">Cash</option>
                                                    <option value="check">Check</option>
                                                    <option value="bank">Bank Transfer</option>
                                                    <option value="card">Credit Card</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.payment_method}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Row>
                                </motion.div>
                            )}
                            
                            {/* Payment Summary */}
                            <motion.div
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                                className="p-3 bg-light rounded"
                            >
                                <h5 className="mb-3 border-bottom pb-2">Payment Summary</h5>
                                <Row>
                                    <Col md={6}>
                                        <p><strong>Subtotal:</strong> ${paymentSummary.subtotal.toFixed(2)}</p>
                                        <p><strong>Discount:</strong> ${paymentSummary.discount.toFixed(2)}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Total:</strong> ${paymentSummary.total.toFixed(2)}</p>
                                        <p className={paymentSummary.remaining > 0 ? "text-danger" : "text-success"}>
                                            <strong>Remaining:</strong> ${paymentSummary.remaining.toFixed(2)}
                                        </p>
                                    </Col>
                                </Row>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSubmitting || isLoadingAdvance}
                        className="d-flex align-items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FaCheck className="me-2" /> Save
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddClass;