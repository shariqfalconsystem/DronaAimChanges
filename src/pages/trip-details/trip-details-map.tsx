import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { CircularProgress, Typography } from '@mui/material';
import StartIcon from '../../assets/icons/start-pin.png';
import EndIcon from '../../assets/icons/end-pin.png';
import EventIcon from '../../assets/icons/location-pin.png';

interface LiveTrack {
  latitude: number;
  longitude: number;
}

interface TripDetailsMapProps {
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
  eventLocations: google.maps.LatLngLiteral[];
  highlightedLocationIndex: number | null;
  liveTrackDetails: { vehicleLiveTracks: LiveTrack[] } | null;
  onEventClick: any;
}

const useDirectionsService = () => {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (map) {
      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // Suppress default markers
      });

      setDirectionsService(service);
      setDirectionsRenderer(renderer);
    }
  }, [map]);

  return { directionsService, directionsRenderer };
};

const TripDetailsMap: React.FC<TripDetailsMapProps> = ({
  startLocation,
  endLocation,
  eventLocations,
  highlightedLocationIndex,
  liveTrackDetails,
  onEventClick,
}) => {
  const [mapCenter, setMapCenter] = useState(new google.maps.LatLng(startLocation.lat, startLocation.lng));
  const [zoom, setZoom] = useState(5);
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLng | null>(null);

  const { directionsService, directionsRenderer }: any = useDirectionsService();
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);

  useEffect(() => {
    if (highlightedLocationIndex !== null) {
      const location =
        highlightedLocationIndex === 0
          ? startLocation
          : highlightedLocationIndex === eventLocations.length + 1
          ? endLocation
          : eventLocations[highlightedLocationIndex - 1];
      const newCenter = new google.maps.LatLng(location.lat, location.lng);
      setMapCenter(newCenter);
      setZoom(15);
      setInfoWindowPosition(newCenter);
    }
  }, [highlightedLocationIndex, startLocation, endLocation, eventLocations]);

  const calculateDirections = useCallback(() => {
    if (liveTrackDetails?.vehicleLiveTracks && directionsService && directionsRenderer) {
      const tracks = liveTrackDetails.vehicleLiveTracks;

      if (tracks.length < 2) {
        console.error('Not enough tracking points to create a route');
        return;
      }

      setIsDirectionsLoading(true);

      const origin = new google.maps.LatLng(tracks[tracks.length - 1].latitude, tracks[tracks.length - 1].longitude);
      const destination = new google.maps.LatLng(tracks[0].latitude, tracks[0].longitude);

      // Helper function to calculate distance between two points in meters
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
      };

      const reduceWaypoints = (points: LiveTrack[], maxWaypoints: number) => {
        if (points.length <= maxWaypoints) return points;

        const interval = Math.ceil(points.length / maxWaypoints);
        return points.filter((_, index) => index % interval === 0);
      };

      const reducedTracks = reduceWaypoints(tracks.slice(1, -1), 25);

      // Filter out waypoints that are too close to origin or destination
      const MIN_DISTANCE = 50; // Minimum 50 meters
      const filteredTracks = reducedTracks.filter((track: LiveTrack) => {
        const distToOrigin = getDistance(
          track.latitude,
          track.longitude,
          tracks[tracks.length - 1].latitude,
          tracks[tracks.length - 1].longitude
        );
        const distToDestination = getDistance(track.latitude, track.longitude, tracks[0].latitude, tracks[0].longitude);
        return distToOrigin >= MIN_DISTANCE && distToDestination >= MIN_DISTANCE;
      });

      const waypoints = filteredTracks
        .map((track: LiveTrack) => ({
          location: new google.maps.LatLng(track.latitude, track.longitude),
          stopover: false,
        }))
        .reverse();

      console.log('Filtered waypoints: ', waypoints);

      directionsRenderer?.setDirections({ routes: [] }); // Clear previous routes

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer?.setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
          setIsDirectionsLoading(false);
        }
      );
    } else {
      directionsRenderer?.setDirections({ routes: [] }); // Clear previous routes
    }
  }, [liveTrackDetails, directionsService, directionsRenderer]);

  useEffect(() => {
    calculateDirections();
  }, [calculateDirections]);

  const handleMarkerClick = (event: any, index: any) => {
    onEventClick(event, index);
  };

  const markers = useMemo(() => {
    const startMarker = (
      <AdvancedMarker key="start" position={new google.maps.LatLng(startLocation?.lat, startLocation?.lng)}>
        <img src={StartIcon} width={40} height={40} alt="Start Location" />
      </AdvancedMarker>
    );

    const endMarker = (
      <AdvancedMarker key="end" position={new google.maps.LatLng(endLocation?.lat, endLocation?.lng)}>
        <img src={EndIcon} width={40} height={40} alt="End Location" />
      </AdvancedMarker>
    );

    const eventMarkers = eventLocations.map((location, index) => {
      return (
        <AdvancedMarker
          key={index}
          position={new google.maps.LatLng(location.lat, location.lng)}
          onClick={() => handleMarkerClick(location, index)}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={EventIcon}
              width={50}
              height={50}
              style={{
                borderRadius: '50%',
                border: highlightedLocationIndex === index ? '3px solid blue' : 'none',
              }}
            />
          </div>
        </AdvancedMarker>
      );
    });

    return [startMarker, ...eventMarkers, endMarker];
  }, [
    startLocation?.lat,
    startLocation?.lng,
    endLocation?.lat,
    endLocation?.lng,
    eventLocations,
    highlightedLocationIndex,
    handleMarkerClick,
  ]);

  const handleCameraChange = useCallback((event: any) => {
    const { center, zoom } = event.detail;
    setMapCenter(center);
    setZoom(zoom);
  }, []);

  return (
    <Map
      center={mapCenter}
      zoom={zoom}
      style={{ width: '100%', height: '300px', marginBottom: '20px' }}
      gestureHandling="greedy"
      disableDefaultUI={true}
      onCameraChanged={handleCameraChange}
      mapId="d4c5cb7dcfc885fe"
    >
      {markers}

      {isDirectionsLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Calculating Route...
            </Typography>
          </div>
        </div>
      )}
    </Map>
  );
};

export default TripDetailsMap;
