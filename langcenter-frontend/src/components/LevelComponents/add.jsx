import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { Form, Button, Col, Row, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddLevel({ inModal = false, onLevelAdded = null, handleClose = null }) {
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine the redirect path based on user role
  let x = "";
  if (user && user.role === 'admin') {
    x = "";
  } else if (user && user.role === 'director') {
    x = "/director";
  } else {
    x = "/secretary";
  }
  
  // Validation schema using Yup
  const addLevelSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Level name is required'),
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: addLevelSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  // Submit handler
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    const sendData = {
      name: values.name,
    };
    
    try {
      const response = await axios.post('/api/levels', sendData);
      
      // Success notification
      setNotification('Level added successfully');
      setVariant('success');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      
      // Show toast notification
      toast.success('Level added successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setTimeout(() => {
        setNotification('');
        setVariant('');
        
        // Handle modal or page navigation
        if (inModal && onLevelAdded) {
          onLevelAdded(response.data);
          if (handleClose) handleClose();
        } else {
          navigate(`${x}/levels`);
        }
      }, 1000);
      
    } catch (error) {
      setIsSubmitting(false);
      
      // Error handling
      if (error.response && error.response.status === 422) {
        console.log(error.response.data);
        setNotification('Error: Invalid data');
        setVariant('danger');
        
        // Show toast notification for error
        toast.error('Error: Invalid data. Please check your input.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        console.error(error);
        setNotification('An error occurred');
        setVariant('danger');
        
        // Show toast notification for general error
        toast.error('An error occurred. Please try again later.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  // Form submission handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  // Handle cancel action
  const handleCancel = () => {
    if (inModal && handleClose) {
      handleClose();
    } else {
      navigate(`${x}/levels`);
    }
  };

  return (
    <>
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              {inModal ? 'Add New Level' : 'Create Level'}
            </h5>
          </Card.Header>
          <Card.Body>
            <Form noValidate onSubmit={handleFormSubmit}>
              <Row className="mb-4">
                <Form.Group as={Col} sm={inModal ? 12 : 6} controlId="name">
                  <Form.Label className="fw-bold">Level Name</Form.Label>
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="Enter level name"
                      name="name"
                      className="py-2"
                      {...formik.getFieldProps('name')}
                      isInvalid={formik.touched.name && formik.errors.name}
                      disabled={isSubmitting}
                    />
                  </motion.div>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <div className="d-flex justify-content-between mt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" />
                        {inModal ? 'Add Level' : 'Save Level'}
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {inModal ? (
                      <>
                        <FaTimes className="me-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <FaArrowLeft className="me-2" />
                        Back to Levels
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </>
  );
}