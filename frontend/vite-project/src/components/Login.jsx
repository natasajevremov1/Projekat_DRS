import { useState } from "react";
import "../CSS/Login.css";
import axios from "axios";

function Login(){
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [errorMessage,setErrorMessage]=useState("");

  function handleSubmit(e){
    e.preventDefault();
    if(username=="" || password==""){
        setErrorMessage("Sva polja moraju biti popunjena ");
    }else{
        setErrorMessage("");
    }
    axios.post("http://127.0.0.1:5000/login",{
        username,
        password
    })
    .then(res=>{
        alert(res.data.message);
    })
    .catch(err=>{
       if(err.response){
        alert(err.response.data.message);
       }else{
            console.error(err);
       }
    })
  }
  return(
    <form className="login-grup" onSubmit={handleSubmit}>
        <div >
            <h1>Login stranica</h1>
            <div className="form-group">
                <label>Korisnicko ime:</label>
                <input type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                ></input>

            </div>
            <div className="form-group">
                <label>Lozinka:</label>
                <input type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                ></input>
            </div>
            <button type="submit">Prijavi se</button>
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    </form>

  )

}
export default Login;

