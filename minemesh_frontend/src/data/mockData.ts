import type {
  AlertItem,
  DeformationPoint,
  RiskPrediction,
  SensorNode,
  SystemStatus,
} from "../types";

export const mockNodes: SensorNode[] = [
  {
    id: "N01", name: "Node 01", zone: "North Pit", status: "online",
    risk: 18, riskLevel: "Normal", tiltX: 0.8, tiltY: 0.5, vibration: 2.1,
    displacement: 1.8, displacementRate: 0.2, battery: 94, signal: -48,
    lastSeen: "12:48:22 PM",
  },
  {
    id: "N02", name: "Node 02", zone: "North Pit", status: "online",
    risk: 27, riskLevel: "Normal", tiltX: 1.1, tiltY: 0.7, vibration: 2.8,
    displacement: 2.6, displacementRate: 0.3, battery: 88, signal: -52,
    lastSeen: "12:48:19 PM",
  },
  {
    id: "N03", name: "Node 03", zone: "Central Zone", status: "online",
    risk: 61, riskLevel: "Warning", tiltX: 2.8, tiltY: 1.9, vibration: 5.9,
    displacement: 7.2, displacementRate: 0.8, battery: 81, signal: -55,
    lastSeen: "12:48:20 PM",
  },
  {
    id: "N04", name: "Node 04", zone: "East Pit", status: "online",
    risk: 12, riskLevel: "Normal", tiltX: 0.6, tiltY: 0.4, vibration: 1.7,
    displacement: 1.2, displacementRate: 0.1, battery: 76, signal: -61,
    lastSeen: "12:48:17 PM",
  },
  {
    id: "N05", name: "Node 05", zone: "South Pit", status: "online",
    risk: 82, riskLevel: "Critical", tiltX: 4.8, tiltY: 3.6, vibration: 8.2,
    displacement: 12.4, displacementRate: 1.5, battery: 69, signal: -57,
    lastSeen: "12:48:21 PM",
  },
  {
    id: "N06", name: "Node 06", zone: "South Pit", status: "online",
    risk: 24, riskLevel: "Normal", tiltX: 0.9, tiltY: 0.6, vibration: 2.4,
    displacement: 2.0, displacementRate: 0.2, battery: 91, signal: -50,
    lastSeen: "12:48:15 PM",
  },
  {
    id: "N07", name: "Node 07", zone: "West Zone", status: "offline",
    risk: 44, riskLevel: "Warning", tiltX: 2.0, tiltY: 1.3, vibration: 4.6,
    displacement: 5.0, displacementRate: 0.6, battery: 42, signal: -88,
    lastSeen: "12:41:03 PM",
  },
  {
    id: "N08", name: "Node 08", zone: "West Zone", status: "online",
    risk: 15, riskLevel: "Normal", tiltX: 0.7, tiltY: 0.5, vibration: 1.9,
    displacement: 1.4, displacementRate: 0.1, battery: 83, signal: -59,
    lastSeen: "12:48:14 PM",
  },
];

export const mockPrediction: RiskPrediction = {
  score: 61,
  level: "Warning",
  confidence: 87,
  factors: {
    deformation: 72,
    rate: 76,
    tilt: 58,
    vibration: 64,
    variability: 69,
  },
  explanation:
    "The current pattern shows increasing local movement and elevated vibration. Continue close monitoring and inspect the affected zone if the trend continues.",
};

export const mockAlerts: AlertItem[] = [
  {
    id: "A-105",
    nodeId: "N05",
    level: "Critical",
    message: "High displacement rate and vibration detected.",
    time: "12:45 PM",
    resolved: false,
  },
  {
    id: "A-103",
    nodeId: "N03",
    level: "Warning",
    message: "Increasing tilt trend detected.",
    time: "12:42 PM",
    resolved: false,
  },
  {
    id: "A-107",
    nodeId: "N07",
    level: "Warning",
    message: "Node communication lost.",
    time: "12:41 PM",
    resolved: false,
  },
  {
    id: "A-102",
    nodeId: "N02",
    level: "Normal",
    message: "Node returned to normal range.",
    time: "11:56 AM",
    resolved: true,
  },
];

export const mockDeformation: DeformationPoint[] = [
  { label: "08:00", value: -2.0 },
  { label: "09:00", value: -2.6 },
  { label: "10:00", value: -3.5 },
  { label: "11:00", value: -4.8 },
  { label: "12:00", value: -6.2 },
  { label: "13:00", value: -7.4 },
  { label: "14:00", value: -8.1 },
  { label: "15:00", value: -9.2 },
];

export const mockSystem: SystemStatus = {
  gateway: "online",
  aiEngine: "online",
  mesh: "good",
  lastUpdate: "12:48:22 PM",
};
