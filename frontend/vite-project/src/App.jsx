import {useState} from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import axios from "axios";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import AdminUsers from "./components/AdminUsers";
import Header from "./components/Header";
import EditProfile from "./components/EditProfile";
import Flights from "./components/Flights";
import FlightsOverview from "./components/FlightsOverview";
import EditFlight from "./components/EditFlight";
import RejectedFlights from "./components/RejectedFlights";


function App(){

return(
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/admin/users" element={<AdminUsers></AdminUsers>}></Route>
        <Route path="/header" element={<Header></Header>}></Route>
        <Route path="/header/profile" element={<EditProfile></EditProfile>}></Route>
        <Route path="/header/flights" element={<Flights></Flights>}></Route>
        <Route path="/header/overview" element={<FlightsOverview></FlightsOverview>}></Route>
        <Route path="/header/approved" element={<FlightsOverview></FlightsOverview>}></Route>
        <Route path="/flights/rejected" element={<RejectedFlights></RejectedFlights>}></Route>
        <Route path="/flights/rejected/:id" element={<EditFlight />} />

    </Routes>
 </BrowserRouter>
)
}
export default App;