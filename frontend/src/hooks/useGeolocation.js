/**
 * useGeolocation — returns the user's real browser GPS coordinates.
 * Falls back gracefully with an error message; never uses hardcoded India defaults.
 */
import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [state, setState] = useState({
    lat: null,
    lon: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({
        ...s,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    const onSuccess = (position) => {
      setState({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
        error: null,
      });
    };

    const onError = (err) => {
      let msg = 'Location access denied.';
      if (err.code === 1) msg = 'Location permission denied. Please allow location access.';
      if (err.code === 2) msg = 'Location unavailable. Check your device GPS.';
      if (err.code === 3) msg = 'Location request timed out.';
      setState(s => ({ ...s, loading: false, error: msg }));
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, []);

  return state;
}
