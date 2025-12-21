import { useState } from "react";
import axios from "axios";
import "../CSS/Login.css";

function Register(){
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

    function handleSubmit(e){
        e.preventDefault();

        if(!username || !password || !name || !lastname || !dateOfBirth || !gender || !country || !street || !streetNumber){
        setErrorMessage("Sva polja moraju biti popunjena");
        return;
       } else {
        setErrorMessage("");
        setLoading(true);
        }

        
        axios.post("http://127.0.0.1:5000/register",{
            username,
            password,
            name,
            lastname,
            dateOfBirth,
            gender,
            country,
            street,
            streetNumber,
            accountBalance:accountBalance || 0
        })
        .then(res=>{
           alert(res.data.message);
           window.location.href="/login";
        })
        .catch(err=>{
            if(err.response){
                alert(err.response.data.message);
            }else{
                console.error(err);
            }
        })
        .finally(()=>{
        setLoading(false);
        });



    }
    return(
        <form className="register-form" onSubmit={handleSubmit} >
            <div>
                  <h1>Register page</h1>
                  <p className="subtitle">Create your account</p>
                <div className="register-grid"> 
                  <div className="register-group">
                    <label>Email address:</label>
                    <input type="text"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}></input>
                 </div> 
                 <div className="register-group">
                    <label>Password:</label>
                    <input type="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}></input>           
                </div> 
                <div className="register-group">
                    <label>Name:</label>
                    <input type="text"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Lastname:</label>
                    <input type="text"
                    value={lastname}
                    onChange={(e)=>setLastname(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Date Of Birth:</label>
                    <input type="date"
                    value={dateOfBirth}
                    onChange={(e)=>setDateOfBirth(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Gender:</label>
                 <div className="gender-group">
                    <div >
                        <input type="radio"
                        id="male"
                        name="gender"
                        value="Male"
                        checked={gender==="Male"}
                        onChange={(e)=>setGender(e.target.value)}></input>
                        <label htmlFor="male">Male</label>
                    </div>
                    <div>
                        <input type="radio"
                        id="female"
                        name="gender"
                        value="Female"
                        checked={gender==="Female"}
                        onChange={(e)=>setGender(e.target.value)}></input>
                        <label htmlFor="female">Female</label>
                    </div>
                  </div>
                </div>
                <div className="register-group">
                    <label>Country:</label>
                    <input type="text"
                    value={country}
                    onChange={(e)=>setCountry(e.target.value)}></input>
                 </div>
                <div className="register-group">
                   <label>Street:</label> 
                    <input type="text"
                    value={street}
                    onChange={(e)=>setStreet(e.target.value)}></input>           
                </div> 
                <div className="register-group">
                    <label>Street number:</label>
                     <input type="text"
                    value={streetNumber}
                    onChange={(e)=>setStreetNumber(e.target.value)}></input>    
                </div>
                <div className="register-group">
                    <label>Account balance:</label>
                     <input type="number"
                    value={accountBalance}
                    onChange={(e)=>setAccountBalance(e.target.value)}></input>    
                </div>
                </div>
                <button type="submit">Sign up</button>
                {errorMessage && <p className="error">{errorMessage}</p>}
            </div>
        </form>
         
    )
}
export default Register;