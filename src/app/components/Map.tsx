'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import osmFriseure from './data/osm-friseure.json';


mapboxgl.accessToken = 'pk.eyJ1IjoidGhlb3ZhbmRpcyIsImEiOiJjbTh5aWgwbzAwMWpuMmtyeXBrb3d6NjZxIn0.2hh-o8UpZzECkOMbn-F3Mw';

export interface Slot {
  id: number;
  lngLat: [number, number];
  name: string;
  type: 'Arzt' | 'Friseur' | 'Massage' | 'Gastro';
  city?: string;
  highlighted?: boolean; // ← für Puls-Effekt
}

interface MapProps {
  city: string;
  slots: Slot[];
  onSlotSelect: (id: number) => void;
  selectedSlotId: number | null;
}

export default function Map({
  city,
  slots,
  onSlotSelect,
  selectedSlotId,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const colorMap: Record<string, string> = {
    Arzt: '#2563eb',
    Friseur: '#d97706',
    Massage: '#16a34a',
    Gastro: '#dc2626',
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [8.5417, 47.3769],
      zoom: 12,
    });

    mapRef.current = map;
    map.on('load', () => setMapLoaded(true));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !Array.isArray(slots)) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    slots.forEach((slot) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker' + (slot.highlighted ? ' pulse' : '');
      markerEl.style.backgroundColor = colorMap[slot.type] || '#6b7280';
      markerEl.style.transform = 'translate(-50%, -50%)';

      // Optional: pulsend bei hervorgehobenen Slots
      if (slot.highlighted) {
        markerEl.classList.add('pulse');
      }

    
      // Popup hinzufügen
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="text-sm font-semibold">${slot.name}</div>
        <button class="popup-btn text-xs text-blue-600 underline mt-1" data-id="${slot.id}">
          Anzeigen
        </button>
      `);
    
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(slot.lngLat)
        .setPopup(popup)
        .addTo(mapRef.current!);
    
      marker.getPopup().on('open', () => {
        const popupElement = marker.getPopup().getElement();
        popupElement?.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('popup-btn')) {
            onSlotSelect(Number(target.dataset.id));
          }
        });
      });
    
      markersRef.current.push(marker);
    });
    

    if (slots.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      slots.forEach((slot) => bounds.extend(slot.lngLat));
      mapRef.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [slots, mapLoaded]);

  useEffect(() => {
    if (!mapRef.current || selectedSlotId === null || !mapLoaded) return;
    const selected = slots.find((s) => s.id === selectedSlotId);
    if (selected) {
      mapRef.current.flyTo({
        center: selected.lngLat,
        zoom: 15,
        speed: 1.5,
        curve: 1,
        essential: true,
      });
    }
  }, [selectedSlotId]);

  useEffect(() => {
    const centers: Record<string, [number, number]> = {
      Zürich: [8.5417, 47.3769],
      Berlin: [13.405, 52.52],
      Wien: [16.3738, 48.2082],
    };

    const center = centers[city];
    if (mapRef.current && center && mapLoaded) {
      mapRef.current.flyTo({
        center,
        zoom: 13,
        speed: 1.2,
        curve: 1,
        essential: true,
      });
    }
  }, [city, mapLoaded]);

  return <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />;
}
