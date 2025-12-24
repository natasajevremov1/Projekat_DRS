import { useState } from "react";
import "../CSS/Login.css";
import axios from "axios";
import {Link} from "react-router-dom";

function Login(){
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [errorMessage,setErrorMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const [blocked,setBlocked]=useState(false);
  function handleSubmit(e){
    e.preventDefault();
    if(username=="" || password==""){
        setErrorMessage("Sva polja moraju biti popunjena ");
        return;
    }else{
        setErrorMessage("");
        setLoading(true);
    }
    axios.post("http://127.0.0.1:5000/login",{
        username,
        password
    })
    .then(res=>{
        localStorage.setItem("token",res.data.access_token);
        alert(res.data.message);
    })
    .catch(err=>{
       if(err.response){
        if(err.response){
            if(err.response.status===403){
                setErrorMessage("Nalog je privremeno blokiran.Porusajte kasnije");
                setBlocked(true);
            }else if(err.response.status===401){
                setErrorMessage("Pogresan email ili lozinka");
            }else{
                setErrorMessage("Doslo je do greske.");
            }
        }
       }else{
            console.error(err);
            setErrorMessage("Server nije dostupan");
       }
    })
    .finally(()=>{
        setLoading(false);
    })
  }
  return(
    <form className="login-grup" onSubmit={handleSubmit}>
        <div >
            
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to manage your flights and bookings</p>
            <div className="form-group">
                <label>Email address:</label>
                <input type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                ></input>

            </div>
            <div className="form-group">
                <label>Password:</label>
                <input type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                ></input>
            </div>
            <button type="submit" disabled={blocked}>Sign in</button>
            {loading && <div className="spinner"></div>}

            <div className="register-link">
                Don't have an account?{" "}
                <Link to="/register">Sign up</Link>
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    </form>

  )

}
export default Login;

