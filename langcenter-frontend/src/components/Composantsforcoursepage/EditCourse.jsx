import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from "../../api/axios";
import { useNavigate, useParams } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";
import { motion } from 'framer-motion';

export default function EditCourse() {
  const { user, setNotification, setVariant } = UseStateContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  let x = "";
  const navigate = useNavigate();
  const { id } = useParams();
  
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
        description: values.description || '',
        price: values.price,
      };
      
      axios.put(`/api/cours/${id}`, data)
        .then((res) => {
          setNotification('Course has been edited successfully');
          setVariant('warning');
          setTimeout(() => {
            setNotification('');
            setVariant('');
          }, 3000);
          navigate(`${x}/course`);
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
            setNotification(error.response?.data?.message || 'Error updating course');
            setVariant('danger');
          }
          setTimeout(() => {
            setNotification('');
            setVariant('');
          }, 3000);
          console.error("Error updating course:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/cours/${id}`);
        const courseData = response.data.data;
        
        // Parse duration string into value and unit
        let durationValue = '';
        let durationUnit = 'heures';
        
        if (courseData.duration) {
          const durationParts = courseData.duration.split(' ');
          if (durationParts.length >= 2) {
            durationValue = durationParts[0];
            durationUnit = durationParts[1];
          }
        }
        
        formik.setValues({
          course_name: courseData.title || '',
          duration_value: durationValue,
          duration_unit: durationUnit,
          description: courseData.description || '',
          price: Math.round(courseData.price) || 0,
        });
      } catch (error) {
        console.error("Error fetching course:", error);
        setNotification('Error loading course data');
        setVariant('danger');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="edit-course-container card shadow-sm p-4 mx-auto"
        style={{ borderRadius: '12px', maxWidth: '800px' }}
      >
        <form onSubmit={formik.handleSubmit}>
          <motion.div variants={itemVariants} className="text-center mb-4">
            <h1 className="fw-bold text-primary">Edit Course</h1>
            <div className="text-muted">Update the course information below</div>
          </motion.div>

          <motion.div className='mb-4 col-12' variants={itemVariants}>
            <label htmlFor='course_name' className='form-label fw-semibold'>
              Course Name<span className='text-danger'>*</span>
            </label>
            <input
              type='text'
              id='course_name'
              className={`form-control form-control-lg ${formik.touched.course_name && formik.errors.course_name ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('course_name')}
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
              />
              {formik.touched.price && formik.errors.price && (
                <div className='invalid-feedback'>{formik.errors.price}</div>
              )}
            </div>
          </motion.div>

          <motion.div className="d-flex justify-content-between mt-4" variants={itemVariants}>
            <motion.button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={() => navigate(`${x}/course`)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cancel
            </motion.button>
            
            <motion.button 
              type='submit' 
              className="btn btn-warning btn-lg"
              disabled={isSubmitting}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Update Course'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}