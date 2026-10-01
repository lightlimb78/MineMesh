export type RiskLevel = "Normal" | "Warning" | "Critical";
export type NodeStatus = "online" | "offline";

export interface SensorNode {
  id: string;
  name: string;
  zone: string;
  status: NodeStatus;
  risk: number;
  riskLevel: RiskLevel;
  tiltX: number;
  tiltY: number;
  vibration: number;
  displacement: number;
  displacementRate: number;
  battery: number;
  signal: number;
  lastSeen: string;
}

export interface RiskPrediction {
  score: number;
  level: RiskLevel;
  confidence: number;
  factors: {
    deformation: number;
    rate: number;
    tilt: number;
    vibration: number;
    variability: number;
  };
  explanation: string;
}

export interface AlertItem {
  id: string;
  nodeId: string;
  level: RiskLevel;
  message: string;
  time: string;
  resolved: boolean;
}

export interface DeformationPoint {
  label: string;
  value: number;
}

export interface SystemStatus {
  gateway: "online" | "offline";
  aiEngine: "online" | "offline";
  mesh: "good" | "degraded" | "offline";
  lastUpdate: string;
}
