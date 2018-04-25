import { GrainBill } from './grain-bill';
import { HopsSchedule } from './hops-schedule';
import { Yeast } from './yeast';
import { Batch } from './batches';
import { Schedule } from './schedule';

export interface Recipe {
  type: string;
  boilTime: number;
  mashTime: number;
  batchVolume: number;
  boilVolume: number;
  grains: Array<GrainBill>;
  hops: Array<HopsSchedule>;
  yeast: Yeast;
  processSchedule: Array<Schedule>;
  notes: string;
  originalGravity: number;
  finalGravity: number;
  abv: number;
  ibu: number;
  srm: number;
}
