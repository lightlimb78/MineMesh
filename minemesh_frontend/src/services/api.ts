import {
  mockAlerts,
  mockDeformation,
  mockNodes,
  mockPrediction,
  mockSystem,
} from "../data/mockData";
import type {
  AlertItem,
  DeformationPoint,
  RiskPrediction,
  SensorNode,
  SystemStatus,
} from "../types";

const MOCK_MODE = false;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getNodes(): Promise<SensorNode[]> {
  if (MOCK_MODE) return mockNodes;
  return getJson<SensorNode[]>("/api/nodes");
}

export async function getPrediction(): Promise<RiskPrediction> {
  if (MOCK_MODE) return mockPrediction;
  return getJson<RiskPrediction>("/api/risk/latest");
}

export async function getAlerts(): Promise<AlertItem[]> {
  if (MOCK_MODE) return mockAlerts;
  return getJson<AlertItem[]>("/api/alerts");
}

export async function getDeformation(): Promise<DeformationPoint[]> {
  if (MOCK_MODE) return mockDeformation;
  return getJson<DeformationPoint[]>("/api/trends/deformation");
}

export async function getSystemStatus(): Promise<SystemStatus> {
  if (MOCK_MODE) return mockSystem;
  return getJson<SystemStatus>("/api/system/status");
}

export function isMockMode(): boolean {
  return MOCK_MODE;
}
