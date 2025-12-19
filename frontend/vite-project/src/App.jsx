import {useState} from "react";

function Login(){

  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [errorMessage,setErrorMessage]=useState("");
   //username->ono sto je upisano u input
   //setUsername->funkcija koja menja to


function handleSubmit(e){
  e.preventDefault();
    if(username=="" || password==""){
      setErrorMessage("Sva polja moraju biti popunjena");
    }else{
      setErrorMessage("");
    }

    fetch("http://127.0.0.1:5000/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({username,password})

    })
    .then(res=>res.json())
    .then(data=>{
      alert(data.message);
    })
    .catch(err=>{
      console.error(err);
    });

}

return(
  <form className="login-form" onSubmit={handleSubmit}>
     <div>
         <h1>Login stranica</h1>
    <div className="form-group">
       <label>Korisnicko ime:</label>
        <input type="text"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}></input>           
    </div>
     <div className="form-group">
      <label>Lozinka:</label>
      <input type="password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}></input>
     </div>
     <button type="submit">Prijavi se</button>
     {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
   
  </form>
)

}

export default Login;