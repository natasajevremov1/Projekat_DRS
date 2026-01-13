import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Link,useNavigate } from "react-router-dom";
import "../CSS/Login.css";


function Header(){

  const navigate=useNavigate();
    
           // localStorage.getItem("token");
     const   role= localStorage.getItem("role");
            console.log(role);
           /* if(res.data.role=="ADMIN"){
                navigate("/admin/users");
            }else if(res.data.role=="MANAGER"){
                navigate("/mainManager");
            }else{
                navigate("/mainUsers");  //Ove putanje nemam jos jer nemam te stranice   
            }*/
        

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
                    <Link to="/admin/users">User table</Link>
                )}
                {role==="MANAGER" && (
                    <>
                    <Link to="/manager">Manager</Link>
                    <Link to="profile">Edit Profile</Link>
                    </>
                    )}
                {role === "USER" && (
                    <>
                    <Link to="/users">User</Link>
                    <Link to="/profile"> Edit Profile</Link>
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