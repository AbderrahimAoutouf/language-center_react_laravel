import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { UseStateContext } from '../../context/ContextProvider';
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';

export default function TableTeacher() {
  const tableCustomStyles = {
    headCells: {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        paddingLeft: '0 8px',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      },
    },
    cells: {
      style: {
        fontSize: '18px',
        paddingLeft: '0 8px',
        justifyContent: 'center',
      },
    },
  };

  const [teacherData, setTeacherDate] = useState([]);
  const { user, setNotification, setVariant } = UseStateContext();
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [pending, setPending] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchTeacher = async () => {
      const res = await axios.get("api/teachers");
      setTeacherDate(
        res.data.data.map((item) => ({
          id: item.id,
          name: item.first_name + ' ' + item.last_name,
          gender: item.gender,
          class: Array.isArray(item.classes) && item.classes.length > 0
            ? item.classes.map((cls) => cls.name).join(', ')
            : 'No class',
          subject: item.speciality,
          phone: item.phone,
          hourly_rate: item.hourly_rate,
        }))
      );
    };

    setTimeout(async () => {
      await fetchTeacher();
      setPending(false);
    }, 200);
  }, []);

  // Delete teacher
  const deleteRow = async (id) => {
    await axios.delete(`api/teachers/${id}`);
    setTeacherDate(teacherData.filter((item) => item.id !== id)); // fixed `_id` to `id`
    setNotification("Teacher deleted successfully");
    setVariant("danger");
    setTimeout(() => {
      setNotification("");
      setVariant("");
      window.location.reload();
    }, 3000);
  };

  let x = "";
  if (user && user.role === 'admin') {
    x = "";
  } else if (user && user.role === 'director') {
    x = "/director";
  } else {
    x = "/secretary";
  }

  const filteredData = teacherData.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase());
    const classMatch = item.class.toLowerCase().includes(classFilter.toLowerCase());
    return nameMatch && classMatch;
  });

  const col = [
    {
      name: 'ID',
      selector: (row) => row.id,
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      wrap: true,
    },
    {
      name: 'Gender',
      selector: (row) => row.gender,
    },
    {
      name: 'Class',
      selector: (row) => row.class,
    },
    {
      name: 'Subject',
      selector: (row) => row.subject,
    },
    {
      name: 'Phone',
      selector: (row) => row.phone,
    },
    {
      name: 'Hourly Rate (DH)',
      selector: (row) => row.hourly_rate,
    },
    {
      name: 'Action',
      selector: (row) => row.action,
      cell: (row) => (
        <div className="actions" style={{ display: 'flex', gap: '0px' }}>
          <Link to={`${x}/teacher/details/${row.id}`}>
            <button style={{ border: 'none', background: 'none' }}>
              <FaEye style={{ color: 'lightBlue', fontSize: '16px' }} />
            </button>
          </Link>
          <Link to={`${x}/teacher/edit/${row.id}`}>
            <button style={{ border: 'none', background: 'none' }}>
              <BsFillPencilFill style={{ color: 'orange', fontSize: '15px' }} />
            </button>
          </Link>
          <button style={{ border: 'none', background: 'none' }} onClick={() => deleteRow(row.id)}>
            <MdDelete style={{ color: 'red', fontSize: '18px' }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-around">
        <input
          style={{ backgroundColor: 'rgba(221, 222, 238, 0.5)', border: 'none', borderRadius: '8px' }}
          type="text"
          placeholder="Search by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          style={{ backgroundColor: 'rgba(221, 222, 238, 0.5)', border: 'none', borderRadius: '8px' }}
          type="text"
          placeholder="Search by Class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        />
        <Link to={`${x}/teacher/add`}>
          <button className="btn btn-danger">Add Teacher</button>
        </Link>
      </div>
      <DataTable
        columns={col}
        data={filteredData}
        fixedHeader
        pagination
        progressPending={pending}
        className="mt-4"
        customStyles={tableCustomStyles}
        progressComponent={
          <Ellipsis
            size={64}
            color='#D60A0B'
            sizeUnit='px'
          />
        }
      />
    </div>
  );
}
