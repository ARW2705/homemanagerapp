export interface Sensor {
  _id: string;
  deviceId: number;
  temperature: number;
  humidity: number;
  locationName: string;
  lastUpdated: number;
  isRapid: boolean;
}
