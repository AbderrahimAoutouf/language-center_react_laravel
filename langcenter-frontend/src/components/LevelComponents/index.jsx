import Button from "../Button"
import { useState,useEffect } from "react"
import DataTable from "react-data-table-component"
import { BsFillEyeFill, BsFillPencilFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { Link, Navigate,useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Ellipsis } from 'react-awesome-spinners'
import { UseStateContext } from "../../context/ContextProvider";
import Edit from './Edit';

export default function Index() {
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
    }
    const [levels,setLevels]=useState([]);
    const {user,setNotification,setVariant} = UseStateContext()
    const [pending, setPending] = useState(true);
    const [data,setData]=useState([]);
    const [records,setRecords]=useState([]);
    const[nameFilter , setNameFilter]= useState('');
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
    const col = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Action',
            selector: row => row.action,
            cell: row => (
            <div className="actions" style={{ display: 'flex', gap: '0px' }}>
                <Link to={`${x}/levels/${row.id}`}>
                    <button style={{ border: 'none', background: 'none'}}>
                        <BsFillEyeFill style={{ color: 'green', fontSize: '20px' }} />
                    </button>
                </Link>
                <Link to={`${x}/levels/edit/${row.id}`}>
                    <button style={{ border: 'none', background: 'none' }}>
                        <BsFillPencilFill style={{ color: 'orange' }} />
                    </button>
                </Link>
          <button style={{ border: 'none', background: 'none' }} onClick={() => deleteRow(row.id)}>
            <MdDelete style={{ color: 'red', fontSize: '20px' }} />
          </button>
        </div>
            )
        }
    ]
    useEffect(() => {
        const timeout = setTimeout(async () => {
            const fetchData = async () => {
                try {
                    const response = await axios.get("/api/levels");
                    setData(
                        response?.data?.map((item) => {
                            return {
                                id: item.id,
                                name: item.name,
                            };
                        })
                        );
                    console.log(response.data);
                    setPending(false);
                } catch (err) {
                    console.log(err);
                }
            };
            await fetchData();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [data]);
    //methodes
    const deleteRow = async (id) => {
        try {
            const response = await axios.delete(`/api/levels/${id}`);
            console.log(response);
            setNotification("Level deleted successfully")
            setVariant("danger")
            navigate(`${x}/levels`)
        } catch (err) {
            console.log(err);
            setNotification("Level deleted failed")
            setVariant("danger")
        }
    };

    const filteredData = data.filter((item)=>item.name.toLowerCase().includes(nameFilter.toLocaleLowerCase()))

    return (
            <div>
        <div className="row offset-1 my-2">
            <div className="col">
                 <input type="text" className="form-control" placeholder="Search by Name" value={nameFilter} onChange={(e)=>{setNameFilter(e.target.value)}}/>
            </div>
            <Link to={`${x}/levels/add`} className="col">
                    <Button className="" variant="danger" isDisabled={false} size="md" value="add Level" handleSmthg={() => console.log("chibakiya")}/>
            </Link>
        </div>
            <DataTable
                    columns={col}
                    data={filteredData}
                    fixedHeader
                    pagination
                    progressPending={pending}
                    customStyles={tableCustomStyles}
                    progressComponent={<Ellipsis  size={64}
                        color='#D60A0B'
                        sizeUnit='px' />}
            >
             </DataTable>
                </div>
    )
}
