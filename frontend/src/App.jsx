import { useSatellitePositions } from "./hooks/useSatellitePositions";
import Scene from "./components/Scene";
import "./App.css";

function App() {
  // Start with "stations" -- a tiny group (ISS, Tiangong, a couple others)
  // so you can visually confirm correctness before scaling up to hundreds
  // or thousands of objects in "active".
  const { positions, loading, error } = useSatellitePositions("planet");

  if (loading) return <div style={{ color: "white" }}>Loading satellites...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <Scene positions={positions} />
    </div>
  );
}

export default App;