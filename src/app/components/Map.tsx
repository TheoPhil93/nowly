// src/app/components/Map.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map as MapboxMap, Popup, GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- Token Handling ---
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
let isMapboxTokenValid = true;
if (!mapboxToken) {
  console.error("Mapbox Access Token (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) ist nicht gesetzt!");
  isMapboxTokenValid = false;
}
mapboxgl.accessToken = mapboxToken || '';
// --- Ende Token Handling ---


// --- Typdefinitionen ---
export interface Slot {
  id: number | string; // Erlaube String IDs
  lngLat: [number, number]; name: string; type: string; city?: string;
  highlighted?: boolean; subType?: string; address?: string;
}
interface MapProps {
  city: string; slots: Slot[]; onSlotSelect: (id: number | string) => void; // Erlaube String IDs
  selectedSlotId: number | string | null; // Erlaube String IDs
  flyToCoords: [number, number] | null; onMapMoveEnd: () => void;
}

// --- Konstanten ---
const cityCoordinates: Record<string, [number, number]> = {
  'Zürich': [8.5417, 47.3769], 'Berlin': [13.405, 52.52], 'Wien': [16.3738, 48.2082],
};
const colorMap: Record<string, string> = {
  Arzt: '#2563eb', Friseur: '#d97706', Massage: '#16a34a', Gastro: '#dc2626', Default: '#6b7280',
};
const getMarkerColor = (type: string) => colorMap[type] || colorMap.Default;

// --- Komponente ---
const Map: React.FC<MapProps> = ({
  city, slots, onSlotSelect, selectedSlotId, flyToCoords, onMapMoveEnd,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const htmlMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const SOURCE_ID = 'slots-source'; const LAYER_ID_POINTS = 'slots-points';
  const LAYER_ID_BORDER = 'slots-points-border'; const LAYER_ID_CLUSTERS = 'clusters';
  const LAYER_ID_CLUSTER_COUNT = 'cluster-count';

  // Effekt #1: Initialisierung
  useEffect(() => {
    if (!isMapboxTokenValid || !mapContainer.current || mapRef.current) return;
    const currentPopup = popupRef.current; const currentHtmlMarker = htmlMarkerRef.current;
    let map: mapboxgl.Map | null = null;
    console.log("[Map DEBUG] Initializing Mapbox map...");
    try {
        map = new mapboxgl.Map({ container: mapContainer.current, style: 'mapbox://styles/mapbox/light-v11', center: cityCoordinates[city] || cityCoordinates['Zürich'], zoom: 12, attributionControl: false, interactive: true });
        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
        map.on('load', () => {
            console.log("[Map DEBUG] Map 'load' event fired."); setMapLoaded(true);
            // --- Event Listener ---
            map?.on('click', LAYER_ID_POINTS, (e) => {
                if (e.features && e.features.length > 0) {
                    const slotId = e.features[0].properties?.id;
                    if (slotId !== undefined && slotId !== null) onSlotSelect(slotId);
                }
            });
            map?.on('click', LAYER_ID_CLUSTERS, (e) => {
                 if (!e.features || e.features.length === 0) return;
                 const feature = e.features[0]; const clusterId = feature.properties?.cluster_id;
                 const source = map?.getSource(SOURCE_ID) as GeoJSONSource;
                 if (!clusterId || !source || typeof source.getClusterExpansionZoom !== 'function') return;
                 source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err || zoom === null || zoom === undefined) return;
                    // Fix the any type with a proper GeoJSON Point type
                    map?.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom + 0.5 });
                 });
            });
            map?.on('mouseenter', [LAYER_ID_POINTS, LAYER_ID_CLUSTERS], () => { const c = map?.getCanvas(); if(c) c.style.cursor = 'pointer'; });
            map?.on('mouseleave', [LAYER_ID_POINTS, LAYER_ID_CLUSTERS], () => { const c = map?.getCanvas(); if(c) c.style.cursor = ''; });
        });
        map.on('error', (e) => console.error('[Mapbox Error]', e?.error?.message || e));
    } catch (error) { console.error("[Map DEBUG] Error initializing Mapbox map:", error); }
    return () => {
      console.log("[Map DEBUG] Cleaning up map instance.");
      currentPopup?.remove(); currentHtmlMarker?.remove(); map?.remove();
      mapRef.current = null; setMapLoaded(false);
    };
  }, [city, onSlotSelect]);

  // Effekt #2: GeoJSON Quelle & Layer verwalten
  useEffect(() => {
    if (!isMapboxTokenValid || !mapLoaded || !mapRef.current || !Array.isArray(slots)) return;
    const map = mapRef.current;
    const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: slots.map(slot => ({ type: 'Feature', geometry: { type: 'Point', coordinates: slot.lngLat }, properties: { id: slot.id, name: slot.name, type: slot.type, subType: slot.subType, address: slot.address, highlighted: slot.highlighted } }))
    };
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (source) { source.setData(geojsonData); }
    else {
        map.addSource(SOURCE_ID, { type: 'geojson', data: geojsonData, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });
        // Cluster Layer
        map.addLayer({ id: LAYER_ID_CLUSTERS, type: 'circle', source: SOURCE_ID, filter: ['has', 'point_count'], paint: {
             'circle-color': [ 'step', ['get', 'point_count'], '#a3b18a', 20, '#588157', 50, '#3a5a40' ],
             'circle-radius': [ 'step', ['get', 'point_count'], 15, 20, 20, 50, 25 ] }
        });
        map.addLayer({ id: LAYER_ID_CLUSTER_COUNT, type: 'symbol', source: SOURCE_ID, filter: ['has', 'point_count'], layout: {
            'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 }, paint: { 'text-color': '#ffffff' }
        });
        // Einzelpunkt Layer
        map.addLayer({ id: LAYER_ID_BORDER, type: 'circle', source: SOURCE_ID, filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 7, 'circle-color': 'white', 'circle-opacity': 0.8 } });
        map.addLayer({ id: LAYER_ID_POINTS, type: 'circle', source: SOURCE_ID, filter: ['!', ['has', 'point_count']],
           paint: {
                'circle-radius': [ 'case', ['==', ['get', 'id'], selectedSlotId || -1], 8, 5 ],
                'circle-color': [
                    'case',
                    ['==', ['get', 'type'], 'Arzt'], colorMap.Arzt,
                    ['==', ['get', 'type'], 'Friseur'], colorMap.Friseur,
                    ['==', ['get', 'type'], 'Massage'], colorMap.Massage,
                    ['==', ['get', 'type'], 'Gastro'], colorMap.Gastro,
                    colorMap.Default // Fallback
                ]
           }
        });
    }
  // Remove colorMap and isMapboxTokenValid from dependencies
  }, [slots, mapLoaded, selectedSlotId]);

  // Effekt #3: Layer-Paint für Auswahl aktualisieren
  useEffect(() => {
     if (!isMapboxTokenValid || !mapLoaded || !mapRef.current) return;
     const map = mapRef.current;
     if (map.getLayer(LAYER_ID_POINTS)) {
         map.setPaintProperty(LAYER_ID_POINTS, 'circle-radius', [ 'case', ['==', ['get', 'id'], selectedSlotId || -1], 8, 5 ]);
     }
  // Remove isMapboxTokenValid from dependencies
  }, [selectedSlotId, mapLoaded]);

  // Effekt #4: Stadtwechsel
  useEffect(() => {
    if (!isMapboxTokenValid || !mapRef.current || !mapLoaded) return;
    const map = mapRef.current; const currentCenter = map.getCenter();
    const targetCenter = cityCoordinates[city] || cityCoordinates['Zürich'];
     if (Math.abs(currentCenter.lng - targetCenter[0]) > 0.001 || Math.abs(currentCenter.lat - targetCenter[1]) > 0.001 ) {
        map.flyTo({ center: targetCenter, zoom: 12, speed: 1.2 });
     }
  // Remove isMapboxTokenValid from dependencies
  }, [city, mapLoaded]);

  // Effekt #5: FlyTo zu Koordinaten
  useEffect(() => {
    if (!isMapboxTokenValid || !flyToCoords || !mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (!Array.isArray(flyToCoords) || typeof flyToCoords[0] !== 'number' || typeof flyToCoords[1] !== 'number') { onMapMoveEnd(); return; }
    const handleMoveEnd = () => onMapMoveEnd();
    map.once('idle', handleMoveEnd);
    map.flyTo({ center: flyToCoords, zoom: 15, speed: 1.5 });
    return () => { map.off('idle', handleMoveEnd); };
  // Remove isMapboxTokenValid from dependencies
  }, [flyToCoords, mapLoaded, onMapMoveEnd]);

  // Effekt #6: Fly Back bei Deselektieren
  useEffect(() => {
    if (!isMapboxTokenValid || !mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    if (selectedSlotId === null) {
       const target = cityCoordinates[city] || cityCoordinates['Zürich'];
       map.flyTo({ center: target, zoom: 12, speed: 1.2 });
    }
  // Remove isMapboxTokenValid from dependencies
  }, [selectedSlotId, city, mapLoaded]);

  // Effekt #7: Pulsierender HTML Marker
  useEffect(() => {
    if (!isMapboxTokenValid || !mapRef.current || !selectedSlotId || !mapLoaded) { htmlMarkerRef.current?.remove(); return; };
    const map = mapRef.current;
    const selectedSlot = slots.find(slot => slot.id === selectedSlotId);
    if (!selectedSlot) { htmlMarkerRef.current?.remove(); return; };
    htmlMarkerRef.current?.remove();
    const markerColor = getMarkerColor(selectedSlot.type);
    const el = document.createElement('div');
    el.className = 'pulsing-marker'; // CSS Klasse für Animation verwenden
    el.innerHTML = `<div class="marker-dot" style="background-color: ${markerColor}"></div><div class="marker-ping" style="border-color: ${markerColor}"></div>`;
    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(selectedSlot.lngLat).addTo(map);
    htmlMarkerRef.current = marker;
    return () => { htmlMarkerRef.current?.remove(); };
  // Remove isMapboxTokenValid from dependencies
  }, [selectedSlotId, slots, mapLoaded]);


  // --- JSX ---
  return ( <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden bg-gray-200" /> );
};

// Mit React.memo exportieren
export default React.memo(Map);