import { useFormik } from 'formik';
import { useState,useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import * as yup from 'yup';
import axios from '../../api/axios';
import {useNavigate} from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { useParams } from 'react-router-dom';
import countriesData from '../../data/countries+states+cities.json';


export default function EditEtudiant() {
    const navigate = useNavigate();
    const {id} = useParams();
    const {user,setNotification,setVariant} = UseStateContext();
    const [customDiploma, setCustomDiploma] = useState("");
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

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
  const [classData, setClassData] = useState([]);
    // Fetch available courses and levels from the database
  // Replace this with your actual API call to fetch data
  useEffect(() => {
    axios.get('/api/classes').then((res) => {
      setClassData(res.data);
    });

  }, []);
  const formik = useFormik({
        initialValues:{
        firstName: ``,
        lastName: ``,
        class: ``,
        gender: ``,
        country: '',
        state: '',
        city: '',
        street: '',
        dateofBirth: ``,
        active: false,
        email: ``,
        phone: ``,
        underAge: '',
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
      gender: yup.string().oneOf(['female','male']).required('required'),
      country: yup.string().required('Country is required'),
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      street: yup.string().required('Street is required'),
      dateofBirth: yup.date().required('required'),
      email: yup.string().email('Invalid email').required("required"),
      phone: yup.string().min(9,'to short to be a valid phone number').required('required'),
  }),
  onSubmit: (values) => {
    console.log("wewe are here");

}
});
  const [underAge,setUnderAge] = useState(false);
  const handleSubmit = async(e) => {
    e.preventDefault();
    let response = [];
        const etudiantData = {
      prenom: formik.values.firstName,
      nom: formik.values.lastName,
      date_naissance: formik.values.dateofBirth,
      sexe: formik.values.gender,
      email: formik.values.email,
      telephone: formik.values.phone,
      adresse: `${formik.values.street}, ${formik.values.city}, ${formik.values.state}, ${formik.values.country}`,
      underAge: false,
    }
    try{

      response = await axios.put(`/api/etudiants/${id}`,etudiantData);
    } catch (error) {
      console.log(error);
    }
    setNotification("Student updated successfully");
    setVariant("success");
    setTimeout(() => {
      setNotification("");
      setVariant("");
    }, 3000);
    navigate(`${x}/student`);
  }
  useEffect(() => {
    axios.get(`/api/etudiants/${id}`).then((res) => {
      const addressParts = res.data.data.address?.split(',').map(part => part.trim()) || [];
      const [street, city, state, country] = addressParts;
      formik.setValues(
        {
          firstName: res.data.data.prenom,
          lastName: res.data.data.nom,
          dateofBirth: res.data.data.date_naissance,
          gender: res.data.data.sexe,
          email: res.data.data.email,
          phone: res.data.data.telephone,
          country: country || '',
        state: state || '',
        city: city || '',
        street: street || '',
        }
      )
    });
  }, []);
  return (
    <div className="student-add">
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
              <Form.Label>First name *</Form.Label>
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
              <Form.Label>Last name *</Form.Label>
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
              <Form.Label>Gender*</Form.Label>
              <Form.Select
              component="select"
              id="gender"
              name="gender"
              {...formik.getFieldProps('gender')}
              isInvalid={formik.touched.gender && formik.errors.gender}
              >
              <option value=''>Chose Gender</option>
              <option value='female'>female</option>
              <option value='male'>male</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid" tooltip>{formik.errors.gender}</Form.Control.Feedback>
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
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
            type="date"
            name="dateofbirth"
            {...formik.getFieldProps('dateofBirth')}
            isInvalid={formik.touched.dateofBirth && formik.errors.dateofBirth}
            />
            <Form.Control.Feedback type="invalid" tooltip>
            {formik.errors.dateofBirth}
            </Form.Control.Feedback>
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
          </Row>
        <Button type="submit" onClick={()=>console.log("hi")}>Submit form</Button>
        </Form>
    </div>
  )
}
