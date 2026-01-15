import { useState,useEffect } from "react";
import axios from "axios";
import "../CSS/Login.css";
import { useNavigate } from "react-router-dom";


function EditProfile(){
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [name,setName]=useState("");
    const [lastname,setLastname]=useState("");
    const [dateOfBirth,setDateOfBirth]=useState("");
    const [gender,setGender]=useState("");
    const [country,setCountry]=useState("");
    const [street,setStreet]=useState("");
    const [streetNumber,setStreetNumber]=useState("");
    const [accountBalance,setAccountBalance]=useState("");
    const [loading,setLoading]=useState(false);
    const [errorMessage,setErrorMessage]=useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);


    const navigate=useNavigate();
    useEffect(() => {
    axios.get("http://127.0.0.1:5000/profile", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(res => {
      const u = res.data || {};  // fallback na prazan objekat
        setUsername(u.username);
        setName(u.name);
        setLastname(u.lastname);
        setDateOfBirth(u.dateOfBirth);
        setGender(u.gender);
        setCountry(u.country);
        setStreet(u.street);
        setStreetNumber(u.streetNumber);
        setAccountBalance(u.accountBalance);

        setCurrentImage(u.profile_image); // 👈 OVO JE BITNO
    })
    .catch(err => console.error(err));
}, []);



    function handleSubmit(e){
        e.preventDefault();

        if(!username || !name || !lastname || !dateOfBirth || !gender || !country || !street || !streetNumber){
        setErrorMessage("Sva polja moraju biti popunjena");
        return;
       } else {
        setErrorMessage("");
        setLoading(true);
        }

        
       const formData = new FormData();
formData.append("username", username);
formData.append("name", name);
formData.append("lastname", lastname);
formData.append("dateOfBirth", dateOfBirth);
formData.append("gender", gender);
formData.append("country", country);
formData.append("street", street);
formData.append("streetNumber", streetNumber);
formData.append("accountBalance", accountBalance || 0);

if (profileImage) {
    formData.append("profileImage", profileImage);
}
  // ➕ password samo ako je unesen
        if (password) {
            formData.append("password", password);
        }

 axios.put("http://127.0.0.1:5000/profile", formData, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data"
            }
        })
        .then(res => {
            alert(res.data.message);
            navigate("/"); // ili profile page
        })
        .catch(err => {
            if (err.response) {
                setErrorMessage(err.response.data.message);
            } else {
                console.error(err);
            }
        })
        .finally(() => {
            setLoading(false);
        });

    }  
    return (
    <form className="register-form" onSubmit={handleSubmit}>
        <div>
            <h1>Edit profile</h1>
            <p className="subtitle">Update your personal data</p>

            <div className="register-grid">

                <div className="register-group">
                    <label>Email address:</label>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="register-group">
                    <label>New password (optional):</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <div className="register-group">
                    <label>Name:</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="register-group">
                    <label>Lastname:</label>
                    <input
                        value={lastname}
                        onChange={e => setLastname(e.target.value)}
                    />
                </div>

                <div className="register-group">
                    <label>Date of birth:</label>
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={e => setDateOfBirth(e.target.value)}
                    />
                </div>

                <div className="register-group">
                    <label>Gender:</label>
                    <div className="gender-group">
                        <label>
                            <input
                                type="radio"
                                value="Male"
                                checked={gender === "Male"}
                                onChange={e => setGender(e.target.value)}
                            />
                            Male
                        </label>

                        <label>
                            <input
                                type="radio"
                                value="Female"
                                checked={gender === "Female"}
                                onChange={e => setGender(e.target.value)}
                            />
                            Female
                        </label>
                    </div>
                </div>

                <div className="register-group">
                    <label>Profile image (optional):</label>

                    {currentImage && (
                        <img
                            src={`http://127.0.0.1:5000/uploads/${currentImage}`}
                            alt="Profile"
                            style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "50%",
                                display: "block",
                                marginBottom: "10px"
                            }}
                        />
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setProfileImage(e.target.files[0])}
                    />
                </div>

            </div> {/* 👈 ZATVARA register-grid */}

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
            </button>

            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    </form>
);
}
export default EditProfile;