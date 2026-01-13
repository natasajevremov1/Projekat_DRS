import {useState} from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import axios from "axios";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import AdminUsers from "./components/AdminUsers";
import Header from "./components/Header";
import EditProfile from "./components/EditProfile";


function App(){

return(
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/admin/users" element={<AdminUsers></AdminUsers>}></Route>
        <Route path="/header" element={<Header></Header>}></Route>
        <Route path="/profile" element={<EditProfile></EditProfile>}></Route>
    </Routes>
 </BrowserRouter>
)
}
export default App;