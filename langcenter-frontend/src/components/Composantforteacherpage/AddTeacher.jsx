import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Form, Button, Row, Col } from 'react-bootstrap';
import * as Yup from 'yup';
import AvatarEdit from '../ProfileCompo/AvatarEdit';
import axios from "../../api/axios";
import { UseStateContext } from "../../context/ContextProvider";
import { useNavigate } from 'react-router-dom';

export default function AddTeacher() {
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();

  let x = user?.role === 'admin' ? "" : user?.role === 'director' ? "/director" : "/secretary";

  const [customDiploma, setCustomDiploma] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      cin: '',
      birthday: '',
      gender: '',
      email: '',
      address: '',
      phone: '',
      diploma: '',
      hourly_rate: '',
      speciality: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      cin: Yup.string().required('CIN is required'),
      birthday: Yup.date().required('Birthday is required'),
      gender: Yup.string().required('Gender is required'),
      email: Yup.string().email('Invalid email').notRequired(),
      address: Yup.string().required('Address is required'),
      phone: Yup.string().required('Phone number is required'),
      diploma: Yup.string().notRequired().nullable().matches(/^[a-zA-Z\s]*$/, 'Invalid diploma value'),
      hourly_rate: Yup.number().required('Hourly rate is required'),
      speciality: Yup.string().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Submitting values:", values);
      const postData = {
        first_name: values.firstName,
        last_name: values.lastName,
        cin: values.cin,
        birthday: values.birthday,
        gender: values.gender,
        email: values.email,
        address: values.address,
        phone: values.phone,
        diploma: values.diploma && values.diploma !== 'Other' ? values.diploma : customDiploma,
        hourly_rate: values.hourly_rate,
        speciality: values.speciality,
      };

      axios.post('/api/teachers', postData).then(() => {
        setNotification("Teacher added successfully");
        setVariant("success");
        setTimeout(() => {
          setNotification("");
          setVariant("");
        }, 3000);
        navigate(`${x}/teacher`);
      }).catch((error) => {
        console.error("API error:", error);
        if (error.response && error.response.status === 422) {
          formik.setErrors(error.response.data.errors);
        }
      });
    }, catch (err) {
      console.error("Unexpected error in onSubmit:", err); // Catch other errors
    }
  });

  return (
    <Form onSubmit={formik.handleSubmit} className='addTeacher'>
      <h1>Add New Teacher</h1>
      <Row>
        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='firstName'>First Name*</Form.Label>
          <Form.Control
            id='firstName'
            type='text'
            className={`form-control ${formik.errors.firstName  && formik.touched.firstName  ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('firstName')}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <div className='invalid-feedback'>{formik.errors.firstName}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='lastName'>Last Name*</Form.Label>
          <Form.Control
            id='lastName'
            type='text'
            className={`form-control ${formik.errors.lastName  && formik.touched.lastName ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('lastName')}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <div className='invalid-feedback'>{formik.errors.lastName}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='cin'>CIN*</Form.Label>
          <Form.Control
            id='cin'
            type='text'
            className={`form-control ${formik.errors.cin  && formik.touched.cin ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('cin')}
          />
          {formik.touched.cin && formik.errors.cin && (
            <div className='invalid-feedback'>{formik.errors.cin}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='birthday'>Birthday*</Form.Label>
          <Form.Control
            id='birthday'
            type='date'
            className={`form-control ${formik.errors.birthday  && formik.touched.birthday ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('birthday')}
          />
          {formik.touched.birthday && formik.errors.birthday && (
            <div className='invalid-feedback'>{formik.errors.birthday}</div>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='gender'>Gender*</Form.Label>
          <Form.Select
            id='gender'
            className={`form-select ${formik.errors.gender   && formik.touched.gender? 'is-invalid' : ''}`}
            {...formik.getFieldProps('gender')}
          >
            <option value=''>Select gender</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </Form.Select>
          {formik.touched.gender && formik.errors.gender && (
            <div className='invalid-feedback'>{formik.errors.gender}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label> {/* Removed * */}
          <Form.Control
            id='email'
            type='email'
            className={`form-control ${formik.errors.email  && formik.touched.email ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <div className='invalid-feedback'>{formik.errors.email}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='address'>Address*</Form.Label>
          <Form.Control
            id='address'
            type='text'
            className={`form-control ${formik.errors.address  && formik.touched.address ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('address')}
          />
          {formik.touched.address && formik.errors.address && (
            <div className='invalid-feedback'>{formik.errors.address}</div>
          )}
        </Col>

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='phone'>Phone*</Form.Label>
          <Form.Control
            id='phone'
            type='text'
            className={`form-control ${formik.errors.phone  && formik.touched.phone ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('phone')}
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className='invalid-feedback'>{formik.errors.phone}</div>
          )}
        </Col>
      </Row>

      <Row>
       <Col md={3} className='mb-3'>
          <Form.Label htmlFor='speciality'>Speciality</Form.Label> {/* Removed * */}
          <Form.Control
            id='speciality'
            type='text'
            className={`form-control ${formik.errors.speciality  && formik.touched.speciality ?  'is-invalid' : ''}`}
            {...formik.getFieldProps('speciality')}
          />
          {formik.touched.speciality && formik.errors.speciality && (
            <div className='invalid-feedback'>{formik.errors.speciality}</div>
          )}
        </Col>


        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='diploma'>Diploma</Form.Label>
          <Form.Select
  id="diploma"
  className="form-select"
  {...formik.getFieldProps('diploma')}
  onChange={(e) => {
    formik.setFieldValue('diploma', e.target.value);
    if (e.target.value !== 'Other') setCustomDiploma('');
  }}
>
  <option value="">Select diploma (Optional)</option>
  <option value="Bac">Bac</option>
  <option value="Licence">Licence</option>
  <option value="Master">Master</option>
  <option value="Doctorat">Doctorat</option>
  <option value="Other">Other</option>
</Form.Select>
        </Col>

        {formik.values.diploma === 'Other' && (
          <Col md={3} className='mb-3'>
            <Form.Label htmlFor='customDiploma'>Specify Diploma</Form.Label>
            <Form.Control
              id='customDiploma'
              type='text'
              className='form-control'
              value={customDiploma}
              onChange={(e) => setCustomDiploma(e.target.value)}
            />
          </Col>
        )}

        <Col md={3} className='mb-3'>
          <Form.Label htmlFor='hireDate'>Hourly rate*</Form.Label>
          <Form.Control
            id='hourlyRate'
            type='number'
            className={`form-control ${formik.errors.hourly_rate  && formik.touched.hourly_rate ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('hourly_rate')}
          />
          {formik.touched.hourly_rate && formik.errors.hourly_rate && (
            <div className='invalid-feedback'>{formik.errors.hourly_rate}</div>
          )}
        </Col>
      </Row>

      <Row>
        {/* <Col md={3} className='mb-3'>
          <Form.Label htmlFor='class'>Class(es)*</Form.Label>
          <Form.Select
            id='class'
            className={`form-select ${formik.errors.class  && formik.touched.class ? 'is-invalid' : ''}`}
            multiple
            {...formik.getFieldProps('class')}
          >
            {classData.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </Form.Select>
          {formik.touched.class && formik.errors.class && (
            <div className='invalid-feedback'>{formik.errors.class}</div>
          )}
          <div className='form-text text-muted' style={{ fontSize: 'small', color: 'lightgray' }}>
            (Ctrl + click) or (⌘ + click) to select multiple classes  
          </div>
        </Col> */}
        <AvatarEdit button='Add Teacher profile photo' />
      </Row>

      <Button type='submit' className='btn btn-primary'>
        Add Teacher
      </Button>
    </Form>
  );
}
