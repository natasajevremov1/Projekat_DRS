import { useState } from "react";
import "../CSS/Login.css";
import axios from "axios";
import {Link} from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Login(){
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [errorMessage,setErrorMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const [blocked,setBlocked]=useState(false);
  const [remainingTime,setRemainingTime]=useState(0)
  const navigate=useNavigate();
  useEffect(()=>{
    if(!blocked) return;

    const timer=setInterval(()=>{
        setRemainingTime(prev=>{
            if(prev<=1){
                clearInterval(timer);
                setBlocked(false);
                return 0;
            }
            return prev-1;
        });
    },1000);
    return ()=>clearInterval(timer);
  },[blocked]);

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
        localStorage.setItem("role",res.data.role);
        alert(res.data.message);
        navigate("/header");
        
    })
    .catch(err=>{
       if(err.response){
        if(err.response){
            if(err.response.status===403){
                setErrorMessage("Nalog je privremeno blokiran.Porusajte kasnije");
                setBlocked(true);
                setRemainingTime(err.response.data.remaining_seconds);
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
            {blocked && (<p className="error">Pokusajte ponovo za {remainingTime} sekundi</p>)}
        </div>
    </form>

  )

}
export default Login;

