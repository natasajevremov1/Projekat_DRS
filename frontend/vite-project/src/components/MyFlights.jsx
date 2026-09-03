import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";

function MyFlights() {
  const [myFlights, setMyFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const load = async () => {
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:5001/user/myflights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyFlights(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Error loading your flights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRate = async (flightId, rating) => {
    if (!rating) return;
    setLoading(true);
    try {
      await axios.post(
        `http://127.0.0.1:5001/user/rate/${flightId}`,
        { rating: parseInt(rating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Error saving rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page">
      <Header />

      <div className="content1">
        <div className="admin-container1">
          <h2>My Flights</h2>
          {error && <p className="error">{error}</p>}

          <table border="1">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Airline</th>
                <th>Departure</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Purchased</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {myFlights.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    {loading ? "Loading..." : "No purchased flights yet."}
                  </td>
                </tr>
              ) : (
                myFlights.map((p) => (
                  <tr key={p.purchase_id}>
                    <td>{p.flight.flight_name}</td>
                    <td>{p.flight.airline_name || "Unknown"}</td>
                    <td>{p.flight.departure_time}</td>
                    <td>{p.flight.departure_airport}</td>
                    <td>{p.flight.airport_of_arrival}</td>
                    <td>
                      {p.flight.arrival_state} / {p.flight.status}
                    </td>
                    <td>{p.purchased_at}</td>
                    <td>
                      {p.rating ? (
                        <span>
                          {p.rating} ⭐ {p.rated_at ? `(${p.rated_at})` : ""}
                        </span>
                      ) : p.flight.arrival_state === "finished" ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <select
                            defaultValue={""}
                            onChange={(e) => handleRate(p.flight.id, e.target.value)}
                            disabled={loading}
                          >
                            <option value="" disabled>
                              Rate (1-5)
                            </option>
                            {[1, 2, 3, 4, 5].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span>Available after finish</span>
                      )}
                    </td>
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

export default MyFlights;
