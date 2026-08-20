import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ geometry, title = 'Listing Location', location = '', country = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check valid coordinates [lng, lat]
    const coordinates = geometry?.coordinates;
    const hasValidCoords =
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      !isNaN(coordinates[0]) &&
      !isNaN(coordinates[1]);

    const latitude = hasValidCoords ? coordinates[1] : 28.6139; // Default fallback: New Delhi
    const longitude = hasValidCoords ? coordinates[0] : 77.2090;

    // Clean up previous instance if already mounted
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom Red Pin Marker
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #dc3545; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <h4 style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #222;">${title}</h4>
        <p style="margin: 0; font-size: 12px; color: #717171;">${location ? `${location}, ` : ''}${country}</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #dc3545; font-weight: 600;">Exact location provided after booking</p>
      </div>
    `);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geometry, title, location, country]);

  return (
    <div className="w-full">
      <div
        ref={mapContainerRef}
        className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs z-0"
      />
    </div>
  );
}
