"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterMapRecords, type MapCountry, type MapRecord } from "@/lib/prison-map/location";

const MapRenderer = dynamic(() => import("./map-renderer"), { ssr: false, loading: () => <div className="flex h-[320px] items-center justify-center bg-muted md:h-[580px]" role="status">Loading interactive map. Prison results are available below.</div> });
class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="flex h-[320px] items-center justify-center bg-muted p-6 text-center" role="alert">The interactive map could not load. Use the prison results and profile links.</div> : this.props.children; }
}
const precisionLabels = { postcode: "Approximate postcode location · not an exact prison entrance", facility: "Official facility location · entrance may differ", legacy: "Existing directory coordinates · entrance not verified" };

export function PrisonMapClient({ records }: { records: MapRecord[] }) {
  const [country, setCountry] = useState<MapCountry>("uk");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [reentryOffices, setReentryOffices] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const filtered = useMemo(() => filterMapRecords(records, { country, query, state, reentryOffices }), [records, country, query, state, reentryOffices]);
  const mapped = useMemo(() => filtered.filter(p => !p.exclusion), [filtered]);
  const missing = filtered.length - mapped.length;
  const selected = filtered.find(p => p.id === selectedId);
  const states = useMemo(() => Array.from(new Set(records.filter(p => p.country === "us" && !p.exclusion && (!p.reentryOffice || reentryOffices)).map(p => p.state))).filter(Boolean).sort(), [records, reentryOffices]);
  const select = useCallback((id: string) => { previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setSelectedId(id); }, []);
  const close = useCallback(() => { setSelectedId(null); previousFocus.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (selectedId && !filtered.some(p => p.id === selectedId)) setSelectedId(null); }, [selectedId, filtered]);
  useEffect(() => { if (selectedId) detailHeading.current?.focus(); }, [selectedId]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && selectedId) close(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [close, selectedId]);

  return <section aria-label="Find prisons on the map" className="space-y-4">
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Map country">
        {(["uk", "us"] as const).map(c => <Button key={c} variant={country === c ? "default" : "outline"} aria-pressed={country === c} className="min-h-11" onClick={() => { setCountry(c); setState(""); setSelectedId(null); }}>{c === "uk" ? "United Kingdom" : "United States"}</Button>)}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div><label htmlFor="map-search" className="mb-1 block text-sm font-medium">Search prisons</label><Input id="map-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Prison name or location" className="min-h-11" /></div>
        {country === "us" && <div><label htmlFor="map-state" className="mb-1 block text-sm font-medium">State or territory</label><select id="map-state" value={state} onChange={e => setState(e.target.value)} className="min-h-11 w-full rounded-md border bg-background px-3 text-sm"><option value="">All states and territories</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4">
        {country === "us" && <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={reentryOffices} onChange={e => { setReentryOffices(e.target.checked); setState(""); }} className="h-5 w-5 accent-accent" />Reentry offices <span className="text-muted-foreground">(administrative locations)</span></label>}
        {(query || state || reentryOffices) && <Button variant="ghost" className="min-h-11" onClick={() => { setQuery(""); setState(""); setReentryOffices(false); }}>Clear filters</Button>}
      </div>
    </div>
    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{mapped.length} {mapped.length === 1 ? "location" : "locations"} on the map{missing > 0 ? ` · ${missing} ${missing === 1 ? "record needs" : "records need"} location review` : ""}.</p>
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-lg border"><MapBoundary><MapRenderer records={mapped} country={country} selectedId={selectedId} onSelect={select} /></MapBoundary></div>
      <div className="space-y-4">
        {selected && <section aria-label="Selected prison" className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-2"><h2 ref={detailHeading} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-accent">{selected.name}</h2><Button variant="ghost" className="min-h-11 shrink-0 px-2" onClick={close} aria-label="Close prison details">Close</Button></div>
          <p className="mt-2 text-sm">{selected.country === "uk" ? "United Kingdom" : "United States"}{[selected.city, selected.state].filter(Boolean).length > 0 ? ` · ${[selected.city, selected.state].filter(Boolean).join(", ")}` : ""}</p>
          <p className="mt-2 text-sm text-muted-foreground">{selected.type}{selected.status === "historic" ? " · Historic prison" : ""}</p>
          <p className="mt-3 text-xs text-muted-foreground">{selected.exclusion ? `Not mapped: ${selected.exclusion}` : selected.precision ? precisionLabels[selected.precision] : ""}</p>
          <Link href={selected.href} className="mt-3 inline-flex min-h-11 items-center font-medium text-accent underline">View prison profile</Link>
        </section>}
        <section aria-label="Prison results" className="rounded-lg border bg-card">
          <h2 className="border-b p-4 font-semibold">Prison results</h2>
          {filtered.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No prisons match. Try another name or clear your filters.</p> : <ul className="max-h-[420px] overflow-y-auto divide-y">{filtered.map(p => <li key={p.id} className={p.id === selectedId ? "bg-secondary p-3" : "p-3"}>
            <button onClick={() => select(p.id)} aria-pressed={p.id === selectedId} className="min-h-11 w-full text-left text-sm font-medium hover:text-accent focus-visible:outline-accent">{p.name}</button>
            <p className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(", ")}{p.status === "historic" ? " · Historic prison" : ""}{p.exclusion ? " · Location needs review" : ""}</p>
            <Link href={p.href} aria-label={`${p.name} profile`} className="inline-flex min-h-11 items-center text-xs text-accent underline">Profile</Link>
          </li>)}</ul>}
        </section>
      </div>
    </div>
    <p className="text-sm text-muted-foreground">UK markers show approximate postcode locations. Official facility and existing directory coordinates are identified in prison details. Locations do not identify visitor entrances; check the prison’s official visiting guidance before travelling.</p>
    <noscript><p>JavaScript is required to interact with the map. The UK profile links above and country directories below remain available.</p></noscript>
  </section>;
}
