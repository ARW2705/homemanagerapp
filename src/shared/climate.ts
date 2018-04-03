import { Sensor } from './sensor';

export interface Climate {
  _id: string;
  zoneData: Array<Sensor>;
  selectedMode: string;
  operatingStatus: string;
  targetTemperature: number;
  updatedAt: string;
}
