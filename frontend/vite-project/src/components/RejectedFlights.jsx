import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

function RejectedFlights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

    axios.get("http://127.0.0.1:5001/flights/rejected", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setFlights(res.data);
    })
    .catch(err => {
      console.error("Error loading rejected flights:", err);
      setError("Error loading rejected flights");
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-page">
      <Header />

      <div className="content1">
        <div className="admin-container1">
          <h2>Rejected Flights</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}

          {flights.length === 0 && !loading && <p>No rejected flights.</p>}

          {flights.length > 0 && (
            <table border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Flight Name</th>
                  <th>Airline</th>
                  <th>Length (km)</th>
                  <th>Duration (min)</th>
                  <th>Departure</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Created By</th>
                  <th>Ticket Price</th>
                  <th>Action</th>
                </tr>
              </thead>
            <tbody>
  {flights.map(flight => (
    <tr key={flight.id} style={{ backgroundColor: "#ffcccc", cursor: "pointer" }}>
      {/* Tooltip samo na prvom td */}
      <td className="tooltip-cell" data-tooltip={flight.rejection_reason || "No reason provided"}>
        {flight.id}
      </td>
      <td>{flight.flight_name}</td>
      <td>{flight.airline_name}</td>
      <td>{flight.length_of_flight}</td>
      <td>{flight.flight_duration_minutes}</td>
      <td>{new Date(flight.departure_time).toLocaleString()}</td>
      <td>{flight.departure_airport}</td>
      <td>{flight.airport_of_arrival}</td>
      <td>{flight.created_by_id}</td>
      <td>{flight.ticket_price.toFixed(2)}</td>
      <td>
        <Link to={`/flights/rejected/${flight.id}`}>Edit</Link>
      </td>
    </tr>
  ))}
</tbody>
</table>
          )}
        </div>
      </div>
    </div>
  );
}

export default RejectedFlights;
