import { create } from "zustand";
import type { Peak, TabKey, SortKey, Camp } from "@/types";
import peaksData from "@/data/peaks.json";

interface CampFlyRequest {
  lat: number;
  lng: number;
  elevation: number;
  ts: number;
}

interface PeakStore {
  peaks: Peak[];
  selectedPeak: Peak | null;
  hoveredPeak: Peak | null;
  activeTab: TabKey;
  isSidebarOpen: boolean;
  searchQuery: string;
  sortKey: SortKey;
  visibleRouteIndices: number[];
  campFlyRequest: CampFlyRequest | null;
  selectPeak: (peak: Peak | null) => void;
  setHoveredPeak: (peak: Peak | null) => void;
  setActiveTab: (tab: TabKey) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSortKey: (key: SortKey) => void;
  toggleRoute: (idx: number) => void;
  setAllRoutesVisible: (count: number) => void;
  clearAllRoutes: () => void;
  requestCampFly: (camp: Camp) => void;
}

export const usePeakStore = create<PeakStore>((set) => ({
  peaks: peaksData as Peak[],
  selectedPeak: null,
  hoveredPeak: null,
  activeTab: "info",
  isSidebarOpen: true,
  searchQuery: "",
  sortKey: "elevation",
  visibleRouteIndices: [],
  campFlyRequest: null,

  selectPeak: (peak) =>
    set({
      selectedPeak: peak,
      activeTab: "info",
      visibleRouteIndices: peak ? peak.routes.map((_, i) => i) : [],
    }),
  setHoveredPeak: (peak) => set({ hoveredPeak: peak }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortKey: (key) => set({ sortKey: key }),
  toggleRoute: (idx) =>
    set((state) => ({
      visibleRouteIndices: state.visibleRouteIndices.includes(idx)
        ? state.visibleRouteIndices.filter((i) => i !== idx)
        : [...state.visibleRouteIndices, idx],
    })),
  setAllRoutesVisible: (count) =>
    set({ visibleRouteIndices: Array.from({ length: count }, (_, i) => i) }),
  clearAllRoutes: () => set({ visibleRouteIndices: [] }),
  requestCampFly: (camp) =>
    set({
      campFlyRequest: { lat: camp.lat, lng: camp.lng, elevation: camp.elevation, ts: Date.now() },
    }),
}));
