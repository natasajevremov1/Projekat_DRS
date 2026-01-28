import { useState, useEffect } from "react";
import Header from "./Header";
import axios from "axios";
import io from "socket.io-client";

function FlightsOverview() {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const role=localStorage.getItem("role");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

      const url = role === "ADMIN"
    ? "http://127.0.0.1:5001/header/overview"
    : "http://127.0.0.1:5001/flights/approved"; // korisnici i menadžeri
    // POSTOJEĆA RUTA → za sada koristimo overview, kasnije možeš dodati user-flights
    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        // Ako korisnik nije ADMIN, filtriraj samo APPROVED letove
        if (role === "USER" || role === "MANAGER") {
          setFlights(res.data.filter(f => f.status === "approved"));
        } else {
          setFlights(res.data);
        }
      })
      .catch(err => {
        if (err.response?.status === 403) {
          setError("You don't have permission. You're not an admin.");
        } else {
          setError("Error loading flights");
        }
      })
      .finally(() => setLoading(false));

    const socket = io("http://127.0.0.1:5001");

    // Real-time dodavanje novih letova
    socket.on("new-flight", (newFlight) => {
      if (role === "ADMIN") {
        setFlights(prev => [newFlight, ...prev]);
      } else if (newFlight.status === "approved") {
        setFlights(prev => [newFlight, ...prev]);
      }
    });

    socket.on("flight-rejected", (flightInfo) => {
      alert(`Flight "${flightInfo.flight_name}" was rejected.\nReason: ${flightInfo.reason}`);
      setFlights(prev => prev.filter(f => f.id !== flightInfo.id));
    });

    socket.on("flight-approved", (flightInfo) => {
      setFlights(prev =>
        prev.map(f =>
          f.id === flightInfo.id ? { ...f, status: "approved" } : f
        )
      );
    });

    return () => socket.disconnect();
  }, [role]);

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.post(
        `http://127.0.0.1:5001/header/accept/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFlights(prev =>
        prev.map(f =>
          f.id === id ? { ...f, status: "approved" } : f
        )
      );
    } catch {
      alert("Error approving flight");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      await axios.post(
        `http://127.0.0.1:5001/header/reject/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFlights(prev => prev.filter(f => f.id !== id));
    } catch {
      alert("Error rejecting flight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page">
      <Header />

      <div className="content1">
        <div className="admin-container1">
          <h2>Flights Overview</h2>
          {error && <p className="error">{error}</p>}

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
                {role === "ADMIN" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.flight_name}</td>
                  <td>{f.airline_name}</td>
                  <td>{f.length_of_flight}</td>
                  <td>{f.flight_duration_minutes}</td>
                  <td>{new Date(f.departure_time).toLocaleString()}</td>
                  <td>{f.departure_airport}</td>
                  <td>{f.airport_of_arrival}</td>
                  <td>{f.created_by_id}</td>
                  <td>{f.ticket_price.toFixed(2)}</td>

                  <td>
                    {role === "ADMIN" && (
                      <>
                        {f.status === "pending" && (
                          <>
                            <button onClick={() => handleAccept(f.id)} disabled={loading}>
                              Accept
                            </button>
                            <button onClick={() => handleReject(f.id)} disabled={loading}>
                              Reject
                            </button>
                          </>
                        )}

                        {f.status === "approved" && (
                          <>
                            <span>✔ Approved </span>
                            <button onClick={() => handleCancel(f.id)} disabled={loading}>
                              Cancel
                            </button>
                          </>
                        )}

                        {f.status === "rejected" && <span>❌ Rejected</span>}
                        {f.status === "cancelled" && <span>⚠ Cancelled</span>}
                      </>
                    )}

                    {(role === "USER" || role === "MANAGER")  && (
                        <>
                        {f.status === "rejected"  && (
                            <Link to={`/header/edit-flight/${f.id}`}>
                                Edit after rejection
                            </Link>
                        )}
                         
                        </>
                    )
                    }
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

export default FlightsOverview;
