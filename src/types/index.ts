export interface WeatherMonth {
  month: string;
  avgTemp: number;
  windKmh: number;
  precipMm: number;
}

export interface Route {
  name: string;
  difficulty: "F" | "PD" | "AD" | "D" | "TD" | "ED";
  description: string;
  coordinates: [number, number][];
}

export interface Camp {
  name: string;
  elevation: number;
  lat: number;
  lng: number;
}

export interface LegendaryAscent {
  year: number;
  climbers: string[];
  note?: string;
}

export interface FirstAscent {
  year: number;
  climbers: string[];
}

export interface Peak {
  id: string;
  name: string;
  elevation: number;
  location: {
    lat: number;
    lng: number;
  };
  country: string;
  continent: string;
  range: string;
  description: string;
  flagEmoji: string;
  firstAscent: FirstAscent;
  routes: Route[];
  camps: Camp[];
  legendaryAscents: LegendaryAscent[];
  weather: WeatherMonth[];
}

export type TabKey = "info" | "routes" | "weather" | "history";

export type SortKey = "elevation" | "name" | "continent";
