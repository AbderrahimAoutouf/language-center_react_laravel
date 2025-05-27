import React, { useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from '../../api/axios';
import { FaUserGraduate } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';

export default function ViewGroupe() {
  const localizer = momentLocalizer(moment);
  const { id } = useParams();
  const [classData, setClassData] = useState({});
  const [classScheduleData, setClassScheduleData] = useState([]);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");
  const [variant, setVariant] = useState("info");
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'students' | 'schedule'
  const [searchTerm, setSearchTerm] = useState('');
  

  // Fetch class details
  const fetchClassDetails = useCallback(async () => {
  setPending(true);
  try {
    const response = await axios.get(`api/classes/${id}?include=etudiants`);
    const classData = response.data.data;
    
    setClassData(classData);
    
    if (classData.etudiants) {
      setStudents(classData.etudiants.map(student => ({
        id: student.id,
        first_name: student.prenom,
        last_name: student.nom,
        email: student.email,
        phone: student.telephone,
        date_of_birth: student.date_naissance,
        address: student.adresse,
        gender: student.sexe,
        is_active: student.isActive,
        parent_info: student.parent,
        is_free: student.gratuit,
        advance_payment: student.avance,
        photo_authorized: student.photo_authorized,
        level: student.level,
        age_group: student.age_group,
        classes: student.classes || [],
        courses: student.cours || [],
        age: student.date_naissance ? moment().diff(moment(student.date_naissance), 'years') : null,
        enrollment_date: student.created_at || student.enrollment_date,
        status: student.isActive ? 'Active' : 'Inactive'
      })));
    }
  } catch (error) {
    console.error('Error fetching class details:', error);
    setNotification("Failed to load class details");
    setVariant("danger");
  } finally {
    setPending(false);
  }
}, [id]);


  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  // Fetch class schedule
  const fetchClassSchedule = useCallback(async () => {
    try {
      // Use consistent URL format without hardcoded domain
      const response = await axios.get(`api/timeTable?class_id=${id}`);
      setClassScheduleData(response.data.timetable || []);
    } catch (error) {
      console.error('Error fetching class schedule details:', error);
      setNotification("Failed to load class schedule");
      setVariant("danger");
    }
  }, [id]);

  useEffect(() => {
    fetchClassSchedule();
  }, [fetchClassSchedule]);

  // Alternative approach to fetch class data (from your provided code)
  const fetchClassData = useCallback(async () => {
    setPending(true);
    
    try {
      const response = await axios.get("/api/classes");
      
      const formattedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        schoolYear: item.school_year,
        //capacity: item.capacity,
        level: item.level,
        startDate: new Date(item.start_date).toLocaleDateString(),
        endDate: new Date(item.end_date).toLocaleDateString(),
        students: item.nb_etudiants,
        course: item.cours.title,
        teacher: item.teacher ? `${item.teacher.first_name} ${item.teacher.last_name}` : 'Not Assigned',
        student: item.etudiants ? item.etudiants.map(student => 
          `${student.prenom} ${student.nom}`
        ) : [],
      }));
      
      // Find the class that matches our current ID
      const currentClass = formattedData.find(cls => cls.id === parseInt(id) || cls.id === id);
      
      if (currentClass) {
        // Update our class data using this information
        setClassData(currentClass);
        
        // Set students data if available
        if (currentClass.student && currentClass.student.length > 0) {
          // Convert formatted student names back to objects for display
          const studentObjects = currentClass.student.map((studentName, index) => ({
            id: index + 1, // temporary ID
            first_name: studentName.split(' ')[0],
            last_name: studentName.split(' ').slice(1).join(' '),
            email: null,
            phone: null,
            date_of_birth: null,
            address: null,
            gender: null,
            is_active: true,
            parent_info: null,
            is_free: false,
            advance_payment: 0,
            photo_authorized: false,
            level: null,
            age_group: null,
            classes: [],
            courses: [],
            age: null,
            enrollment_date: null,
            status: 'Active'
          }));
          setStudents(studentObjects);
        }
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      setNotification("Failed to load class data");
      setVariant("danger");
    } finally {
      setPending(false);
      setLoading(false);
    }
  }, [id]);

  // Generate calendar events
  useEffect(() => {
    if (classScheduleData.length > 0) {
      const generatedEvents = generateEventsFromTimetable(classScheduleData);
      setEvents(generatedEvents);
    }
  }, [classScheduleData]);

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const generateEventsFromTimetable = (timetableData) => {
    const events = timetableData.flatMap((entry) => {
      const recurringEvents = [];
      
      // Ensure entry properties exist before accessing them
      if (!entry.startTime || !entry.finishTime || !entry.day_id) {
        console.warn('Incomplete timetable entry:', entry);
        return [];
      }
      
      const startDateTime = moment().isoWeekday(entry.day_id).set({
        hour: entry.startTime.split(':')[0],
        minute: entry.startTime.split(':')[1],
        second: entry.startTime.split(':')[2],
      });
      const endDateTime = moment().isoWeekday(entry.day_id).set({
        hour: entry.finishTime.split(':')[0],
        minute: entry.finishTime.split(':')[1],
        second: entry.finishTime.split(':')[2],
      });
      
      let currentDateTime = moment(startDateTime);
      
      // Ensure we have end_date and start_date
      const endDate = entry.end_date ? moment(entry.end_date).startOf('week') : moment().add(4, 'months');
      const startDate = entry.start_date ? moment(entry.start_date).startOf('week') : moment().subtract(1, 'week');
      
      while (currentDateTime.isSameOrBefore(endDate)) {
        if (currentDateTime.isSameOrAfter(startDate)) {
          const start = currentDateTime.toDate();
          const end = moment(endDateTime)
            .add(currentDateTime.diff(startDateTime))
            .toDate();
          recurringEvents.push({
            id: entry.id,
            title: `${entry.course_title || 'Class'} (${entry.classroom_name || 'Room'})`,
            start,
            end,
            event_color: entry.event_color,
          });
        }
        currentDateTime = currentDateTime.add(1, 'week');
      }
      return recurringEvents;
    });
    return events;
  };

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .fade-in { 
        animation: fadeIn 0.5s ease; 
      }
      .tab-active {
        border-bottom: 3px solid #dc3545;
        color: #dc3545;
        font-weight: bold;
      }
      .student-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      .alert {
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  

  // Fetch all data on component mount
  useEffect(() => {
    // Try the alternate approach in case our detailed endpoints fail
    fetchClassData();
  }, [fetchClassData]);

  return (
    <div className="container-fluid p-4 fade-in">
      {notification && (
        <div className={`alert alert-${variant} alert-dismissible fade show mb-4`} role="alert">
          {notification}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification("")}
            aria-label="Close"
          />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="mb-4">Class Details</h2>
        
        {/* Navigation Tabs */}
        <div className="d-flex border-bottom mb-4">
          <div 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'details' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
            style={{ cursor: 'pointer' }}
          >
            Class Details
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'students' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('students')}
            style={{ cursor: 'pointer' }}
          >
            Students ( {students.length > 0 
                            ? `${students.length} ` 
                            : (classData.students ? `${classData.students} ` : 'N/A')})
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'schedule' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            style={{ cursor: 'pointer' }}
          >
            Schedule
          </div>
        </div>
        
        {/* Class Details Tab */}
        {activeTab === 'details' && (
          <div className="fade-in">
            {pending ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h4 className="card-title border-bottom pb-3">Basic Information</h4>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">ID:</div>
                        <div className="col-8 font-weight-bold">{classData.id}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">Class Name:</div>
                        <div className="col-8 font-weight-bold">{classData.name}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">Course Name:</div>
                        <div className="col-8 font-weight-bold">
                          {classData.cours?.title || classData.course || 'N/A'}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">Level:</div>
                        <div className="col-8 font-weight-bold">{classData.level}</div>
                      </div>
                      <div className="row">
                        <div className="col-4 text-muted">Teacher:</div>
                        <div className="col-8 font-weight-bold">
                          {classData.teacher?.last_name && classData.teacher?.first_name 
                            ? `${classData.teacher.last_name} ${classData.teacher.first_name}` 
                            : (typeof classData.teacher === 'string' ? classData.teacher : "No Teacher Assigned")}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h4 className="card-title border-bottom pb-3">Additional Information</h4>
                      {/* <div className="row mb-3">
                        <div className="col-4 text-muted">Capacity:</div>
                        <div className="col-8 font-weight-bold">{classData.capacity || 'N/A'}</div>
                      </div> */}
                      <div className="row mb-3">
                        <div className="col-4 text-muted">School Year:</div>
                        <div className="col-8 font-weight-bold">{classData.school_year || classData.schoolYear || 'N/A'}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">Start Date:</div>
                        <div className="col-8 font-weight-bold">
                          {classData.start_date 
                            ? new Date(classData.start_date).toLocaleDateString() 
                            : (classData.startDate || 'N/A')}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-muted">End Date:</div>
                        <div className="col-8 font-weight-bold">
                          {classData.end_date 
                            ? new Date(classData.end_date).toLocaleDateString()
                            : (classData.endDate || 'N/A')}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 text-muted">Students:</div>
                        <div className="col-8 font-weight-bold">
  {students.length > 0 
    ? `${students.length} enrolled` 
    : (classData.nb_etudiants ? `${classData.nb_etudiants} enrolled` : 'N/A')}
</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    Search
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <span className="text-muted">
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>
            </div>
            
            {/* Display error message if there is one */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
                <div className="mt-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-danger me-2"
                    onClick={() => setActiveTab('details')}
                  >
                    Go back to details
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      setError(null);
                      fetchClassData();
                    }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center my-5">
                <FaUserGraduate size={50} className="text-muted mb-3" />
                <h4 className="text-muted">No students found</h4>
                <p>{students.length === 0 ? 'No students are enrolled in this class' : 'Try adjusting your search'}</p>
                {students.length === 0 && classData.students > 0 && (
                  <div className="alert alert-warning mt-3">
                    <strong>Note:</strong> This class has {classData.students} students according to our records, 
                    but we couldn't load the detailed student information.
                    <div className="mt-3">
                      <button 
                        className="btn btn-outline-warning"
                        onClick={fetchClassData}
                      >
                        Try loading again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="row">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card shadow-sm student-card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-light rounded-circle p-3 me-3">
                            <FaUserGraduate size={24} className="text-danger" />
                          </div>
                          <div>
                            <h5 className="card-title mb-0">{student.first_name} {student.last_name}</h5>
                            <small className="text-muted">Student ID: {student.id}</small>
                          </div>
                        </div>
                        
                        <div className="card-text">
                          {student.email && (
                            <div className="d-flex align-items-center mb-2">
                              <FiMail className="text-muted me-2" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          
                          {student.phone && (
                            <div className="d-flex align-items-center mb-2">
                              <FiPhone className="text-muted me-2" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          
                          {student.age && (
                            <div className="mb-2">
                              <span className="text-muted me-2">Age:</span>
                              <span>{ student.age}</span>
                            </div>
                          )}
                          {student.advance_payment && (
                            <div className="mb-2">
                              <span className="text-muted me-2">Avance:</span>
                              <span>{student.advance_payment}</span>
                            </div>
                          )}
                          {student.age_group && (
                            <div className="mb-2">
                              <span className="text-muted me-2">age_group:</span>
                              <span>{student.age_group}</span>
                            </div>
                          )}
                          
                          {student.is_free !== undefined && (
  <div className="mb-2">
    <span className="text-muted me-2">is_free:</span>
    <span>{student.is_free === 1 ? "Yes" : "No"}</span>
  </div>
)}

                        </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            {events.length === 0 ? (
              <div className="text-center my-5">
                <div className="text-muted mb-3">
                  <svg width="50" height="50" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                </div>
                <h4 className="text-muted">No schedule information available</h4>
                <p>This class doesn't have any scheduled sessions yet.</p>
                <button 
                  className="btn btn-outline-danger mt-3"
                  onClick={fetchClassSchedule}
                >
                  Refresh Schedule
                </button>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                min={new Date().setHours(8, 0, 0)}
                max={new Date().setHours(20, 0, 0)}
                views={['day', 'work_week', 'week', 'month']}
                defaultView="week"
                eventPropGetter={(event) => {
                  const backgroundColor = event.event_color || classData.event_color || '#dc3545';
                  return { style: { backgroundColor } };
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}