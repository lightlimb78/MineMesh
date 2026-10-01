/**
 * ESP32 integration boundary.
 *
 * Recommended production flow:
 * ESP32 sensors -> mesh -> gateway/backend -> REST/WebSocket -> frontend
 *
 * Do NOT put ESP32 credentials or private network secrets in the frontend.
 */

export interface Esp32Payload {
  nodeId: string;
  timestamp: string;
  tiltX: number;
  tiltY: number;
  vibration: number;
  displacement: number;
}

export function validateEsp32Payload(payload: unknown): payload is Esp32Payload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;

  return (
    typeof p.nodeId === "string" &&
    typeof p.timestamp === "string" &&
    typeof p.tiltX === "number" &&
    typeof p.tiltY === "number" &&
    typeof p.vibration === "number" &&
    typeof p.displacement === "number"
  );
}
