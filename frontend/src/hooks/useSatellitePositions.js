import { useState, useEffect, useRef } from 'react';
import * as satellite from 'satellite.js';
import {fetchSatelliteGroupe} from '../api/satellites';

// we use custom hook instead of inline useEffect => Fetching + propagating is a distinct unit of logic that could be reused
export function useSatellitePositions(group, updateInterval = 2000) {
    const [positions, setPositions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
// we store parsed satrecs in a ref to avoid re-render 
    const satrecsRef = useRef([]);

    // Effect 1 : Fetch satellite data when the group changes and parse it into satrecs
    useEffect(() => {
        let cancelled = false; // Flag to track if the component is still mounted
        setLoading(true);
        setError(null);

        fetchSatelliteGroupe(group)
            .then((data) => {
                if (cancelled) return; // If the component is unmounted, do not update state
           // const limited = data.slice(0, 2000); // Limit to first 2000 satellites for testing purposes. Adjust as needed for performance.
                const parsed = data
                .map((omm) => {
                    try {
                        const satrec = satellite.json2satrec(omm);
                        return {satrec, name:omm.OBJECT_NAME, nordId: omm.NORAD_CAT_ID};
                    }catch  {
                        return null; // Skip invalid OMM entries
                }
            })
            .filter(Boolean);

            satrecsRef.current = parsed;
            setLoading(false);
        })
        .catch((err) => {
            if (!cancelled) {
            setError(err.toString());
            setLoading(false);
            } // If the component is unmounted, do not update state

        });
        return () => {
            cancelled = true; // Cleanup function to set the flag when the component unmounts
        };
    }, [group]);

    // Effect 2 : Update positions at regular intervals
    // propagate every stored satrec to "now" and
    // push the resulting lat/lon/alt into state

    useEffect(() => {
        if (loading || error) return; // Do not start the interval if still loading or if there was an error

        const tick = () => {
            const now = new Date();
            const gmst = satellite.gstime(now);

            const next = satrecsRef.current
                .map(({satrec, name, nordId}) => {
                    const pv= satellite.propagate(satrec, now); // returns position and velocity in ECI coordinates pv
                    if (!pv.position)  return null; // Skip if propagation failed

                    const geo = satellite.eciToGeodetic(pv.position, gmst);
                    return {
                        name,
                        nordId,
                        lat: satellite.degreesLat(geo.latitude),
                        lon: satellite.degreesLong(geo.longitude),
                        alt: geo.height,
                    };
                })
                .filter(Boolean); // Remove any null entries

            setPositions(next);
        };
        tick(); // Initial tick to set positions immediately
        const intervalId = setInterval(tick, updateInterval);

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [group, updateInterval]);
    return { positions, loading, error };
                    }