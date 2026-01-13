import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import EditProfile from "./EditProfile";

function AdminUsers(){
    const [users, setUsers]=useState([]);
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);

    const token=localStorage.getItem("token");
    const fetchUsers=()=>{
        
   

        axios.get("http://127.0.0.1:5000/admin/users",{
             headers:{
               Authorization: `Bearer ${token}`
            }
        })
        .then(res=>{
            console.log(res.data);
            setUsers(res.data);
        })
        .catch(err=>{
            if(err.response?.status===403){
                setError("You don't have permission.You're not an admin.");
            }else{
                setError("Error loading users");
            }
        });
   
    };
    useEffect(()=>{fetchUsers();},[]);

    const handleRoleChange = (id,newRole)=>{
        setUsers(prev=>prev.map(u=>u.id === id? {...u,role:newRole}:u));
    };
    const updateRole=(id,role)=>{
        setLoading(true);
        axios.put(`http://127.0.0.1:5000/admin/users/${id}`,{role},
            {headers:{Authorization: `Bearer ${token}`}
        })
        .then(res=>{
            alert("Role updated successfully!");
            fetchUsers();
        })
        .catch(err=> alert("Error updating role"))
        .finally(()=>setLoading(false));
    };

   const deleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);

    axios.delete(`http://127.0.0.1:5000/admin/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        alert("User successfully deleted!");
        // ukloni korisnika iz liste odmah, bez ponovnog fetch-a
        setUsers(prev => prev.filter(u => u.id !== id));
    })
    .catch(err => {
        console.error(err); // vidi šta tačno vraća server
        alert("Error deleting user!");
    })
    .finally(() => setLoading(false));
};

return (
    <div className="main-page">
      {/* Header / meni ide ovde, izvan admin-container */}
      <Header />

      <div className="content">
        <div className="admin-container">
          <h2>Users List</h2>
          {error && <p className="error">{error}</p>}

          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role !== "ADMIN")
                .map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value)
                        }
                      >
                        <option value="MANAGER">MANAGER</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => updateRole(u.id, u.role)}
                        disabled={loading}
                      >
                        Update
                      </button>
                      <button
                      onClick={()=>deleteUser(u.id)}
                      disabled={loading}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;