import TableFeesEtud from "../components/Composantforstedentsfeespage/TableFeesEtud";
import Nav from 'react-bootstrap/Nav';
import { useState } from "react";
import TableFeesTests from "../components/testFees/index"
export default function PaiementsEtu(){
    const [selectedTab, setSelectedTab] = useState(0);
    console.log(selectedTab);
    return(
        <>
        <div id="tab--nav" className="row w-25 m-3">
        <Nav justify variant="tabs">
                <Nav.Item className="bg-light">
                    <Nav.Link className={!selectedTab ? "bg-info text-light" : "text-dark"} onClick={() => setSelectedTab(0)}>Class Inscriptions</Nav.Link>
                </Nav.Item>
                {/* <Nav.Item className="bg-light">
                    <Nav.Link className={selectedTab ? "bg-info text-light" : "text-dark"}  onClick={() => setSelectedTab(1)}>Test Registration</Nav.Link>
                </Nav.Item> */}
            </Nav>
        </div>
        <div className="Container">
            <div className="row">
            <h2>Earnings</h2>
            {
                !selectedTab ? <TableFeesEtud /> : <></>
            }
            {
                selectedTab ? <TableFeesTests selectedTab={selectedTab} setSelectedTab={setSelectedTab} /> : <></>
            }
            
            </div>
        </div>
        </>
    )
}