export interface ClimateProgram {
  _id: string;
  name: string;
  program: Array<number>;
  mode: number;
  isActive: boolean;
}
