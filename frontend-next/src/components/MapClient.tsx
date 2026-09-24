"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Activity, Search, Tractor, X } from "lucide-react";
import { resolveApiUrl } from "@/services/telemetryService";
import { ListaPosicoesMaquinasSchema } from "@/schemas";
import type { MachinePosition } from "@/types/telemetry";
import type { EstadoRequisicao } from "@/types/api";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/FeedbackStates";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletFeatureGroup = import("leaflet").FeatureGroup;
type LeafletMarker = import("leaflet").Marker;
type LeafletTileLayer = import("leaflet").TileLayer;

const DEFAULT_CENTER: [number, number] = [-15.793889, -47.882778];

const API_URL = resolveApiUrl();

type UnknownRecord = Record<string, unknown>;

function normalizeApiPositions(data: UnknownRecord[]): UnknownRecord[] {
  return data.map((d) => ({
    ...d,
    lat: d.lat ?? d.latitude ?? d.latitude_deg ?? d.lat_deg,
    lng: d.lng ?? d.longitude ?? d.longitude_deg ?? d.lon,
    telemetria:
      d.telemetria || d.telemetry || d.leitura || d.leitura_atual || d.last_telemetry,
  }));
}

function hasUsableCoordinates(data: UnknownRecord) {
  if (data.lat == null || data.lng == null || data.lat === "" || data.lng === "") {
    return false;
  }

  const lat = Number(data.lat);
  const lng = Number(data.lng);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function parsePositions(data: UnknownRecord[]) {
  const parseResult = ListaPosicoesMaquinasSchema.safeParse(
    data.filter(hasUsableCoordinates),
  );

  if (!parseResult.success) {
    console.error("Contrato de API quebrado:", {
      endpoint: "MapClient.getMachinePositions",
      errors: parseResult.error.format(),
    });
    throw new Error("Formato de dados inesperado recebido do servidor.");
  }

  return parseResult.data;
}

function getPopupHtml(machine: MachinePosition) {
  const statusLabel =
    machine.status === "operando"
      ? "Operando"
      : machine.status === "parada"
        ? "Parada"
        : "Offline";

  const statusColor =
    machine.status === "operando"
      ? "var(--status-normal)"
      : machine.status === "parada"
        ? "var(--status-atencao)"
        : "var(--status-critico)";

  return `
    <div style="font-size:13px;line-height:1.5;color:var(--text-1);background:linear-gradient(180deg,var(--panel-glass-strong),var(--panel-glass-mid));backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border:1px solid transparent;border-radius:12px;padding:14px 16px;box-shadow:var(--shadow-glass);min-width:220px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <strong style="font-size:13px;color:var(--text-1);">${escapeHtml(machine.maquina_id ?? machine.modelo)}</strong>
        <span style="display:inline-flex;align-items:center;gap:6px;border-radius:9999px;border:1px solid color-mix(in srgb, ${statusColor} 20%, transparent);background:color-mix(in srgb, ${statusColor} 12%, transparent);padding:2px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${statusColor};">
          <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};box-shadow:0 0 6px color-mix(in srgb, ${statusColor} 55%, transparent);"></span>
          ${statusLabel}
        </span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:12px;color:var(--text-2);">
        <div style="grid-column:1/-1;"><span style="color:var(--text-3);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Ao vivo agora</span><div style="margin-top:2px;font-weight:700;color:${statusColor};">${escapeHtml(String(machine.telemetria.rpm))} RPM</div></div>
        <div><span style="color:var(--text-3);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Temperatura</span><div style="margin-top:2px;font-weight:700;color:var(--text-1);">${escapeHtml(String(machine.telemetria.temperatura))}°C</div></div>
        <div><span style="color:var(--text-3);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">RPM</span><div style="margin-top:2px;font-weight:700;color:var(--text-1);">${escapeHtml(String(machine.telemetria.rpm))}</div></div>
        <div style="grid-column:1/-1;"><span style="color:var(--text-3);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Última atualização</span><div style="margin-top:2px;font-weight:600;color:var(--text-1);">${escapeHtml(new Date(machine.telemetria.timestamp).toLocaleString())}</div></div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
  })[character] ?? character);
}

function getMarkerStatus(status: MachinePosition["status"]) {
  if (status === "operando") {
    return { label: "Operando", color: "var(--status-normal)", glow: "var(--glow-normal-strong)" };
  }
  if (status === "parada") {
    return { label: "Atenção", color: "var(--status-atencao)", glow: "var(--glow-amber)" };
  }
  return { label: "Offline", color: "var(--status-critico)", glow: "var(--glow-red)" };
}

function createMarkerIcon(L: LeafletModule, machine: MachinePosition, selected = false) {
  const status = getMarkerStatus(machine.status);
  const machineId = escapeHtml(machine.maquina_id ?? machine.modelo);
  const markerSize = selected ? 42 : 34;

  return L.divIcon({
    className: `leaflet-machine-marker${selected ? " is-selected" : ""}`,
    html: `<div class="map-machine-marker__content" style="transform:translate(-${markerSize / 2}px,-${markerSize / 2}px)" aria-label="${machineId} — ${status.label}" title="${machineId}"><span class="map-machine-marker__icon" style="width:${markerSize}px;height:${markerSize}px;border-color:${status.color};color:${status.color};box-shadow:0 0 ${selected ? 22 : 12}px ${status.glow}, inset 0 0 0 4px rgba(255,255,255,0.04);"><span style="font-size:${selected ? 16 : 13}px;line-height:1;">🚜</span></span><span class="map-machine-marker__label" style="border-color:color-mix(in srgb, ${status.color} 45%, transparent);"><span class="map-machine-marker__status-dot" style="background:${status.color};box-shadow:0 0 6px ${status.glow};"></span>${machineId} · ${status.label}</span></div>`,
    iconAnchor: [markerSize / 2, markerSize / 2],
    popupAnchor: [0, selected ? -24 : -20],
  });
}

function isValidPosition(machine: MachinePosition) {
  return (
    Number.isFinite(machine.lat) &&
    Number.isFinite(machine.lng) &&
    Math.abs(machine.lat) <= 90 &&
    Math.abs(machine.lng) <= 180
  );
}

function cleanupLeafletContainer(container: HTMLElement | null) {
  if (!container) return;
  const typedContainer = container as HTMLElement & { _leaflet_id?: unknown };
  const existingId = typedContainer._leaflet_id;
  if (existingId != null) {
    try {
      delete typedContainer._leaflet_id;
    } catch {
      typedContainer._leaflet_id = undefined;
    }
  }
}

export default function MapClient({
  externalPositions,
  fullBleed = false,
}: {
  externalPositions?: MachinePosition[];
  fullBleed?: boolean;
}) {
  const [estado, setEstado] = useState<EstadoRequisicao<MachinePosition[]>>({ tipo: "carregando" });
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>(() => (
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
      ? "light"
      : "dark"
  ));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const markersRef = useRef<LeafletFeatureGroup | null>(null);
  const markerRefs = useRef(new Map<string, LeafletMarker>());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const positions = useMemo(() => estado.tipo === "sucesso" ? estado.dados : [], [estado]);
  const visiblePositionCount = positions.filter(isValidPosition).length;
  const shouldRenderMap = estado.tipo === "sucesso" && visiblePositionCount > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setMapTheme(root.classList.contains('light') ? 'light' : 'dark');
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;

    async function createMap() {
      if (!shouldRenderMap) return;
      if (typeof window === "undefined") return;
      if (mapRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const imported = await import("leaflet");
      const leafletImport = imported as { default?: LeafletModule };
      const L = leafletImport.default ?? imported;
      leafletRef.current = L;

      cleanupLeafletContainer(container);

      const map = L.map(container, {
        center: DEFAULT_CENTER,
        zoom: 4,
      });

      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
        minZoom: 2,
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      const layerGroup = L.featureGroup().addTo(map);
      markersRef.current = layerGroup;
      mapRef.current = map;
      setMapReady(true);
      map.invalidateSize();
      window.requestAnimationFrame(() => map.invalidateSize());
      window.setTimeout(() => map.invalidateSize(), 250);

      if (!active) {
        map.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        setMapReady(false);
      }
    }

    createMap();

    const container = containerRef.current;
    return () => {
      active = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore
        }
        cleanupLeafletContainer(container);
        mapRef.current = null;
        tileLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, [shouldRenderMap]);

  useEffect(() => {
    const tileLayer = tileLayerRef.current;
    if (!tileLayer) return;
    tileLayer.setUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  }, [mapTheme]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (isMobile) {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
    } else {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
    }
  }, [isMobile]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    const markers = markersRef.current ?? L.featureGroup().addTo(map);
    markersRef.current = markers;
    const validPositions = positions.filter(isValidPosition);

    markers.clearLayers();
    markerRefs.current.clear();

    validPositions.forEach((machine) => {
      const machineId = machine.maquina_id ?? String(machine.id);
      const marker = L.marker([machine.lat, machine.lng], {
        icon: createMarkerIcon(L, machine, machineId === selectedMachineId),
      })
        .bindPopup(getPopupHtml(machine), { closeButton: true, autoPan: true })
        .on("click", () => setSelectedMachineId(machineId))
        .addTo(markers);
      markerRefs.current.set(machineId, marker);
    });

    if (validPositions.length === 1) {
      map.setView([validPositions[0].lat, validPositions[0].lng], 13);
    } else if (validPositions.length > 1) {
      const bounds = markers.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2), { maxZoom: 13 });
      }
    } else {
      map.setView(DEFAULT_CENTER, 4);
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [mapReady, positions, selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId || !mapRef.current) return;
    const marker = markerRefs.current.get(selectedMachineId);
    if (!marker) return;
    marker.openPopup();
  }, [selectedMachineId, positions]);

  const validPositions = positions.filter(isValidPosition);
  const filteredPositions = validPositions.filter((machine) => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return true;
    return [machine.maquina_id, machine.modelo, machine.status]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase().includes(query));
  });

  function selectMachine(machine: MachinePosition) {
    const machineId = machine.maquina_id ?? String(machine.id);
    setSelectedMachineId(machineId);
    const map = mapRef.current;
    const marker = markerRefs.current.get(machineId);
    if (map && marker) {
      map.flyTo([machine.lat, machine.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
      marker.openPopup();
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPositions() {
      if (externalPositions?.length) {
        try {
          const parsed = parsePositions(externalPositions as unknown as UnknownRecord[]);
          if (!cancelled) {
            setEstado({ tipo: "sucesso", dados: parsed });
          }
          return;
        } catch {
          if (!cancelled) {
            setEstado({ tipo: "erro", mensagem: "Dados de GPS inválidos" });
          }
          return;
        }
      }

      try {
        const response = await fetch(`${API_URL}/maquinas/posicao/`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const normalized = Array.isArray(data) ? normalizeApiPositions(data) : [];
        const parsed = parsePositions(normalized);
        if (!cancelled) {
          setEstado(parsed.length === 0 ? { tipo: "vazio" } : { tipo: "sucesso", dados: parsed });
        }
      } catch (err) {
        if (!cancelled) {
          const mensagem = err instanceof Error ? err.message : "Falha ao carregar posições da frota.";
          setEstado({ tipo: "erro", mensagem });
        }
      }
    }

    loadPositions();
    const interval = window.setInterval(loadPositions, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [externalPositions, retryCount]);

  if (estado.tipo === "carregando") {
    return (
      <div className={`${fullBleed ? "h-full min-h-0" : "min-h-[50vh] h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-5rem)]"} flex w-full items-center justify-center`}>
        <LoadingState mensagem="Carregando posições..." />
      </div>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <div className={`${fullBleed ? "h-full min-h-0" : "min-h-[50vh] h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-5rem)]"} flex w-full items-center justify-center`}>
        <ErrorState mensagem={estado.mensagem} onRetry={() => setRetryCount((c) => c + 1)} />
      </div>
    );
  }

  if (estado.tipo === "vazio") {
    return (
      <div className={`${fullBleed ? "h-full min-h-0" : "h-[calc(100vh-5.5rem)] min-h-[28rem] sm:h-[calc(100vh-5rem)]"} flex w-full items-center justify-center bg-black/20 px-6 text-center`}>
        <EmptyState mensagem="Nenhuma máquina veio com coordenadas válidas de GPS no momento." />
      </div>
    );
  }

  return (
    <div
      className={`map-surface map-surface--${mapTheme} ${mapTheme === "dark" ? "map-dark-filter" : ""} ${fullBleed ? "h-full min-h-0" : "h-[calc(100vh-5.5rem)] min-h-[28rem] sm:h-[calc(100vh-5rem)]"} relative w-full`}
      data-map-theme={mapTheme}
    >
      {process.env.NODE_ENV !== "production" && (
        <div
          id="map-client-debug"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            background: "var(--overlay-debug)",
            color: "var(--text-1)",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          MapClient: {mounted ? "mounted" : "not-mounted"} • positions: {positions.length}
        </div>
      )}

      <div ref={containerRef} className={`relative z-0 h-full w-full ${fullBleed ? "min-h-0" : "min-h-[28rem]"}`} />

      {fullBleed ? (
        <div className="pointer-events-none absolute inset-0 z-10 p-4 pt-24 sm:p-6 sm:pt-28">
          <div className="pointer-events-auto flex max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
            <section className="liquid-glass--subtle p-4" aria-label="Resumo da frota">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-heading">Central de campo</p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--text-1)]">Frota em movimento</h2>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-[color:var(--status-normal)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--status-normal)]">
                  <Activity size={11} aria-hidden="true" /> ao vivo
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div><p className="text-2xl font-bold text-[var(--text-1)]">{validPositions.length}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]">Total</p></div>
                <div><p className="text-2xl font-bold text-[color:var(--status-normal)]">{validPositions.filter((m) => m.status === "operando").length}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]">Ativas</p></div>
                <div><p className="text-2xl font-bold text-[color:var(--status-atencao)]">{validPositions.filter((m) => m.status !== "operando").length}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]">Atenção</p></div>
              </div>
            </section>

            <section className="liquid-glass--subtle p-3" aria-label="Buscar máquina">
              <label className="relative block">
                <span className="sr-only">Buscar máquina no mapa</span>
                <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar ID ou modelo" className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] pl-9 pr-9 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] focus:border-[color:var(--ui-accent)]/60" />
                {searchTerm ? <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpar busca" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-3)] hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)]"><X size={13} aria-hidden="true" /></button> : null}
              </label>
              {searchTerm && filteredPositions.length > 0 ? (
                <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">
                  {filteredPositions.map((machine) => {
                    const machineId = machine.maquina_id ?? String(machine.id);
                    return <button key={machineId} type="button" onClick={() => selectMachine(machine)} className="flex min-h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-xs text-[var(--text-2)] hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)]"><span className="flex items-center gap-2"><Tractor size={13} aria-hidden="true" />{machineId}</span><span className="text-[10px] text-[var(--text-3)]">{machine.modelo}</span></button>;
                  })}
                </div>
              ) : null}
            </section>

            <section className="liquid-glass--subtle hidden p-3 sm:block" aria-label="Atividade recente">
              <p className="section-heading">Atividade recente</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-2)]">Selecione um marcador para ver RPM, temperatura e o último horário recebido.</p>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
