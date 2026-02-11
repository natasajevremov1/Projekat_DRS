import { useState, useEffect } from "react";
import Header from "./Header";
import io from "socket.io-client";
import Countdown from "react-countdown";
import Select from "react-select/creatable";
import "../CSS/admin.css";
import { api,flightsApi } from "../api";

function FlightsOverview() {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [airlines, setAirlines] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

    const url =
      role === "ADMIN"
        ? "/header/overview"
        : "/flights/approved";

    flightsApi
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (role === "USER" || role === "MANAGER") {
          setFlights(res.data.filter(f => f.status === "approved" || f.status === "cancelled"));
        } else {
          setFlights(res.data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setError("You don't have permission. You're not an admin.");
        } else {
          setError("Error loading flights");
        }
      })
      .finally(() => setLoading(false));

    flightsApi
      .get("/companies", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const options = res.data.map((a) => ({ value: a.id, label: a.name }));
        setAirlines(options);
      })
      .catch(err => console.log(err));

    const socket = io(flightsApi.defaults.baseURL, { transports: ["polling", "websocket"] });

    socket.on("new-flight", (newFlight) => {
      if (role === "ADMIN") setFlights(prev => [newFlight, ...prev]);
      else if (newFlight.status === "approved") setFlights(prev => [newFlight, ...prev]);
    });

    socket.on("flight-rejected", (flightInfo) => {
      alert(`Flight "${flightInfo.flight_name}" was rejected.\nReason: ${flightInfo.reason}`);
      setFlights(prev => prev.filter(f => f.id !== flightInfo.id));
    });

    socket.on("flight-approved", (flightInfo) => {
      setFlights(prev =>
        prev.map(f => f.id === flightInfo.id ? { ...f, status: "approved" } : f)
      );
    });

    socket.on("flight-cancelled", (flightInfo) => {
      setFlights(prev =>
        prev.map(f => f.id === flightInfo.id ? { ...f, status: "cancelled" } : f)
      );
    });

    socket.on("flight_update", (updatedFlight) => {
      setFlights(prevFlights => {
        const index = prevFlights.findIndex(f => f.id === updatedFlight.id);
        if (index !== -1) {
          const newFlights = [...prevFlights];
          newFlights[index] = { ...newFlights[index], ...updatedFlight };
          return newFlights;
        } else {
          return [...prevFlights, updatedFlight];
        }
      });
    });

    return () => socket.disconnect();
  }, [role]);

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await flightsApi.post(`/header/accept/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFlights(prev => prev.map(f => f.id === id ? { ...f, status: "approved" } : f));
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
      await flightsApi.post(`/header/reject/${id}`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      setFlights(prev => prev.filter(f => f.id !== id));
    } catch {
      alert("Error rejecting flight");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await flightsApi.post(`/header/cancel/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFlights(prev => prev.map(f => f.id === id ? { ...f, status: "cancelled" } : f));
    } catch {
      alert("Error cancelling flight");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this flight?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await flightsApi.delete(`/header/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setFlights(prev => prev.filter(f => f.id !== id));
    } catch {
      alert("Error deleting flight");
    } finally {
      setLoading(false);
    }
  };

  function FlightCountdown({ arrival_time }) {
    const render = ({ hours, minutes, seconds, completed }) => {
      if (completed) return <span>Arrived</span>;
      return (
        <span>
          {hours.toString().padStart(2, "0")}:
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </span>
      );
    };
    return <Countdown date={new Date(arrival_time)} renderer={render} />;
  }

  const filteredFlights = flights.filter(flight => {
    const matchesName = flight.flight_name.toLowerCase().includes(search.toLowerCase());
    const matchesAirline = !selectedAirline || flight.airline_id === selectedAirline.value;
    return matchesName && matchesAirline;
  });

  const visibleFlights = filteredFlights.filter(flight => flight.arrival_state === activeTab);

  const customStyles = {
    control: (provided) => ({ ...provided, backgroundColor: "white", color: "black" }),
    singleValue: (provided) => ({ ...provided, color: "black" }),
    menu: (provided) => ({ ...provided, backgroundColor: "white" }),
    option: (provided, state) => ({
      ...provided,
      color: "black",
      backgroundColor: state.isFocused ? "#eee" : "white",
    }),
  };

  return (
    <div className="main-page">
      <Header />
      <div className="content1">
        <div className="admin-container1">
          <h2>Flights Overview</h2>
          {error && <p className="error">{error}</p>}
          <div className="input-wrapper">
            <input type="text" placeholder="Search flights" value={search} onChange={e => setSearch(e.target.value)} />
            <Select styles={customStyles} isClearable placeholder="Select airline" value={selectedAirline} onChange={setSelectedAirline} options={airlines} />
          </div>
          <div className="tabs">
            <button onClick={() => setActiveTab("upcoming")}>Upcoming</button>
            <button onClick={() => setActiveTab("in_progress")}>In Progress</button>
            <button onClick={() => setActiveTab("finished")}>Finished</button>
          </div>
          <table>
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
                {role === "ADMIN" && <th>Created By</th>}
                <th>Ticket Price</th>
                {activeTab === "in_progress" && <th>Timer</th>}
                {role === "ADMIN" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {visibleFlights.length === 0 ? (
                <tr>
                  <td colSpan={role === "ADMIN" ? 11 : 9} style={{ textAlign: "center" }}>
                    No flights found.
                  </td>
                </tr>
              ) : (
                visibleFlights.map(f => (
                  <tr key={f.id} style={{ backgroundColor: f.status === "cancelled" ? "rgba(255,0,0,0.2)" : undefined }}>
                    <td>{f.id}</td>
                    <td>{f.flight_name}</td>
                    <td>{f.airline_name || "Unknown"}</td>
                    <td>{f.length_of_flight}</td>
                    <td>{f.flight_duration_minutes}</td>
                    <td>{new Date(f.departure_time).toLocaleString()}</td>
                    <td>{f.departure_airport}</td>
                    <td>{f.airport_of_arrival}</td>
                    {role === "ADMIN" && <td>{f.created_by_id}</td>}
                    <td>{f.ticket_price.toFixed(2)}</td>
                    {f.arrival_state === "in_progress" && <td><FlightCountdown arrival_time={f.arrival_time} /></td>}
                    {role === "ADMIN" && (
                      <td>
                        {f.status === "pending" && (
                          <>
                            <button onClick={() => handleAccept(f.id)} disabled={loading}>Accept</button>
                            <button onClick={() => handleReject(f.id)} disabled={loading}>Reject</button>
                          </>
                        )}

                        {f.status === "approved" && (
                          <>
                            {(f.arrival_state === "upcoming" || f.arrival_state === "in_progress") && (
                              <button onClick={() => handleDelete(f.id)} disabled={loading} style={{ marginLeft: "5px", backgroundColor: "red", color: "white" }}>Delete</button>
                            )}
                            {f.arrival_state === "upcoming" && (
                              <button onClick={() => handleCancel(f.id)} disabled={loading} style={{ marginLeft: "5px" }}>Cancel</button>
                            )}
                          </>
                        )}

                        {f.status === "rejected" && <span>❌ Rejected</span>}
                        {f.status === "cancelled" && <span>⚠ Cancelled</span>}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FlightsOverview;