import React, { useState, useEffect } from 'react';
import { Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';
import { useParams } from 'react-router-dom';
import { Ellipsis } from 'react-awesome-spinners';
import { SketchPicker } from 'react-color';
import AddCourse from '../Composantsforcoursepage/AddCourse'; // adapte le chemin selon ton projet
import AddLevel from '../LevelComponents/add';

const AddGroup = () => {
  const [selectedColor, setSelectedColor] = useState('#265985');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [coursData, setCourseData] = useState([]);
  const { user, setNotification, setVariant } = UseStateContext();
  const [teacherData, setTeacherDate] = useState([]);
  const navigate = useNavigate();
  
  // État pour gérer l'affichage du modal AddCourse
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  // État pour gérer l'affichage du modal AddLevel
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);

  let x = '';
  if (user && user.role === 'admin') {
    x = '';
  } else if (user && user.role === 'director') {
    x = '/director';
  } else {
    x = '/secretary';
  }
  
  const formik = useFormik({
    initialValues: {
      groupName: '',
      course: '',
      level: '',
      school_year: '',
      start_date: '',
      end_date: '',
      description: '',
      teacher: '',
    },
    validationSchema: Yup.object({
      groupName: Yup.string().required('Group name is required'),
      course: Yup.string().required('Course is required'),
      level: Yup.string().required('Level is required'),
      school_year: Yup.string().required('School year is required'),
      start_date: Yup.string().required('Start date is required'),
      end_date: Yup.string().required('End date is required'),
      description: Yup.string(),
      teacher: Yup.string().required('Teacher is required'),
    })
  });

  // Fonction pour ouvrir/fermer le modal AddCourse
  const handleAddCourseModalOpen = () => setShowAddCourseModal(true);
  const handleAddCourseModalClose = () => setShowAddCourseModal(false);

  // Fonction pour ouvrir/fermer le modal AddLevel
  const handleAddLevelModalOpen = () => setShowAddLevelModal(true);
  const handleAddLevelModalClose = () => setShowAddLevelModal(false);

  // Fonction pour gérer l'ajout d'un nouveau cours
  const handleNewCourseAdded = (newCourse) => {
    // Ajouter le nouveau cours à la liste des cours
    setCourseData([...coursData, newCourse]);
    
    // Sélectionner automatiquement le nouveau cours
    formik.setFieldValue('course', newCourse.id);
    setSelectedCourse(newCourse.id);
    
    // Fermer le modal
    handleAddCourseModalClose();
    
    // Notification
    setNotification('Course added successfully');
    setVariant('success');
    setTimeout(() => {
      setNotification('');
      setVariant('');
    }, 3000);
  };

  // Fonction pour gérer l'ajout d'un nouveau niveau
  const handleNewLevelAdded = (newLevel) => {
    // Ajouter le nouveau niveau à la liste des niveaux
    setLevels([...levels, newLevel]);
    
    // Sélectionner automatiquement le nouveau niveau
    formik.setFieldValue('level', newLevel.name);
    setSelectedLevel(newLevel.name);
    
    // Fermer le modal
    handleAddLevelModalClose();
    
    // Notification
    setNotification('Level added successfully');
    setVariant('success');
    setTimeout(() => {
      setNotification('');
      setVariant('');
    }, 3000);
  };

  // Fetch available courses from the database
  useEffect(() => {
    axios.get('/api/cours').then((res) => {
      setCourseData(res.data);
    });
  }, []);
  
  //fetch levels from api
  const [levels, setLevels] = useState([]);
  useEffect(() => {
    axios.get('/api/levels').then((res) => {
      setLevels(res.data);
    });
  }, []);

  //get teacher data from api
  useEffect(() => {
    axios.get('/api/teachers').then((res) => {
      setTeacherDate(
        res.data.data.map((teacher) => {
          return {
            id: teacher.id,
            name: teacher.first_name + ' ' + teacher.last_name,
          };
        })
      );
    });
  }, []);

  const [courseName, setCourseName] = useState("");
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setCourseName(
      coursData.find(
        item => item.id == e.target.value
      )
    );
  };

  const handleLevelChange = (e) => {
    const levelId = e.target.value;
    setSelectedLevel(levelId);
  };

  useEffect(() => {
    formik.setFieldValue('groupName',
      (courseName?.title || "") + (selectedLevel ? " " : "") + (selectedLevel || "")
    );
  }, [selectedCourse, selectedLevel, courseName]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Handle form submission and add group
    const sendData = {
      name: formik.values.groupName,
      cours_id: formik.values.course,
      school_year: formik.values.school_year,
      start_date: formik.values.start_date,
      end_date: formik.values.end_date,
      description: formik.values.description,
      level: formik.values.level,
      teacher_id: formik.values.teacher,
      event_color: selectedColor,
    };
    axios.post('/api/classes', sendData).then((res) => {
      console.log(res.data);
      setNotification('Class added successfully');
      setVariant('success');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      navigate(`${x}/class`);
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="addGroup">
        <h1>Add Class</h1>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="course">Course<span className='text-danger'>*</span></Form.Label>
            <Form.Select
              id='course'
              {...formik.getFieldProps('course')}
              value={formik.values.course}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'add-new-course') {
                  // Au lieu de rediriger, ouvrir le modal AddCourse
                  handleAddCourseModalOpen();
                  formik.setFieldValue('course', ''); // Réinitialise le champ dans Formik
                } else {
                  formik.setFieldValue('course', selectedValue);
                  handleCourseChange && handleCourseChange(e); // Appelle ton handler si défini
                }
              }}
              isInvalid={formik.touched.course && formik.errors.course}
            >
              <option value=''>Select course</option>
              {coursData.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
              <option value="add-new-course" style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                ＋ Add New Course...
              </option>
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {formik.errors.course}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className='mb-3'>
            <Form.Label htmlFor='level'>
              Level<span className='text-danger'>*</span>
            </Form.Label>
            <Form.Select
              id='level'
              {...formik.getFieldProps('level')}
              value={selectedLevel}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'add-new-level') {
                  // Ouvrir le modal AddLevel
                  handleAddLevelModalOpen();
                  formik.setFieldValue('level', ''); // Réinitialise le champ dans Formik
                } else {
                  handleLevelChange(e);
                  formik.handleChange(e);
                }
              }}
              isInvalid={formik.touched.level && formik.errors.level}
              disabled={!selectedCourse}
            >
              <option value=''>Select level</option>
              {levels.map((level) => (
                <option key={level.id} value={level.name}>
                  {level.name}
                </option>
              ))}
              <option value="add-new-level" style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                ＋ Add New Level...
              </option>
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {formik.errors.level}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="groupName">Class Name<span className='text-danger'>*</span></Form.Label>
            <Form.Control
              id="groupName"
              type="text"
              {...formik.getFieldProps('groupName')}
              isInvalid={formik.touched.groupName && formik.errors.groupName}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.groupName}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="school_year">School Year<span className='text-danger'>*</span></Form.Label>
            <Form.Control
              id='school_year'
              type='text'
              {...formik.getFieldProps('school_year')}
              isInvalid={
                formik.touched.school_year && formik.errors.school_year
              }
            />
            <Form.Control.Feedback type='invalid'>
              {formik.errors.school_year}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className='mb-3'>
            <Form.Label htmlFor='start_date'>
              Start Date<span className='text-danger'>*</span>
            </Form.Label>
            <Form.Control
              id='start_date'
              type='date'
              {...formik.getFieldProps('start_date')}
              isInvalid={
                formik.touched.start_date && formik.errors.start_date
              }
            />
            <Form.Control.Feedback type='invalid'>
              {formik.errors.start_date}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className='mb-3'>
            <Form.Label htmlFor='end_date'>
              End Date<span className='text-danger'>*</span>
            </Form.Label>
            <Form.Control
              id='end_date'
              type='date'
              {...formik.getFieldProps('end_date')}
              isInvalid={formik.touched.end_date && formik.errors.end_date}
            />
            <Form.Control.Feedback type='invalid'>
              {formik.errors.end_date}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className='mb-3'>
            <Form.Label htmlFor='description'>Description</Form.Label>
            <Form.Control
              id='description'
              type='text'
              {...formik.getFieldProps('description')}
              isInvalid={
                formik.touched.description && formik.errors.description
              }
            />
            <Form.Control.Feedback type='invalid'>
              {formik.errors.description}
            </Form.Control.Feedback>
          </Col>
          <Col md={6} className='mb-3'>
            <Form.Label htmlFor='teacher'>
              Teacher<span className='text-danger'>*</span>
            </Form.Label>
            <Form.Select
              id='teacher'
              {...formik.getFieldProps('teacher')}
              isInvalid={formik.touched.teacher && formik.errors.teacher}
            >
              <option value=''>Select teacher</option>
              {teacherData.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {formik.errors.teacher}
            </Form.Control.Feedback>
          </Col>
        </Row>
        <Col className='w-25 d-flex flex-column align-items-center'>
          <div
            style={{
              backgroundColor: selectedColor,
              width: '200px',
              height: '80px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h5 style={{ color: 'white', height: '20px' }}>Class Color</h5>
          </div>
          <div>
            <SketchPicker
              color={selectedColor}
              onChange={(color) => setSelectedColor(color.hex)}
            />
          </div>
        </Col>
        <Button type='submit' variant='primary' className='mt-3'>
          Add Class
        </Button>
      </Form>

      {/* Modal pour le composant AddCourse */}
      <Modal show={showAddCourseModal} onHide={handleAddCourseModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddCourse 
            inModal={true} 
            onCourseAdded={handleNewCourseAdded}
            handleClose={handleAddCourseModalClose}
          />
        </Modal.Body>
      </Modal>

      {/* Modal pour le composant AddLevel */}
      <Modal show={showAddLevelModal} onHide={handleAddLevelModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Level</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddLevel 
            inModal={true} 
            onLevelAdded={handleNewLevelAdded}
            handleClose={handleAddLevelModalClose}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddGroup;