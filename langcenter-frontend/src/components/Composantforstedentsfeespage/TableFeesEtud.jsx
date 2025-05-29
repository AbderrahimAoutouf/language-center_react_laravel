import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { BsFillPencilFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import EditFees from './EditFees';
import { useEffect } from 'react';
import { UseStateContext } from '../../context/ContextProvider';
import Inscription from '../InscStudDash/Inscription';
import axios from '../../api/axios';
import { Ellipsis } from 'react-awesome-spinners'
import { Button } from 'react-bootstrap';


export default function TableFeesEtud()
{ 
  const [nameFilter,setNameFilter]= useState('');
  const [status2,setStatus2]= useState('all');
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
    const {user,setNotification,setVariant} = UseStateContext()
    const [data,setData]=useState([]);
    const [pending, setPending] = useState(true);
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
    useEffect(()=>{
      
       const fetchData = async() => axios.get('/api/payment').then((response)=>{
          console.log(response.data.data);
          setData(
              response.data.data.map((row)=>({
                  id:row.id,
                  inscription_id: row.inscription_id,
                  name:row.etudiant_name,
                  status:row.status,
                  iamount:row.cours_fee,
                  aamount:row.negotiated_price,
                  pamount:row.amount,
                  ramount:Number(row.remaining),
                  class:row.classe_name,
                  date:row.payment_date,
                  avance:row.avance,
              }))
          );
            })
        .catch((error)=>console.log(error));
        setTimeout(async() => {
        await fetchData();
        setPending(false);
      }, 200);
    },[])


  
      const deleteRow = (id) => {
        axios.delete(`/api/delete-payment/${id}`)
        .then((response)=>{
          console.log(response.data.data);
          setNotification("Student deleted successfully");
          setVariant("danger");
          setTimeout(() => {
              setNotification("");
              setVariant("");
              window.location.reload();
          }, 2000);
        })
        .catch((error)=>console.log(error));
      }
    const col=[
        {
            name:"ID",
            selector:row => row.id
        },
        {
            name:"Name",
            selector:row => row.name
        },
        {
            name:"Class",
            selector:row => row.class
        },
        {
            name:"Inscription ID",
            selector:row => row.inscription_id,
            display: 'none'
        },
        {
            name:"avance",
            selector:row => row.avance,
            display: 'none'
        },
        {
            name:"Status",
            selector:row => row.status,
            cell: (row) => (
        <div style={{ display: 'flex', gap: '0px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: row.status === 'Paid' ? 'green' : 'red' }} />
          <p style={{ marginLeft: '5px' }}>{row.status}</p>
        </div>
      ),
        },
        {
          name:"Cours Price",
          selector:row => row.iamount
      },
      {
          name:"Total",
          selector:row => row.aamount,
      },
      {
          name:"Paid",
          selector:row => row.pamount
      },
      {
          name:"Remaining ",
          selector:row => row.ramount
      },
        {
            name:"Date of Payment",
            selector:row => row.date
        },
        {
            name:"Action",
            selector:row => row.action,
            cell: (row) => (
        <div className="actions" style={{ display: 'flex', gap: '0px' }}>
          <Link to={`${x}/income/student/edit/${row.id}`}>
            <button style={{ border: 'none', background: 'none' }}>
              <BsFillPencilFill style={{ color: 'orange' }} />
            </button>
          </Link>
          <button style={{ border: 'none', background: 'none' }} onClick={() => deleteRow(row.id)}>
            <MdDelete style={{ color: 'red', fontSize: '20px' }} />
          </button>
          {
            (row.status === 'Unpaid' || row.status === 'Partial Payment')  && (
                <Link to={`${x}/income/student/add/${row.inscription_id}`} className='text-black'>
              <Button variant="success" style={{ border: 'none', background: 'none',color: 'black' }}>
                +
              </Button>
              </Link>
            )
          }
        </div>
      ),
        }
    ]

    // const [Namefilter,setNamefilter]=useState(Data)
    // function handelfilterbyname(event)
    // {
    //   const newData=Data.filter(row =>{
    //     return row.name.toLowerCase().includes(event.target.value.toLowerCase())
    //   })
    //   setNamefilter(newData)
    // }
    // const [Classfilter,setClassfilter]=useState(Data)
    // function handelfilterbyClass(event)
    // {
    //   const newData=Data.filter(row =>{
    //     return row.class.toLowerCase().includes(event.target.value.toLowerCase())
    //   })
    //   setNamefilter(newData)
    // }


    // const [StatusFilter, setStatusFilter] = useState(Data);

    // function handleFilterByStatus(event)
    // {
    //   const selectedStatus = event.target.value.toLowerCase();

    //   if (selectedStatus === 'all') {
    //     // Afficher toutes les lignes
    //     setNamefilter(Data);
    //   } else {
    //     // Filtrer les lignes en fonction du statut
    //     const newData = Data.filter((row) => row.status.toLowerCase() === selectedStatus);
    //     setNamefilter(newData);
    //   }
    // }

    const filteredData = data.filter((item)=>item.name.toLowerCase().includes(nameFilter.toLowerCase()) && ( item.status.toLowerCase()===status2.toLowerCase() || status2==='all' ) ) 
    console.log(status2 , ' aes')
    return(
        <div>
           
            <div className='row'>
              <div className='col'>

                <input type="text" name="name" className="form-control" placeholder='Search by name' value={nameFilter} onChange={(e)=>setNameFilter(e.target.value)}/>
              </div>
              <div className='col'>

                <select type="selectStatus" className="form-control" onChange={(e)=>setStatus2(e.target.value)}  >
                <option value="all">All</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            {/* <div className="row offset-1">
              <div className='col'>
              <input type="text" className="form-control"  placeholder="Search by Name"  />
              </div>
              <div className='col'>
              <input type="text" className="form-control"  placeholder="Search by Class"  />
              </div>
              <div className='col'>
              <select className="form-control" >
                            <option value="all">All</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
              </select>
              </div>
            </div> */}
            <DataTable
                    columns={col}
                    data={filteredData}
                    fixedHeader
                    pagination
                    customStyles={tableCustomStyles}
                    className="mt-4"
                    progressPending={pending}
                    progressComponent={<Ellipsis  size={64}
                    color='#D60A0B'
                    sizeUnit='px' />} 
            >
              </DataTable>
          </div>
    )
}

