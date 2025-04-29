import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';

export default function AddLevel({ inModal = false, onLevelAdded = null, handleClose = null }) {
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();
  
  let x = "";
  if (user && user.role === 'admin') {
    x = "";
  } else if (user && user.role === 'director') {
    x = "/director";
  } else {
    x = "/secretary";
  }
  
  const addLevelSchema = Yup.object().shape({
    name: Yup.string()
      .max(50, 'Too Long!')
      .required('Required'),
  });
  
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: addLevelSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = async (values) => {
    const sendData = {
      name: values.name,
    };
    
    try {
      const response = await axios.post('/api/levels', sendData);
      
      setNotification('Level added successfully');
      setVariant('success');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      
      // Always call onLevelAdded in modal mode and don't redirect
      if (inModal && onLevelAdded) {
        onLevelAdded(response.data);
        if (handleClose) handleClose();
      } else {
        // If not in modal mode, navigate to levels page
        navigate(`${x}/levels`);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.log(error.response.data);
        setNotification('Error: Invalid data');
        setVariant('danger');
      } else {
        console.error(error);
        setNotification('An error occurred');
        setVariant('danger');
      }
      
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    }
  };

  // Modified form submission handler for the form element
  const handleFormSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  return (
    <Form noValidate onSubmit={handleFormSubmit}>
      <Row className='mb-3'>
        <Form.Group as={Col} sm={inModal ? 12 : 4} controlId="name">
          <Form.Label column>
            Name
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Level Name"
            name="name"
            {...formik.getFieldProps('name')}
            isInvalid={formik.touched.name && formik.errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.name}
          </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <div className="d-flex justify-content-between">
        <Button type="submit" className='my-3 btn-primary'>
          {inModal ? 'Add Level' : 'Submit'}
        </Button>
        {inModal && (
          <Button className='my-3 btn-secondary' onClick={handleClose}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
}