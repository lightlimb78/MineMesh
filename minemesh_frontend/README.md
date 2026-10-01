# MineGuard AI Frontend

React + TypeScript + Vite frontend for the mine subsidence monitoring project.

## Architecture

ESP32 sensors -> wireless mesh -> gateway/backend -> frontend
                                      \
                                       -> XGBoost risk API -> frontend

The project starts in MOCK MODE so the UI can be developed before the real ESP32/XGBoost services are ready.

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

## Switch to the real backend

Create `.env` from `.env.example`:

```env
VITE_MOCK_MODE=false
VITE_API_BASE_URL=http://localhost:8000
```

The frontend expects:

- GET `/api/nodes`
- GET `/api/risk/latest`
- GET `/api/alerts`
- GET `/api/trends/deformation`
- GET `/api/system/status`
- POST `/api/predict`

Do not put private credentials in the frontend.

## XGBoost contract

The file `src/services/xgboost.ts` shows the request/response shape expected from the teammate's prediction API.

If the teammate gives you a Python XGBoost model (`.pkl`, `.json`, etc.), keep that model on the backend and expose a prediction API. Do not try to put a Python model directly inside the browser.

## ESP32 contract

The file `src/services/esp32.ts` shows the sensor payload shape. In production, the ESP32 should normally send readings to the gateway/backend. The frontend then reads the processed/live data from that service.

## Build check

```bash
npm run build
```

A successful build means TypeScript and the Vite production build completed without compilation errors.

## UI redesign
The latest version uses a dark industrial command-center design. Service files and API contracts were intentionally kept separate from the UI so XGBoost and ESP32 integration can be added without rebuilding the screens.
