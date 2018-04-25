export interface Yeast {
  _id: string;
  name: string;
  description: string;
  attenuation: number;
  flocculation: number;
  quantity: number;
  type: string;
  isStarterNeeded: boolean;
}
