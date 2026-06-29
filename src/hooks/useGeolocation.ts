import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  error: string | null;
  loading: boolean;
  isFallback: boolean;
}

// Center of Chennai (T Nagar coordinates)
export const CHENNAI_CENTER = {
  latitude: 13.0405,
  longitude: 80.2337
};

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    latitude: CHENNAI_CENTER.latitude,
    longitude: CHENNAI_CENTER.longitude,
    error: null,
    loading: true,
    isFallback: true
  });

  const getPosition = () => {
    if (!navigator.geolocation) {
      setState({
        latitude: CHENNAI_CENTER.latitude,
        longitude: CHENNAI_CENTER.longitude,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        isFallback: true
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          isFallback: false
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permissions blocked. Defaulting to Chennai central.';
        }
        setState({
          latitude: CHENNAI_CENTER.latitude,
          longitude: CHENNAI_CENTER.longitude,
          loading: false,
          error: errorMessage,
          isFallback: true
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    getPosition();
  }, []);

  return { ...state, refresh: getPosition };
}
