import {useState} from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import axios from "axios";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import AdminUsers from "./components/AdminUsers";

function App(){

return(
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/admin/users" element={<AdminUsers></AdminUsers>}></Route>
    </Routes>
 </BrowserRouter>
)
}
export default App;