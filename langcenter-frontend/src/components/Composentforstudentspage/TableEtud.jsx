import Button from "../Button";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { BsFillEyeFill, BsFillPencilFill, BsDownload } from 'react-icons/bs';
import { MdDelete , MdToggleOn, MdToggleOff } from 'react-icons/md';
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners';
import { UseStateContext } from "../../context/ContextProvider";
import AddClass from "./AddClass.jsx";
import male from "../../images/icons/icons8-male (1).svg";
import female from "../../images/icons/icons8-female (1).svg";
import Form from 'react-bootstrap/Form';
import ParentModal from "./ParentModal";
import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';
import * as XLSX from 'xlsx';
import imgStudent from "../../images/student.png";

export default function TableEtud() {
    const [selectedID, setSelectedID] = useState(null);
    const [ParentModalShow, setParentModalShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [levels, setLevels] = useState([]);
    const { user, setNotification, setVariant } = UseStateContext();
    const [pending, setPending] = useState(true);
    const [data, setData] = useState([]);
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();

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

    let x = "";
    if (user?.role === 'admin') x = "";
    else if (user?.role === 'director') x = "/director";
    else x = "/secretary";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, levelsRes] = await Promise.all([
                    axios.get("/api/etudiants"),
                    axios.get("/api/levels")
                ]);

                const formattedData = studentsRes.data.data.map(student => ({
                    id: student.id,
                    avatar: student.avatar || imgStudent,
                    name: `${student.prenom} ${student.nom}`,
                    gender: student.sexe,
                    class: student.classes?.map(c => c.name).join(', ') || 'No class',
                    parents: student.parent ? `${student.parent.nom} ${student.parent.prenom}` : "_________",
                    parent_id: student.parent?.id,
                    status: true,
                    level: student.level?.id
                }));

                setData(formattedData);
                setLevels(levelsRes.data);
                setRecords(formattedData);
                setPending(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setNotification("Failed to load data");
                setVariant("danger");
                setPending(false);
            }
        };

        fetchData();
    }, [setNotification, setVariant]);

    const deleteRow = async (id) => {
        try {
            await axios.delete(`/api/etudiants/${id}`);
            setData(prev => prev.filter(item => item.id !== id));
            setNotification("Student deleted successfully");
            setVariant("danger");
        } catch (error) {
            console.error("Delete error:", error);
            setNotification("Delete failed");
            setVariant("danger");
        }
    };
    const handleExportCSV = () => {
        try {
          const parser = new Parser({ 
            fields: ['id', 'name', 'gender', 'class', 'parents', 'level', 'status'] 
          });
          const csv = parser.parse(records);
          saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'students_export.csv');
          setNotification("CSV exported successfully");
          setVariant("success");
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } catch (err) {
          console.error(err);
          setNotification("Export failed");
          setVariant("danger");
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        }
      };
      
      const handleExportExcel = () => {
        try {
          const ws = XLSX.utils.json_to_sheet(records);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Students");
          XLSX.writeFile(wb, 'students.xlsx');
          setNotification("Excel exported successfully");
          setVariant("success");
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } catch (err) {
          console.error(err);
          setNotification("Export failed");
          setVariant("danger");
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        }
      };

    const handleChangeLevel = async (e, id) => {
        try {
            await axios.post("/api/assignLevel", {
                student_id: id,
                level_id: e.target.value
            });
            setData(prev => prev.map(item => 
                item.id === id ? { ...item, level: e.target.value } : item
            ));
        } catch (error) {
            console.error("Level update error:", error);
        }
    };

    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            width: '70px'
        },
        {
            name: "Avatar",
            cell: row => (
                <img 
                    src={row.avatar}
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                    alt="Avatar"
                    onError={(e) => {
                        e.target.src = imgStudent;
                    }}
                />
            ),
            width: '80px'
        },
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
            wrap: true
        },
        {
            name: "Gender",
            selector: row => row.gender,
            cell: row => (
                <img 
                    src={row.gender === "male" ? male : female} 
                    alt="gender" 
                    width="30px" 
                />
            )
        },
        {
            name: "Class",
            selector: row => row.class,
            cell: row => (
                <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: row.class === 'No class' ? 'red' : 'inherit' }}>
                        {row.class}
                    </span>
                    <button 
                        className="btn btn-link text-decoration-none"
                        onClick={() => setShowModal(true)}
                    >
                        +
                    </button>
                    <AddClass 
                        showModal={showModal} 
                        handleClose={() => setShowModal(false)} 
                        selectedItem={row}
                    />
                </div>
            )
        },
        {
            name: "Parent",
            selector: row => row.parents,
            cell: row => (
                <button 
                    className={`btn btn-sm ${row.parents === "_________" ? 'text-danger' : 'text-primary'}`}
                    onClick={() => row.parent_id && setParentModalShow(true)}
                >
                    {row.parents}
                </button>
            )
        },
        {
            name: "Level",
            cell: row => (
                <Form.Select 
                    defaultValue={row.level} 
                    onChange={(e) => handleChangeLevel(e, row.id)}
                    size="sm"
                >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                </Form.Select>
            )
        },
        {
            name: "Status",
            cell: row => (
                <span className={`badge bg-${row.status ? 'success' : 'danger'}`}>
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            name: "Actions",
            cell: row => (
                <div className="d-flex gap-2">
                    <Link to={`${x}/student/${row.id}`}>
                        <BsFillEyeFill className="text-success cursor-pointer" />
                    </Link>
                    <Link to={`${x}/student/editStudent/${row.id}`}>
                        <BsFillPencilFill className="text-warning cursor-pointer" />
                    </Link>
                    <MdDelete 
                        className="text-danger cursor-pointer" 
                        onClick={() => deleteRow(row.id)} 
                    />
                </div>
            )
        }
    ];

    const handleFilter = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setRecords(data.filter(item =>
            item.name.toLowerCase().includes(searchValue)
        ));
    };
    

    const handleClassFilter = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setRecords(data.filter(item =>
            item.class.toLowerCase().includes(searchValue)
        ));
    };

    return (
        <div className="p-4">
          <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
            {/* Champ de recherche */}
            <input
              type="text"
              className="form-control flex-grow-1"
              placeholder="Search by Name"
              onChange={handleFilter}
              style={{ maxWidth: '300px' }}
            />
            <input
          className="form-control flex-grow-1"
          style={{ maxWidth: '300px' }}
          placeholder="Search by Class"
          onChange={handleClassFilter}
        />
      
            {/* Bouton d'export CSV */}
            <button 
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={handleExportCSV}
            >
              <BsDownload /> Export CSV
            </button>
      
            {/* Bouton d'export Excel */}
            <button 
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={handleExportExcel}
            >
              <BsDownload /> Export Excel
            </button>
      
            {/* Bouton Add Student */}
            <Link to={`${x}/student/addStudent`} className="col">
                    <Button className="" variant="danger" isDisabled={false} size="md" value="add Student" handleSmthg={() => console.log("chibakiya")}/>
            </Link>
          </div>
      
          {/* DataTable */}
          <DataTable
            columns={columns}
            data={records}
            fixedHeader
            pagination
            progressPending={pending}
            customStyles={tableCustomStyles}
            progressComponent={<Ellipsis size={64} color="#D60A0B" />}
            className="border rounded-3 shadow-sm"
          />
      
          {/* Modals */}
          <ParentModal 
            show={ParentModalShow} 
            onHide={() => setParentModalShow(false)} 
            parentId={selectedID}
          />
        </div>
      );
      
}