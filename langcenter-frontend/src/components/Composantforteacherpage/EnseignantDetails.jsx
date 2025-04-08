import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import imgTeacher from "../../images/teacher.png";
import { Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from "../../context/ContextProvider";

export default function EnseignantDetails() {
    const [teacherData, setTeacherData] = useState({});
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = UseStateContext();
    
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
        setLoading(true);
        axios.get(`/api/teachers/${id}`)
            .then((res) => {
                const data = res.data.data;
                setTeacherData({
                    id: data.id,
                    nom: data.last_name,
                    prenom: data.first_name,
                    name: data.first_name + ' ' + data.last_name,
                    gender: data.gender,
                    class: data.classes && data.classes.length > 0 ? data.classes.map((cls) => cls.name).join(', ') : 'No class',
                    subject: data.speciality,
                    status: "active",
                    phone: data.phone,
                    birthday: data.birthday,
                    email: data.email,
                    address: data.address,
                    date_admission: data.hiredate,
                    degree: data.diploma,
                    cin: data.cin,
                    hourly_rate: data.hourly_rate
                });
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, [id]);

    const handleEditClick = () => {
        navigate(`${routePrefix}/teacher/edit/${id}`);
    };

    if (loading) {
        return <div className="text-center mt-5">Loading teacher data...</div>;
    }

    return (
        <div>
            <br /><br /><br />

            <div className="Container">
                <div className="row">
                    <div className="col-5">
                        <Image width={"50%"} className="ms-5" src={imgTeacher} roundedCircle />
                    </div>
                    <div className="col">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{teacherData.nom} {teacherData.prenom}</h5>
                            <Button variant="primary" onClick={handleEditClick}>Edit Teacher</Button>
                        </div>
                        <p>
                            {teacherData.subject ? `Specializing in ${teacherData.subject}` : 'Description'}
                        </p> 
                        <br />
                        <div className="row">
                            <div className="col-6">
                                ID Number:
                            </div>
                            <div className="col-6">
                                {teacherData.id}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                CIN:
                            </div>
                            <div className="col-6">
                                {teacherData.cin}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Last Name:
                            </div>
                            <div className="col-6">
                                {teacherData.nom}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                First Name:
                            </div>
                            <div className="col-6">
                                {teacherData.prenom}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Gender:
                            </div>
                            <div className="col-6">
                                {teacherData.gender && teacherData.gender.charAt(0).toUpperCase() + teacherData.gender.slice(1)}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Email:
                            </div>
                            <div className="col-6">
                                {teacherData.email}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Phone:
                            </div>
                            <div className="col-6">
                                {teacherData.phone}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Address:
                            </div>
                            <div className="col-6">
                                {teacherData.address}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Date of birth:
                            </div>
                            <div className="col-6">
                                {teacherData.birthday}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Degree:
                            </div>
                            <div className="col-6">
                                {teacherData.degree}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Hourly Rate:
                            </div>
                            <div className="col-6">
                                {teacherData.hourly_rate}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Date of Admission:
                            </div>
                            <div className="col-6">
                                {teacherData.date_admission}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                Class:
                            </div>
                            <div className="col-6">
                                {teacherData.class}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}