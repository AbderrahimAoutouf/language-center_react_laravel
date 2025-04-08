import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill, BsDownload , BsSearch, BsPersonPlus} from 'react-icons/bs';
import { MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { UseStateContext } from '../../context/ContextProvider';
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';
import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';
import * as XLSX from 'xlsx';

export default function TableTeacher() {
  const [teacherData, setTeacherData] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [pending, setPending] = useState(true);
  const { user, setNotification, setVariant } = UseStateContext();

  const tableCustomStyles = {
    table: {
      style: {
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
      },
    },
    headRow: {
      style: {
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e9ecef',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#495057',
        justifyContent: 'center',
        paddingTop: '16px',
        paddingBottom: '16px',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f1f3f5',
        },
      },
      stripedStyle: {
        backgroundColor: '#f8f9fa',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        justifyContent: 'center',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e9ecef',
        fontSize: '14px',
      },
    },
  };

  const getRolePath = () => {
    if (!user) return "";
    switch (user.role) {
      case "director": return "/director";
      case "secretary": return "/secretary";
      default: return "";
    }
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("api/teachers?populate=*");
        const data = res.data?.data || [];

        setTeacherData(
          data.map((item) => ({
            id: item.id,
            active: item.active,
            name: `${item.first_name} ${item.last_name}`,
            gender: item.gender,
            class: item.classes?.length ? item.classes.map(c => c.name).join(', ') : 'No class',
            subject: item.speciality,
            phone: item.phone,
            hourly_rate: item.hourly_rate,
          }))
        );
      } catch (err) {
        console.error(err);
        setNotification("Failed to load data");
        setVariant("danger");
      } finally {
        setPending(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleExportCSV = () => {
    try {
      const parser = new Parser({ fields: ['id', 'name', 'gender', 'class', 'subject', 'phone', 'hourly_rate', 'active'] });
      const csv = parser.parse(teacherData);
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'teachers_export.csv');
      setNotification("CSV exported successfully");
      setVariant("success");
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      setNotification("Export failed");
      setVariant("danger");
    }
  };

  const toggleActive = async (id, status) => {
    try {
      // Use the dedicated toggle-active endpoint
      const res = await axios.patch(`api/teachers/${id}/toggle-active`);
      
      // Get the updated status from the response
      const updatedStatus = res.data?.data?.active;
  
      setTeacherData(prev =>
        prev.map(t => t.id === id ? { ...t, active: updatedStatus } : t)
      );
  
      // Show notification with status
      setNotification(`Teacher status ${updatedStatus ? 'activated' : 'deactivated'}`);
      setVariant(updatedStatus ? "success" : "warning");
      
      // Auto-clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setNotification("Failed to update status");
      setVariant("danger");
      
      // Also clear error notifications
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`api/teachers/${id}`);
      setTeacherData(prev => prev.filter(t => t.id !== id));
      setNotification("Teacher deleted successfully");
      setVariant("success");
    } catch (err) {
      console.error(err);
      setNotification("Delete failed");
      setVariant("danger");
    }
  };

  const filteredData = teacherData.filter(t =>
    t.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    t.class.toLowerCase().includes(classFilter.toLowerCase())
  );

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true,
      width: '70px'},
    { name: 'Name / Nom', selector: row => row.name, wrap: true , sortable: true,
      wrap: true },
    { name: 'Gender / Sexe', selector: row => row.gender , sortable: true,
      },
    { name: 'Class / Classe', selector: row => row.class , sortable: true,
      },
    { name: 'Subject / Matière', selector: row => row.subject , sortable: true,
      },
    { name: 'Phone / Tel.', selector: row => row.phone , sortable: true,
      },
    { name: 'Hourly Rate / Taux Horaire', selector: row => row.hourly_rate , sortable: true,
      format: row => `${row.hourly_rate}DH`},
    {
      name: 'Status',
      sortable: true,
      cell: row => (
        <div className="d-flex flex-column align-items-center">
          <button 
            onClick={() => toggleActive(row.id, row.active)} 
            className="btn btn-sm position-relative" 
            style={{ 
              backgroundColor: row.active ? 'rgba(25, 135, 84, 0.1)' : 'rgba(108, 117, 125, 0.1)', 
              borderRadius: '20px',
              border: row.active ? '1px solid rgba(25, 135, 84, 0.2)' : '1px solid rgba(108, 117, 125, 0.2)',
              padding: '8px 12px',
              minWidth: '90px'
            }}
            title={row.active ? "Click to deactivate" : "Click to activate"}
          >
            <div className="d-flex align-items-center justify-content-center gap-2"></div>
            {row.active
              ? <MdToggleOn color="green" size={22} />
              : <MdToggleOff color="gray" size={22} />
            }
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 'medium',
                color: row.active ? '#198754' : '#6c757d'
            }}>
              {row.active ? 'Active' : 'Inactive'}
            </span>
          </button>
        </div>
      )
    },
    {
      name: 'Action',
      cell: row => (
        <div className="actions d-flex gap-2 justify-content-center">
          <Link to={`${getRolePath()}/teacher/details/${row.id}`}>
          <button className="btn btn-sm btn-outline-primary" title="View Details">
            <FaEye  size={14} />
            </button></Link>
            <Link to={`${getRolePath()}/teacher/edit/${row.id}`}>
            <button className="btn btn-sm btn-outline-warning" title="Edit">
              <BsFillPencilFill size={14} />
            </button>
          </Link>
          
          <button onClick={() => deleteTeacher(row.id)} className="btn btn-sm btn-outline-danger" 
          title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      ),
      width: '150px'
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-around align-items-center gap-3">
        <input
          className="form-control"
          style={{ borderRadius: '8px' }}
          placeholder="Search by Name"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
        />
        <input
          className="form-control"
          style={{ borderRadius: '8px' }}
          placeholder="Search by Class"
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
        />
        <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleExportCSV}>
          <BsDownload /> Export CSV
        </button>
        <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleExportExcel}>
          <BsDownload /> Export Excel
        </button>
        <Link to={`${getRolePath()}/teacher/add`}>
          <button className="btn btn-danger">Add Teacher</button>
        </Link>
      </div>

          <DataTable
        columns={columns}
        data={filteredData}
        fixedHeader
        pagination
        progressPending={pending}
        className="mt-4"
        customStyles={tableCustomStyles}
        progressComponent={<Ellipsis size={64} color='#D60A0B' />}
      />
    </div>
   
  );
}
