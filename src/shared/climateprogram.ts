export interface ClimateProgram {
  _id: string;
  name: string;
  listIndex: number;
  program: Array<number>;
  mode: number;
  isActive: boolean;
}
