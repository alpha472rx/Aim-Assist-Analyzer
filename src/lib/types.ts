export type SimulationMode = "Manual" | "Aim Assist" | "Aimlock";

export type Position = { x: number; y: number };

export type Entity = {
  name: string;
  position: Position;
  health: number;
  isAlive: boolean;
};

export type PerformanceData = {
  id: string;
  mode: SimulationMode;
  timeToEliminate: number;
  shotsFired: number;
  accuracy: number; 
};
