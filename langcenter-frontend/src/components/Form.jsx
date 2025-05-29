import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Alert, Modal } from 'react-bootstrap';
import * as yup from 'yup';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../context/ContextProvider';
import AddCourse from './Composantsforcoursepage/AddCourse'; 

// Constants
const MINIMUM_AGE = 18;

function StudentRegistrationForm() {
  const navigate = useNavigate();
  const { user, setNotification, setVariant } = UseStateContext();
  
  // State management
  const [isUnderAge, setIsUnderAge] = useState(false);
  const [showParentForm, setShowParentForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Course related states
  const [coursesData, setCoursesData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // User role-based routing
  const getBaseRoute = () => {
    switch (user?.role) {
      case 'admin': return '';
      case 'director': return '/director';
      default: return '/secretary';
    }
  };

  // Form validation schema
  const validationSchema = yup.object().shape({
    firstName: yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .required('First name is required'),
    lastName: yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .required('Last name is required'),
    gender: yup.string()
      .oneOf(['female', 'male'], 'Please select a gender')
      .required('Gender is required'),
    dateofBirth: yup.date()
      .max(new Date(), 'Birth date cannot be in the future')
      .required('Date of birth is required'),
    email: yup.string().email('Invalid email format'),
    phone: yup.string().min(9, 'Phone number too short'),
    emergencyContact: yup.string().min(9, 'Emergency contact too short'),
    
    // Course selection
    course: yup.string().required('Course selection is required'),
    
    // Guardian fields (conditional validation)
    guardfName: yup.string().when('isUnderAge', {
      is: true,
      then: () => yup.string().required('Guardian first name is required for minors'),
      otherwise: () => yup.string()
    }),
    guardLName: yup.string().when('isUnderAge', {
      is: true,
      then: () => yup.string().required('Guardian last name is required for minors'),
      otherwise: () => yup.string()
    }),
    guardPhone: yup.string().when('isUnderAge', {
      is: true,
      then: () => yup.string().min(9, 'Guardian phone too short').required('Guardian phone is required for minors'),
      otherwise: () => yup.string()
    }),
    guardCin: yup.string()
      .min(2, 'CIN too short')
      .max(8, 'CIN too long'),
    guardEmail: yup.string().email('Invalid email format'),
    parentRelationship: yup.string(),
    
    // Advance payment validation
    courseFeesPaid: yup.number()
      .transform((value, originalValue) => {
        return originalValue === '' ? 0 : Number(originalValue);
      })
      .min(0, 'Advance payment cannot be negative')
      .when('isFree', {
        is: false,
        then: (schema) => schema.max(yup.ref('coursePrice'), 'Advance payment cannot exceed course price'),
        otherwise: () => yup.number()
          .transform((value, originalValue) => originalValue === '' ? 0 : Number(originalValue))
      }),
    
    photoRights: yup.boolean()
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dateofBirth: '',
      email: '',
      phone: '',
      emergencyContact: '',
      address: '',
      
      // Course information
      course: '',
      coursePrice: 0,
      
      // Guardian information
      guardfName: '',
      guardLName: '',
      guardGender: '',
      guardCin: '',
      guardEmail: '',
      guardPhone: '',
      guardBirthDate: '',
      guardAddress: '',
      parentRelationship: '',
      
      // Advance payment information
      courseFeesPaid: 0,

      isFree: false,
      photoRights: false,
      isUnderAge: false,
    },
    validationSchema,
    onSubmit: handleFormSubmit
  });

  

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/cours');
        setCoursesData(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        showNotification('Failed to load courses', 'danger');
      }
    };
    
    fetchCourses();
  }, []);

  // Calculate remaining amount when course or advance payment changes
  useEffect(() => {
    const coursePrice = formik.values.coursePrice || 0;
    const advancePayment = Number(formik.values.courseFeesPaid) || 0;
    const remaining = coursePrice - advancePayment;
    setRemainingAmount(Math.max(0, remaining));
  }, [formik.values.coursePrice, formik.values.courseFeesPaid]);

  // Auto-fill parent information if exists
  useEffect(() => {
    if (isUnderAge && (formik.values.guardCin?.length >= 7 || formik.values.guardPhone?.length >= 9)) {
      const debounceTimer = setTimeout(() => {
        searchExistingParent();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [formik.values.guardCin, formik.values.guardPhone, isUnderAge]);

  // Course handling functions
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    
    if (courseId === 'add-new-course') {
      setShowAddCourseModal(true);
      formik.setFieldValue('course', '');
      return;
    }
    
    const course = coursesData.find(c => c.id == courseId);
    setSelectedCourse(course);
    
    formik.setFieldValue('course', courseId);
    formik.setFieldValue('coursePrice', course ? course.price : 0);
    
    // Reset advance payment when course changes
    formik.setFieldValue('courseFeesPaid', 0);
  };

  const handleNewCourseAdded = (newCourse) => {
    setCoursesData([...coursesData, newCourse]);
    setSelectedCourse(newCourse);
    formik.setFieldValue('course', newCourse.id);
    formik.setFieldValue('coursePrice', newCourse.price);
    setShowAddCourseModal(false);
    showNotification('Course added successfully', 'success');
  };

  // API Functions
  const searchExistingParent = async () => {
    try {
      const response = await axios.post('/api/parents/search', {
        cin: formik.values.guardCin,
        telephone: formik.values.guardPhone
      });

      if (response.data.length > 0) {
        const parent = response.data[0];
        fillParentInformation(parent);
        showNotification('Parent information found and filled automatically', 'success');
      }
    } catch (error) {
      console.error('Parent search error:', error);
    }
  };

  const fillParentInformation = (parent) => {
    const addressParts = parent.adresse?.split(', ') || [];
    formik.setValues({
      ...formik.values,
      guardfName: parent.prenom || '',
      guardLName: parent.nom || '',
      guardGender: parent.sexe || '',
      guardEmail: parent.email || '',
      guardBirthDate: parent.date_naissance || '',
      guardAddress: parent.adresse || '',
      parentRelationship: parent.relationship || '',
      address: parent.adresse || ''
    });
    setShowParentForm(false);
  };

  // Utility functions
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const showNotification = (message, variant = 'info') => {
    setNotification(message);
    setVariant(variant);
    setTimeout(() => {
      setNotification('');
      setVariant('');
    }, 3000);
  };

  const handleDateOfBirthChange = (e) => {
    const selectedDate = e.target.value;
    const age = calculateAge(selectedDate);
    const underAge = age < MINIMUM_AGE;
    
    setIsUnderAge(underAge);
    formik.setFieldValue('dateofBirth', selectedDate);
    formik.setFieldValue('isUnderAge', underAge);
  };

  // PDF Receipt generation
  const generateReceipt = async (studentId) => {
    try {
      const response = await axios.get(`/api/etudiants/${studentId}/receipt`, {
        responseType: 'blob',
        timeout: 30000,
        headers: { 'Accept': 'application/pdf' }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `receipt-${studentId}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      showNotification('Failed to generate receipt', 'danger');
    }
  };

  // Form submission handler
  async function handleFormSubmit(values) {
    setIsLoading(true);
    
    try {
      // Prepare student data with course and advance payment
      const studentData = {
        prenom: values.firstName,
        nom: values.lastName,
        date_naissance: values.dateofBirth,
        sexe: values.gender,
        email: values.email,
        telephone: values.phone,
        emergency_contact: values.emergencyContact,
        adresse: values.address,
        gratuit: formik.values.isFree,
        adulte: !isUnderAge,
        underAge: isUnderAge,
        photo_authorized: values.photoRights,
        
        // Course information
        cours_id: values.course,
        prix_course: values.coursePrice,
        avance: !values.isFree ? Number(values.courseFeesPaid) : 0,
        montant_restant: !values.isFree ? remainingAmount : 0,
        
        // Guardian information (if under age)
        ...(isUnderAge && {
          parent_prenom: values.guardfName,
          parent_nom: values.guardLName,
          parent_email: values.guardEmail,
          parent_telephone: values.guardPhone,
          parent_cin: values.guardCin,
          parent_sexe: values.guardGender,
          parent_adresse: values.guardAddress,
          parent_date_naissance: values.guardBirthDate,
          parent_relationship: values.parentRelationship,
        })
      };

      // Create student
      const studentResponse = await axios.post('/api/etudiants', studentData);
      const studentId = studentResponse.data?.data?.id;

      if (!studentId) {
        throw new Error('Invalid student creation response');
      }

      // Generate receipt
      await generateReceipt(studentId);

      showNotification('Student registered successfully!', 'success');
      
      setTimeout(() => {
        navigate(`${getBaseRoute()}/student`);
      }, 2000);

    } catch (error) {
      console.error('Form submission error:', error);
      handleSubmissionError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmissionError = (error) => {
    if (error.response?.data) {
      const serverErrors = error.response.data;
      const fieldErrors = serverErrors.errors || serverErrors.message || serverErrors;
      
      // Map server field names to form field names
      const mappedErrors = {
        ...fieldErrors,
        phone: fieldErrors.telephone,
        guardPhone: fieldErrors.parent_telephone,
        guardCin: fieldErrors.parent_cin,
        guardEmail: fieldErrors.parent_email
      };
      
      formik.setErrors(mappedErrors);
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to register student';
    showNotification(errorMessage, 'danger');
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Student Registration</h2>
      
      <Form noValidate onSubmit={formik.handleSubmit}>
        {/* Student Information Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h4>Student Information</h4>
          </div>
          <div className="card-body">
            <Row className="mb-3">
              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  {...formik.getFieldProps('firstName')}
                  isInvalid={formik.touched.firstName && !!formik.errors.firstName}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  {...formik.getFieldProps('lastName')}
                  isInvalid={formik.touched.lastName && !!formik.errors.lastName}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="gender"
                  {...formik.getFieldProps('gender')}
                  isInvalid={formik.touched.gender && !!formik.errors.gender}
                >
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>Date of Birth <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="dateofBirth"
                  {...formik.getFieldProps('dateofBirth')}
                  onChange={handleDateOfBirthChange}
                  isInvalid={formik.touched.dateofBirth && !!formik.errors.dateofBirth}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.dateofBirth}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  {...formik.getFieldProps('email')}
                  isInvalid={formik.touched.email && !!formik.errors.email}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="position-relative">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="+(212) ..."
                  {...formik.getFieldProps('phone')}
                  isInvalid={formik.touched.phone && !!formik.errors.phone}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="position-relative">
                <Form.Label>Emergency Contact</Form.Label>
                <Form.Control
                  type="tel"
                  name="emergencyContact"
                  placeholder="+(212) ..."
                  {...formik.getFieldProps('emergencyContact')}
                  isInvalid={formik.touched.emergencyContact && !!formik.errors.emergencyContact}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.emergencyContact}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="position-relative d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  label="Authorize photo usage"
                  {...formik.getFieldProps('photoRights')}
                  checked={formik.values.photoRights}
                />
              </Form.Group>
            </Row>

            {/* Address Section */}
            <h5 className="mt-4 mb-3">Address Information</h5>
<Row className="mb-3">
  <Form.Group as={Col} md="12" className="position-relative">
    <Form.Label>Address</Form.Label>
    <Form.Control
      as="textarea"
      rows={2}
      name="address"
      placeholder="Enter address"
      {...formik.getFieldProps('address')}
    />
  </Form.Group>
</Row>
          </div>
        </div>

        {/* Course Selection Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h4>Course Information</h4>
          </div>
          <div className="card-body">
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="position-relative">
                <Form.Label>Select Course <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="course"
                  {...formik.getFieldProps('course')}
                  onChange={handleCourseChange}
                  isInvalid={formik.touched.course && !!formik.errors.course}
                >
                  <option value="">Select Course</option>
                  {coursesData.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.price} DH
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.course}
                </Form.Control.Feedback>
              </Form.Group>

              {selectedCourse && (
                <Form.Group as={Col} md="6" className="position-relative">
                  <Form.Label>Course Price</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${selectedCourse.price} DH`}
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Duration: {selectedCourse.duration} | {selectedCourse.description}
                  </Form.Text>
                </Form.Group>
              )}
            </Row>
          </div>
        </div>

        {/* Guardian Information Section - Only show if under age */}
        {isUnderAge && (
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Guardian Information</h4>
              <Button
                variant="link"
                onClick={() => setShowParentForm(!showParentForm)}
                className="p-0"
              >
                {showParentForm ? 'Hide' : 'Edit'} Guardian Info
              </Button>
            </div>
            {showParentForm && (
              <div className="card-body">
                <Row className="mb-3">
                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Guardian First Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="guardfName"
                      placeholder="Guardian first name"
                      {...formik.getFieldProps('guardfName')}
                      isInvalid={formik.touched.guardfName && !!formik.errors.guardfName}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {formik.errors.guardfName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Guardian Last Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="guardLName"
                      placeholder="Guardian last name"
                      {...formik.getFieldProps('guardLName')}
                      isInvalid={formik.touched.guardLName && !!formik.errors.guardLName}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {formik.errors.guardLName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Guardian CIN</Form.Label>
                    <Form.Control
                      type="text"
                      name="guardCin"
                      placeholder="CIN"
                      {...formik.getFieldProps('guardCin')}
                      isInvalid={formik.touched.guardCin && !!formik.errors.guardCin}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {formik.errors.guardCin}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Guardian Phone <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      name="guardPhone"
                      placeholder="+(212) ..."
                      {...formik.getFieldProps('guardPhone')}
                      isInvalid={formik.touched.guardPhone && !!formik.errors.guardPhone}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {formik.errors.guardPhone}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Guardian Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="guardEmail"
                      placeholder="Guardian email"
                      {...formik.getFieldProps('guardEmail')}
                      isInvalid={formik.touched.guardEmail && !!formik.errors.guardEmail}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {formik.errors.guardEmail}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="position-relative">
                    <Form.Label>Relationship</Form.Label>
                    <Form.Select
                      name="parentRelationship"
                      {...formik.getFieldProps('parentRelationship')}
                    >
                      <option value="">Select Relationship</option>
                      <option value="père">Father</option>
                      <option value="mère">Mother</option>
                      <option value="frère">Brother</option>
                      <option value="sœur">Sister</option>
                      <option value="tuteur">Guardian</option>
                      <option value="autre">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Row>
              </div>
            )}
          </div>
        )}

        {/* Payment Information Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h4>Payment Information</h4>
          </div>
          <div className="card-body">
            {/* Free Student Option */}
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="free-student"
                label="Free Student"
                checked={formik.values.isFree}
                onChange={(e) => {
                  formik.setFieldValue('isFree', e.target.checked);
                  if (e.target.checked) {
                    formik.setFieldValue('courseFeesPaid', 0);
                  }
                }}
              />
            </Form.Group>

            {/* Payment fields - only show if not free */}
            {!formik.values.isFree && selectedCourse && (
              <Row className="mb-3">
                <Form.Group as={Col} md="4" className="position-relative">
                  <Form.Label>Course Total Price</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${selectedCourse.price} DH`}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group as={Col} md="4" className="position-relative">
                  <Form.Label>Advance Payment</Form.Label>
                  <Form.Control
                    type="number"
                    name="courseFeesPaid"
                    placeholder="Enter advance payment"
                    min="0"
                    max={selectedCourse.price}
                    step="0.01"
                    {...formik.getFieldProps('courseFeesPaid')}
                    isInvalid={formik.touched.courseFeesPaid && !!formik.errors.courseFeesPaid}
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {formik.errors.courseFeesPaid}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Enter the amount paid in advance (0 to {selectedCourse.price} DH)
                  </Form.Text>
                </Form.Group>

                <Form.Group as={Col} md="4" className="position-relative">
                  <Form.Label>Remaining Amount</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${remainingAmount} DH`}
                    readOnly
                    className={`${remainingAmount > 0 ? 'bg-warning-subtle' : 'bg-success-subtle'}`}
                  />
                  {remainingAmount > 0 && (
                    <Form.Text className="text-warning">
                      <small>⚠️ Student still owes {remainingAmount} DH</small>
                    </Form.Text>
                  )}
                  {remainingAmount === 0 && Number(formik.values.courseFeesPaid) > 0 && (
                    <Form.Text className="text-success">
                      <small>✅ Course fully paid</small>
                    </Form.Text>
                  )}
                </Form.Group>
              </Row>
            )}

            {/* Payment Status Summary */}
            {selectedCourse && !formik.values.isFree && (
              <Alert variant={remainingAmount > 0 ? 'warning' : 'success'} className="mt-3">
                <Alert.Heading className="h6">Payment Summary</Alert.Heading>
                <div className="d-flex justify-content-between">
                  <span>Course: {selectedCourse.title}</span>
                  <span>{selectedCourse.price} DH</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Advance Payment:</span>
                  <span>-{Number(formik.values.courseFeesPaid) || 0} DH</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Remaining Balance:</span>
                  <span>{remainingAmount} DH</span>
                </div>
                {remainingAmount > 0 && (
                  <small className="text-muted d-block mt-2">
                    Student will need to pay the remaining balance before or during the course.
                  </small>
                )}
              </Alert>
            )}

            {formik.values.isFree && (
              <Alert variant="info">
                <Alert.Heading className="h6">Free Student</Alert.Heading>
                This student is enrolled for free. No payment is required.
              </Alert>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`${getBaseRoute()}/student`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => formik.resetForm()}
              disabled={isLoading}
            >
              Reset Form
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formik.isValid}
              className="d-flex align-items-center gap-2"
            >
              {isLoading && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              )}
              {isLoading ? 'Registering...' : 'Register Student'}
            </Button>
          </div>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(formik.errors).length > 0 && formik.submitCount > 0 && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading className="h6">Please correct the following errors:</Alert.Heading>
            <ul className="mb-0">
              {Object.entries(formik.errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {error}
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </Form>

      {/* Add Course Modal */}
      <Modal show={showAddCourseModal} onHide={() => setShowAddCourseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddCourse 
            inModal={true} 
            onCourseAdded={handleNewCourseAdded}
            handleClose={() => setShowAddCourseModal(false)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default StudentRegistrationForm;