import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { UseStateContext } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';

export default function EditSchedule() {
  const {user,setNotification, setVariant } = UseStateContext();
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [course, setCourse] = useState(null);
  const [group, setGroup] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [day, setDay] = useState(null);
  const [classroomsList, setClassroomsList] = useState([]);
  const navigate = useNavigate();

  let x = ""
  if (user && user.role==='admin')
  {
      x = ""
  } else if (user && user.role==='director')
  {
      x="/director"
  }
  else{
      x="/secretary"
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduleResponse = await axios.get(`/api/timeTable/${id}`);
        const { course_id, class_id, classroom_id,day_id } = scheduleResponse.data.timeTable;
        const courseResponse = await axios.get(`/api/cours/${course_id}`);
        const groupResponse = await axios.get(`/api/classes/${class_id}`);
        const classroomResponse = await axios.get(`/api/classroom/${classroom_id}`);
        const dayResponse = await axios.get(`/api/days/${day_id}`);

        setSchedule(scheduleResponse.data.timeTable);
        setCourse(courseResponse.data.data);
        setGroup(groupResponse.data.data);
        setClassroom(classroomResponse.data.classroom);
        setDay(dayResponse.data.day.name);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [id]);



  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get('/api/classroom');
     
        setClassroomsList(response.data.data);
        console.log("fdf",classroomsList)
      } catch (error) {
        console.log(error);
      }
    };

    fetchClassrooms();
  }, []);



  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      startTime: newStartTime,
    }));
  };

  const handleFinishTimeChange = (e) => {
    const newFinishTime = e.target.value;
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      FinishTime: newFinishTime,
    }));
  };
  
  const handleClassroomChange = (e) => {
    const newClassroomId = parseInt(e.target.value);
    console.log(newClassroomId);
    console.log(classroomsList);
  
    const selectedClassroom = classroomsList.find((classroom) => classroom.id === newClassroomId);
    
    if (selectedClassroom) {
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        classroom_name: selectedClassroom.name,
        classroom_id: selectedClassroom.id,
      }));
    } else {
      console.log('Selected classroom not found');
    }
  };
  
  

  const handleSave = () => {
  console.log(schedule);

  const sendData = {
    course_id: schedule.course_id,
    class_id: schedule.class_id,
    classroom_id: schedule.classroom_id,
    startTime: schedule.startTime,
    FinishTime: schedule.FinishTime,
    day_id: schedule.day_id, // Pass the days array directly
  };

  console.log(sendData.days);

  axios
    .put(`/api/timeTable/${id}`, sendData)
    .then((res) => {
      console.log(res.data);
      setNotification('Timetable updated successfully');
      setVariant('success');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      navigate(`${x}/schedule`);
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
      setNotification('An error occurred');
      setVariant('danger');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
    });
};

  
  

  if (!schedule || !course || !group || !classroom || !classroomsList) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Edit Schedule</h1>
      <p>ID: {schedule.id}</p>
      <p>Course Name: {course.title}</p>
      <p>Group: {group.name}</p>
      <form className="editSchedule">
        <div className="mb-3">
          <label htmlFor="days" className="form-label">
            Day: {day}
          </label>
          
        </div>
        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">
            Start Time:
          </label>
          <input
            type="time"
            className="form-control"
            id="startTime"
            value={schedule.startTime}
            onChange={handleStartTimeChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="finishTime" className="form-label">
            Finish Time:
          </label>
          <input
            type="time"
            className="form-control"
            id="finishTime"
            value={schedule.FinishTime}
            onChange={handleFinishTimeChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="classroom" className="form-label">
            Classroom:
          </label>
          <select
            className="form-select"
            id="classroom"
            value={schedule.classroom_id}
            onChange={handleClassroomChange}
          >
           
            {classroomsList.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.class_room}
              </option>
            ))}
          </select>
        </div>
      </form>
      <button onClick={handleSave} className="btn btn-success">
        Save
      </button>
    </div>
  );
}
