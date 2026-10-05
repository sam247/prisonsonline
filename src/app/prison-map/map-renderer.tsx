"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { MapRecord } from "@/lib/prison-map/location";
import styles from "./map.module.css";

export default function MapRenderer({ records, country, selectedId, onSelect }: {
  records: MapRecord[]; country: "uk" | "us"; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const cluster = useRef<L.MarkerClusterGroup>();
  const markers = useRef(new Map<string, L.Marker>());
  const [tileError, setTileError] = useState(false);
  const [initializationError, setInitializationError] = useState(false);
  const tiles = useRef<L.TileLayer>();

  useEffect(() => {
    if (!container.current) return;
    let instance: L.Map | undefined;
    try {
      instance = L.map(container.current, { scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView([54, -2], 6);
      map.current = instance;
      tiles.current = L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).on("tileerror", () => setTileError(true)).addTo(instance);
      cluster.current = L.markerClusterGroup({
        animate: false, showCoverageOnHover: false, spiderfyOnMaxZoom: true,
        iconCreateFunction: group => L.divIcon({ className: styles.cluster, html: `<span>${group.getChildCount()}</span>`, iconSize: [44, 44] }),
      }).addTo(instance);
      const observer = new ResizeObserver(() => instance?.invalidateSize());
      observer.observe(container.current);
      return () => { observer.disconnect(); instance?.remove(); map.current = undefined; cluster.current = undefined; };
    } catch {
      instance?.remove();
      setInitializationError(true);
    }
  }, []);

  useEffect(() => {
    if (!map.current || !cluster.current) return;
    cluster.current.clearLayers();
    markers.current.clear();
    const located = records.filter(p => p.latitude != null && p.longitude != null);
    for (const prison of located) {
      const marker = L.marker([prison.latitude!, prison.longitude!], {
        title: prison.name, alt: prison.name, keyboard: true,
        icon: L.divIcon({ className: styles.marker, html: '<span></span>', iconSize: [44, 44], iconAnchor: [22, 22] }),
      }).on("click", () => onSelect(prison.id));
      markers.current.set(prison.id, marker);
      cluster.current.addLayer(marker);
    }
    if (located.length) map.current.fitBounds(L.latLngBounds(located.map(p => [p.latitude!, p.longitude!])), { padding: [32, 32], maxZoom: 12, animate: false });
    else map.current.setView(country === "uk" ? [54, -2] : [38, -98], country === "uk" ? 6 : 4);
  }, [records, country, onSelect]);

  useEffect(() => {
    markers.current.forEach((marker, id) => marker.getElement()?.classList.toggle(styles.selected, id === selectedId));
    const marker = selectedId ? markers.current.get(selectedId) : undefined;
    if (marker) cluster.current?.zoomToShowLayer(marker, () => marker.getElement()?.classList.add(styles.selected));
  }, [selectedId, records]);

  return <div className="relative">
    <div ref={container} className={styles.map} aria-label="Interactive prison map. Use arrow keys to pan and plus or minus to zoom." />
    {initializationError && <p role="alert" className="absolute inset-0 flex items-center justify-center bg-muted p-6 text-center">The map could not load. Use the prison results and profile links below.</p>}
    {tileError && <div role="status" className="border-t bg-card p-3 text-sm">Some map tiles could not load. Prison results remain available. <button className="min-h-11 text-accent underline" onClick={() => { setTileError(false); tiles.current?.redraw(); }}>Retry map tiles</button></div>}
  </div>;
}
