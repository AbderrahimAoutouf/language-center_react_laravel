import Image from 'react-bootstrap/Image'
import ListGroup from 'react-bootstrap/ListGroup';
import imgStudent from "../../images/parent.png"
import { useState,useEffect } from 'react';
import { UseStateContext } from '../../context/ContextProvider';
import axios from '../../api/axios';
import { useParams } from 'react-router-dom';
import { Modal} from "react-bootstrap"
export default function ParentModal({showModal,handleClose,id}) {
    const { user } = UseStateContext();
    const [parent, setParent] = useState([]);

    useEffect(() => {
        if (showModal && id) { 
        axios.get(`api/parents/${id}`).then((response) => {
            console.log(response.data.data);
            setParent({
                        id: response.data.data.id,
                        nom: response.data.data.nom,
                        prenom: response.data.data.prenom,
                        cin: response.data.data.cin,
                        date_naissance: response.data.data.date_naissance,
                        email: response.data.data.email,
                        sexe: response.data.data.sexe,
                        adresse: response.data.data.adresse,
                        telephone: response.data.data.telephone,
                        nb_enfant_inscrit: response.data.data.nb_enfant_inscrit,
                        enfants: response.data.data.enfants,
                    }
            );
        }
        ).catch((error) => {
            console.log(error);
        });
    }
    }, [showModal, id]);
    const etudiant = {
        id:'1',
        nom: 'Wade7',
        prenom: 'Mzn',
        gender:'Male',
        Fathername:'Mawade7ch',
        Mothername:'Mamzyanch',
        email: 'wade7mzyan@.com',
        telephone: '06 12 34 56 78',
        DateNaissance:'7.7.2020',
        DateEnrol:'25.3.2023',
        class:'2'
      };
   return(
    <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Parent Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
    <div>
        <div className="Container mt-5 w-100">
            <div className="row">
                <div className="col-5">
                    <Image width={"50%"} className="ms-5"  src={imgStudent} roundedCircle>
                        </Image>
                </div>
                <div className="col">
                    <h5>{parent.nom} {parent.prenom}</h5>
                        <p>
                           Descreption
                        </p> 
                        <br /><br />
                        <div className="row">
                            <div className="col-6">
                                 ID Number:
                            </div>
                            <div className="col-6">
                            {parent.id}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                 Last Name:
                            </div>
                            <div className="col-6">
                            {parent.nom}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                 First Name:
                            </div>
                            <div className="col-6">
                            {parent.prenom}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                 Gender:
                            </div>
                            <div className="col-6">
                            {parent.sexe}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                 Email:
                            </div>
                            <div className="col-6">
                            {parent.email}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                 Date of birth:
                            </div>
                            <div className="col-6">
                            {parent.date_naissance}
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-6">
                                    Address:
                                    </div>
                            <div className="col-6">
                            {parent.adresse}
                            </div>
                        </div>
                            <br/>
                        <div className="row">
                            <div className="col-6">
                                    Phone Number:
                            </div>
                            <div className="col-6">
                            {parent.telephone}
                            </div>
                        </div>
                        <br/>
                        <div className="row">
                            <div className="col-6">
                                    Number of children enrolled:
                            </div>
                            <div className="col-6">
                            {parent.nb_enfant_inscrit}
                            </div>
                            </div>
                            <br/>
                        <div className="row">
                            <div className="col-6">
                                    enfants:
                            </div>
                            <div className="col-6">
                            <ListGroup>
                                {parent.enfants?.map((enfant) => (
                                    <ListGroup.Item key={enfant.id}>
                                        {enfant.nom} {enfant.prenom}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            </div>
                            </div>


                </div>
            </div>

        </div>
        <div>
      
    </div>
    </div>
    </Modal.Body>
    <Modal.Footer>
            <button className="btn btn-secondary" onClick={handleClose}>Close</button>
        </Modal.Footer>
    </Modal>
   )
  
   
}