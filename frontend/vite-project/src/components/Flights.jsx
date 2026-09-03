import { useState, useEffect } from "react";
import Header from "./Header";
import CreatableSelect from "react-select/creatable";
import "../CSS/global.css";   // osnovni stilovi, fontovi
import "../CSS/auth.css";     // forma i input polja, dugmad, error poruke
import "../CSS/layout.css";   // main-page, meni, header-form
import { api,flightsApi } from "../api";

function Flights(){
    const [flight_name,SetFlightsName]=useState("");
    const [length_of_flight,SetLengthOfFlight]=useState("");
    const [flight_duration_minutes,SetFlightDuration]=useState("");
    const [departure_time,SetDepartureTime]=useState("");
    const [departure_airport,SetDepartureAir]=useState("");
    const [airport_of_arrival,SetAirportOfArrival]=useState("");
    const [ticket_price,SetTicketPrice]=useState("");
    const [errorMessage,setErrorMessage]=useState("");
    const [loading,setLoading]=useState(false);

    const [airlines,setAirlines]=useState([]);
    const [selectedAirline, setSelectedAirline] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(()=>{
        setLoading(true);
        //const token = localStorage.getItem("token");
        console.log("TOKEN 1:", token);
        const role=localStorage.getItem("role");
        if (!token) {
        setErrorMessage("No token found. Please login.");
        setLoading(false);
        return;
        }
        flightsApi.get(`/companies`, {
            headers: { Authorization: `Bearer ${token}` }
         })
         .then(res =>{
            const options = res.data.map(a => ({ value: a.id, label: a.name }));
            setAirlines(options);
         })
         .catch(err => console.error(err));
    },[]);

    const handleSubmit = async (e) => {
        e.preventDefault();  //da se ne refreshuje odmah
        if(!flight_name || !selectedAirline || !length_of_flight || !flight_duration_minutes || !departure_airport
            || ! departure_time || ! airport_of_arrival || !ticket_price
        ){
            setErrorMessage("All fileds must be filled");
            return;
        }else{
            setErrorMessage("");
            setLoading(true);
        }
        
        try{
            let airlineId = selectedAirline.value;

            if(selectedAirline.__isNew__){
                console.log(selectedAirline);
                console.log(token);
                const resAirline = await flightsApi.post(
                    `/companies`,
                    {name:selectedAirline.label.trim()},
                    {headers: {Authorization: `Bearer ${token}`,
                             'Content-Type': 'application/json'}}
                );

                airlineId = resAirline.data.id;

                const updatedAirlines = await flightsApi.get(
                    `/companies`,
                    {headers: {Authorization: `Bearer ${token}` }}
                    
                );

                const options = updatedAirlines.data.map(a=> ({value: a.id, label:a.name}));
                setAirlines(options);
            }
            console.log({
                flight_name,
                airline_id: airlineId,
                length_of_flight,
                flight_duration_minutes,
                departure_time,
                departure_airport,
                airport_of_arrival,
                ticket_price
            });

            const resFlight = await flightsApi.post("/header/flights",{
                flight_name,
                airline_id: airlineId,
                length_of_flight: parseInt(length_of_flight),
                flight_duration_minutes: parseInt(flight_duration_minutes),
                departure_time,
                departure_airport,
                airport_of_arrival,
                ticket_price: parseFloat(ticket_price)    
            },{
                headers:{
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            alert(resFlight.data.message);

            SetFlightsName("");
            setSelectedAirline(null);
            SetLengthOfFlight("");
            SetFlightDuration("");
            SetDepartureTime("");
            SetDepartureAir("");
            SetAirportOfArrival("");
            SetTicketPrice("");
        }
        catch(err){
            if(err.response){
                alert(err.response.data.message);
            }else{
                console.error(err);
            }
        }
        finally{
            setLoading(false);
        }

    };



    return(
       <form onSubmit={handleSubmit}>
        <div>
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
                    <CreatableSelect
                        isClearable
                        options={airlines}
                        value={selectedAirline}
                        onChange={setSelectedAirline}
                        placeholder="Select or type airline"
                    />
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
                <button type="submit"/* disabled={loading}*/>Create</button>
                {errorMessage && <p className="error">{errorMessage}</p>}

            
        </div>
       </form>
       
        

    )

}
export default Flights;