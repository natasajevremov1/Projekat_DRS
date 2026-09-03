import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../CSS/global.css";
import "../CSS/auth.css";
import { api } from "../api";
function EditProfile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // --- Load user profile on mount ---
  useEffect(() => {
    api
      .get("/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const u = res.data;
        setUsername(u.username || "");
        setName(u.name || "");
        setLastname(u.lastname || "");
        setDateOfBirth(u.dateOfBirth || "");
        setGender(u.gender || "");
        setCountry(u.country || "");
        setStreet(u.street || "");
        setStreetNumber(u.streetNumber || "");
        setAccountBalance(u.accountBalance || "");
        setCurrentImage(u.profileImage || null); // 👈 Show current image
      })
      .catch((err) => console.error(err));
  }, []);

  // --- Handle form submit ---
  function handleSubmit(e) {
    e.preventDefault();

    if (!username || !name || !lastname || !dateOfBirth || !gender || !country || !street || !streetNumber) {
      setErrorMessage("Sva polja moraju biti popunjena");
      return;
    }

    setErrorMessage("");
    setLoading(true);

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
    if (password) {
      formData.append("password", password);
    }

    api
      .put("/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        alert(res.data.message);
        navigate("/"); // redirect to home or profile page
      })
      .catch((err) => {
        if (err.response) setErrorMessage(err.response.data.message);
        else console.error(err);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="main-page">
      <Header />
      <div className="content">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>Edit profile</h1>
          <p className="subtitle">Update your personal data</p>

<div className="register-grid">
  <div className="register-group">
    <label>Email address:</label>
    <input value={username} onChange={(e) => setUsername(e.target.value)} />
  </div>

  <div className="register-group">
    <label>New password (optional):</label>
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Name:</label>
    <input value={name} onChange={(e) => setName(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Lastname:</label>
    <input value={lastname} onChange={(e) => setLastname(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Date of birth:</label>
    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Gender:</label>
    <div className="gender-group">
      <label>
        <input type="radio" value="Male" checked={gender === "Male"} onChange={(e) => setGender(e.target.value)} /> Male
      </label>
      <label>
        <input type="radio" value="Female" checked={gender === "Female"} onChange={(e) => setGender(e.target.value)} /> Female
      </label>
    </div>
  </div>

  <div className="register-group">
    <label>Country:</label>
    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Street:</label>
    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Street number:</label>
    <input type="text" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Account balance:</label>
    <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
  </div>

  <div className="register-group">
    <label>Profile image (optional):</label>
    {currentImage && typeof currentImage === "string" && (
      <div>
        <img
          src={currentImage.startsWith("blob:") ? currentImage : `http://127.0.0.1:5000/uploads/${currentImage.split("\\").pop()}`}
          alt="Profile"
          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", marginBottom: "10px" }}
        />
      </div>
    )}
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        if (file) setCurrentImage(URL.createObjectURL(file));
      }}
    />
  </div>
</div>


          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
