import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';

const EditHoliday = () => {
  const { id } = useParams();
  const [data, setData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();
  let x = '';
  if (user && user.role === 'admin') {
    x = '';
  } else if (user && user.role === 'director') {
    x = '/director';
  } else {
    x = '/secretary';
  }

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`api/holiday/${id}`);
        setData({
          name: res.data.Holiday.name,
          start_date: res.data.Holiday.start_date,
          end_date: res.data.Holiday.end_date,
        });
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  useEffect(() => {
    formik.setValues({
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
    });
  }, [data]);

  const formik = useFormik({
    initialValues: {
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      startDate: Yup.string().required('Required'),
      endDate: Yup.string().required('Required'),
    }),
    onSubmit: (values) => {
      console.log('val ', values);

      const sendData = {
        name: values.name,
        start_date: values.startDate,
        end_date: values.endDate,
      };

      axios
        .put(`/api/holiday/${id}`, sendData)
        .then((res) => {
          console.log(res.data);
          setNotification('Holiday Edited successfully');
          setVariant('success');
          setTimeout(() => {
            setNotification('');
            setVariant('');
          }, 3000);
          navigate(`${x}/holidays`);
        })
        .catch((error) => {
          if (error.response && error.response.status === 422) {
            console.log(error.response.data);
            setNotification('Error: Invalid data');
            setVariant('danger');
            setTimeout(() => {
              setNotification('');
            }, 3000);
          } else {
            console.error(error);
            setNotification('An error occurred');
            setVariant('danger');
            setTimeout(() => {
              setNotification('');
            }, 3000);
          }
        });
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className='row g-3 needs-validation'
      noValidate
    >
      <div className='col-md-4 position-relative'>
        <label htmlFor='name' className='form-label'>
          Holiday name
        </label>
        <input
          id='name'
          name='name'
          type='text'
          className={`form-control ${
            formik.touched.name && formik.errors.name ? 'is-invalid' : ''
          }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          required
        />
        {formik.touched.name && formik.errors.name && (
          <div className='invalid-feedback'>{formik.errors.name}</div>
        )}
      </div>

      <div className='col-md-4 position-relative'>
        <label htmlFor='startDate' className='form-label'>
          Start Date
        </label>
        <input
          id='startDate'
          name='startDate'
          type='date'
          className={`form-control ${
            formik.touched.startDate && formik.errors.startDate
              ? 'is-invalid'
              : ''
          }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.startDate}
          required
        />
        {formik.touched.startDate && formik.errors.startDate && (
          <div className='invalid-feedback'>{formik.errors.startDate}</div>
        )}
      </div>

      <div className='col-md-4 position-relative'>
        <label htmlFor='endDate' className='form-label'>
          End Date
        </label>
        <input
          id='endDate'
          name='endDate'
          type='date'
          className={`form-control ${
            formik.touched.endDate && formik.errors.endDate ? 'is-invalid' : ''
          }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.endDate}
          required
        />
        {formik.touched.endDate && formik.errors.endDate && (
          <div className='invalid-feedback'>{formik.errors.endDate}</div>
        )}
      </div>
      <div className='col-12'>
        <button type='submit' className='btn btn-primary '>
          Submit
        </button>
      </div>
    </form>
  );
};

export default EditHoliday;
