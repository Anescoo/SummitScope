"use client";

import { useEffect, useRef, useCallback } from "react";
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

export default function GlobeViewer() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { peaks, selectedPeak, hoveredPeak, selectPeak, setHoveredPeak } =
    usePeakStore();
  const entitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Set ion token
    const token = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    if (token) {
      Cesium.Ion.defaultAccessToken = token;
    }

    const viewer = new Cesium.Viewer(containerRef.current, {
      // Terrain — use new Cesium.Terrain API (Cesium ≥1.110)
      terrain: token
        ? Cesium.Terrain.fromWorldTerrain()
        : undefined,
      // UI elements
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
      // Performance
      requestRenderMode: false,
      shadows: false,
      // Scene
      scene3DOnly: true,
    });

    // Style the viewer background
    viewer.scene.backgroundColor = new Cesium.Color(0.008, 0.024, 0.09, 1.0);
    viewer.scene.skyBox.show = true;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = false;

    // Atmosphere settings
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;

    // Fog for depth
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.00008;

    // Initial camera position — zoom out to see the whole globe
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(10, 20, 22000000),
      orientation: {
        heading: 0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0,
      },
    });

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Add/update peak markers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !peaks.length) return;

    // Remove old entities
    entitiesRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current.clear();

    peaks.forEach((peak: Peak) => {
      const isSelected = selectedPeak?.id === peak.id;
      const isHovered = hoveredPeak?.id === peak.id;
      const iconUrl = createPeakIcon(isSelected, isHovered);

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
        },
        label: {
          text: peak.name,
          font: "13px Space Grotesk, sans-serif",
          fillColor: isSelected ? Cesium.Color.CYAN : Cesium.Color.fromCssColorString("#94a3b8"),
          outlineColor: Cesium.Color.fromCssColorString("#020617"),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 6),
          show: true,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      entitiesRef.current.set(peak.id, entity);
    });
  }, [peaks, selectedPeak, hoveredPeak]);

  // Add route polylines for selected peak
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove existing route entities
    const toRemove = viewer.entities.values.filter((e) =>
      e.id?.toString().startsWith("route-")
    );
    toRemove.forEach((e) => viewer.entities.remove(e));

    if (!selectedPeak) return;

    const routeColors = [
      Cesium.Color.CYAN.withAlpha(0.85),
      Cesium.Color.fromCssColorString("#f59e0b").withAlpha(0.85),
      Cesium.Color.fromCssColorString("#f87171").withAlpha(0.85),
    ];

    selectedPeak.routes.forEach((route, idx) => {
      if (!route.coordinates?.length) return;

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

    // Add camp markers
    selectedPeak.camps.forEach((camp, idx) => {
      viewer.entities.add({
        id: `camp-${selectedPeak.id}-${idx}`,
        position: Cesium.Cartesian3.fromDegrees(
          camp.lng,
          camp.lat,
          camp.elevation
        ),
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString("#fbbf24"),
          outlineColor: Cesium.Color.fromCssColorString("#92400e"),
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: camp.name,
          font: "11px sans-serif",
          fillColor: Cesium.Color.fromCssColorString("#fbbf24"),
          outlineColor: Cesium.Color.fromCssColorString("#020617"),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -6),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });
  }, [selectedPeak]);

  // Camera fly-to when peak selected
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedPeak) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selectedPeak.location.lng,
        selectedPeak.location.lat - 0.3,
        80000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-25),
        roll: 0,
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, [selectedPeak]);

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
          const peakId = entityId.replace("peak-", "");
          const peak = peaks.find((p) => p.id === peakId);
          if (peak) {
            selectPeak(peak);
            return;
          }
        }
      }
      // Click on empty space deselects
      if (!Cesium.defined(picked)) {
        selectPeak(null);
      }
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
          const peakId = entityId.replace("peak-", "");
          const peak = peaks.find((p) => p.id === peakId) ?? null;
          setHoveredPeak(peak);
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
    handler.setInputAction(
      handleClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    handler.setInputAction(
      handleMouseMove,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    return () => {
      handler.destroy();
    };
  }, [handleClick, handleMouseMove]);

  return <div ref={containerRef} className="w-full h-full" />;
}
