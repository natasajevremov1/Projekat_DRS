import { useState } from "react";
import Header from "./Header";
import axios from "axios";


function Flights(){
    const [flight_name,SetFlightsName]=useState("");
    const [airline_name,SetAirlineName]=useState("");
    const [length_of_flight,SetLengthOfFlight]=useState("");
    const [flight_duration_minutes,SetFlightDuration]=useState("");
    const [departure_time,SetDepartureTime]=useState("");
    const [departure_airport,SetDepartureAir]=useState("");
    const [airport_of_arrival,SetAirportOfArrival]=useState("");
    const [ticket_price,SetTicketPrice]=useState("");
    const [errorMessage,setErrorMessage]=useState("");
    const [loading,setLoading]=useState(false);

    function handleSubmit(e){
        e.preventDefault();  //da se ne refreshuje odmah
        if(!flight_name || ! airline_name || !length_of_flight || !flight_duration_minutes || !departure_airport
            || ! departure_time || ! airport_of_arrival || !ticket_price
        ){
            setErrorMessage("All fileds must be filled");
            return;
        }else{
            setErrorMessage("");
            setLoading(true);
        }

        axios.post("http://127.0.0.1:5001/header/flights",{
            flight_name,
            airline_name,
            length_of_flight,
            flight_duration_minutes,
            departure_time,
            departure_airport,
            airport_of_arrival,
            ticket_price     
        },{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(res=>{
            alert(res.data.message);
            SetFlightsName("");
            SetAirlineName("");
            SetLengthOfFlight("");
            SetFlightDuration("");
            SetDepartureTime("");
            SetDepartureAir("");
            SetAirportOfArrival("");
            SetTicketPrice("");
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
       <form onSubmit={handleSubmit}>
        <div className="header-form">
            <Header></Header>
        </div>
        <div className="register-form">
            <h1>New Flights</h1>
            <p className="subtitle">Create new flight</p>
            <div className="register-grid">
                <div className="register-group">
                    <label>Flight Name</label>
                    <input type="text"
                    value={flight_name}
                    onChange={(e)=>SetFlightsName(e.target.value)}></input>
                </div>
                <div className=" register-group">
                    <label>Airline Name</label>
                    <input type="text"
                    value={airline_name}
                    onChange={(e)=>SetAirlineName(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Length Of Flight</label>
                    <input type="number"
                    value={length_of_flight}
                    onChange={(e)=>SetLengthOfFlight(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Flight Duration Minutes</label>
                    <input type="number"
                    value={flight_duration_minutes}
                    onChange={(e)=>SetFlightDuration(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Departure Time</label>
                    <input type="datetime-local"
                    value={departure_time}
                    onChange={(e)=>SetDepartureTime(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Departure Airport</label>
                    <input type="text"
                    value={departure_airport}
                    onChange={(e)=>SetDepartureAir(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Airport Of Arrival</label>
                    <input  type="text"
                    value={airport_of_arrival}
                    onChange={(e)=>SetAirportOfArrival(e.target.value)}></input>
                </div>
                <div className="register-group">
                    <label>Ticket Price</label>
                    <input type="number"
                    value={ticket_price}
                    onChange={(e)=>SetTicketPrice(e.target.value)}></input>
                </div>
                </div>
                <button type="submit" disabled={loading}>Create</button>
                {errorMessage && <p className="error">{errorMessage}</p>}

            
        </div>
       </form>
       
        

    )

}
export default Flights;