import { useState, useEffect } from "react";
import "../CSS/global.css";
import "../CSS/auth.css";

import { api, flightsApi } from "../api";   // ⬅️ UMESTO axios
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const navigate = useNavigate();

  console.log("API base URL:", import.meta.env.VITE_API_URL);
  console.log("Flights API base URL:", import.meta.env.VITE_FLIGHTS_API_URL);

  useEffect(() => {
    if (!blocked) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setBlocked(false);
          setErrorMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [blocked]);

  function handleSubmit(e) {
    e.preventDefault();

    if (username === "" || password === "") {
      setErrorMessage("All fields are required");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    api
      .post("/login", { username, password })
      .then((res) => {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("role", res.data.role);
        alert(res.data.message);
        navigate("/header");
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 403) {
            setErrorMessage("Account is temporarily blocked. Try again later.");
            setBlocked(true);
            setRemainingTime(err.response.data.remaining_seconds);
          } else if (err.response.status === 401) {
            setErrorMessage("Wrong email or password.");
          } else {
            setErrorMessage("An error occurred.");
          }
        } else {
          console.error(err);
          setErrorMessage("The server is not available.");
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <form className="login-grup" onSubmit={handleSubmit}>
      <div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to manage your flights and bookings</p>

        <div className="form-group">
          <label>Email address:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={blocked}>
          Sign in
        </button>
        {loading && <div className="spinner"></div>}

        <div className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {blocked && (
          <p className="error">
            Please try again in {remainingTime} seconds
          </p>
        )}
      </div>
    </form>
  );
}

export default Login;
