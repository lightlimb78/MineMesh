# MineGuard Stage A Backend

This version intentionally contains **NO AI/ML**.

It handles only:

ESP32 Sensor Node
    ->
SX1278 LoRa
    ->
ESP32 Gateway
    ->
USB Serial
    ->
FastAPI
    ->
Frontend

## 1. Install

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Start

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Open:

http://localhost:8000

API documentation:

http://localhost:8000/docs

## 4. Gateway packet

Preferred:

```text
N1,42,3.21,-1.17,1.02,0.084,37.4,2.5,28.4,67.2
```

Fields:

1. node ID
2. sequence
3. tilt X
4. tilt Y
5. acceleration
6. vibration
7. displacement
8. displacement rate
9. temperature
10. humidity

The backend also accepts the previous 9-field format:

```text
N1,42,3.21,-1.17,1.02,1837,1,28.4,67.2
```

## 5. Test without LoRa

You can test the backend with a direct HTTP request.

PowerShell:

```powershell
curl.exe -X POST http://localhost:8000/api/sensor-data `
  -H "Content-Type: application/json" `
  -d "{\"nodeId\":\"N1\",\"sequence\":1,\"tiltX\":2.4,\"tiltY\":-1.1,\"acceleration\":1.02,\"vibration\":0.4,\"displacement\":37.4,\"displacementRate\":2.1,\"temperature\":28.4,\"humidity\":67.2}"
```

Then:

```text
http://localhost:8000/api/nodes
http://localhost:8000/api/deformation
http://localhost:8000/api/alerts
http://localhost:8000/api/prediction
http://localhost:8000/api/system-status
```

## 6. Important

The `risk` value currently returned for each node is only a simple
sensor-status calculation used to keep the existing frontend functional.

It is NOT an AI prediction.

When the ML stage is ready, replace this calculation with the real model.

## 7. Gateway ESP32 requirement

The Gateway ESP32 must print only the packet in CSV form for ingestion.

For example:

```cpp
Serial.println(
  "N1,42,3.21,-1.17,1.02,0.084,37.4,2.5,28.4,67.2"
);
```

Debug messages are allowed; the Python gateway ignores lines that do not
start with `N`.

The Gateway Serial Monitor and FastAPI must use the same baud rate.
Default is 115200.
