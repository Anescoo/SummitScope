"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as Cesium from "cesium";
import { usePeakStore } from "@/store/peakStore";
import type { Peak } from "@/types";

// Mountain peak SVG as data URL for billboard
function createPeakIcon(isSelected: boolean, isHovered: boolean): string {
  const color = isSelected ? "#22d3ee" : isHovered ? "#67e8f9" : "#94a3b8";
  const glow = isSelected ? "#22d3ee44" : "transparent";
  const size = isSelected ? 32 : 28;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${glow}" stroke="${color}" stroke-width="1.5"/>
    <polygon points="16,6 22,22 10,22" fill="${color}" opacity="0.9"/>
    <polygon points="16,10 20,22 12,22" fill="white" opacity="0.25"/>
    <circle cx="16" cy="16" r="1.5" fill="white" opacity="0.8"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const LAYERS = [
  { id: "satellite" as const, label: "Satellite", icon: "🛰️" },
  { id: "streets" as const, label: "Rues", icon: "🗺️" },
  { id: "topo" as const, label: "Topographique", icon: "⛰️" },
];
type LayerId = "satellite" | "streets" | "topo";

export default function GlobeViewer() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const compassNeedleRef = useRef<SVGGElement>(null);
  const tiltSliderRef = useRef<HTMLInputElement>(null);
  const headingSliderRef = useRef<HTMLInputElement>(null);
  const {
    peaks,
    selectedPeak,
    hoveredPeak,
    selectPeak,
    setHoveredPeak,
    visibleRouteIndices,
    campFlyRequest,
  } = usePeakStore();
  const entitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const [navOpen, setNavOpen] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerId>("satellite");
  const [layerOpen, setLayerOpen] = useState(false);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const token = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    if (token) {
      Cesium.Ion.defaultAccessToken = token;
    }

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: token ? Cesium.Terrain.fromWorldTerrain() : undefined,
      timeline: false,
      animation: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      geocoder: false,
      infoBox: false,
      selectionIndicator: false,
      requestRenderMode: false,
      shadows: false,
    });

    viewer.scene.backgroundColor = new Cesium.Color(0.008, 0.024, 0.09, 1.0);
    viewer.scene.skyBox.show = true;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = false;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.00008;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(10, 20, 22000000),
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    });

    viewer.resolutionScale = window.devicePixelRatio;

    const ctrl = viewer.scene.screenSpaceCameraController;
    ctrl.enableInputs = true;
    ctrl.enableRotate = true;
    ctrl.enableZoom = true;
    ctrl.enableTilt = true;
    ctrl.enableLook = true;
    ctrl.minimumZoomDistance = 200;
    // Explicitly include both wheel and pinch for zoom (trackpad pinch support)
    ctrl.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.PINCH,
    ];

    // Sync compass needle + sliders every frame (no React re-render)
    const updateUI = () => {
      const h = viewer.camera.heading;
      const p = viewer.camera.pitch;
      if (h == null || p == null) return;
      if (compassNeedleRef.current) {
        compassNeedleRef.current.setAttribute(
          "transform",
          `rotate(${Cesium.Math.toDegrees(h)}, 16, 16)`
        );
      }
      if (tiltSliderRef.current) {
        const tilt = Cesium.Math.toDegrees(p) + 90;
        tiltSliderRef.current.value = Math.max(0, Math.min(90, tilt)).toString();
      }
      if (headingSliderRef.current) {
        headingSliderRef.current.value = ((Cesium.Math.toDegrees(h) + 360) % 360).toString();
      }
    };
    viewer.scene.postRender.addEventListener(updateUI);

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Switch imagery layer when activeLayer changes
  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const token = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    v.imageryLayers.removeAll();
    if (activeLayer === "satellite") {
      if (token) {
        Cesium.IonImageryProvider.fromAssetId(2).then((provider) => {
          if (!v.isDestroyed()) v.imageryLayers.addImageryProvider(provider);
        });
      }
    } else if (activeLayer === "streets") {
      v.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          credit: "© OpenStreetMap contributors",
        })
      );
    } else if (activeLayer === "topo") {
      v.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
          credit: "© OpenTopoMap contributors, SRTM",
        })
      );
    }
  }, [activeLayer]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.zoomIn(v.camera.positionCartographic.height * 0.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.zoomOut(v.camera.positionCartographic.height * 0.6);
  }, []);

  // Reset camera heading to north
  const handleResetNorth = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.flyTo({
      destination: v.camera.position,
      orientation: { heading: 0, pitch: v.camera.pitch, roll: 0 },
      duration: 0.6,
    });
  }, []);

  // Tilt slider → camera pitch (0 = straight down, 90 = horizontal)
  const handleTiltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = viewerRef.current;
    if (!v) return;
    const pitch = Cesium.Math.toRadians(parseFloat(e.target.value) - 90);
    v.camera.setView({
      destination: v.camera.position,
      orientation: { heading: v.camera.heading, pitch, roll: 0 },
    });
  }, []);

  // Heading slider → camera heading (0–360°)
  const handleHeadingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.setView({
      destination: v.camera.position,
      orientation: {
        heading: Cesium.Math.toRadians(parseFloat(e.target.value)),
        pitch: v.camera.pitch,
        roll: 0,
      },
    });
  }, []);

  // 2D / 3D scene toggle
  const handleToggleScene = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    if (is3D) {
      v.scene.morphTo2D(1.5);
      setIs3D(false);
    } else {
      v.scene.morphTo3D(1.5);
      setIs3D(true);
    }
  }, [is3D]);

  // Add/update peak markers — hide non-selected peaks when one is selected
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !peaks.length) return;

    entitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    entitiesRef.current.clear();

    peaks.forEach((peak: Peak) => {
      const isSelected = selectedPeak?.id === peak.id;
      const isHovered = hoveredPeak?.id === peak.id;
      const iconUrl = createPeakIcon(isSelected, isHovered);
      const show = !selectedPeak || isSelected;

      const entity = viewer.entities.add({
        id: `peak-${peak.id}`,
        position: Cesium.Cartesian3.fromDegrees(
          peak.location.lng,
          peak.location.lat,
          peak.elevation
        ),
        billboard: {
          image: iconUrl,
          width: isSelected ? 40 : 32,
          height: isSelected ? 40 : 32,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: isSelected ? 1.2 : 1.0,
          show,
        },
        label: {
          text: peak.name,
          font: isSelected ? "bold 13px sans-serif" : "12px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: isSelected
            ? Cesium.Color.fromCssColorString("#22d3ee")
            : Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString("#050d1a"),
          outlineWidth: 4,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -44),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          showBackground: false,
          show,
        },
      });

      entitiesRef.current.set(peak.id, entity);
    });
  }, [peaks, selectedPeak, hoveredPeak]);

  // Add route polylines and camp point markers for selected peak
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const toRemove = viewer.entities.values.filter((e) => {
      const id = e.id?.toString() ?? "";
      return id.startsWith("route-") || id.startsWith("camp-");
    });
    toRemove.forEach((e) => viewer.entities.remove(e));

    if (!selectedPeak) return;

    const routeColors = [
      Cesium.Color.CYAN.withAlpha(0.85),
      Cesium.Color.fromCssColorString("#f59e0b").withAlpha(0.85),
      Cesium.Color.fromCssColorString("#f87171").withAlpha(0.85),
    ];

    selectedPeak.routes.forEach((route, idx) => {
      if (!route.coordinates?.length) return;
      if (!visibleRouteIndices.includes(idx)) return;
      const positions = route.coordinates.map(([lat, lng]) =>
        Cesium.Cartesian3.fromDegrees(lng, lat)
      );
      viewer.entities.add({
        id: `route-${selectedPeak.id}-${idx}`,
        polyline: {
          positions,
          width: 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: routeColors[idx % routeColors.length],
          }),
          clampToGround: true,
        },
      });
    });

    selectedPeak.camps.forEach((camp, idx) => {
      viewer.entities.add({
        id: `camp-${selectedPeak.id}-${idx}`,
        position: Cesium.Cartesian3.fromDegrees(camp.lng, camp.lat, camp.elevation),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString("#fbbf24"),
          outlineColor: Cesium.Color.fromCssColorString("#78350f"),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: camp.name,
          font: "11px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.fromCssColorString("#fbbf24"),
          outlineColor: Cesium.Color.fromCssColorString("#050d1a"),
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          showBackground: false,
        },
      });
    });
  }, [selectedPeak, visibleRouteIndices]);

  // Camera fly-to when peak selected
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedPeak) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selectedPeak.location.lng,
        selectedPeak.location.lat - 0.05,
        selectedPeak.elevation + 8000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, [selectedPeak]);

  // Camp fly-to — 350m above camp, tight angle to clearly frame it
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !campFlyRequest) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        campFlyRequest.lng,
        campFlyRequest.lat - 0.002,
        campFlyRequest.elevation + 350,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-28),
        roll: 0,
      },
      duration: 2,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, [campFlyRequest]);

  // Click handler
  const handleClick = useCallback(
    (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const picked = viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id) {
        const entityId: string =
          typeof picked.id === "string" ? picked.id : picked.id.id;
        if (entityId?.startsWith("peak-")) {
          const peak = peaks.find((p) => p.id === entityId.replace("peak-", ""));
          if (peak) { selectPeak(peak); return; }
        }
        if (entityId?.startsWith("camp-")) {
          const parts = entityId.split("-");
          const campIdx = parseInt(parts[parts.length - 1]);
          const store = usePeakStore.getState();
          const camp = store.selectedPeak?.camps[campIdx];
          if (camp) { store.requestCampFly(camp); return; }
        }
      }
      if (!Cesium.defined(picked)) selectPeak(null);
    },
    [peaks, selectPeak]
  );

  // Mouse move handler for hover
  const handleMouseMove = useCallback(
    (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const picked = viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(picked) && picked.id) {
        const entityId: string =
          typeof picked.id === "string" ? picked.id : picked.id.id;
        if (entityId?.startsWith("peak-")) {
          const peak = peaks.find((p) => p.id === entityId.replace("peak-", "")) ?? null;
          setHoveredPeak(peak);
          if (containerRef.current) containerRef.current.style.cursor = "pointer";
          return;
        }
        if (entityId?.startsWith("camp-")) {
          if (containerRef.current) containerRef.current.style.cursor = "pointer";
          return;
        }
      }
      setHoveredPeak(null);
      if (containerRef.current) containerRef.current.style.cursor = "default";
    },
    [peaks, setHoveredPeak]
  );

  // Attach event handlers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    return () => { handler.destroy(); };
  }, [handleClick, handleMouseMove]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Navigation controls — Google Earth style */}
      <div className={`absolute bottom-6 z-30 flex flex-col items-end gap-2 transition-[right] duration-300 ${selectedPeak ? "right-[340px]" : "right-4"}`}>

        {/* Layer picker panel */}
        {layerOpen && (
          <div className="glass-panel px-3 py-2.5 w-48 shadow-xl">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Calque de carte</div>
            <div className="space-y-1">
              {LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => { setActiveLayer(layer.id); setLayerOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm transition-all ${
                    activeLayer === layer.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-300 hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <span className="text-base leading-none">{layer.icon}</span>
                  <span>{layer.label}</span>
                  {activeLayer === layer.id && (
                    <svg className="w-3 h-3 ml-auto text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable nav panel (only in 3D mode) */}
        {navOpen && is3D && (
          <div className="glass-panel px-4 py-3 w-52 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Navigation</span>
              <button
                onClick={() => setNavOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tilt / Inclinaison */}
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1.5">Inclinaison</div>
              <input
                ref={tiltSliderRef}
                type="range" min="0" max="90" defaultValue="0"
                onChange={handleTiltChange}
                className="w-full h-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Heading / Orientation */}
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1.5">Orientation</div>
              <input
                ref={headingSliderRef}
                type="range" min="0" max="360" defaultValue="0"
                onChange={handleHeadingChange}
                className="w-full h-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleResetNorth}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rétablir l'orientation
            </button>
          </div>
        )}

        {/* Compact control bar */}
        <div className="flex items-center gap-1.5">
          {/* Compass — click to open/close nav panel */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            title="Navigation"
            className={`w-10 h-10 backdrop-blur border rounded-full flex items-center justify-center transition-all shadow-lg ${navOpen ? "bg-slate-700/90 border-cyan-500/50" : "bg-slate-900/80 border-slate-700/60 hover:bg-slate-700/80"}`}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#475569" strokeWidth="1" />
              <text x="16" y="6" textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="#94a3b8" fontFamily="sans-serif">N</text>
              <text x="16" y="27" textAnchor="middle" dominantBaseline="middle" fontSize="4" fill="#64748b" fontFamily="sans-serif">S</text>
              <text x="5" y="16.5" textAnchor="middle" dominantBaseline="middle" fontSize="4" fill="#64748b" fontFamily="sans-serif">O</text>
              <text x="27" y="16.5" textAnchor="middle" dominantBaseline="middle" fontSize="4" fill="#64748b" fontFamily="sans-serif">E</text>
              <g ref={compassNeedleRef}>
                <polygon points="16,5 17.5,16 16,14 14.5,16" fill="#f87171" />
                <polygon points="16,27 17.5,16 16,18 14.5,16" fill="#475569" />
                <circle cx="16" cy="16" r="2" fill="#e2e8f0" />
                <circle cx="16" cy="16" r="1" fill="#0f172a" />
              </g>
            </svg>
          </button>

          {/* Layer switcher */}
          <button
            onClick={() => { setLayerOpen(!layerOpen); setNavOpen(false); }}
            title="Changer de calque"
            className={`w-10 h-10 backdrop-blur border rounded-lg flex items-center justify-center transition-all shadow-lg text-base ${
              layerOpen
                ? "bg-slate-700/90 border-cyan-500/50"
                : "bg-slate-900/80 border-slate-700/60 hover:bg-slate-700/80"
            }`}
          >
            🗺️
          </button>

          {/* 2D / 3D toggle */}
          <button
            onClick={handleToggleScene}
            title={is3D ? "Passer en vue 2D" : "Passer en vue 3D"}
            className={`px-2.5 h-10 backdrop-blur border rounded-lg text-xs font-bold transition-all shadow-lg ${
              is3D
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30"
                : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:bg-slate-700/80"
            }`}
          >
            {is3D ? "3D" : "2D"}
          </button>

          {/* Zoom in */}
          <button
            onClick={handleZoomIn}
            title="Zoom avant"
            className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-700/80 transition-all shadow-lg text-xl font-light leading-none"
          >
            +
          </button>

          {/* Zoom out */}
          <button
            onClick={handleZoomOut}
            title="Zoom arrière"
            className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-700/80 transition-all shadow-lg text-xl font-light leading-none"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
}
