// Centralizing the base URL here...
// TODO : move to env variable or config file for production use
const API_BASE = "http://localhost:5269" ;


export async function fetchSatelliteGroupe(group) {

    const response = await fetch(`${API_BASE}/api/satellites/${group}`);

    if (!response.ok) {
         throw new Error(`Failed to fetch satellite group "${group}": ${response.status}`);
    }

    return response.json();
}