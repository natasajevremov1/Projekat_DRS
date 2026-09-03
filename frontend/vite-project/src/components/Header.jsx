import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Link,useNavigate } from "react-router-dom";
import "../CSS/Login.css";


function Header(){

    const [rejectedCount,setRejectedCount]=useState(0);
    const   role= localStorage.getItem("role");
    useEffect(() => {
    if (role === "MANAGER") {
      const token = localStorage.getItem("token");
      axios.get("http://127.0.0.1:5001/flights/rejected", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setRejectedCount(res.data.length); // postavljamo broj letova na ispravci
      })
      .catch(err => {
        console.log("Error loading rejected flights", err);
      });
    }
  }, [role]);
  const navigate=useNavigate();
    
           
     
            console.log(role);
        

                const handleLogout=()=>{
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/");
                }

    return(
        <div className="main-page">
            <div className="meni">
                <div className="meni-left">
                {role==="ADMIN" && (
                    <>
                     <Link to="/admin/users">User table</Link>
                     <Link to="/header/overview">Overview</Link>
                     <Link to="/admin/ratings">Ratings</Link>
               
                    </>
                    )}
                {role==="MANAGER" && (
                    <>
                    <Link to="/header/profile">Edit Profile</Link>
                    <Link to= "/header/flights">New Flights</Link>
                    <Link to="/header/approved">
                       Flights
                     </Link>
                   <Link to="/flights/rejected" className="notification-bubble">
                      {rejectedCount}
                   </Link>

                    </>
                    )}
                {role === "USER" && (
                    <>
                    <Link to="/users">User</Link>
                    <Link to="/header/profile"> Edit Profile</Link>
                    <Link to="/header/approved">Flights</Link>
                    </>
                )}
                </div>
                <div className="meni-right">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
                
            </div>
           
        </div>

    )
}
export default Header;