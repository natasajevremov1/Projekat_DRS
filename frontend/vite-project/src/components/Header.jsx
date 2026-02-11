import { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
//import "../CSS/Login.css";
import "../CSS/layout.css";  
import "../CSS/global.css";  
import "../CSS/admin.css";   
import {api,flightsApi}  from "../api";

function Header() {
  const [rejectedCount, setRejectedCount] = useState(0);
  const [currentImage, setCurrentImage] = useState(null);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Dohvatanje slike korisnika
    api
      .get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentImage(res.data.profileImage || null);
      })
      .catch((err) => console.error("Error loading profile image:", err));

    // Ako je MANAGER, dohvatiti odbijene letove
    if (role === "MANAGER") {
      api
        .get("/flights/rejected", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setRejectedCount(res.data.length);
        })
        .catch((err) => console.log("Error loading rejected flights", err));
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="main-page">
      <div className="meni">
        <div className="meni-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          {/* Profilna slika levo */}
          {(role === "MANAGER" || role === "USER") && (
          <div className="profile-pic-container">
            <img
              src={
                currentImage
                  ? `http://127.0.0.1:5000/uploads/${currentImage.split("\\").pop()}`
                  : "/default-avatar.png"
              }
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

          )}

          {/* Linkovi */}
          {role === "ADMIN" && (
            <>
              <Link to="/admin/users">User table</Link>
              <Link to="/header/overview">Overview</Link>
            </>
          )}
          {role === "MANAGER" && (
            <>
              <Link to="/header/profile">Edit Profile</Link>
              <Link to="/header/flights">New Flights</Link>
              <Link to="/header/approved">Flights</Link>
              <Link to="/flights/rejected" className="notification-bubble">
                {rejectedCount}
              </Link>
            </>
          )}
          {role === "USER" && (
            <>
              <Link to="/users">User</Link>
              <Link to="/header/profile">Edit Profile</Link>
              <Link to="/header/approved">Flights</Link>
            </>
          )}
        </div>

        <div className="meni-right">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
