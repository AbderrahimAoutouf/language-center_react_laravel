import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from "../../api/axios";
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";
import { Button } from 'react-bootstrap';

export default function AddCourse({ inModal = false, onCourseAdded = null, handleClose = null }) {
  const { user, setNotification, setVariant } = UseStateContext();
  let x = "";
  const navigate = useNavigate();
  
  if (user && user.role === 'admin') {
    x = "";
  } else if (user && user.role === 'director') {
    x = "/director";
  } else {
    x = "/secretary";
  }
  
  const formik = useFormik({
    initialValues: {
      course_name: '',
      duration: '',
      description: '',
      price: '',
    },
    validationSchema: Yup.object({
      course_name: Yup.string().required('Course Name is required'),
      duration: Yup.string().required('Duration is required'),
      description: Yup.string(),
      price: Yup.number().required('Price is required'),
    }),
    onSubmit: (values) => {
      const data = {
        title: values.course_name,
        duration: values.duration,
        description: values.description,
        price: values.price,
      };
      
      axios.post('/api/cours', data).then((res) => {
        setNotification('Course added successfully');
        setVariant('success');
        setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        
        // Si le composant est dans un modal, appeler le callback et ne pas naviguer
        if (inModal && onCourseAdded) {
          // Passez le nouveau cours au parent
          onCourseAdded(res.data);
          formik.resetForm();
        } else {
          // Comportement normal quand utilisé comme page complète
          navigate(`${x}/course`);
        }
      }).catch(error => {
        setNotification('Error adding course');
        setVariant('danger');
        setTimeout(() => {
          setNotification('');
          setVariant('');
        }, 3000);
        console.error("Error adding course:", error);
      });
    },
  });

  // Style conditionnel en fonction de si on est dans un modal ou non
  const formStyle = inModal 
    ? { padding: '0', margin: '0' } 
    : { };

  return (
    <div className={inModal ? '' : 'row'}>
      <form onSubmit={formik.handleSubmit} className={inModal ? '' : 'addCourse'} style={formStyle}>
        {!inModal && <h1>Add Course</h1>}

        <div className='mb-3 col-12'>
          <label htmlFor='course_name' className='form-label'>
            Course Name<span className='text-danger'>*</span>
          </label>
          <input
            type='text'
            id='course_name'
            className={`form-control ${formik.touched.course_name && formik.errors.course_name ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('course_name')}
          />
          {formik.touched.course_name && formik.errors.course_name && (
            <div className='invalid-feedback'>{formik.errors.course_name}</div>
          )}
        </div>

        <div className='mb-3 col-12'>
          <label htmlFor='duration' className='form-label'>
            Duration<span className='text-danger'>*</span>
          </label>
          <input
            type='text'
            id='duration'
            className={`form-control ${formik.touched.duration && formik.errors.duration ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('duration')}
          />
          {formik.touched.duration && formik.errors.duration && (
            <div className='invalid-feedback'>{formik.errors.duration}</div>
          )}
        </div>

        <div className='mb-3 col-12'>
          <label htmlFor='description' className='form-label'>
            Description
          </label>
          <input
            type='text'
            id='description'
            className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('description')}
          />
          {formik.touched.description && formik.errors.description && (
            <div className='invalid-feedback'>{formik.errors.description}</div>
          )}
        </div>
        
        <div className='mb-3 col-12'>
          <label htmlFor='price' className='form-label'>
            Price<span className='text-danger'>*</span>
          </label>
          <input
            type='number'
            id='price'
            className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('price')}
          />
          {formik.touched.price && formik.errors.price && (
            <div className='invalid-feedback'>{formik.errors.price}</div>
          )}
        </div>

        <div className="d-flex justify-content-end mt-3">
          {inModal && (
            <Button 
              variant="secondary" 
              onClick={handleClose} 
              className="me-2"
            >
              Cancel
            </Button>
          )}
          <Button type='submit' variant="primary">
            {inModal ? 'Add Course' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  );
}