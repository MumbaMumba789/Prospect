import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { EvaluatedTarget, GeologicalFeature, KnownDeposit, LayerVisibility } from '../types';
import { getPriorityStyling } from '../utils/scoring';
import { Maximize2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ExplorationMapProps {
  targets: EvaluatedTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  knownDeposits: KnownDeposit[];
  geologicalFeatures: GeologicalFeature[];
  layerVisibility: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
}

export const ExplorationMap: React.FC<ExplorationMapProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  knownDeposits,
  geologicalFeatures,
  layerVisibility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const targetMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const knownDepositsLayerRef = useRef<L.LayerGroup | null>(null);
  const geologicalVectorsLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [basemap, setBasemap] = useState<'light' | 'osm' | 'grid'>('light');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tileErrorCount, setTileErrorCount] = useState<number>(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Zambia Copperbelt & Northwestern Province
    const initialCenter: [number, number] = [-12.55, 27.2];
    const initialZoom = 7;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000,
      });
    });

    map.on('mouseout', () => {
      setCursorCoords(null);
    });

    const geoLayer = L.layerGroup().addTo(map);
    const depositsLayer = L.layerGroup().addTo(map);
    const targetsLayer = L.layerGroup().addTo(map);

    geologicalVectorsLayerRef.current = geoLayer;
    knownDepositsLayerRef.current = depositsLayer;
    targetMarkersLayerRef.current = targetsLayer;

    mapInstanceRef.current = map;

    // Invalidate size once DOM stabilizes
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles with Error Handling
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (basemap === 'grid') {
      // Schematic vector grid mode (no external tiles required)
      return;
    }

    const tileUrl =
      basemap === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
    });

    let errors = 0;
    tiles.on('tileerror', () => {
      errors += 1;
      if (errors > 4) {
        setTileErrorCount(errors);
      }
    });

    tiles.on('tileload', () => {
      // successful tile load resets error count
      if (errors === 0) setTileErrorCount(0);
    });

    tiles.addTo(map);
    tileLayerRef.current = tiles;
  }, [basemap]);

  // Ensure map resizes properly when panels collapse/expand
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedTargetId]);

  // Render Geological Features
  useEffect(() => {
    const geoLayer = geologicalVectorsLayerRef.current;
    if (!geoLayer) return;

    geoLayer.clearLayers();

    geologicalFeatures.forEach((feat) => {
      if (feat.type === 'roan_formation' && !layerVisibility.roanFormation) return;
      if (feat.type === 'basement_dome' && !layerVisibility.basementDomes) return;
      if (feat.type === 'fault_shear' && !layerVisibility.faultsAndStructures) return;

      if (feat.geometryType === 'Polygon') {
        const isRoan = feat.type === 'roan_formation';
        const polygon = L.polygon(feat.coordinates as [number, number][], {
          color: isRoan ? '#c25e1a' : '#0284c7',
          weight: 1.5,
          opacity: 0.85,
          fillColor: isRoan ? '#d97706' : '#38bdf8',
          fillOpacity: 0.12,
          dashArray: isRoan ? '3, 3' : undefined,
        });

        polygon.bindTooltip(
          `<div class="text-xs">
            <span class="font-bold text-slate-900">${feat.name}</span>
            <div class="text-slate-600 text-[11px]">${feat.description}</div>
          </div>`,
          { sticky: true }
        );

        geoLayer.addLayer(polygon);
      } else if (feat.geometryType === 'LineString') {
        const polyline = L.polyline(feat.coordinates as [number, number][], {
          color: '#dc2626',
          weight: 1.5,
          opacity: 0.8,
          dashArray: '5, 5',
        });

        polyline.bindTooltip(
          `<div class="text-xs">
            <span class="font-bold text-red-700">${feat.name}</span>
            <div class="text-slate-600 text-[11px]">${feat.description}</div>
          </div>`,
          { sticky: true }
        );

        geoLayer.addLayer(polyline);
      }
    });
  }, [geologicalFeatures, layerVisibility]);

  // Render Known Producing Mines
  useEffect(() => {
    const depositsLayer = knownDepositsLayerRef.current;
    if (!depositsLayer) return;

    depositsLayer.clearLayers();

    if (!layerVisibility.knownOccurrences) return;

    knownDeposits.forEach((deposit) => {
      const isProducing = deposit.status === 'Producing Mine';
      const iconHtml = `
        <div class="relative flex items-center justify-center w-5 h-5 -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
          <div class="w-3 h-3 rotate-45 ${isProducing ? 'bg-emerald-600' : 'bg-slate-600'} border border-white shadow-sm"></div>
          <div class="absolute -top-4 whitespace-nowrap bg-white text-slate-800 border border-slate-200 text-[9px] font-medium px-1 py-0.2 rounded shadow-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${deposit.name.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-deposit-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([deposit.coords.lat, deposit.coords.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="space-y-1 max-w-[220px]">
          <div class="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">${deposit.status}</div>
          <div class="text-xs font-bold text-slate-900">${deposit.name}</div>
          <div class="text-[11px] text-slate-600">${deposit.district} · ${deposit.type}</div>
          <p class="text-[11px] text-slate-500 pt-1 border-t border-slate-100 mt-1">${deposit.notes}</p>
        </div>
      `);

      depositsLayer.addLayer(marker);
    });
  }, [knownDeposits, layerVisibility.knownOccurrences]);

  // Render Target Markers
  useEffect(() => {
    const targetsLayer = targetMarkersLayerRef.current;
    if (!targetsLayer) return;

    targetsLayer.clearLayers();
    markerMapRef.current.clear();

    if (!layerVisibility.targetMarkers) return;

    targets.forEach((target) => {
      const isSelected = target.id === selectedTargetId;
      const styling = getPriorityStyling(target.priorityCategory);

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 28px; height: 28px;">
          ${
            isSelected
              ? `<div class="absolute inset-0 rounded-full animate-ping opacity-40" style="background-color: ${styling.hexColor};"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center rounded-full text-white font-bold text-[10px] shadow-sm transition-transform duration-100 ${
            isSelected ? 'scale-120 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'group-hover:scale-110'
          }" style="width: 22px; height: 22px; background-color: ${styling.hexColor}; border: 1.5px solid #ffffff;">
            ${target.rank}
          </div>
          <div class="absolute -bottom-3.5 whitespace-nowrap text-[9px] font-mono px-1 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs pointer-events-none">
            ${target.id}
          </div>
        </div>
      `;

      const targetIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-target-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([target.coordinates.lat, target.coordinates.lng], { icon: targetIcon });

      marker.on('click', () => {
        onSelectTarget(target.id);
      });

      const popupHtml = `
        <div class="space-y-1.5 min-w-[210px] p-0.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1">
            <span class="font-mono text-xs font-bold text-slate-900">${target.id}</span>
            <span class="text-xs font-bold px-1.5 py-0.2 rounded" style="color: ${styling.hexColor}; background-color: ${styling.badgeBg}">
              ${target.totalScore.toFixed(1)} / 100
            </span>
          </div>
          <div class="font-semibold text-slate-900 text-xs">${target.name}</div>
          <div class="text-[11px] text-slate-500">${target.district} District · ${target.priorityCategory}</div>
          <div class="text-[11px] text-slate-600 border-t border-slate-100 pt-1">
            <span class="font-medium text-slate-700">Host:</span> ${target.hostLithology}
          </div>
          <div class="pt-1">
            <button id="inspect-btn-${target.id}" class="w-full py-1 px-2 text-center text-xs font-semibold rounded bg-[#c25e1a] hover:bg-[#a34e15] text-white transition-colors cursor-pointer shadow-2xs">
              Inspect Target Rationale &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${target.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectTarget(target.id);
          };
        }
      });

      markerMapRef.current.set(target.id, marker);
      targetsLayer.addLayer(marker);
    });
  }, [targets, selectedTargetId, layerVisibility.targetMarkers, onSelectTarget]);

  // Center and auto-open popup on selected target
  useEffect(() => {
    if (!selectedTargetId || !mapInstanceRef.current) return;
    const selected = targets.find((t) => t.id === selectedTargetId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.coordinates.lat, selected.coordinates.lng], {
        animate: true,
        duration: 0.4,
      });

      const marker = markerMapRef.current.get(selectedTargetId);
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedTargetId, targets]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-12.55, 27.2], 7, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* Offline Tile Error Notice Fallback Banner */}
      {tileErrorCount > 4 && basemap !== 'grid' && (
        <div className="absolute top-12 left-3 right-3 z-30 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-md text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              External web tiles offline or blocked. GIS Vector Layer & Target coordinates remain 100% active.
            </span>
          </div>
          <button
            onClick={() => setBasemap('grid')}
            className="text-[11px] font-semibold text-[#c25e1a] hover:underline cursor-pointer ml-2"
          >
            Switch to GIS Grid Mode
          </button>
        </div>
      )}

      {/* Floating Basemap & View Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
        <div className="flex items-center bg-white/95 backdrop-blur-xs border border-slate-200 rounded p-0.5 shadow-xs">
          <button
            onClick={() => setBasemap('light')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              basemap === 'light'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setBasemap('osm')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              basemap === 'osm'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OSM
          </button>
          <button
            onClick={() => setBasemap('grid')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              basemap === 'grid'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grid
          </button>
        </div>

        <button
          onClick={handleResetView}
          title="Reset map extent to Copperbelt"
          className="p-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-600 hover:text-slate-900 rounded shadow-xs transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full relative ${
          basemap === 'grid'
            ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100'
            : ''
        }`}
      />

      {/* Map Footer: Clean Legend & Coordinates */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex items-center justify-between gap-2">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-slate-200 rounded px-2.5 py-1 text-[11px] text-slate-700 flex items-center gap-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c25e1a] inline-block"></span>
            <span>High (&ge;75)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
            <span>Moderate (50–74)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span>Low (&lt;50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rotate-45 bg-emerald-600 inline-block"></span>
            <span>Known Deposit</span>
          </div>
        </div>

        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-slate-200 rounded px-2.5 py-1 text-[11px] text-slate-600 font-mono shadow-xs">
          {cursorCoords ? (
            <span className="tabular-nums">
              {cursorCoords.lat.toFixed(4)}°S, {cursorCoords.lng.toFixed(4)}°E
            </span>
          ) : (
            <span>Copperbelt Domain · WGS 84</span>
          )}
        </div>
      </div>
    </div>
  );
};
