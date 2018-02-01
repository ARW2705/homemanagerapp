import { Sensor } from './sensor';

export interface Climate {
  zoneData: Array<Sensor>;
  selectedMode: string;
  operatingStatus: string;
  targetTemperature: number;
}
