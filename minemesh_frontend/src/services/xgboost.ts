/**
 * XGBoost integration boundary.
 *
 * The frontend should receive a prediction from the teammate's backend/API.
 * The model itself should normally run server-side (for example, Python).
 */

export interface XgboostRequest {
  nodeId: string;
  currentDeformation: number;
  previousDeformation: number;
  deformationChange: number;
  deformationRate: number;
  deformationAcceleration: number;
  rollingMean: number;
  rollingStd: number;
  cumulativeDeformation: number;
  trendSlope: number;
  tilt: number;
  vibration: number;
}

export interface XgboostResponse {
  riskScore: number;
  riskClass: "Normal" | "Warning" | "Critical";
  confidence?: number;
  explanation?: string;
}

export async function requestXgboostPrediction(
  request: XgboostRequest,
): Promise<XgboostResponse> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Prediction API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<XgboostResponse>;
}
