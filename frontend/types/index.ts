export interface SubstanceRoaRange {
  min: number;
  max: number;
}

export interface SubstanceDose {
  units: string;
  threshold: number | null;
  light: SubstanceRoaRange | null;
  common: SubstanceRoaRange | null;
  strong: SubstanceRoaRange | null;
  heavy: number | null;
}

export interface SubstanceDuration {
  onset: { min: number; max: number; units: string } | null;
  comeup: { min: number; max: number; units: string } | null;
  peak: { min: number; max: number; units: string } | null;
  offset: { min: number; max: number; units: string } | null;
  total: { min: number; max: number; units: string } | null;
}

export interface SubstanceRoa {
  name: string;
  dose: SubstanceDose | null;
  duration: SubstanceDuration | null;
  bioavailability: { min: number; max: number } | null;
}

export interface Interaction {
  name: string;
  status: 'Dangerous' | 'Unsafe' | 'Caution' | 'Safe' | 'Unknown';
  note?: string;
}

export interface Substance {
  _id: string;
  name: string;
  url: string | null;
  featured: boolean | null;
  summary: string | null;
  roas: SubstanceRoa[];
  images: { thumb: string }[] | null;
  interactions_flat: Interaction[] | null;
  addictionPotential: string | null;
  tolerance: any | null;
}

export interface DoseLog {
  id: string;
  substanceName: string;
  substanceId?: string;
  amount: number;
  unit: string;
  roa: string;
  timestamp: number; // Unix timestamp
  estimatedDurationMinutes?: number;
  substanceSnapshot?: {
    interactions_flat: Interaction[] | null;
  };
  notes: string;
}
