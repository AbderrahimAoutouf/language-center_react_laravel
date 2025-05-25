import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AvatarEdit from '../ProfileCompo/AvatarEdit';
import { FaMoneyBill } from 'react-icons/fa';
import axios from "../../api/axios";
import { UseStateContext } from "../../context/ContextProvider";
import { useNavigate, useParams } from 'react-router-dom';
import countriesData from '../../data/countries+states+cities.json';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiDollarSign, FiEdit } from 'react-icons/fi';

export default function EditTeacher() {
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();
  const [customDiploma, setCustomDiploma] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { id } = useParams();
  
  // Determine redirect path based on user role
  const redirectPath = user?.role === 'admin' ? "" : user?.role === 'director' ? "/director" : "/secretary";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Load countries data
  useEffect(() => {
    setCountries(countriesData);
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      setStates(selectedCountry.states);
    } else {
      setStates([]);
    }
    setCities([]);
  }, [selectedCountry]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      setCities(selectedState.cities);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // Form validation schema
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      cin: '',
      birthday: '',
      gender: '',
      email: '',
      country: '',
      state: '',
      city: '',
      street: '',
      phone: '',
      diploma: '',
      hourly_rate: '',
      speciality: '',
      contract_type: 'hourly',
      monthly_salary: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      cin: Yup.string().notRequired(),
      birthday: Yup.date().notRequired(),
      gender: Yup.string().notRequired(),
      email: Yup.string().email('Invalid email format').notRequired(),
      country: Yup.string().notRequired(),
      state: Yup.string().notRequired(),
      city: Yup.string().notRequired(),
      street: Yup.string().notRequired(),
      phone: Yup.string().required('Phone number is required'),
      diploma: Yup.string().notRequired().nullable().matches(/^[a-zA-Z\s]*$/, 'Invalid diploma value'),
      hourly_rate: Yup.number().when('contract_type', {
        is: 'hourly',
        then: () => Yup.number().required('Hourly rate is required for hourly contracts').positive('Rate must be positive'),
        otherwise: () => Yup.number().notRequired()
      }),
      speciality: Yup.string().notRequired(),
      contract_type: Yup.string().required('Contract type is required'),
      monthly_salary: Yup.number().when('contract_type', {
        is: 'monthly',
        then: () => Yup.number().required('Monthly salary is required for permanent contracts').positive('Salary must be positive'),
        otherwise: () => Yup.number().notRequired()
      }),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        
        // Append avatar URL (image) to FormData if exists
        if (avatarUrl && typeof avatarUrl === 'object') {
          formData.append('avatar', avatarUrl);
        }
        
        // Add form fields to FormData
        const postData = {
          first_name: values.firstName,
          last_name: values.lastName,
          cin: values.cin,
          birthday: values.birthday,
          gender: values.gender,
          email: values.email,
          address: `${values.street}, ${values.city}, ${values.state}, ${values.country}`,
          phone: values.phone,
          diploma: values.diploma && values.diploma !== 'Other' ? values.diploma : customDiploma,
          speciality: values.speciality,
          contract_type: values.contract_type,
        };
        
        if (values.contract_type === 'hourly') {
          postData.hourly_rate = Number(values.hourly_rate);
        } else {
          postData.monthly_salary = Number(values.monthly_salary);
        }

        // Make PUT request to update teacher
        const response = await axios.put(`/api/teachers/${id}`, postData);
        
        // Show success notification
        toast.success("Teacher updated successfully");
        setNotification("Teacher has been updated successfully");
        setVariant("warning");
        
        setTimeout(() => {
          setNotification("");
          setVariant("");
          navigate(`${redirectPath}/teacher`);
        }, 1500);
      } catch (error) {
        console.error("API error:", error);
        
        // Handle validation errors
        if (error.response && error.response.status === 422) {
          formik.setErrors(error.response.data.errors);
        }
        
        toast.error("Failed to update teacher");
        setNotification("Failed to update teacher");
        setVariant("danger");
        
        setTimeout(() => {
          setNotification("");
          setVariant("");
        }, 3000);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch teacher data
  useEffect(() => {
    axios.get(`/api/teachers/${id}`).then((res) => {
      setAvatarUrl(res.data.avatar);
      const addressParts = res.data.data.address?.split(',').map(part => part.trim()) || [];
      const [street, city, state, country] = addressParts;
  
      // Convert all null/undefined fields to empty strings
      formik.setValues({
        firstName: res.data.data.first_name || '',
        lastName: res.data.data.last_name || '',
        cin: res.data.data.cin || '',
        birthday: res.data.data.birthday || '',
        gender: res.data.data.gender || '',
        email: res.data.data.email || '',
        country: country || '',
        state: state || '',
        city: city || '',
        street: street || '',
        phone: res.data.data.phone || '',
        diploma: res.data.data.diploma || '',
        speciality: res.data.data.speciality || '',
        // Convert hourly_rate to string
        hourly_rate: res.data.data.hourly_rate || '',
        monthly_salary: res.data.data.monthly_salary || '',
        contract_type: res.data.data.contract_type || 'hourly', 
      });
  
      const countryObj = countriesData.find(c => c.name === country);
      setSelectedCountry(countryObj);
  
      if (countryObj) {
        const stateObj = countryObj.states.find(s => s.name === state);
        setSelectedState(stateObj);
      }
    });
  }, [id]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="edit-teacher-container"
    >
      <Card className="shadow-sm mb-4">
        <Card.Header as="h5" className="bg-primary text-white py-3">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="d-flex align-items-center"
          >
            <FiEdit className="me-2" size={24} />
            Edit Teacher
          </motion.div>
        </Card.Header>
        <Card.Body className="py-4">
          <Form onSubmit={formik.handleSubmit} className='addTeacher'>
            {/* Personal Information Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <h5 className="border-start border-primary border-4 ps-2 mb-4">Personal Information</h5>
              <Row>
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='firstName'>First Name*</Form.Label>
                  <Form.Control
                    id='firstName'
                    type='text'
                    placeholder="Enter first name"
                    className={`form-control ${formik.errors.firstName && formik.touched.firstName ? 'is-invalid' : ''}`}
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
                    placeholder="Enter last name"
                    className={`form-control ${formik.errors.lastName && formik.touched.lastName ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('lastName')}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className='invalid-feedback'>{formik.errors.lastName}</div>
                  )}
                </Col>

                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='cin'>CIN</Form.Label>
                  <Form.Control
                    id='cin'
                    type='text'
                    placeholder="Enter CIN"
                    className={`form-control ${formik.errors.cin && formik.touched.cin ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('cin')}
                  />
                  {formik.touched.cin && formik.errors.cin && (
                    <div className='invalid-feedback'>{formik.errors.cin}</div>
                  )}
                </Col>

                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='birthday'>
                    <FiCalendar className="me-1" /> Birthday
                  </Form.Label>
                  <Form.Control
                    id='birthday'
                    type='date'
                    className={`form-control ${formik.errors.birthday && formik.touched.birthday ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('birthday')}
                  />
                  {formik.touched.birthday && formik.errors.birthday && (
                    <div className='invalid-feedback'>{formik.errors.birthday}</div>
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='gender'>Gender</Form.Label>
                  <Form.Select
                    id='gender'
                    className={`form-select ${formik.errors.gender && formik.touched.gender ? 'is-invalid' : ''}`}
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
                  <Form.Label htmlFor='email'>
                    <FiMail className="me-1" /> Email
                  </Form.Label>
                  <Form.Control
                    id='email'
                    type='email'
                    placeholder="Enter email address"
                    className={`form-control ${formik.errors.email && formik.touched.email ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('email')}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className='invalid-feedback'>{formik.errors.email}</div>
                  )}
                </Col>
                
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='phone'>
                    <FiPhone className="me-1" /> Phone*
                  </Form.Label>
                  <Form.Control
                    id='phone'
                    type='text'
                    placeholder="Enter phone number"
                    className={`form-control ${formik.errors.phone && formik.touched.phone ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('phone')}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className='invalid-feedback'>{formik.errors.phone}</div>
                  )}
                </Col>
              </Row>
            </motion.div>

            {/* Address Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <h5 className="border-start border-primary border-4 ps-2 mb-4">
                <FiMapPin className="me-2" /> Address Information
              </h5>
              <Row>
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='country'>Country</Form.Label>
                  <Form.Select
                    id='country'
                    className={`form-select ${formik.errors.country && formik.touched.country ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('country')}
                    onChange={(e) => {
                      const country = countries.find(c => c.name === e.target.value);
                      setSelectedCountry(country);
                      formik.setFieldValue('state', '');
                      formik.setFieldValue('city', '');
                      formik.setFieldValue('country', e.target.value);
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.iso2} value={country.name}>{country.name}</option>
                    ))}
                  </Form.Select>
                  {formik.touched.country && formik.errors.country && (
                    <div className='invalid-feedback'>{formik.errors.country}</div>
                  )}
                </Col>

                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='state'>State</Form.Label>
                  <Form.Select
                    id='state'
                    className={`form-select ${formik.errors.state && formik.touched.state ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('state')}
                    onChange={(e) => {
                      const state = states.find(s => s.name === e.target.value);
                      setSelectedState(state);
                      formik.setFieldValue('city', '');
                      formik.setFieldValue('state', e.target.value);
                    }}
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.name}>{state.name}</option>
                    ))}
                  </Form.Select>
                  {formik.touched.state && formik.errors.state && (
                    <div className='invalid-feedback'>{formik.errors.state}</div>
                  )}
                </Col>

                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='city'>City</Form.Label>
                  {cities.length > 0 ? (
                    <Form.Select
                      id='city'
                      className={`form-select ${formik.errors.city && formik.touched.city ? 'is-invalid' : ''}`}
                      {...formik.getFieldProps('city')}
                      disabled={!selectedState}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      id='city'
                      type='text'
                      placeholder="Enter city name"
                      className={`form-control ${formik.errors.city && formik.touched.city ? 'is-invalid' : ''}`}
                      {...formik.getFieldProps('city')}
                      disabled={!selectedState}
                    />
                  )}
                  {formik.touched.city && formik.errors.city && (
                    <div className='invalid-feedback'>{formik.errors.city}</div>
                  )}
                </Col>

                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='street'>Street</Form.Label>
                  <Form.Control
                    id='street'
                    type='text'
                    placeholder="Enter street address"
                    className={`form-control ${formik.errors.street && formik.touched.street ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('street')}
                  />
                  {formik.touched.street && formik.errors.street && (
                    <div className='invalid-feedback'>{formik.errors.street}</div>
                  )}
                </Col>
              </Row>
            </motion.div>

            {/* Professional Information Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <h5 className="border-start border-primary border-4 ps-2 mb-4">
                <FiBook className="me-2" /> Professional Information
              </h5>
              <Row>
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='speciality'>Speciality</Form.Label>
                  <Form.Control
                    id='speciality'
                    type='text'
                    placeholder="Enter speciality"
                    className={`form-control ${formik.errors.speciality && formik.touched.speciality ? 'is-invalid' : ''}`}
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
                    className={`form-select ${formik.errors.diploma && formik.touched.diploma ? 'is-invalid' : ''}`}
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
                  {formik.touched.diploma && formik.errors.diploma && (
                    <div className='invalid-feedback'>{formik.errors.diploma}</div>
                  )}
                </Col>

                {formik.values.diploma === 'Other' && (
                  <Col md={3} className='mb-3'>
                    <Form.Label htmlFor='customDiploma'>Specify Diploma</Form.Label>
                    <Form.Control
                      id='customDiploma'
                      type='text'
                      placeholder="Enter custom diploma"
                      className='form-control'
                      value={customDiploma}
                      onChange={(e) => setCustomDiploma(e.target.value)}
                    />
                  </Col>
                )}
              </Row>

              <Row>
                <Col md={3} className='mb-3'>
                  <Form.Label htmlFor='contract_type'>
                    <FaMoneyBill className="me-1" /> Contract Type*
                  </Form.Label>
                  <Form.Select
                    id='contract_type'
                    className={`form-select ${formik.errors.contract_type && formik.touched.contract_type ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('contract_type')}
                  >
                    <option value=''>Select Contract Type</option>
                    <option value='hourly'>Hourly Contract</option>
                    <option value='monthly'>Monthly Contract (Permanent)</option>
                  </Form.Select>
                  {formik.touched.contract_type && formik.errors.contract_type && (
                    <div className='invalid-feedback'>{formik.errors.contract_type}</div>
                  )}
                </Col>

                {formik.values.contract_type === 'monthly' && (
                  <Col md={3} className='mb-3'>
                    <Form.Label htmlFor='monthly_salary'>Monthly Salary*</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">DH</span>
                      <Form.Control
                        id='monthly_salary'
                        type='number'
                        placeholder="Enter monthly salary"
                        className={`form-control ${formik.errors.monthly_salary && formik.touched.monthly_salary ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('monthly_salary')}
                      />
                      {formik.touched.monthly_salary && formik.errors.monthly_salary && (
                        <div className='invalid-feedback'>{formik.errors.monthly_salary}</div>
                      )}
                    </div>
                  </Col>
                )}

                {formik.values.contract_type === 'hourly' && (
                  <Col md={3} className='mb-3'>
                    <Form.Label htmlFor='hourly_rate'>Hourly Rate*</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">DH</span>
                      <Form.Control
                        id='hourly_rate'
                        type='number'
                        placeholder="Enter hourly rate"
                        className={`form-control ${formik.errors.hourly_rate && formik.touched.hourly_rate ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('hourly_rate')}
                      />
                      {formik.touched.hourly_rate && formik.errors.hourly_rate && (
                        <div className='invalid-feedback'>{formik.errors.hourly_rate}</div>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            </motion.div>

            {/* Photo Upload Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <h5 className="border-start border-primary border-4 ps-2 mb-4">Profile Photo</h5>
              <Row>
                <Col>
                  <AvatarEdit 
                    button='Update Teacher profile photo' 
                    setImageData={setAvatarUrl}
                    teacherId={id} 
                    initialImage={avatarUrl}
                  />
                </Col>
              </Row>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="d-flex gap-2 mt-4"
            >
              <Button 
                type='submit' 
                className='btn btn-primary px-4' 
                disabled={isSubmitting}
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
                    Processing...
                  </>
                ) : (
                  'Update Teacher'
                )}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate(`${redirectPath}/teacher`)}
              >
                Cancel
              </Button>
            </motion.div>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
}