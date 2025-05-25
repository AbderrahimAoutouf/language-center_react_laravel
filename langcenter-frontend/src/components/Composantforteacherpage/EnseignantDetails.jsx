import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import imgTeacher from "../../images/teacher.png";
import { Image, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserEdit, FaGraduationCap, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, 
        FaBirthdayCake, FaCalendarCheck, FaBook, FaDollarSign, FaChalkboardTeacher,
        FaCheckCircle, FaTimesCircle, FaCircle, FaHistory } from 'react-icons/fa';
import { MdToggleOn, MdToggleOff } from 'react-icons/md';

export default function EnseignantDetails() {
    const [teacherData, setTeacherData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showStatusDetails, setShowStatusDetails] = useState(false);
    const [statusHistory, setStatusHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setNotification, setVariant } = UseStateContext();
    
    // Determine the route prefix based on user role
    let routePrefix = "";
    if (user && user.role === 'admin') {
        routePrefix = "";
    } else if (user && user.role === 'director') {
        routePrefix = "/director";
    } else {
        routePrefix = "/secretary";
    }

    useEffect(() => {
        // Fetch teacher data
        fetchTeacherData();
    }, [id]);
    
    const fetchTeacherData = () => {
        setLoading(true);
        axios.get(`/api/teachers/${id}?populate=*`)
            .then((res) => {
                const data = res.data.data;
                setTeacherData({
                    id: data.id,
                    nom: data.last_name,
                    prenom: data.first_name,
                    name: `${data.first_name} ${data.last_name}`,
                    gender: data.gender,
                    classes: data.classes || [],
                    classNames: data.classes?.length ? data.classes.map(c => c.name) : [],
                    classDisplay: data.classes?.length ? data.classes.map(c => c.name).join(', ') : 'No class',
                    subject: data.speciality,
                    active: data.active ?? false,
                    status: data.active ? "active" : "inactive",
                    phone: data.phone,
                    birthday: data.birthday,
                    email: data.email,
                    address: data.address,
                    date_admission: data.hiredate,
                    degree: data.diploma,
                    cin: data.cin,
                    contract_type: data.contract_type,
                    hourly_rate: data.hourly_rate,
                    monthly_salary: data.monthly_salary,
                    created_at: data.created_at,
                    avatar: data.avatar || null,
                    updated_at: data.updated_at,
                    status_history: data.status_history || []
                });
                setLoading(false);
                fetchStatusHistory(data.status_history);
            })
            .catch((err) => {
                console.error("Error fetching teacher data:", err);
                setNotification && setNotification("Failed to load teacher data");
                setVariant && setVariant("danger");
                setLoading(false);
                setTimeout(() => {
                    setNotification('');
                    setVariant('');
                  }, 3000);
            });
    };
    
    const fetchStatusHistory = (history) => {
        setHistoryLoading(true);
        setHistoryError(null);
      
        try {
          // Parse the JSON status_history from teacherData
          const rawHistory = history || [];
          const formattedHistory = rawHistory
            .map(item => ({
              date: new Date(item.timestamp).toLocaleDateString(),
              status: item.status,
              notes: item.notes || 'No notes available',
              updated_by: item.updated_by || 'System'
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
      
          setStatusHistory(formattedHistory);
        } catch (err) {
          console.error("Failed to parse status history:", err);
          setHistoryError("Could not load complete status history");
          
          // Fallback to created_at/updated_at
          const fallback = [];
          if (teacherData.created_at) {
            fallback.push({
              date: new Date(teacherData.created_at).toLocaleDateString(),
              status: 'active',
              notes: 'Initial account creation',
              updated_by: 'System'
            });
          }
          if (teacherData.updated_at) {
            fallback.push({
              date: new Date(teacherData.updated_at).toLocaleDateString(),
              status: teacherData.status,
              notes: 'Last system update',
              updated_by: 'System'
            });
          }
          setStatusHistory(fallback);
        } finally {
          setHistoryLoading(false);
        }
    };

    const handleEditClick = () => {
        navigate(`${routePrefix}/teacher/edit/${id}`);
    };
    
    const handleToggleActive = async () => {
        try {
            const res = await axios.patch(`/api/teachers/${id}/toggle-active`);
            const updatedStatus = res.data?.data?.active;
            
            setTeacherData(prev => ({
                ...prev,
                active: updatedStatus,
                status: updatedStatus ? "active" : "inactive"
            }));
            
            setNotification && setNotification(`Teacher status ${updatedStatus ? 'activated' : 'deactivated'}`);
            setVariant && setVariant(updatedStatus ? "success" : "warning");
            
            // Refresh status history
            fetchTeacherData();
        } catch (error) {
            console.error("Status toggle error:", error);
            setNotification && setNotification("Failed to update status");
            setVariant && setVariant("danger");
            setTimeout(() => {
                setNotification('');
                setVariant('');
              }, 3000);
        }
    };
    
    const handleRefreshData = () => {
        fetchTeacherData();
        setNotification && setNotification("Teacher data refreshed successfully");
        setVariant && setVariant("success");
        
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading teacher data...</span>
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

    // Get status details
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'danger';
            case 'on leave':
                return 'warning';
            case 'suspended':
                return 'secondary';
            default:
                return 'info';
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'active':
                return <FaCheckCircle />;
            case 'inactive':
                return <FaTimesCircle />;
            default:
                return <FaCircle />;
        }
    };

    const statusColor = getStatusColor(teacherData.status);
    const statusIcon = getStatusIcon(teacherData.status);
    
    // Get most recent status change for the tooltip
    const latestStatusChange = statusHistory.length > 0 ? statusHistory[0] : {
        date: teacherData.updated_at ? new Date(teacherData.updated_at).toLocaleDateString() : "N/A",
        updated_by: "System",
        notes: "No status information available"
    };
    
    // Format payment information
    const paymentInfo = teacherData.contract_type === 'monthly' 
        ? `${teacherData.monthly_salary} DH (Monthly)`
        : `${teacherData.hourly_rate} DH/hour`;

    // Class badge with animation
    const ClassBadge = ({ className }) => (
        <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="badge bg-info me-1 mb-1"
            style={{ fontSize: '0.85rem', fontWeight: 'normal' }}
        >
            {className}
        </motion.span>
    );

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
                            <h4 className="m-0">Teacher Profile</h4>
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
                                                src={teacherData.avatar || imgTeacher} 
                                                className="img-fluid"
                                                style={{ objectFit: "cover" }}
                                                onError={(e) => {
                                                    // Fallback to default image if the avatar URL fails to load
                                                    e.target.src = imgTeacher;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <h4 className="mb-1">{teacherData.prenom} {teacherData.nom}</h4>
                                    <h6 className="text-muted mb-3">
                                        <FaGraduationCap className="me-2" />
                                        {teacherData.subject || 'No Specialty'}
                                    </h6>

                                    {/* Status Toggle Button (consistent with TableTeacher) */}
                                    <motion.div 
                                        className="mb-4"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            whileHover={{ scale: 1.05 }}
                                            onClick={handleToggleActive}
                                            className="btn btn-light d-flex align-items-center gap-2 mx-auto"
                                            style={{
                                                border: teacherData.active ? '1px solid green' : '1px solid gray',
                                                borderRadius: '20px',
                                                backgroundColor: teacherData.active ? '#e9fbe9' : '#f0f0f0',
                                                padding: '0.5rem 1rem',
                                            }}
                                        >
                                            {teacherData.active 
                                                ? <MdToggleOn color="green" size={22} /> 
                                                : <MdToggleOff color="gray" size={22} />
                                            }
                                            <span style={{ fontWeight: '500', color: teacherData.active ? 'green' : 'gray' }}>
                                                {teacherData.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </motion.button>
                                        
                                        <div 
                                            className="status-container position-relative mt-3"
                                            onMouseEnter={() => setShowStatusDetails(true)}
                                            onMouseLeave={() => setShowStatusDetails(false)}
                                        >
                                            <div className="text-center">
                                                <small className="text-muted">Last status change: {latestStatusChange.date}</small>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {showStatusDetails && (
                                                    <motion.div 
                                                        className="status-details position-absolute start-50 translate-middle-x mt-2 p-3 bg-white rounded shadow-sm border"
                                                        style={{ width: "200px", zIndex: 100 }}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <h6 className="fw-bold mb-2">Status Information</h6>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <small className="text-muted">Updated by:</small>
                                                            <small>{latestStatusChange.updated_by}</small>
                                                        </div>
                                                        <div className="border-top pt-2 mt-2">
                                                            <small className="text-muted d-block">Notes:</small>
                                                            <small className="fst-italic">{latestStatusChange.notes}</small>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>

                                    <Card className="bg-light border-0 mb-4">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3 small">Contact Information</h6>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaEnvelope className="text-primary me-3" />
                                                <div className="text-start overflow-hidden text-truncate">
                                                    {teacherData.email || 'Not provided'}
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaPhone className="text-primary me-3" />
                                                <div>{teacherData.phone || 'Not provided'}</div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <FaMapMarkerAlt className="text-primary me-3" />
                                                <div>{teacherData.address || 'Address not available'}</div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    
                                    <Card className="bg-light border-0">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3 small">Classes Assigned</h6>
                                            <div className="d-flex flex-wrap justify-content-center">
                                                {teacherData.classNames && teacherData.classNames.length > 0 ? (
                                                    teacherData.classNames.map((cls, index) => (
                                                        <ClassBadge key={`${teacherData.id}-${index}`} className={cls} />
                                                    ))
                                                ) : (
                                                    <span className="text-muted">No classes assigned</span>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>

                            <Col lg={8}>
                                <h5 className="border-bottom pb-2 mb-4">Personal Information</h5>
                                
                                <Row className="g-4">
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaIdCard />}
                                                label="ID Number"
                                                value={teacherData.id}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaIdCard />}
                                                label="CIN"
                                                value={teacherData.cin}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="First Name"
                                                value={teacherData.prenom}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="Last Name"
                                                value={teacherData.nom}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                label="Gender"
                                                value={teacherData.gender && teacherData.gender.charAt(0).toUpperCase() + teacherData.gender.slice(1)}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaBirthdayCake />}
                                                label="Date of Birth"
                                                value={teacherData.birthday}
                                            />
                                        </motion.div>
                                    </Col>
                                </Row>

                                <h5 className="border-bottom pb-2 mb-4 mt-4">Professional Information</h5>
                                
                                <Row className="g-4">
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaCalendarCheck />}
                                                label="Date of Admission"
                                                value={teacherData.date_admission}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaBook />}
                                                label="Specialty"
                                                value={teacherData.subject}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaGraduationCap />}
                                                label="Degree"
                                                value={teacherData.degree}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={6}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaDollarSign />}
                                                label="Contract Type"
                                                value={teacherData.contract_type === 'monthly' ? 'Permanent' : 'Hourly'}
                                            />
                                        </motion.div>
                                    </Col>
                                    <Col md={12}>
                                        <motion.div className="mb-4" variants={itemVariants}>
                                            <InfoItem 
                                                icon={<FaDollarSign />}
                                                label="Payment"
                                                value={paymentInfo}
                                            />
                                        </motion.div>
                                    </Col>
                                </Row>

                                {/* Dynamic Status History Section */}
                                <motion.div 
                                    className="mt-4"
                                    variants={itemVariants}
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="border-bottom pb-2 mb-0">Status History</h5>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="d-flex align-items-center"
                                            onClick={() => fetchStatusHistory(teacherData.status_history)}
                                            disabled={historyLoading}
                                        >
                                            <FaHistory className="me-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                    
                                    <Card className="border-0 shadow-sm">
                                        <Card.Body>
                                            {historyLoading ? (
                                                <div className="text-center py-4">
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    <span>Loading status history...</span>
                                                </div>
                                            ) : historyError ? (
                                                <div className="alert alert-warning">
                                                    <small>{historyError}</small>
                                                </div>
                                            ) : (
                                                <div className="position-relative">
                                                    {/* Timeline line */}
                                                    <div className="position-absolute" style={{ left: "7px", top: 0, bottom: 0, width: "2px", backgroundColor: "#e9ecef" }}></div>
                                                    
                                                    {/* Timeline items */}
                                                    {statusHistory.length > 0 ? (
                                                        statusHistory.map((item, index) => (
                                                            <motion.div 
                                                                key={index}
                                                                className="d-flex mb-3 position-relative"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 + (index * 0.1), duration: 0.4 }}
                                                            >
                                                                <div 
                                                                    className={`rounded-circle bg-${getStatusColor(item.status)} me-3`} 
                                                                    style={{ width: "16px", height: "16px", marginTop: "4px", zIndex: 2 }}
                                                                ></div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex justify-content-between">
                                                                        <span className="fw-bold">{item.status}</span>
                                                                        <small className="text-muted">{item.date}</small>
                                                                    </div>
                                                                    <small className="text-secondary d-block">{item.notes}</small>
                                                                    <small className="text-muted">Updated by: {item.updated_by}</small>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-muted py-3">
                                                            No status history available
                                                        </div>
                                                    )}
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

            {/* Add a floating status indicator that follows scroll */}
            <motion.div 
                className="position-fixed bottom-0 end-0 m-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <div 
                    className={`d-flex align-items-center justify-content-center p-3 rounded-circle shadow bg-${statusColor}`}
                    style={{ width: "60px", height: "60px" }}
                >
                    <motion.div 
                        className="text-white fs-5"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        {statusIcon}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Helper component for displaying info items
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