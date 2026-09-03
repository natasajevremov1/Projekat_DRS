import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "./Header";
import CreatableSelect from "react-select/creatable";
// import CSS za ceo layout i forme
import "../CSS/global.css";   // osnovni globalni stilovi (boje, fontovi, spacing)
import "../CSS/admin.css";    // stilovi za admin stranice i forme (tablice, grid, buttons)
import { api,flightsApi } from "../api";

function EditFlight() {
  const { id } = useParams(); // id leta iz URL-a
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [airlines,setAirlines]=useState([]);
  const [formData, setFormData] = useState({
    flight_name: "",
    airline_id: "",
    length_of_flight: "",
    flight_duration_minutes: "",
    departure_time: "",
    departure_airport: "",
    airport_of_arrival: "",
    ticket_price: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {

    flightsApi.get(`/flights/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setFlight(res.data);
      setFormData({
        flight_name: res.data.flight_name,
        airline_id: res.data.airline_id,
        length_of_flight: res.data.length_of_flight,
        flight_duration_minutes: res.data.flight_duration_minutes,
        departure_time: res.data.departure_time,
        departure_airport: res.data.departure_airport,
        airport_of_arrival: res.data.airport_of_arrival,
        ticket_price: res.data.ticket_price
      });
      setSelectedAirline({
        value:res.data.airline_id,
        label:res.data.airline_name
      });
    })
    .catch(err => setError("Error loading flight"))
    .finally(() => setLoading(false));
  }, [id]);

  useEffect(()=>{
    flightsApi.get(`/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res =>{
        const options = res.data.map(a => ({ value: a.id, label: a.name }));
        setAirlines(options);
      })
      .catch(err => console.error(err));
  },[]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
   
    try {
      let airlineId;

      if (!selectedAirline) {
                alert("Please select or type an airline");
                setLoading(false);
                return;
            }

      if(selectedAirline.__isNew__){

          const resAirline = await flightsApi.post(
              `/companies`,
              {name:selectedAirline.label.trim()},
              {headers: {Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'}}
          );

          airlineId = resAirline.data.id;

          const updatedAirlines = await flightsApi.get(
              `/companies`,
              {headers: { Authorization: `Bearer ${token}`}}
          );
          
          const options = updatedAirlines.data.map(a=> ({value: a.id, label:a.name}));
          setAirlines(options);
      }else{
        airlineId = selectedAirline.value;
      }

      await flightsApi.put(`/flights/${id}`, 
        {...formData, airline_id: airlineId}, 
        {headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/header/approved"); // vrati se na listu letova
    } catch {
      setError("Error updating flight");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="header-form">
        <Header />
      </div>

      <div className="register-form">
        <h1>Edit Flight</h1>
        <p className="subtitle">Update flight details</p>

        {flight.status === "rejected" && (
          <div className="error" style={{textAlign: "center", marginBottom: "15px"}}>
            ❌ Rejected by Admin: {flight.rejection_reason}
          </div>
        )}

        <div className="register-grid">
          <div className="register-group">
            <label>Flight Name</label>
            <input
              type="text"
              name="flight_name"
              value={formData.flight_name}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
             <label>Airline Name</label>
              <CreatableSelect
                isClearable
                value={selectedAirline}
                onChange={setSelectedAirline}
                options={airlines}
                placeholder= "Select or type airline"
              />
          </div>

          <div className="register-group">
            <label>Length of Flight</label>
            <input
              type="number"
              name="length_of_flight"
              value={formData.length_of_flight}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
            <label>Flight Duration Minutes</label>
            <input
              type="number"
              name="flight_duration_minutes"
              value={formData.flight_duration_minutes}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
            <label>Departure Time</label>
            <input
              type="datetime-local"
              name="departure_time"
              value={formData.departure_time}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
            <label>Departure Airport</label>
            <input
              type="text"
              name="departure_airport"
              value={formData.departure_airport}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
            <label>Airport of Arrival</label>
            <input
              type="text"
              name="airport_of_arrival"
              value={formData.airport_of_arrival}
              onChange={handleChange}
            />
          </div>

          <div className="register-group">
            <label>Ticket Price</label>
            <input
              type="number"
              name="ticket_price"
              step="0.01"
              value={formData.ticket_price}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          Save & Resubmit
        </button>
      </div>
    </form>
  );
}

export default EditFlight;
