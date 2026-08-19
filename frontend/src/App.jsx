import { useSatellitePositions } from "./hooks/useSatellitePositions";
import {useState} from "react";
import Scene from "./components/Scene";
import "./App.css";

function App() {
  // Start with "stations" -- a tiny group (ISS, Tiangong, a couple others)
  // so you can visually confirm correctness before scaling up to hundreds
  // or thousands of objects in "active".
  const [group, setGroup] = useState("stations");
  const { positions, loading, error } = useSatellitePositions(group);

  return (
  <div>
    <div style={{ position: "absolute", zIndex: 10, padding: "1rem" }}>
      <select value={group} onChange={(e) => setGroup(e.target.value)}>
        <option value="">Select Satellite Group</option>
        <option value="stations">Stations</option>
        <option value="active">Active Satellites</option>
        <option value="planet">Planet Group</option>
      </select>
      {loading && <span style={{ color: "white", marginLeft: "1rem" }}>Loading...</span>}
      {error && <span style={{ color: "red", marginLeft: "1rem" }}>Error: {error}</span>}
    </div>

    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <Scene positions={positions} />
    </div>
  </div>
);
}

export default App;