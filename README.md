# 🛰️ Satellite Visualizer

A real-time 3D visualization of satellites orbiting Earth, built with a C# backend and a React + Three.js frontend. Orbital positions are computed client-side using real orbital element data (TLE/OMM) from [CelesTrak](https://celestrak.org).

![status](https://img.shields.io/badge/status-in%20progress-yellow)

![screenshot](./docs/SS1.JPG)

## What it does

- Fetches live orbital element sets (OMM/JSON) from CelesTrak for satellite groups (e.g. space stations, active satellites)
- Propagates each satellite's real-time position using the SGP4 algorithm (the same model used in real-world satellite tracking)
- Renders Earth and satellites in an interactive 3D scene you can rotate, zoom, and explore
- Click any satellite to view its details (name, NORAD ID, latitude/longitude, altitude) in a side panel
- Switch between satellite groups on the fly via a dropdown

## Tech stack

**Backend**
- C# / ASP.NET Core (minimal API)
- In-memory caching to avoid hammering CelesTrak's public endpoint
- Fetches and serves orbital element data as JSON

**Frontend**
- React + Vite
- [Three.js](https://threejs.org/) via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) and [`@react-three/drei`](https://github.com/pmndrs/drei)
- [`satellite.js`](https://github.com/shashwatak/satellite-js) for SGP4 orbit propagation (TLE/OMM → real-time position)
- Instanced rendering to efficiently draw hundreds–thousands of satellites in a single draw call

**Data source**
- [CelesTrak](https://celestrak.org) — public orbital element data (GP/OMM format), no API key required

## How it works, briefly

1. The backend fetches orbital element sets (OMM/JSON) from CelesTrak for a requested satellite group and caches the result.
2. The frontend requests this data, then parses each satellite's orbital elements into an SGP4 orbit record using `satellite.js`.
3. On an interval, the app propagates every satellite to the current time, converting its position from Earth-Centered Inertial (ECI) coordinates into latitude/longitude/altitude.
4. Those coordinates are mapped onto a 3D globe and rendered as instanced points, updated live as time progresses.

## Getting started

**Prerequisites:** .NET 8 SDK, Node 18+

```bash
# Backend
cd backend/SatViz.Api
dotnet run

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) once both are running.

## Roadmap / ideas for later

- [ ] Orbit path trails (draw the upcoming/past orbit line, not just current position)
- [ ] Search/filter satellites by name or NORAD ID
- [ ] Ground station / visibility overlay (pass predictions)
- [ ] Persistent disk-based caching for backend (survive restarts during dev)
- [ ] Deploy live demo (frontend + backend hosting)
- [ ] Scale-aware satellite marker sizing (consistent visual size regardless of camera zoom)

## Data attribution

Orbital element data courtesy of [CelesTrak](https://celestrak.org). Please respect their [usage guidelines](https://celestrak.org/NORAD/documentation/) if you fork or extend this project.

## License

MIT
