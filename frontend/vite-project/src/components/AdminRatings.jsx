import { useEffect, useState } from "react";
import Header from "./Header";
import { flightsApi } from "../api";

function AdminRatings() {
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    setLoading(true);
    flightsApi
      .get("/admin/ratings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRatings(res.data))
      .catch((e) => setError(e?.response?.data?.message || "Error loading ratings"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-page">
      <Header />

      <div className="content1">
        <div className="admin-container1">
          <h2>User Flight Ratings</h2>
          {error && <p className="error">{error}</p>}

          <table border="1">
            <thead>
              <tr>
                <th>User</th>
                <th>Flight</th>
                <th>Airline</th>
                <th>Rating</th>
                <th>Rated At</th>
              </tr>
            </thead>
            <tbody>
              {ratings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    {loading ? "Loading..." : "No ratings yet."}
                  </td>
                </tr>
              ) : (
                ratings.map((r, idx) => (
                  <tr key={`${r.user_id}-${r.flight_id}-${idx}`}>
                    <td>{r.user_email || r.user_id}</td>
                    <td>{r.flight_name || r.flight_id}</td>
                    <td>{r.airline_name || ""}</td>
                    <td>{r.rating} ⭐</td>
                    <td>{r.rated_at || ""}</td>
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

export default AdminRatings;
