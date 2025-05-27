import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Alert } from 'react-bootstrap';
import * as yup from 'yup';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../context/ContextProvider';
import countriesData from '../data/countries+states+cities.json';

// Constants
const MINIMUM_AGE = 18;


function StudentRegistrationForm() {
  const navigate = useNavigate();
  const { user, setNotification, setVariant } = UseStateContext();
  
  // State management
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [isUnderAge, setIsUnderAge] = useState(false);
  const [showParentForm, setShowParentForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
    // Convertir en nombre si c'est une chaîne
    return originalValue === '' ? 0 : Number(originalValue);
  })
  .min(0, 'Advance payment cannot be negative')
  .when('isFree', {
    is: false,
    then: () => yup.number()
      .transform((value, originalValue) => originalValue === '' ? 0 : Number(originalValue))
      .min(0, 'Advance payment cannot be negative'),
    otherwise: () => yup.number()
      .transform((value, originalValue) => originalValue === '' ? 0 : Number(originalValue))
  }),
  
  
    
    photoRights: yup.boolean()
  });

  // Formik setup - MOVED BEFORE useEffect hooks that depend on it
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dateofBirth: '',
      email: '',
      phone: '',
      emergencyContact: '',
      country: '',
      state: '',
      city: '',
      street: '',
      
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

  // Data fetching effects
  useEffect(() => {
    setCountries(countriesData);
  }, []);

  

  // Location handling effects
  useEffect(() => {
    if (selectedCountry) {
      setStates(selectedCountry.states || []);
      setCities([]);
      formik.setFieldValue('state', '');
      formik.setFieldValue('city', '');
    }
  }, [selectedCountry, formik]);

  useEffect(() => {
    if (selectedState) {
      setCities(selectedState.cities || []);
      formik.setFieldValue('city', '');
    }
  }, [selectedState, formik]);

  // Auto-fill parent information if exists
  useEffect(() => {
    if (isUnderAge && (formik.values.guardCin?.length >= 2 || formik.values.guardPhone?.length >= 9)) {
      const debounceTimer = setTimeout(() => {
        searchExistingParent();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [formik.values.guardCin, formik.values.guardPhone, isUnderAge]);

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
      street: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2] || '',
      country: addressParts[3] || ''
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

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    formik.setFieldValue('country', countryName);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const state = states.find(s => s.name === stateName);
    setSelectedState(state);
    formik.setFieldValue('state', stateName);
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
      // Prepare student data with advance payment
      const studentData = {
        prenom: values.firstName,
        nom: values.lastName,
        date_naissance: values.dateofBirth,
        sexe: values.gender,
        email: values.email,
        telephone: values.phone,
        emergency_contact: values.emergencyContact,
        adresse: `${values.street}, ${values.city}, ${values.state}, ${values.country}`,
        gratuit: formik.values.isFree,
        adulte: !isUnderAge,
        underAge: isUnderAge,
        photo_authorized: values.photoRights,
        // NOUVELLE COLONNE: Sauvegarder l'avance dans la table etudiant
        avance: !values.isFree ? Number(values.courseFeesPaid) : 0,
        
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
              <Form.Group as={Col} md="3" className="position-relative">
                <Form.Label>Country</Form.Label>
                <Form.Select
                  name="country"
                  {...formik.getFieldProps('country')}
                  onChange={handleCountryChange}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.iso2} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="3" className="position-relative">
                <Form.Label>State</Form.Label>
                <Form.Select
                  name="state"
                  {...formik.getFieldProps('state')}
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="3" className="position-relative">
                <Form.Label>City</Form.Label>
                {cities.length > 0 ? (
                  <Form.Select
                    name="city"
                    {...formik.getFieldProps('city')}
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    {...formik.getFieldProps('city')}
                    disabled={!selectedState}
                  />
                )}
              </Form.Group>

              <Form.Group as={Col} md="3" className="position-relative">
                <Form.Label>Street</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  placeholder="Street address"
                  {...formik.getFieldProps('street')}
                />
              </Form.Group>
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

       
{/* Advance Payment Section */}
<div className="card mb-4">
  <div className="card-header">
    <h4>Advance Payment</h4>
  </div>
  <div className="card-body">
    {/* Free Student Option */}
    <Form.Group className="mb-3">
      <Form.Check 
        type="switch"
        id="free-student"
        label="Étudiant gratuit"
        checked={formik.values.isFree}
        onChange={(e) => {
          formik.setFieldValue('isFree', e.target.checked);
          // Si étudiant gratuit, réinitialiser l'avance
          if (e.target.checked) {
            formik.setFieldValue('courseFeesPaid', 0);
          }
        }}
        className={`me-3 fs-4 ${formik.values.isFree ? "text-danger" : ''}`}
      />
    </Form.Group>

    {/* Advance Payment - Disabled if free student */}
    {!formik.values.isFree && (
      <Row className="mb-3">
        <Form.Group as={Col} md="6" className="position-relative">
          <Form.Label>Advance Payment Amount</Form.Label>
          <Form.Control
            type="number"
            name="courseFeesPaid"
            placeholder="Enter advance payment amount"
            min="0"
            {...formik.getFieldProps('courseFeesPaid')}
            isInvalid={formik.touched.courseFeesPaid && !!formik.errors.courseFeesPaid}
          />
          <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.courseFeesPaid}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Montant de l'avance pour l'étudiant (sera automatiquement affiché lors de l'ajout de classe)
          </Form.Text>
        </Form.Group>

        
      </Row>
    )}
  </div>
</div>

        {/* Submit Button */}
        <div className="d-flex justify-content-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`${getBaseRoute()}/student`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="px-4"
          >
            {isLoading ? 'Registering...' : 'Register Student'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default StudentRegistrationForm;