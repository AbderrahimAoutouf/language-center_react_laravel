import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import imgStudent from "../../images/student.png";
import { Image, Button, Card, Container, Row, Col, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaIdCard, 
        FaChalkboardTeacher, FaUserFriends, FaHistory, FaUserEdit } from 'react-icons/fa';
import PModal from '../PaymentClasses_Modal';

export default function StudentsDetails() {
    const [studentData, setStudentData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setNotification, setVariant } = UseStateContext();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`/api/etudiants/${id}?populate=*`);
                const data = response.data.data;
                setStudentData({
                    id: data.id,
                    nom: data.nom,
                    prenom: data.prenom,
                    email: data.email,
                    telephone: data.telephone,
                    dateNaissance: data.date_naissance,
                    gender: data.sexe,
                    classes: data.classes || [],
                    parent: {
                        name: data.parent?.prenom + ' ' + data.parent?.nom,
                        email: data.parent?.email,
                        phone: data.parent?.telephone,
                        address: data.parent?.adresse,
                        dateNaissance: data.parent?.date_naissance,
                        gender: data.parent?.sexe,
                        occupation: data.parent?.occupation || 'N/A'
                    }
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching student data:", err);
                setNotification("Failed to load student data");
                setVariant("danger");
                setLoading(false);
            }
            
        };
        fetchStudentData();
    }, [id]);

    const handleEditClick = () => {
        navigate(`/student/edit/${id}`);
    };

    const handleRefreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/etudiants/${id}?populate=*`);
            const data = response.data.data;
            setStudentData({
                ...studentData,
                classes: data.classes || []
            });
            setNotification("Student data refreshed successfully");
            setVariant("success");
        } catch (err) {
            console.error("Error refreshing student data:", err);
            setNotification("Failed to refresh student data");
            setVariant("danger");
        }
        setTimeout(() => {
            setNotification(null);
          }, 3000);
        setLoading(false);
    };

    const handleClassClick = (classItem) => {
        setSelectedClass(classItem);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedClass(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading student data...</span>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="py-5"
        >
            <Container>
                <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
                    <Card.Header className="bg-primary text-white p-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="m-0">Student Profile</h4>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="light" 
                                    className="d-flex align-items-center" 
                                    onClick={handleRefreshData}
                                >
                                    <FaHistory className="me-2" />
                                    Refresh
                                </Button>
                                <Button 
                                    variant="light" 
                                    className="d-flex align-items-center" 
                                    onClick={handleEditClick}
                                >
                                    <FaUserEdit className="me-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Body className="p-4">
                        <Row>
                            <Col lg={4} className="mb-4 mb-lg-0">
                                <motion.div 
                                    className="text-center" 
                                    variants={itemVariants}
                                >
                                    <div className="position-relative d-inline-block">
                                        <div className="rounded-circle overflow-hidden border border-4 border-primary p-1 mb-3 mx-auto">
                                            <Image 
                                                width="200px"
                                                height="200px"
                                                src={imgStudent} 
                                                className="img-fluid"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    </div>

                                    <h4 className="mb-1">{studentData.prenom} {studentData.nom}</h4>
                                    <h6 className="text-muted mb-3">
                                        <FaUser className="me-2" />
                                        Student ID: {studentData.id}
                                    </h6>

                                    <Card className="bg-light border-0 mb-4">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3 small">Contact Information</h6>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaEnvelope className="text-primary me-3" />
                                                <div>{studentData.email || 'N/A'}</div>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaPhone className="text-primary me-3" />
                                                <div>{studentData.telephone || 'N/A'}</div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <FaBirthdayCake className="text-primary me-3" />
                                                <div>{studentData.dateNaissance || 'N/A'}</div>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    {studentData.parent && (
                                        <Card className="bg-light border-0">
                                            <Card.Body>
                                                <h6 className="text-uppercase text-muted mb-3 small">Parent Information</h6>
                                                <div className="d-flex align-items-center mb-2">
                                                    <FaUserFriends className="text-primary me-3" />
                                                    <div>{studentData.parent.name || 'N/A'}</div>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <FaEnvelope className="text-primary me-3" />
                                                    <div>{studentData.parent.email || 'N/A'}</div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <FaPhone className="text-primary me-3" />
                                                    <div>{studentData.parent.phone || 'N/A'}</div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </motion.div>
                            </Col>

                            <Col lg={8}>
                                <h5 className="border-bottom pb-2 mb-4">Personal Information</h5>
                                
                                <Row className="g-4">
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaIdCard />}
                                                label="Student ID"
                                                value={studentData.id}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="Gender"
                                                value={studentData.gender?.charAt(0).toUpperCase() + studentData.gender?.slice(1)}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="First Name"
                                                value={studentData.prenom}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="Last Name"
                                                value={studentData.nom}
                                            />
                                        </motion.div>
                                    </Col>
                                </Row>

                                <h5 className="border-bottom pb-2 mb-4 mt-4">Academic Information</h5>
                                
                                <motion.div 
                                    className="mt-4"
                                    variants={itemVariants}
                                >
                                    <Card className="border-0 shadow-sm">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3 small">Enrolled Classes</h6>
                                            {studentData.classes.length > 0 ? (
                                                <ListGroup>
                                                    {studentData.classes.map((cls, index) => (
                                                        <ListGroup.Item 
                                                            key={index}
                                                            action 
                                                            onClick={() => handleClassClick(cls)}
                                                            className="d-flex align-items-center"
                                                        >
                                                            <FaChalkboardTeacher className="text-primary me-3" />
                                                            {cls.name}
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <div className="text-center text-muted py-3">
                                                    No enrolled classes
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            <PModal 
                showModal={showModal} 
                handleClose={handleCloseModal} 
                selectedItem={selectedClass?.id} 
                studentId={id} 
            />
        </motion.div>
    );
}

const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        <label className="text-muted d-flex align-items-center">
            {icon && <span className="text-primary me-2">{icon}</span>}
            {label}
        </label>
        <div className="mt-1 p-2 bg-light rounded">
            {value || 'N/A'}
        </div>
    </div>
);