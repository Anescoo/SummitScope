import { create } from "zustand";
import type { Peak, TabKey, SortKey } from "@/types";
import peaksData from "@/data/peaks.json";

interface PeakStore {
  peaks: Peak[];
  selectedPeak: Peak | null;
  hoveredPeak: Peak | null;
  activeTab: TabKey;
  isSidebarOpen: boolean;
  searchQuery: string;
  sortKey: SortKey;
  selectPeak: (peak: Peak | null) => void;
  setHoveredPeak: (peak: Peak | null) => void;
  setActiveTab: (tab: TabKey) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSortKey: (key: SortKey) => void;
}

export const usePeakStore = create<PeakStore>((set) => ({
  peaks: peaksData as Peak[],
  selectedPeak: null,
  hoveredPeak: null,
  activeTab: "info",
  isSidebarOpen: true,
  searchQuery: "",
  sortKey: "elevation",

  selectPeak: (peak) => set({ selectedPeak: peak, activeTab: "info" }),
  setHoveredPeak: (peak) => set({ hoveredPeak: peak }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortKey: (key) => set({ sortKey: key }),
}));
