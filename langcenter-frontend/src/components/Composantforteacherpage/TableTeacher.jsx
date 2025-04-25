import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill, BsDownload } from 'react-icons/bs';
import { MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { UseStateContext } from '../../context/ContextProvider';
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';
import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';
import * as XLSX from 'xlsx';
import imgTeacher from "../../images/teacher.png";

export default function TableTeacher() {
  const [teacherData, setTeacherData] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [pending, setPending] = useState(true);
  const { user, setNotification, setVariant } = UseStateContext();

  const getRolePath = () => {
    if (!user) return "";
    if (user.role === "admin") return "";
    if (user.role === "director") return "/director";
    return "/secretary";
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("api/teachers?populate=*");
        const data = res.data?.data || [];
        setTeacherData(data.map(item => ({
          id: item.id,
          avatar: item.avatar,
          active: item.active ?? false,
          name: `${item.first_name} ${item.last_name}`,
          gender: item.gender,
          class: item.classes?.length ? item.classes.map(c => c.name).join(', ') : 'No class',
          subject: item.speciality,
          phone: item.phone,
          hourly_rate: item.hourly_rate,
        })));
      } catch (err) {
        console.error(err);
        setNotification("Failed to load data");
        setVariant("danger");
      } finally {
        setPending(false);
      }
    };

    fetchTeachers();
  }, [setNotification, setVariant]);

  const handleExportCSV = () => {
    try {
      const parser = new Parser({ fields: ['id', 'name', 'gender', 'class', 'subject', 'phone', 'hourly_rate', 'active'] });
      const csv = parser.parse(teacherData);
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'teachers_export.csv');
      setNotification("CSV exported successfully");
      setVariant("success");
    } catch {
      setNotification("Export failed");
      setVariant("danger");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(teacherData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teachers");
      XLSX.writeFile(wb, 'teachers.xlsx');
      setNotification("Excel exported successfully");
      setVariant("success");
    } catch {
      setNotification("Export failed");
      setVariant("danger");
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await axios.patch(`api/teachers/${id}/toggle-active`);
      const updatedStatus = res.data?.data?.active;

      setTeacherData(prev =>
        prev.map(t => t.id === id ? { ...t, active: updatedStatus } : t)
      );

      setNotification(`Teacher status ${updatedStatus ? 'activated' : 'deactivated'}`);
      setVariant(updatedStatus ? "success" : "warning");
      setTimeout(() => {
        setNotification('');
      }, 3000);
    } catch {
      setNotification("Failed to update status");
      setVariant("danger");
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`api/teachers/${id}`);
      setTeacherData(prev => prev.filter(t => t.id !== id));
      setNotification("Teacher deleted successfully");
      setVariant("success");
    } catch (err) {
      setNotification(err.response?.status === 400 ?
        "Cannot delete: Teacher is assigned to classes." :
        "Delete failed"
      );
      setVariant("danger");
    }
  };

  const filteredData = useMemo(() => teacherData.filter(t =>
    t.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    t.class.toLowerCase().includes(classFilter.toLowerCase())
  ), [teacherData, nameFilter, classFilter]);

  const columns = [
    { name: 'ID', selector: row => row.id, width: '60px' },
    {
      name: 'Avatar',
      cell: row => (
        <img
          src={row.avatar || imgTeacher}
          alt="Avatar"
          className="rounded-circle"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          onError={(e) => e.target.src = imgTeacher}
        />
      ),
      width: '80px'
    },
    { name: 'Name', selector: row => row.name, wrap: true, grow: 2 },
    { name: 'Gender', selector: row => row.gender },
    { name: 'Class', selector: row => row.class, grow: 2 },
    { name: 'Subject', selector: row => row.subject },
    { name: 'Phone', selector: row => row.phone, wrap: true },
    {
      name: 'Hourly Rate',
      selector: row => row.hourly_rate,
      format: row => `${row.hourly_rate} DH`
    },
    {
      name: 'Status',
      cell: row => (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => toggleActive(row.id)}
          className="btn btn-light d-flex align-items-center gap-2"
          style={{
            border: row.active ? '1px solid green' : '1px solid gray',
            borderRadius: '20px',
            backgroundColor: row.active ? '#e9fbe9' : '#f0f0f0'
          }}
        >
          {row.active ? <MdToggleOn color="green" size={22} /> : <MdToggleOff size={22} />}
          <span style={{ fontWeight: '500', color: row.active ? 'green' : 'gray' }}>
            {row.active ? 'Active' : 'Inactive'}
          </span>
        </motion.button>
      ),
      width: '160px'
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2 justify-content-center">
          <Link to={`${getRolePath()}/teacher/details/${row.id}`}>
            <motion.button whileHover={{ scale: 1.1 }} className="btn btn-sm btn-outline-primary"><FaEye /></motion.button>
          </Link>
          <Link to={`${getRolePath()}/teacher/edit/${row.id}`}>
            <motion.button whileHover={{ scale: 1.1 }} className="btn btn-sm btn-outline-warning"><BsFillPencilFill /></motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.1 }} className="btn btn-sm btn-outline-danger" onClick={() => deleteTeacher(row.id)}>
            <MdDelete />
          </motion.button>
        </div>
      ),
      width: '200px'
    }
  ];

  const tableCustomStyles = {
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }
    },
    cells: {
      style: {
        fontSize: '15px',
        justifyContent: 'center'
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ maxWidth: '180px' }}
            type="text"
            placeholder="Search by Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <input
            className="form-control"
            style={{ maxWidth: '180px' }}
            type="text"
            placeholder="Search by Class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={handleExportCSV}>
            Export CSV <BsDownload />
          </button>
          <button className="btn btn-outline-info" onClick={handleExportExcel}>
            Export Excel <BsDownload />
          </button>
          <Link to={`${getRolePath()}/teacher/add`}>
            <button className="btn btn-danger">Add Teacher</button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        fixedHeader
        pagination
        progressPending={pending}
        progressComponent={<Ellipsis size={64} color='#D60A0B' sizeUnit='px' />}
        customStyles={tableCustomStyles}
        highlightOnHover
        responsive
      />
    </div>
  );
}
