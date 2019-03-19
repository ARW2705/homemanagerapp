import { Sensor } from './sensor';

export interface Climate {
  _id: string;
  zoneData: Array<Sensor>;
  setMode: string;
  operatingStatus: string;
  setTemperature: number;
  setZone: number;
  updatedAt: string;
  sleep: boolean;
}

export interface ControlParams {
  setTemperature: number;
  setMode: string;
  setZone: number;
  sleep: boolean;
}
