import { useState, useMemo } from "react";
import { useSatellitePositions } from "./hooks/useSatellitePositions";
import Scene from "./components/Scene";
import "./App.css";

function App() {
  const [group, setGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSat, setSelectedSat] = useState(null);
  const [updateInterval, setUpdateInterval] = useState(2000);

  const { positions, loading, error, findSatrec } = useSatellitePositions(group, updateInterval);

  const filteredPositions = useMemo(() => {
    if (!searchTerm.trim()) return positions;
    const term = searchTerm.toLowerCase();
    return positions.filter(
      (sat) =>
        sat.name?.toLowerCase().includes(term) || String(sat.noradId).includes(term)
    );
  }, [positions, searchTerm]);

  const selectedSatrec = selectedSat ? findSatrec(selectedSat.noradId) : null;

  return (
    <div className="app-root">
      <div className="control-strip">
        <div className="live-indicator">
          <span className="live-indicator__dot" />
          LIVE TRACKING
        </div>

        <div className="control-strip__row">
          <select
            className="control-select"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">Select group</option>
            <option value="stations">Space Stations</option>
            <option value="active">Active Satellites</option>
            <option value="cubesat">Cubesats</option>
            <option value="starlink">Starlink</option>
            <option value="oneweb">OneWeb</option>
            <option value="weather">Weather Satellites</option>
          </select>
        </div>

        <input
          className="control-input"
          type="text"
          placeholder="Search name or NORAD ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="control-strip__row">
  <label className="control-strip__label">Update speed</label>
  <select
    className="control-select"
    value={updateInterval}
    onChange={(e) => setUpdateInterval(Number(e.target.value))}
  >

    <option value={500}>Fast (0.5s)</option>
    <option value={1000}>Normal (1s)</option>
    <option value={2000}>Default (2s)</option>
    <option value={5000}>Slow (5s)</option>
  </select>
</div>

        {loading && <span className="status-text status-text--loading">Loading...</span>}
        {error && <span className="status-text status-text--error">Error: {error}</span>}
      </div>

      {selectedSat && (
        <div className="detail-panel">
          <div className="detail-panel__brackets">
            <span />
            <span />
          </div>

          <button className="detail-panel__close" onClick={() => setSelectedSat(null)}>
            ✕ CLOSE
          </button>

          <div className="detail-panel__title">{selectedSat.name}</div>
          <div className="detail-panel__subtitle">NORAD {selectedSat.noradId}</div>

          <div className="data-row">
            <span className="data-row__label">Latitude</span>
            <span className="data-row__value">{selectedSat.lat.toFixed(2)}°</span>
          </div>
          <div className="data-row">
            <span className="data-row__label">Longitude</span>
            <span className="data-row__value">{selectedSat.lon.toFixed(2)}°</span>
          </div>
          <div className="data-row">
            <span className="data-row__label">Altitude</span>
            <span className="data-row__value">{selectedSat.alt.toFixed(1)} km</span>
          </div>
        </div>
      )}

      <div className="scene-container">
        <Scene
          positions={filteredPositions}
          onSatelliteClick={setSelectedSat}
          selectedSatrec={selectedSatrec}
        />
      </div>
    </div>
  );
}

export default App;