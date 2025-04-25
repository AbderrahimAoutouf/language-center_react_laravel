import { useFormik } from 'formik';
import { useState,useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { InputGroup } from 'react-bootstrap';
import * as yup from 'yup';
import axios from '../api/axios';
import {useNavigate} from 'react-router-dom';
import { UseStateContext } from '../context/ContextProvider';
import countriesData from '../data/countries+states+cities.json';
import AsyncSelect from 'react-select/async';
import Alert from 'react-bootstrap/Alert';

function FormC() {
  const navigate = useNavigate();
  const [testPrice, setTestPrice] = useState(0);
  const [tests, setTests] = useState([]);
  const [customDiploma, setCustomDiploma] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const {user,setNotification,setVariant} = UseStateContext();
  const [underAge,setUnderAge] = useState(false);
  const [total,setTotal] = useState(0);
  const [parents, setParents] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [showParent, setShowParent] = useState(true);
  const [selectedExistingParent, setSelectedExistingParent] = useState(null);
  let x = ""
  if (user && user.role==='admin')
  {
    x = ""
  } else if (user && user.role==='director')
  {
    x="/director"
  }else {
    x="/secretary"
  }
  const [classData, setClassData] = useState([]);
    // Fetch available classes and levels from the database
  useEffect(() => {
    axios.get('/api/classes').then((res) => {
      console.log("Class data structure:", res.data);
      setClassData(res.data);
     
    });
  }, []);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  setIsLoading(true);
  axios.get('/api/classes').then((res) => {
    setClassData(res.data);
    setIsLoading(false);
  }).catch(err => {
    console.error("Error loading class data:", err);
    setIsLoading(false);
  });
}, []);


useEffect(() => {
  axios.get('/api/parents')
      .then(res => setParents(res.data));
}, []);

// Gestion de la recherche
const searchParents = async (input) => {
  const res = await axios.post('/api/parents/search', { q: input });
  return res.data;
};

// Archiver un parent
const archiveParent = (parentId) => {
  axios.patch(`/api/parents/${parentId}/archive`)
      .then(() => {
          // Rafraîchir la liste
      });
};


  // Fetch available tests from the database
  useEffect(() => {
    axios.get('/api/tests').then((res) => {
      console.log("Tests API response:", res.data); // Log actual response structure
      
      // First check if response contains direct array of tests
      if (Array.isArray(res.data)) {
        const firstTest = res.data[0];
        if (firstTest?.price !== undefined) {
          setTestPrice(Number(firstTest.price));
        }
        setTests(res.data);
      }
      // Then check for nested data array
      else if (res.data?.data && Array.isArray(res.data.data)) {
        const firstTest = res.data.data[0];
        if (firstTest?.price !== undefined) {
          setTestPrice(Number(firstTest.price));
        }
        setTests(res.data.data);
      }
      else {
        console.warn("Unexpected tests response structure:", res.data);
        setTestPrice(0);
        setTests([]);
      }
    }).catch(error => {
      console.error("Error fetching tests:", error);
      setTestPrice(0);
      setTests([]);
    });
  }, []);
  
  // Helper function to find price in different places in the response
  const findPriceInResponse = (response) => {
    // Check multiple possible response structures
    const testsArray = 
      response.data || // Direct array
      response.data?.data || // Nested data array
      response.data?.tests || // Tests property
      [];
    
    if (testsArray.length > 0 && testsArray[0].price) {
      return Number(testsArray[0].price);
    }
    if (response.data?.price) {
      return Number(response.data.price);
    }
    return null;
  };



  useEffect(() => {
      setCountries(countriesData);
    }, []);
  
    useEffect(() => {
      if (selectedCountry) {
        setStates(selectedCountry.states);
      } else {
        setStates([]);
      }
      setCities([]);
    }, [selectedCountry]);
  
    useEffect(() => {
      if (selectedState) {
        setCities(selectedState.cities);
      } else {
        setCities([]);
      }
    }, [selectedState]);
  const formik = useFormik({
        initialValues:{
        firstName: ``,
        lastName: ``,
        class: ``,
        gender: ``,
        address: ``,
        country: '',
      state: '',
      city: '',
      street: '',
        dateofBirth: ``,
        active: false,
        adult: ``,
        email: ``,
        phone: ``,
        emergencyContact: ``,
        guardfName:``,
        guardLName: ``,
        guardGender: ``,
        guardCin: ``,
        guardEmail: ``,
        guardPhone: ``,
        guardBirthDate: ``,
        guardAddress: ``,
        courseName: ``,
        courseFeesPaid: ``,
        negotiatedPrice: ``,
        discount: ``,
        customDiscount: ``,
        insurrance: false,
        course: false,
        testLevel: false,
        file: '',
        test: ``,
        testFees: 100,
        testFeesPaid: 0,
        methode: ``,
      },
    validationSchema: yup.object().shape({
    firstName: yup.string()
    .min(3, 'Too Short!')
    .max(50, 'Too Long!')
    .required('required'),
    lastName: yup.string()
    .min(3, "Too short")
    .max(50, 'Too Long!')
    .required('required'),
    class: yup.string().required("required"),
      gender: yup.string().oneOf(['female','male']).required('required'),
      address: yup.string().required('required'),
      country: yup.string().required('Country is required'),
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      street: yup.string().required('Street is required'),
      dateofBirth: yup.date().required('required'),
      adult: yup.boolean().oneOf[true,false],
      email: yup.string().email('Invalid email'),
      phone: yup.string().min(9,'to short to be a valid phone number'),
      guardfName: yup.string(),
      guardLName: yup.string(),
      guardCin: yup.string().min(2,'to short to be a valid CIN').max(8,'to long to be a valid CIN'),
      guardEmail: yup.string().email('invalid Email'),
      guardPhone: yup.string().min(9,'to short to be a valid phone number').required('Required for minors'),
      emergencyContact: yup.string().required('Emergency contact is required'),
    //parentRelationship: yup.string().required('Relationship is required'),
      guardGender: yup.string(),
      guardBirthDate: yup.date(),
      guardAddress: yup.string(),
      courseName: yup.string().oneOf(['english','talks']).required('required'),
      courseFeesPaid: yup.number().required('required'),
      negotiatedPrice: yup.number().required('required').nonNullable(),
      file: yup.mixed(),
      discount: yup.string(),
      customDiscount: yup.number().max(100).min(0),
      test: yup.string(),
      testFees: yup.number(),
      testFeesPaid: yup.number(),
      methode: yup.string(),
    }),
  onSubmit: (values) => {
    console.log("wewe are here");
}
});

  // Find the course fees based on the class id
  const findCoursFees = (classId) => {
    if (isLoading || !classData.length) return 0;
    
    const classFees = classData.find((c) => c.id == classId);
    if (classFees && classFees.cours && classFees.cours.price !== undefined){
      return classFees.cours.price;
    } else {
      return 0;
    }
  }
  // request to create a new student
  const handleSubmit = async(e) => {
    e.preventDefault();
    let response = [];
    let response2 = [];
    let response3 = [];
    console.log(formik.values);
    let adultData = {
      prenom: formik.values.firstName,
      nom: formik.values.lastName,
      date_naissance: formik.values.dateofBirth,
      sexe: formik.values.gender,
      email: formik.values.email,
      telephone: formik.values.phone,
      emergency_contact: formik.values.emergencyContact,
      adresse: `${formik.values.street}, ${formik.values.city}, ${formik.values.state}, ${formik.values.country}`,
      adulte: formik.values.adult,
      underAge: false,
    }
    let etudiantData = adultData;
    if (underAge === true){
       etudiantData = {
      ...adultData,
      parent_prenom: formik.values.guardfName,
      parent_nom: formik.values.guardLName,
      parent_email: formik.values.guardEmail,
      parent_telephone:formik.values.guardPhone,
      parent_cin: formik.values.guardCin,
      parent_sexe :formik.values.guardGender,
      parent_adresse: formik.values.address,
      parent_date_naissance:formik.values.guardBirthDate,
      underAge:true,
      }
      
    }
    try{
      response = await axios.post('/api/etudiants',etudiantData);
      if (response && response.data && response.data.data) {
        const etudiantId = response.data.data.id;
      } else {
        console.error("Invalid response structure:", response); }
    } catch (error) {
      console.log(error);
      if (error.response?.data) {
        const serverErrors = error.response.data;
        // Handle different server error formats
        const fieldErrors = serverErrors.errors || serverErrors.message || serverErrors;
        formik.setErrors({
          ...fieldErrors,
          phone: fieldErrors.telephone,
          guardPhone: fieldErrors.parent_telephone,
          guardCin: fieldErrors.parent_cin,
          guardEmail: fieldErrors.parent_email
        });
      }
      setNotification("Failed to add student: " + (error.response?.data?.message || "Validation error"));
      setVariant("danger");
      return; // Prevent further execution
    }

    console.log(response.data.data.id);
    const etudiantId = response.data.data.id;
        let inscriptionData = {
      etudiant_id: etudiantId,
      class_id: formik.values.class,
      negotiated_price: formik.values.negotiatedPrice,
    }
    if (formik.values.insurrance == true || formik.values.testLevel == true || formik.values.course == true){
    if (formik.values.course === true){
    try{
      response2 = await axios.post('/api/inscrire-classes',inscriptionData);
      console.log(response2);
    }catch (error) {
      console.log(error);
    }
    
    const inscriptionId = response2.data.id;
    const paymentData = {
      payment_amount: formik.values.courseFeesPaid,
      type: formik.values.methode,
    }
    try{
      response3 = await axios.post(`/api/inscrires/${inscriptionId}/register-payment`,paymentData);
    } catch (error) {
      console.log(error);
    }
  }
    
    if (formik.values.testLevel === true){
      let responseTestData = {
        test_id: 1,
        student_id: etudiantId,
      };
      let responseTest = [];
      try {
        responseTest = await axios.post('/api/register',responseTestData);
        console.log(responseTest);
      } catch (error) {
        console.log(error);
      }
      let registerId = responseTest.data.id;
      const paymentData = {
        amount : formik.values.testFeesPaid,
        register_id: registerId,
        payment_method: "cash",
    }
    let responseTestPayment = [];
    try{
      responseTestPayment = await axios.post('/api/testPayment',paymentData);
      console.log(responseTestPayment);
    } catch (error) {
      console.log(error);
    }
  }
  }
    setNotification("Student added successfully");
    setVariant("success");
    setTimeout(() => {
      setNotification("");
      setVariant("");
    }, 7000);
    navigate(`${x}/student`);
  }

  // calculate the total fees
  //+findCoursFees(formik.values.class) * (1-((formik.values.discount == 'custom' ? formik.values.customDiscount : formik.values.discount) /100))
  useEffect(() => {
    setTotal(0);
    if (formik.values.insurrance === true){
      setTotal((prev) => prev + 100);
    }
    if (formik.values.course === true){
      setTotal((prev) => prev + (+findCoursFees(formik.values.class)  * (1-((formik.values.discount == 'custom' ? formik.values.customDiscount : formik.values.discount) /100)) || prev));
    }
    if (formik.values.testLevel === true){
      setTotal((prev) => prev + +testPrice);
    }
    setTotal(
    (prev) => Math.round(prev,2)
    )
  },[formik.values.insurrance,formik.values.course,formik.values.testLevel,formik.values.class,formik.values.discount,formik.values.customDiscount]);
  useEffect(() => {
    let res = 0;
    if (formik.values.discount === 'custom'){
      res = formik.values.customDiscount;
    } else {
      res = formik.values.discount;
    }
    formik.setFieldValue('negotiatedPrice',Math.round(+findCoursFees(formik.values.class) - res * +findCoursFees(formik.values.class) / 100,2) || 0);
  },[total,formik.values.discount,formik.values.customDiscount]);

  useEffect (() => {
    let negotiatedPrice = formik.values.negotiatedPrice;
    let res = (Math.round(+findCoursFees(formik.values.class),2) - +negotiatedPrice)/(Math.round(+findCoursFees(formik.values.class),2)) * 100;
    switch (res) {
      case 10:
      case 20:
      case 30:
          formik.setFieldValue('discount',+res);
        break;
      default:
          formik.setFieldValue('discount','custom');
          formik.setFieldValue('customDiscount',+res);
        break;
    }
  },[formik.values.negotiatedPrice]);
  return (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className='mb-3'>
            <h3>Student</h3>
              <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1032"
              className='position-relative'
              >
              <Form.Label>First name <span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="first name"
                {...formik.getFieldProps('firstName')}
                isInvalid={formik.touched.firstName && formik.errors.firstName}
                />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.firstName}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1"
              className='position-relative'
              >
              <Form.Label>Last name <span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="last name"
                {...formik.getFieldProps('lastName')}
                isInvalid={formik.touched.lastName && formik.errors.lastName}
                />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.lastName}</Form.Control.Feedback>
            </Form.Group>
            
              <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Gender<span className='text-danger'>*</span></Form.Label>
              <Form.Select
              component="select"
              id="gender"
              name="gender"
              {...formik.getFieldProps('gender')}
              isInvalid={formik.touched.gender && formik.errors.gender}
              >
              <option value=''>choose Gender</option>
              <option value='female'>female</option>
              <option value='male'>male</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid" tooltip>{formik.errors.gender}</Form.Control.Feedback>
              </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12"
              className="position-relative">
            <Form.Label>Date of Birth<span className='text-danger'>*</span></Form.Label>
            <Form.Control
            type="date"
            name="dateofbirth"
            {...formik.getFieldProps('dateofBirth')}
            isInvalid={formik.touched.dateofBirth && formik.errors.dateofBirth}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const currentDate = new Date();
              const ageDifferenceInMilliseconds = currentDate - selectedDate;
              const ageDifferenceInYears = ageDifferenceInMilliseconds / (1000 * 3600 * 24 * 365);
              setUnderAge(ageDifferenceInYears < 18);
              formik.setFieldValue('dateofBirth', e.target.value);
            }}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.dateofBirth}
            </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>Country<span className='text-danger'>*</span></Form.Label>
        <Form.Select
        id='country'
          name="country"
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
            <option key={country.iso2} value={country.name}>
              {country.name}
            </option>
          ))}
        </Form.Select>
        {formik.touched.country && formik.errors.country && (
                      <div className='invalid-feedback'>{formik.errors.country}</div>
                    )}
      </Form.Group>

      {/* Région */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>State<span className='text-danger'>*</span></Form.Label>
        <Form.Select
          id='state'
          name="state"
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
            <option key={state.id} value={state.name}>
              {state.name}
            </option>
          ))}
        </Form.Select>
        {formik.touched.state && formik.errors.state && (
            <div className='invalid-feedback'>{formik.errors.state}</div>
          )}
      </Form.Group>

      {/* Ville */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>City<span className='text-danger'>*</span></Form.Label>
        {cities.length > 0 ? (
          <Form.Select
            name="city"
            {...formik.getFieldProps('city')}
            isInvalid={formik.touched.city && !!formik.errors.city}
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
            id='city'
            type="text"
            className={`form-control ${formik.errors.city && formik.touched.city ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('city')}
            disabled={!selectedState}
          />
        )}
         {formik.touched.city && formik.errors.city && (
            <div className='invalid-feedback'>{formik.errors.city}</div>
          )}
      </Form.Group>

      {/* Rue */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>Street<span className='text-danger'>*</span></Form.Label>
        <Form.Control
          id='street'
          type="text"
          placeholder="N° et nom de rue"
          className={`form-control ${formik.errors.street && formik.touched.street ? 'is-invalid' : ''}`}
          {...formik.getFieldProps('street')}
        />
        {formik.touched.street && formik.errors.street && (
            <div className='invalid-feedback'>{formik.errors.street}</div>
          )}
      </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12" 
              className="position-relative">
            <Form.Label>Email</Form.Label>
            <Form.Control
            type="email"
            placeholder="email"
            name="email"
            {...formik.getFieldProps('email')}
            isInvalid={formik.touched.email && formik.errors.email}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.email}
            </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12" 
              className="position-relative">
            <Form.Label>Phone</Form.Label>
            <Form.Control
            type="tel"
            placeholder="+(212) . . . . . . ."
            name="phone"
            {...formik.getFieldProps('phone')}
            isInvalid={formik.touched.phone && formik.errors.phone}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.phone}
            </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12" className="position-relative">
  <Form.Label>Emergency Contact <span className='text-danger'>*</span></Form.Label>
  <Form.Control
    type="tel"
    placeholder="+(212) ..."
    name="emergencyContact"
    {...formik.getFieldProps('emergencyContact')}
    isInvalid={formik.touched.emergencyContact && formik.errors.emergencyContact}
  />
  <Form.Control.Feedback type="invalid" tooltip>
    {formik.errors.emergencyContact}
  </Form.Control.Feedback>
</Form.Group>

            </Row>
           
          <Row className='mb-3'>
          <h3>Parents</h3>
          <Form.Group
            as={Col}
            md="3"
            sm="6"
            xs="12"
            controlId="validationFormik1032"
            className='position-relative'
          >
            <Form.Label>First name {underAge && <span className='text-danger'>*</span>}</Form.Label>
            <Form.Control
              type="text"
              name="guardfName"
              placeholder="first name"
              {...formik.getFieldProps('guardfName')}
              isInvalid={formik.touched.guardfName && formik.errors.guardfName}
              disabled={!underAge}
            />
            <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.guardfName}</Form.Control.Feedback>
          </Form.Group>
              <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1"
              className='position-relative'
              >
              <Form.Label>Last name<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type="text"
                name="guardLName"
                placeholder="last name"
                {...formik.getFieldProps('guardLName')}
                isInvalid={formik.touched.guardLName && formik.errors.guardLName}
                disabled={!underAge}
                />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.guardLName}</Form.Control.Feedback>
            </Form.Group>
              <Form.Group as={Col} md="3" sm="6" xs="12"
              className="position-relative">
                <Form.Label>Cin<span className='text-danger'>*</span></Form.Label>
                <Form.Control
                type="text"
                placeholder="cin"
                name="guardcin"
                {...formik.getFieldProps('guardCin')}
                isInvalid={formik.touched.guardCin && formik.errors.guardCin}
                disabled={!underAge}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                {formik.errors.guardCin}
                </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" sm="6" xs="12"
                className="position-relative">
                  <Form.Label>Gender<span className='text-danger'>*</span></Form.Label>
                  <Form.Select
                  component="select"
                  id="guardGender"
                  name="guardGender"
                  {...formik.getFieldProps('guardGender')}
                  isInvalid={formik.touched.guardGender && formik.errors.guardGender}
                  disabled={!underAge}
                  >
                    <option value=''>Choose Gender</option>
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid" tooltip>
                  {formik.errors.guardGender}
                  </Form.Control.Feedback>
                </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12" 
              className="position-relative">
            <Form.Label>Email</Form.Label>
            <Form.Control
            type="email"
            placeholder="email"
            name="guardemail"
            {...formik.getFieldProps('guardEmail')}
            isInvalid={formik.touched.guardEmail && formik.errors.guardEmail}
            disabled={!underAge}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.guardEmail}
            </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="3" sm="6" xs="12" 
              className="position-relative">
            <Form.Label>Phone</Form.Label>
            <Form.Control
            type="tel"
            placeholder="+(212) . . . . . . . . ."
            name="guardphone"
            {...formik.getFieldProps('guardPhone')}
            isInvalid={formik.touched.guardPhone && formik.errors.guardPhone}
            disabled={!underAge}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.guardPhone}
            </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>Country<span className='text-danger'>*</span></Form.Label>
        <Form.Select
        id='country'
          name="country"
          className={`form-select ${formik.errors.country && formik.touched.country ? 'is-invalid' : ''}`}
          disabled
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
            <option key={country.iso2} value={country.name}>
              {country.name}
            </option>
          ))}
          
        </Form.Select>
        {formik.touched.country && formik.errors.country && (
                      <div className='invalid-feedback'>{formik.errors.country}</div>
                    )}
      </Form.Group>

      {/* Région */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>State<span className='text-danger'>*</span></Form.Label>
        <Form.Select
          id='state'
          name="state"
          className={`form-select ${formik.errors.state && formik.touched.state ? 'is-invalid' : ''}`}
          {...formik.getFieldProps('state')}
          onChange={(e) => {
            const state = states.find(s => s.name === e.target.value);
            setSelectedState(state);
            formik.setFieldValue('city', '');
            formik.setFieldValue('state', e.target.value);
          }}
          disabled
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.id} value={state.name}>
              {state.name}
            </option>
          ))}
        </Form.Select>
        {formik.touched.state && formik.errors.state && (
            <div className='invalid-feedback'>{formik.errors.state}</div>
          )}
      </Form.Group>

      {/* Ville */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>City<span className='text-danger'>*</span></Form.Label>
        {cities.length > 0 ? (
          <Form.Select
            name="city"
            {...formik.getFieldProps('city')}
            isInvalid={formik.touched.city && !!formik.errors.city}
            disabled
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
            id='city'
            type="text"
            className={`form-control ${formik.errors.city && formik.touched.city ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('city')}
            disabled
          />
        )}
         {formik.touched.city && formik.errors.city && (
            <div className='invalid-feedback'>{formik.errors.city}</div>
          )}
      </Form.Group>

      {/* Rue */}
      <Form.Group as={Col} md="3" className="position-relative">
        <Form.Label>Street<span className='text-danger'>*</span></Form.Label>
        <Form.Control
          id='street'
          type="text"
          placeholder="N° et nom de rue"
          className={`form-control ${formik.errors.street && formik.touched.street ? 'is-invalid' : ''}`}
          disabled
          {...formik.getFieldProps('street')}
        />
        {formik.touched.street && formik.errors.street && (
            <div className='invalid-feedback'>{formik.errors.street}</div>
          )}
      </Form.Group>
                <Form.Group as={Col} md="3" sm="6" xs="12"
                className="position-relative">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                type="date"
                placeholder="date of birth"
                name="guarddob"
                {...formik.getFieldProps('guardBirthDate')}
                isInvalid={formik.touched.guardBirthDate && formik.errors.guardBirthDate}
                disabled={!underAge}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                {formik.errors.guardBirthDate}
                </Form.Control.Feedback>
                </Form.Group>
          </Row>
        :
        <>
        </>
        
        
        <Row className='mb-3'>
        <Form.Group
              as={Col}
              className="position-relative col-11 my-3"
              >
              <Form.Label className='h3' >Payment options</Form.Label>
              <div className='d-flex'>
            <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              label="Test"
              {...formik.getFieldProps('testLevel')}
              className={`me-3 fs-4 ${formik.values.testLevel === true ? "text-warning" : ''}`}
              />
            <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              label="Insurance"
              {...formik.getFieldProps('insurrance')}
              className={`me-3 fs-4 ${formik.values.insurrance === true ? "text-success" : ''}`}
              />
            
              <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              label="Course"
              {...formik.getFieldProps('course')}
              className={`me-3 fs-4 ${formik.values.course === true ? "text-info" : ''}`}
              />
              </div>
              </Form.Group>
            {
              formik.values.testLevel === true ?
              <>
              <h3>Placement test</h3>
              <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Test Fees</Form.Label>
              <Form.Control
              type="number"
              placeholder="test fees"
              name="testfees"
              value={testPrice || 0}
              disabled
              isInvalid={formik.touched.testFees && formik.errors.testFees}
              />
              <Form.Control.Feedback type="invalid" tooltip>
              {formik.errors.testFees}
              </Form.Control.Feedback>
              </Form.Group>
              </>
              :
              <>
              </>
            }
            {
                formik.values.testLevel === true ?
                <>
                <Row>
            <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1"
              className='position-relative'
              >
              <Form.Label>Fees Paid</Form.Label>
              <Form.Control
                type="text"
                name="testfeespaid"
                placeholder="Test fees paid"
                {...formik.getFieldProps('testFeesPaid')}
                isInvalid={formik.touched.testFeesPaid && formik.errors.testFeesPaid}
                />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.testFeesPaid}</Form.Control.Feedback>
          </Form.Group>
        </Row>
                </>
                :
                <>
                </>
              }
            {
              formik.values.course === true ?
              <>
                <h3>Course</h3>
        <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Class Name<span className='text-danger'>*</span></Form.Label>
              <Form.Select
              component="select"
              id="class"
              name="class"
              {...formik.getFieldProps('class')}
              isInvalid={formik.touched.class && formik.errors.class}
              >
              <option value=''>choose Class</option>
                {classData.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.name + " (" +classe.cours.title + ")"}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" tooltip>{formik.errors.class}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Course Fees</Form.Label>
              <Form.Control
              type="text"
              name="courseFees"
              value={findCoursFees(formik.values.class)}
              readOnly
              disabled
              />
                </Form.Group>
              </>
              :
              <>
              </>
            }
              </Row>
              {
                formik.values.course === true ?
                <>
                      <Row>
  <Form.Group as={Col} md="3" sm="6" xs="12" controlId="validationFormik1" className='position-relative'>
  <Form.Label>Discount</Form.Label>
  <InputGroup>
    <Form.Select
      name="discount"
      {...formik.getFieldProps('discount')}
      isInvalid={formik.touched.discount && formik.errors.discount}
    >
      <option value="">Select Discount</option>
      <option value="10">10%</option>
      <option value="20">20%</option>
      <option value="30">30%</option>
      <option value="custom">Custom</option>
    </Form.Select>
    {formik.values.discount === 'custom' && (
      <Form.Control
        type="number"
        name="customDiscount"
        placeholder="Enter custom discount"
        {...formik.getFieldProps('customDiscount')}
        isInvalid={formik.touched.customDiscount && formik.errors.customDiscount}
      />
      )}
      <InputGroup.Text id="basic-addon1">%</InputGroup.Text>
    <Form.Control.Feedback className='' type="invalid" tooltip>
      {formik.values.discount === 'custom' ? formik.errors.customDiscount : formik.errors.discount}
    </Form.Control.Feedback>
  </InputGroup>
</Form.Group>
              <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Negotiated Price</Form.Label>
              <Form.Control
              type="text"
              name="negotiatedPrice"
              placeholder="negotiated Price Paid"
                {...formik.getFieldProps('negotiatedPrice')}
                isInvalid={formik.touched.negotiatedPrice && formik.errors.negotiatedPrice}
              />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.negotiatedPrice}</Form.Control.Feedback>
          </Form.Group>
            <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1"
              className='position-relative'
              >
              <Form.Label>Fees Paid</Form.Label>
              <Form.Control
                type="text"
                name="courseFeesPaid"
                placeholder="courseFeesPaid"
                {...formik.getFieldProps('courseFeesPaid')}
                isInvalid={formik.touched.courseFeesPaid && formik.errors.courseFeesPaid}
                />
              <Form.Control.Feedback className='' type="invalid" tooltip>{formik.errors.courseFeesPaid}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group
              as={Col}
              md={3}
              sm={6}
              xs={7}
              className="position-relative"
              >
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
              component="select"
              id="methode"
              name="methode"
              {...formik.getFieldProps('methode')}
              isInvalid={formik.touched.methode && formik.errors.methode}
              >
              <option value='cash'>cash</option>
              <option value='check'>check</option>
              <option value='bank'>bank</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid" tooltip>{formik.errors.methode}</Form.Control.Feedback>
              </Form.Group>
        </Row>
                </>
                : 
                <>
                </>
              }
            <Form.Group
              as={Col}
              md="3"
              sm="6"
              xs="12"
              controlId="validationFormik1"
              className='position-relative'
              >
              <Form.Label>Total</Form.Label>
              <Form.Control
                type="text"
                name="total"
                placeholder="total"
                value={total}
                disabled
                />
          </Form.Group>
        <Row className='mb-3'>
        </Row>
          <Button type="submit" onClick={()=>console.log("hi")}>Submit form</Button>
        </Form>
  );
}
export default FormC;