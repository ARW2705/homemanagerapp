export interface Climate {
  indoorTemperature: number;
  indoorHumidity: number;
  selectedZone: number;
  selectedMode: string;
  operatingStatus: string;
  isProgramActive: boolean;
  targetTemperature: number;
}
