import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from "../../api/axios";
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

export default function AddCourse({ inModal = false, onCourseAdded = null, handleClose = null }) {
  const { user, setNotification, setVariant } = UseStateContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      duration_value: '',
      duration_unit: 'heures',
      description: '',
      price: '',
    },
    validationSchema: Yup.object({
      course_name: Yup.string().required('Course Name is required'),
      duration_value: Yup.number()
        .positive('La durée doit être positive')
        .required('La valeur de durée est requise'),
      duration_unit: Yup.string().required('L\'unité de durée est requise'),
      description: Yup.string().default(''),  // Description optionnelle
      price: Yup.number().required('Price is required'),
    }),
    onSubmit: (values) => {
      setIsSubmitting(true);
      
      const data = {
        title: values.course_name,
        duration: `${values.duration_value} ${values.duration_unit}`,
        description: values.description || '', // Ensure description is never null
        price: values.price,
      };
      
      axios.post('/api/cours', data)
        .then((res) => {
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
        })
        .catch(error => {
          if (error.response && error.response.status === 422) {
            const errors = error.response.data.errors;
            const formattedErrors = {};
            Object.keys(errors).forEach(key => {
              formattedErrors[key] = errors[key][0];
            });
            formik.setErrors(formattedErrors);
          } else {
            setNotification(error.response?.data?.message || 'Error adding course');
            setVariant('danger');
          }
          setTimeout(() => {
            setNotification('');
            setVariant('');
          }, 3000);
          console.error("Error adding course:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10 
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)"
    },
    tap: { scale: 0.95 }
  };

  // Style conditionnel en fonction de si on est dans un modal ou non
  const formStyle = inModal 
    ? { padding: '0', margin: '0' } 
    : { maxWidth: '800px', margin: '0 auto' };

  return (
    <div className={inModal ? '' : 'row'}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={inModal ? '' : 'add-course-container card shadow-sm p-4'}
        style={inModal ? {} : { borderRadius: '12px' }}
      >
        <form onSubmit={formik.handleSubmit} className={inModal ? '' : 'addCourse'} style={formStyle}>
          {!inModal && (
            <motion.div 
              variants={itemVariants} 
              className="text-center mb-4"
            >
              <h1 className="fw-bold text-primary">Add New Course</h1>
              <div className="text-muted">Fill in the details below to create a new course</div>
            </motion.div>
          )}

          <motion.div className='mb-4 col-12' variants={itemVariants}>
            <label htmlFor='course_name' className='form-label fw-semibold'>
              Course Name<span className='text-danger'>*</span>
            </label>
            <input
              type='text'
              id='course_name'
              className={`form-control form-control-lg ${formik.touched.course_name && formik.errors.course_name ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('course_name')}
              placeholder="Enter course title"
            />
            {formik.touched.course_name && formik.errors.course_name && (
              <div className='invalid-feedback'>{formik.errors.course_name}</div>
            )}
          </motion.div>

          <motion.div className='mb-4 col-12' variants={itemVariants}>
            <label htmlFor='duration_value' className='form-label fw-semibold'>
              Duration<span className='text-danger'>*</span>
            </label>
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <input
                  type='number'
                  id='duration_value'
                  min="1"
                  step="1"
                  placeholder='Valeur'
                  className={`form-control form-control-lg ${formik.touched.duration_value && formik.errors.duration_value ? 'is-invalid' : ''}`}
                  {...formik.getFieldProps('duration_value')}
                />
                {formik.touched.duration_value && formik.errors.duration_value && (
                  <div className='invalid-feedback'>{formik.errors.duration_value}</div>
                )}
              </div>
              <div style={{ width: '180px' }}>
                <select
                  id='duration_unit'
                  className={`form-select form-select-lg ${formik.touched.duration_unit && formik.errors.duration_unit ? 'is-invalid' : ''}`}
                  {...formik.getFieldProps('duration_unit')}
                >
                  <option value="heures">Heures</option>
                  <option value="jours">Jours</option>
                  <option value="semaines">Semaines</option>
                  <option value="mois">Mois</option>
                  <option value="séances">Séances</option>
                </select>
                {formik.touched.duration_unit && formik.errors.duration_unit && (
                  <div className='invalid-feedback'>{formik.errors.duration_unit}</div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div className='mb-4 col-12' variants={itemVariants}>
            <label htmlFor='description' className='form-label fw-semibold'>
              Description
            </label>
            <textarea
              id='description'
              rows="3"
              className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('description')}
              placeholder="Provide a brief overview of the course"
            />
            {formik.touched.description && formik.errors.description && (
              <div className='invalid-feedback'>{formik.errors.description}</div>
            )}
          </motion.div>
          
          <motion.div className='mb-4 col-12' variants={itemVariants}>
            <label htmlFor='price' className='form-label fw-semibold'>
              Price<span className='text-danger'>*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">DH</span>
              <input
                type='number'
                id='price'
                min="0"
                step="0.01"
                className={`form-control form-control-lg ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                {...formik.getFieldProps('price')}
                placeholder="0.00"
              />
              {formik.touched.price && formik.errors.price && (
                <div className='invalid-feedback'>{formik.errors.price}</div>
              )}
            </div>
          </motion.div>

          <motion.div className="d-flex justify-content-end mt-4 gap-2" variants={itemVariants}>
            {inModal && (
              <motion.button 
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={handleClose}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
            )}
            <motion.button 
              type='submit' 
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                inModal ? 'Add Course' : 'Create Course'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}