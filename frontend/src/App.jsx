import { useState } from "react";
import { useSatellitePositions } from "./hooks/useSatellitePositions";
import Scene from "./components/Scene";
import "./App.css";

function App() {
  const [group, setGroup] = useState("");
  const [selectedSat, setSelectedSat] = useState(null); 
  const { positions, loading, error } = useSatellitePositions(group);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", zIndex: 10, padding: "1rem" }}>
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Select Satellite Group</option>
          <option value="stations">Stations</option>
          <option value="active">Active Satellites</option>
          <option value="planet">Planet Ris</option>
        </select>
        {loading && <span style={{ color: "white", marginLeft: "1rem" }}>Loading...</span>}
        {error && <span style={{ color: "red", marginLeft: "1rem" }}>Error: {error}</span>}
      </div>

      {/* Side detail panel -- only rendered when something is selected */}
      {selectedSat && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            width: "280px",
            height: "100vh",
            background: "rgba(20, 20, 20, 0.9)",
            color: "white",
            padding: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          <button onClick={() => setSelectedSat(null)} style={{ marginBottom: "1rem" }}>
            ✕ Close
          </button>
          <h2>{selectedSat.name}</h2>
          <p>NORAD ID: {selectedSat.noradId}</p>
          <p>Latitude: {selectedSat.lat.toFixed(2)}°</p>
          <p>Longitude: {selectedSat.lon.toFixed(2)}°</p>
          <p>Altitude: {selectedSat.alt.toFixed(1)} km</p>
        </div>
      )}

      <div style={{ width: "100vw", height: "100vh", background: "black" }}>
        <Scene positions={positions} onSatelliteClick={setSelectedSat} />
      </div>
    </div>
  );
}

export default App;